import sentryMetrics from './sentry';
import { logAmplitudeEvent } from './flow-event';
import { ProviderType } from '../lib/PaymentProvider';
import { selectors } from '../store/selectors';
import { Store } from '../store';

const eventGroupNames = {
  createSubscription: 'subPaySetup',
  upgradeSubscription: 'subPayUpgrade',
  updatePayment: 'subPayManage',
  cancelSubscription: 'subCancel',
  manageSubscriptions: 'subManage',
  createSubscriptionWithPaymentMethod: 'subPaySetup',
  updateDefaultPaymentMethod: 'subPayManage',
} as const;

const eventTypeNames = {
  view: 'view',
  engage: 'engage',
  submit: 'submit',
  success: 'success',
  fail: 'fail',
  complete: 'complete',

  submit3DS: '3ds-submit',
  success3DS: '3ds-success',
  fail3DS: '3ds-fail',
  complete3DS: '3ds-complete',
} as const;

type GlobalEventProperties = {
  uid?: string;
};

export type EventProperties = GlobalEventProperties & {
  planId?: string;
  plan_id?: string;
  productId?: string;
  product_id?: string;
  paymentProvider?: ProviderType;
  error?: Error;
};

type SuccessfulSubscriptionEventProperties = EventProperties & {
  sourceCountry?: string;
};

type Error = { message?: string } | null;

// These can still be overwritten in the event logging function.
let globalEventProperties = {};

function addGlobalEventProperties(props: GlobalEventProperties) {
  globalEventProperties = { ...globalEventProperties, ...props };
}

export function subscribeToReduxStore(store: Store) {
  let unsubscribe: ReturnType<typeof store.subscribe>;
  const uidObs = () => {
    const profile = selectors.profile(store.getState());
    if (profile && profile.result && profile.result.uid) {
      addGlobalEventProperties({ uid: profile.result.uid });
      unsubscribe?.();
    }
  };
  unsubscribe = store.subscribe(uidObs);
}

// This should help ensure failure to log an Amplitude event doesn't
// derail what we're instrumenting.
const safeLogAmplitudeEvent = (
  groupName: string,
  eventName: string,
  eventProperties: object
) => {
  try {
    logAmplitudeEvent(
      groupName,
      eventName,
      normalizeEventProperties({ ...globalEventProperties, ...eventProperties })
    );
  } catch (e) {
    console.error('AppError', e);
    sentryMetrics.captureException(e);
  }
};

// Accepting both planId & plan_id allows us to directly use a Plan type
// as EventProperties
const normalizeEventProperties = (eventProperties: EventProperties) => {
  const {
    error = undefined,
    planId = undefined,
    plan_id = undefined,
    productId = undefined,
    product_id = undefined,
    paymentProvider = undefined,
    ...otherEventProperties
  } = eventProperties;

  return {
    planId: planId || plan_id,
    productId: productId || product_id,
    paymentProvider,
    reason: error && error.message ? error.message : undefined,
    ...otherEventProperties,
  };
};

export function manageSubscriptionsMounted() {
  safeLogAmplitudeEvent(
    eventGroupNames.manageSubscriptions,
    eventTypeNames.view,
    {}
  );
}

export function manageSubscriptionsEngaged() {
  safeLogAmplitudeEvent(
    eventGroupNames.manageSubscriptions,
    eventTypeNames.engage,
    {}
  );
}

export function createSubscriptionMounted(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.createSubscription,
    eventTypeNames.view,
    eventProperties
  );
}

export function createSubscriptionEngaged(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.createSubscription,
    eventTypeNames.engage,
    eventProperties
  );
}

export function createSubscription_PENDING(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.createSubscription,
    eventTypeNames.submit,
    eventProperties
  );
}

export function createSubscription_FULFILLED(
  eventProperties: SuccessfulSubscriptionEventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.createSubscription,
    eventTypeNames.success,
    eventProperties
  );
  safeLogAmplitudeEvent(
    eventGroupNames.createSubscription,
    eventTypeNames.complete,
    eventProperties
  );
}

