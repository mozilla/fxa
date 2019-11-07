import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { logAmplitudeEvent } from '../lib/flow-event';
import * as Sentry from '@sentry/browser';
import { config } from '../lib/config';

const eventGroupNames = {
  createSubscription: 'subPaySetup',
  updatePayment: 'subPayManage',
  cancelSubscription: 'subCancel',
  manageSubscriptions: 'subManage',
};

const eventTypeNames = {
  view: 'view',
  engage: 'engage',
  submit: 'submit',
  success: 'success',
  fail: 'fail',
  complete: 'complete',
};

const getPlanPropsFromAction = (action: any) => {
  const { plan = {} } = action.meta || action.payload || {};
  return { planId: plan.plan_id, productId: plan.product_id };
};

const getFailureReasonFromAction = (action: any) => {
  if (action.payload && action.payload.message) {
    return { reason: action.payload.message };
  }

  return {};
};

export const AmplitudeMiddleware: Middleware = (
  api: MiddlewareAPI<Dispatch<AnyAction>, any>
) => (next: Dispatch<AnyAction>) => (action: any) => {
  // This middleware should not break anything in dispatching actions.
  try {
    switch (action.type) {
      case 'manageSubscriptionsMounted':
        logAmplitudeEvent(
          eventGroupNames.manageSubscriptions,
          eventTypeNames.view,
          config.perfStartTime,
          {}
        );
        break;
      case 'manageSubscriptionsEngaged':
        logAmplitudeEvent(
          eventGroupNames.manageSubscriptions,
          eventTypeNames.engage,
          config.perfStartTime,
          {}
        );
        break;

      case 'createSubscriptionMounted':
        logAmplitudeEvent(
          eventGroupNames.createSubscription,
          eventTypeNames.view,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        break;
      case 'createSubscriptionEngaged':
        logAmplitudeEvent(
          eventGroupNames.createSubscription,
          eventTypeNames.engage,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        break;
      case 'createSubscription_PENDING':
        logAmplitudeEvent(
          eventGroupNames.createSubscription,
          eventTypeNames.submit,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        break;
      case 'createSubscription_FULFILLED':
        logAmplitudeEvent(
          eventGroupNames.createSubscription,
          eventTypeNames.success,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        logAmplitudeEvent(
          eventGroupNames.createSubscription,
          eventTypeNames.complete,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        break;
      case 'createSubscription_REJECTED':
        logAmplitudeEvent(
          eventGroupNames.createSubscription,
          eventTypeNames.fail,
          config.perfStartTime,
          {
            ...getPlanPropsFromAction(action),
            ...getFailureReasonFromAction(action),
          }
        );
        break;

      case 'updatePaymentMounted':
        logAmplitudeEvent(
          eventGroupNames.updatePayment,
          eventTypeNames.view,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        break;
      case 'updatePaymentEngaged':
        logAmplitudeEvent(
          eventGroupNames.updatePayment,
          eventTypeNames.engage,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        break;
      case 'updatePayment_PENDING':
        logAmplitudeEvent(
          eventGroupNames.updatePayment,
          eventTypeNames.submit,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        break;
      case 'updatePayment_FULFILLED':
        logAmplitudeEvent(
          eventGroupNames.updatePayment,
          eventTypeNames.success,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        logAmplitudeEvent(
          eventGroupNames.updatePayment,
          eventTypeNames.complete,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        break;
      case 'updatePayment_REJECTED':
        logAmplitudeEvent(
          eventGroupNames.updatePayment,
          eventTypeNames.fail,
          config.perfStartTime,
          {
            ...getPlanPropsFromAction(action),
            ...getFailureReasonFromAction(action),
          }
        );
        break;

      case 'cancelSubscriptionMounted':
        logAmplitudeEvent(
          eventGroupNames.cancelSubscription,
          eventTypeNames.view,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        break;
      case 'cancelSubscriptionEngaged':
        logAmplitudeEvent(
          eventGroupNames.cancelSubscription,
          eventTypeNames.engage,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        break;
      case 'cancelSubscription_PENDING':
        logAmplitudeEvent(
          eventGroupNames.cancelSubscription,
          eventTypeNames.submit,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        break;
      case 'cancelSubscription_FULFILLED':
        logAmplitudeEvent(
          eventGroupNames.cancelSubscription,
          eventTypeNames.success,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        logAmplitudeEvent(
          eventGroupNames.cancelSubscription,
          eventTypeNames.complete,
          config.perfStartTime,
          getPlanPropsFromAction(action)
        );
        break;
      case 'cancelSubscription_REJECTED':
        logAmplitudeEvent(
          eventGroupNames.cancelSubscription,
          eventTypeNames.fail,
          config.perfStartTime,
          {
            ...getPlanPropsFromAction(action),
            ...getFailureReasonFromAction(action),
          }
        );
        break;
    }
  } catch (e) {
    console.error('AppError', e);
    Sentry.captureException(e);
  }

  next(action);
};
