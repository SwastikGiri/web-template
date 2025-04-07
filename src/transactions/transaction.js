import * as log from '../util/log';
import * as purchaseProcess from './transactionProcessPurchase';
import * as bookingProcess from './transactionProcessBooking';
import * as inquiryProcess from './transactionProcessInquiry';
import * as biketribeDefaultInquiry from './transactionProcessBiketribeDefaultInquiry';

// Unit types
export const ITEM = 'item';
export const DAY = 'day';
export const NIGHT = 'night';
export const HOUR = 'hour';
export const FIXED = 'fixed';
export const INQUIRY = 'inquiry';

// Process names
export const PURCHASE_PROCESS_NAME = 'default-purchase';
export const BOOKING_PROCESS_NAME = 'default-booking';
export const INQUIRY_PROCESS_NAME = 'default-inquiry';
export const BIKETRIBE_INQUIRY_PROCESS_NAME = 'biketribe-default-inquiry';

const PROCESSES = [
  {
    name: PURCHASE_PROCESS_NAME,
    alias: `${PURCHASE_PROCESS_NAME}/release-1`,
    process: purchaseProcess,
    unitTypes: [ITEM],
  },
  {
    name: BOOKING_PROCESS_NAME,
    alias: `${BOOKING_PROCESS_NAME}/release-1`,
    process: bookingProcess,
    unitTypes: [DAY, NIGHT, HOUR, FIXED],
  },
  {
    name: INQUIRY_PROCESS_NAME,
    alias: `${INQUIRY_PROCESS_NAME}/release-1`,
    process: inquiryProcess,
    unitTypes: [INQUIRY],
  },
  {
    name: BIKETRIBE_INQUIRY_PROCESS_NAME,
    alias: `${BIKETRIBE_INQUIRY_PROCESS_NAME}/release-1`,
    process: biketribeDefaultInquiry,
    unitTypes: [INQUIRY],
  },
];

// Utility functions
const txLastTransition = tx => tx?.attributes?.lastTransition;
const statesObjectFromGraph = graph => graph.states || {};

const getStateAfterTransition = process => transition => {
  const statesObj = statesObjectFromGraph(process.graph);
  const stateNames = Object.keys(statesObj);
  const fromState = stateNames.find(stateName => {
    const transitionsForward = Object.keys(statesObj[stateName]?.on || {});
    return transitionsForward.includes(transition);
  });

  return fromState && transition && statesObj[fromState]?.on[transition]
    ? statesObj[fromState]?.on[transition]
    : null;
};

const getProcessState = process => tx => {
  return getStateAfterTransition(process)(txLastTransition(tx));
};

const pickTransitionsToTargetState = (transitionEntries, targetState, initialTransitions) => {
  return transitionEntries.reduce((pickedTransitions, transitionEntry) => {
    const [transition, nextState] = transitionEntry;
    return nextState === targetState ? [...pickedTransitions, transition] : pickedTransitions;
  }, initialTransitions);
};

const getTransitionsToState = (process, targetState) => {
  const states = Object.values(statesObjectFromGraph(process.graph));

  return states.reduce((collectedTransitions, inspectedState) => {
    const transitionEntriesForward = Object.entries(inspectedState.on || {});
    return pickTransitionsToTargetState(
      transitionEntriesForward,
      targetState,
      collectedTransitions
    );
  }, []);
};

const getTransitionsToStates = process => stateNames => {
  return stateNames.reduce((pickedTransitions, stateName) => {
    return [...pickedTransitions, ...getTransitionsToState(process, stateName)];
  }, []);
};

const hasPassedState = process => (stateName, tx) => {
  const txTransitions = tx => tx?.attributes?.transitions || [];
  const hasPassedTransition = (transitionName, tx) =>
    !!txTransitions(tx).find(t => t.transition === transitionName);

  return (
    getTransitionsToState(process, stateName).filter(t => hasPassedTransition(t, tx)).length > 0
  );
};

// Used in translation and process name resolution
export const resolveLatestProcessName = processName => {
  switch (processName) {
    case 'flex-product-default-process':
    case 'default-buying-products':
    case PURCHASE_PROCESS_NAME:
      return PURCHASE_PROCESS_NAME;
    case 'flex-default-process':
    case 'flex-hourly-default-process':
    case 'flex-booking-default-process':
    case BOOKING_PROCESS_NAME:
      return BOOKING_PROCESS_NAME;
    case INQUIRY_PROCESS_NAME:
      return INQUIRY_PROCESS_NAME;
    case BIKETRIBE_INQUIRY_PROCESS_NAME:
      return BIKETRIBE_INQUIRY_PROCESS_NAME;
    default:
      return processName;
  }
};

