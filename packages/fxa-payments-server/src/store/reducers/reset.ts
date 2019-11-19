import { State } from '../types';
import { Action, ResetAction } from '../actions';
import defaultState from '../defaultState';

type ResetTypeToStoreMap = Record<ResetAction['type'], keyof State>;
const resetTypeToStoreMap: ResetTypeToStoreMap = {
  resetCancelSubscription: 'cancelSubscription',
  resetUpdateSubscriptionPlan: 'updateSubscriptionPlan',
  resetCreateSubscription: 'createSubscription',
  resetReactivateSubscription: 'reactivateSubscription',
  resetUpdatePayment: 'updatePayment',
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
