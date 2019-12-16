import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { logAmplitudeEvent } from '../lib/flow-event';
import SentryMetrics from '../lib/sentry';
import { config } from '../lib/config';

const sentryMetrics = new SentryMetrics(config.sentry.dsn);

const eventGroupNames = {
  createSubscription: 'subPaySetup',
  upgradeSubscription: 'subPayUpgrade',
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
          {}
        );
        break;
      case 'manageSubscriptionsEngaged':
        logAmplitudeEvent(
          eventGroupNames.manageSubscriptions,
          eventTypeNames.engage,
          {}
        );
        break;

      case 'createSubscriptionMounted':
        logAmplitudeEvent(
          eventGroupNames.createSubscription,
          eventTypeNames.view,
          getPlanPropsFromAction(action)
        );
        break;
      case 'createSubscriptionEngaged':
        logAmplitudeEvent(
          eventGroupNames.createSubscription,
          eventTypeNames.engage,
          getPlanPropsFromAction(action)
        );
        break;
      case 'createSubscription_PENDING':
        logAmplitudeEvent(
          eventGroupNames.createSubscription,
          eventTypeNames.submit,
          getPlanPropsFromAction(action)
        );
        break;
      case 'createSubscription_FULFILLED':
        logAmplitudeEvent(
          eventGroupNames.createSubscription,
          eventTypeNames.success,
          getPlanPropsFromAction(action)
        );
        logAmplitudeEvent(
          eventGroupNames.createSubscription,
          eventTypeNames.complete,
          getPlanPropsFromAction(action)
        );
        break;
      case 'createSubscription_REJECTED':
        logAmplitudeEvent(
          eventGroupNames.createSubscription,
          eventTypeNames.fail,
          {
            ...getPlanPropsFromAction(action),
            ...getFailureReasonFromAction(action),
          }
        );
        break;

      case 'updateSubscriptionPlanMounted':
        logAmplitudeEvent(
          eventGroupNames.upgradeSubscription,
          eventTypeNames.view,
          getPlanPropsFromAction(action)
        );
        break;
      case 'updateSubscriptionPlanEngaged':
        logAmplitudeEvent(
          eventGroupNames.upgradeSubscription,
          eventTypeNames.engage,
          getPlanPropsFromAction(action)
        );
        break;
      case 'updateSubscriptionPlan_PENDING':
        logAmplitudeEvent(
          eventGroupNames.upgradeSubscription,
          eventTypeNames.submit,
          getPlanPropsFromAction(action)
        );
        break;
      case 'updateSubscriptionPlan_FULFILLED':
        logAmplitudeEvent(
          eventGroupNames.upgradeSubscription,
          eventTypeNames.success,
          getPlanPropsFromAction(action)
        );
        break;
      case 'updateSubscriptionPlan_REJECTED':
        logAmplitudeEvent(
          eventGroupNames.upgradeSubscription,
          eventTypeNames.fail,
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
          getPlanPropsFromAction(action)
        );
        break;
      case 'updatePaymentEngaged':
        logAmplitudeEvent(
          eventGroupNames.updatePayment,
          eventTypeNames.engage,
          getPlanPropsFromAction(action)
        );
        break;
      case 'updatePayment_PENDING':
        logAmplitudeEvent(
          eventGroupNames.updatePayment,
          eventTypeNames.submit,
          getPlanPropsFromAction(action)
        );
        break;
      case 'updatePayment_FULFILLED':
        logAmplitudeEvent(
          eventGroupNames.updatePayment,
          eventTypeNames.success,
          getPlanPropsFromAction(action)
        );
        logAmplitudeEvent(
          eventGroupNames.updatePayment,
          eventTypeNames.complete,
          getPlanPropsFromAction(action)
        );
        break;
      case 'updatePayment_REJECTED':
        logAmplitudeEvent(eventGroupNames.updatePayment, eventTypeNames.fail, {
          ...getPlanPropsFromAction(action),
          ...getFailureReasonFromAction(action),
        });
        break;

      case 'cancelSubscriptionMounted':
        logAmplitudeEvent(
          eventGroupNames.cancelSubscription,
          eventTypeNames.view,
          getPlanPropsFromAction(action)
        );
        break;
      case 'cancelSubscriptionEngaged':
        logAmplitudeEvent(
          eventGroupNames.cancelSubscription,
          eventTypeNames.engage,
          getPlanPropsFromAction(action)
        );
        break;
      case 'cancelSubscription_PENDING':
        logAmplitudeEvent(
          eventGroupNames.cancelSubscription,
          eventTypeNames.submit,
          getPlanPropsFromAction(action)
        );
        break;
      case 'cancelSubscription_FULFILLED':
        logAmplitudeEvent(
          eventGroupNames.cancelSubscription,
          eventTypeNames.success,
          getPlanPropsFromAction(action)
        );
        logAmplitudeEvent(
          eventGroupNames.cancelSubscription,
          eventTypeNames.complete,
          getPlanPropsFromAction(action)
        );
        break;
      case 'cancelSubscription_REJECTED':
        logAmplitudeEvent(
          eventGroupNames.cancelSubscription,
          eventTypeNames.fail,
          {
            ...getPlanPropsFromAction(action),
            ...getFailureReasonFromAction(action),
          }
        );
        break;
    }
  } catch (e) {
    console.error('AppError', e);
    sentryMetrics.captureException(e);
  }

  next(action);
};