export function createSubscription_REJECTED(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.createSubscription,
    eventTypeNames.fail,
    eventProperties
  );
}

export function updatePaymentMounted() {
  safeLogAmplitudeEvent(eventGroupNames.updatePayment, eventTypeNames.view, {});
}

export function updatePaymentEngaged() {
  safeLogAmplitudeEvent(
    eventGroupNames.updatePayment,
    eventTypeNames.engage,
    {}
  );
}

export function updatePayment_PENDING() {
  safeLogAmplitudeEvent(
    eventGroupNames.updatePayment,
    eventTypeNames.submit,
    {}
  );
}

export function updatePayment_FULFILLED() {
  safeLogAmplitudeEvent(
    eventGroupNames.updatePayment,
    eventTypeNames.success,
    {}
  );
  safeLogAmplitudeEvent(
    eventGroupNames.updatePayment,
    eventTypeNames.complete,
    {}
  );
}

export function updatePayment_REJECTED(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.updatePayment,
    eventTypeNames.fail,
    eventProperties
  );
}

export function createSubscriptionWithPaymentMethod_PENDING(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.createSubscriptionWithPaymentMethod,
    eventTypeNames.submit,
    eventProperties
  );
}

export function createSubscriptionWithPaymentMethod_FULFILLED(
  eventProperties: SuccessfulSubscriptionEventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.createSubscriptionWithPaymentMethod,
    eventTypeNames.success3DS,
    eventProperties
  );
  safeLogAmplitudeEvent(
    eventGroupNames.createSubscriptionWithPaymentMethod,
    eventTypeNames.complete3DS,
    eventProperties
  );
}

export function createSubscriptionWithPaymentMethod_REJECTED(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.createSubscriptionWithPaymentMethod,
    eventTypeNames.fail3DS,
    eventProperties
  );
}

export function updateDefaultPaymentMethod_PENDING(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.updateDefaultPaymentMethod,
    eventTypeNames.submit3DS,
    eventProperties
  );
}

export function updateDefaultPaymentMethod_FULFILLED(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.updateDefaultPaymentMethod,
    eventTypeNames.success3DS,
    eventProperties
  );
  safeLogAmplitudeEvent(
    eventGroupNames.updateDefaultPaymentMethod,
    eventTypeNames.complete3DS,
    eventProperties
  );
}

export function updateDefaultPaymentMethod_REJECTED(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.updateDefaultPaymentMethod,
    eventTypeNames.fail3DS,
    eventProperties
  );
}

export function cancelSubscriptionMounted(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.cancelSubscription,
    eventTypeNames.view,
    eventProperties
  );
}

export function cancelSubscriptionEngaged(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.cancelSubscription,
    eventTypeNames.engage,
    eventProperties
  );
}

export function cancelSubscription_PENDING(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.cancelSubscription,
    eventTypeNames.submit,
    eventProperties
  );
}

export function cancelSubscription_FULFILLED(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.cancelSubscription,
    eventTypeNames.success,
    eventProperties
  );
  safeLogAmplitudeEvent(
    eventGroupNames.cancelSubscription,
    eventTypeNames.complete,
    eventProperties
  );
}

export function cancelSubscription_REJECTED(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.cancelSubscription,
    eventTypeNames.fail,
    eventProperties
  );
}

export function updateSubscriptionPlanMounted(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.upgradeSubscription,
    eventTypeNames.view,
    eventProperties
  );
}

export function updateSubscriptionPlanEngaged(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.upgradeSubscription,
    eventTypeNames.engage,
    eventProperties
  );
}

export function updateSubscriptionPlan_PENDING(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.upgradeSubscription,
    eventTypeNames.submit,
    eventProperties
  );
}

export function updateSubscriptionPlan_FULFILLED(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.upgradeSubscription,
    eventTypeNames.success,
    eventProperties
  );
}

export function updateSubscriptionPlan_REJECTED(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.upgradeSubscription,
    eventTypeNames.fail,
    eventProperties
  );
}
