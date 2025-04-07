/**
 * Transaction process graph for custom inquiries with pet profile:
 *   - biketribe-default-inquiry
 */

export const transitions = {
  INQUIRE_WITHOUT_PAYMENT: 'transition/inquire-without-payment',
  PROVIDE_PET_DETAILS: 'transition/provide-pet-details',
};

export const states = {
  INITIAL: 'initial',
  FREE_INQUIRY: 'free-inquiry',
  PET_DETAILS_PROVIDED: 'pet-details-provided',
};

export const graph = {
  id: 'biketribe-default-inquiry/release-1',
  initial: states.INITIAL,

  states: {
    [states.INITIAL]: {
      on: {
        [transitions.INQUIRE_WITHOUT_PAYMENT]: states.FREE_INQUIRY,
      },
    },
    [states.FREE_INQUIRY]: {
      on: {
        [transitions.PROVIDE_PET_DETAILS]: states.PET_DETAILS_PROVIDED,
      },
    },
    [states.PET_DETAILS_PROVIDED]: { type: 'final' },
  },
};

// Determines which transitions to show in ActivityFeed or transaction history
export const isRelevantPastTransition = transition => {
  return [
    transitions.INQUIRE_WITHOUT_PAYMENT,
    transitions.PROVIDE_PET_DETAILS,
  ].includes(transition);
};

export const isCustomerReview = () => false;
export const isProviderReview = () => false;
export const isPrivileged = () => false;
export const isCompleted = () => false;
export const isRefunded = () => false;
export const statesNeedingProviderAttention = [];
