import { Action, ResetAction } from '../actions';
import { State, defaultState } from '../state';

// This maps action types to store keys that can be reset to defaults.
type ResetTypeToStoreMap = Record<ResetAction['type'], keyof State>;
const resetTypeToStoreMap: ResetTypeToStoreMap = {
  resetCancelSubscription: 'cancelSubscription',
  resetUpdateSubscriptionPlan: 'updateSubscriptionPlan',
  resetReactivateSubscription: 'reactivateSubscription',
};

export default (state: State, action: Action): State => {
  if (action.type in resetTypeToStoreMap) {
    const stateKey =
      resetTypeToStoreMap[action.type as keyof ResetTypeToStoreMap];
    return {
      ...state,
      [stateKey]: defaultState[stateKey],
    };
  }
  return state;
};