// Get process object by name
export const getProcess = processName => {
  const latestProcessName = resolveLatestProcessName(processName);
  const processInfo = PROCESSES.find(process => process.name === latestProcessName);
  if (processInfo) {
    return {
      ...processInfo.process,
      getState: getProcessState(processInfo.process),
      getStateAfterTransition: getStateAfterTransition(processInfo.process),
      getTransitionsToStates: getTransitionsToStates(processInfo.process),
      hasPassedState: hasPassedState(processInfo.process),
    };
  } else {
    const error = new Error(`Unknown transaction process name: ${processName}`);
    log.error(error, 'unknown-transaction-process', { processName });
    throw error;
  }
};

// Utility exports
export const getSupportedProcessesInfo = () =>
  PROCESSES.map(({ process, ...rest }) => rest);

export const getAllTransitionsForEveryProcess = () => {
  return PROCESSES.reduce((accTransitions, processInfo) => {
    return [...accTransitions, ...Object.values(processInfo.process.transitions)];
  }, []);
};

export const isPurchaseProcess = processName =>
  resolveLatestProcessName(processName) === PURCHASE_PROCESS_NAME;

export const isPurchaseProcessAlias = processAlias =>
  isPurchaseProcess(processAlias ? processAlias.split('/')[0] : null);

export const isBookingProcess = processName =>
  resolveLatestProcessName(processName) === BOOKING_PROCESS_NAME;

export const isBookingProcessAlias = processAlias =>
  isBookingProcess(processAlias ? processAlias.split('/')[0] : null);

export const isFullDay = unitType => [DAY, NIGHT].includes(unitType);

export const getTransitionsNeedingProviderAttention = () => {
  return PROCESSES.reduce((accTransitions, processInfo) => {
    const statesNeedingProviderAttention = Object.values(
      processInfo.process.statesNeedingProviderAttention || {}
    );
    const process = processInfo.process;
    const processTransitions = statesNeedingProviderAttention.reduce(
      (pickedTransitions, stateName) => {
        return [...pickedTransitions, ...getTransitionsToState(process, stateName)];
      },
      []
    );
    return [...new Set([...accTransitions, ...processTransitions])];
  }, []);
};

// Transition roles
export const TX_TRANSITION_ACTOR_CUSTOMER = 'customer';
export const TX_TRANSITION_ACTOR_PROVIDER = 'provider';
export const TX_TRANSITION_ACTOR_SYSTEM = 'system';
export const TX_TRANSITION_ACTOR_OPERATOR = 'operator';

export const TX_TRANSITION_ACTORS = [
  TX_TRANSITION_ACTOR_CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER,
  TX_TRANSITION_ACTOR_SYSTEM,
  TX_TRANSITION_ACTOR_OPERATOR,
];

// Get user role in transaction
export const getUserTxRole = (currentUserId, transaction) => {
  const customer = transaction?.customer;
  if (currentUserId && currentUserId.uuid && transaction?.id && customer?.id) {
    return currentUserId.uuid === customer.id.uuid
      ? TX_TRANSITION_ACTOR_CUSTOMER
      : TX_TRANSITION_ACTOR_PROVIDER;
  } else {
    throw new Error(`Parameters for "userIsCustomer" function were wrong.
      currentUserId: ${currentUserId}, transaction: ${transaction}`);
  }
};

// ConditionalResolver utility
export const CONDITIONAL_RESOLVER_WILDCARD = '*';

export class ConditionalResolver {
  constructor(data) {
    this.data = data;
    this.resolver = null;
    this.defaultResolver = null;
  }
  cond(conditions, resolver) {
    if (conditions?.length === this.data.length && this.resolver == null) {
      const isDefined = item => typeof item !== 'undefined';
      const isWildcard = item => item === CONDITIONAL_RESOLVER_WILDCARD;
      const isMatch = conditions.reduce(
        (isPartialMatch, item, i) =>
          isPartialMatch && isDefined(item) && (isWildcard(item) || item === this.data[i]),
        true
      );
      this.resolver = isMatch ? resolver : null;
    }
    return this;
  }
  default(defaultResolver) {
    this.defaultResolver = defaultResolver;
    return this;
  }
  resolve() {
    return this.resolver ? this.resolver() : this.defaultResolver ? this.defaultResolver() : null;
  }
}
