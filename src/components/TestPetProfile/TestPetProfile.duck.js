import { storableError } from '../../util/errors';
import { transition } from '../../util/api';

// Action types
export const SUBMIT_PET_PROFILE_REQUEST = 'app/PetProfileForm/SUBMIT_PET_PROFILE_REQUEST';
export const SUBMIT_PET_PROFILE_SUCCESS = 'app/PetProfileForm/SUBMIT_PET_PROFILE_SUCCESS';
export const SUBMIT_PET_PROFILE_ERROR = 'app/PetProfileForm/SUBMIT_PET_PROFILE_ERROR';

// Reducer
const initialState = {
  submitInProgress: false,
  submitError: null,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case SUBMIT_PET_PROFILE_REQUEST:
      return { ...state, submitInProgress: true, submitError: null };
    case SUBMIT_PET_PROFILE_SUCCESS:
      return { ...state, submitInProgress: false };
    case SUBMIT_PET_PROFILE_ERROR:
      return { ...state, submitInProgress: false, submitError: payload };
    default:
      return state;
  }
}

// Action creators
export const submitPetProfileRequest = () => ({ type: SUBMIT_PET_PROFILE_REQUEST });
export const submitPetProfileSuccess = () => ({ type: SUBMIT_PET_PROFILE_SUCCESS });
export const submitPetProfileError = error => ({
  type: SUBMIT_PET_PROFILE_ERROR,
  payload: error,
  error: true,
});

// Thunk
export const submitPetProfile = (transactionId, values) => (dispatch, getState, sdk) => {
  dispatch(submitPetProfileRequest());

  const transitionName = 'transition/provide-pet-details';

  return sdk.transactions
    .transition({
      id: transactionId,
      transition: transitionName,
      params: {
        protectedData: values,
      },
    })
    .then(() => {
      dispatch(submitPetProfileSuccess());
    })
    .catch(e => {
      dispatch(submitPetProfileError(storableError(e)));
    });
};
