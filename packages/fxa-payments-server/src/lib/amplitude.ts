/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AUTH_SERVER_ERRNOS_REVERSE_MAP } from 'fxa-shared/lib/errors';
import { CheckoutType } from 'fxa-shared/subscriptions/types';

import { PaymentProvider } from '../lib/PaymentProvider';
import { Store } from '../store';
import { selectors } from '../store/selectors';
import { logAmplitudeEvent } from './flow-event';
import sentryMetrics from './sentry';

const eventGroupNames = {
  createAccount: 'subPayAccountSetup',
  createSubscription: 'subPaySetup',
  changeSubscription: 'subPaySubChange',
  updatePayment: 'subPayManage',
  cancelSubscription: 'subCancel',
  manageSubscriptions: 'subManage',
  createSubscriptionWithPaymentMethod: 'subPaySetup',
  updateDefaultPaymentMethod: 'subPayManage',
  coupon: 'subCoupon',
} as const;

const eventTypeNames = {
  view: 'view',
  engage: 'engage',
  submit: 'submit',
  success: 'success',
  fail: 'fail',
  other: 'other',
} as const;

type GlobalEventProperties = {
  uid?: string;
  subscribed_plan_ids?: string;
};

export type EventProperties = GlobalEventProperties & {
  planId?: string;
  plan_id?: string;
  productId?: string;
  product_id?: string;
  paymentProvider?: PaymentProvider;
  previousPlanId?: string;
  previous_plan_id?: string;
  previousProductId?: string;
  previous_product_id?: string;
  promotionCode?: string;
  error?: Error;
  checkoutType?: CheckoutType;
  utm_campaign?: string;
  utm_content?: string;
  utm_medium?: string;
  utm_referrer?: string;
  utm_source?: string;
  utm_term?: string;
  other?: string;
  subscriptionId?: string;
};

type SuccessfulSubscriptionEventProperties = EventProperties & {
  country_code_source?: string;
};

type Error = { code?: string } | null;

export function getErrorId(error: any) {
  let errorId = 'unknown_error';
  // Auth server AppErrors have an errno
  if (error && error.errno && AUTH_SERVER_ERRNOS_REVERSE_MAP[error.errno]) {
    errorId = AUTH_SERVER_ERRNOS_REVERSE_MAP[error.errno];
    // Stripe API errors don't have an errno
  } else if (error && error.code && typeof error.code === 'string') {
    errorId = error.code;
  }
  return errorId.toLowerCase();
}

// These can still be overwritten in the event logging function.
let globalEventProperties: GlobalEventProperties = {};

export function addGlobalEventProperties(props: GlobalEventProperties) {
  globalEventProperties = { ...globalEventProperties, ...props };
}

export function subscribeToReduxStore(store: Store) {
  let unsubscribe: ReturnType<typeof store.subscribe>;
  const obs = () => {
    const profile = selectors.profile(store.getState());
    const subscriptions = selectors.customerSubscriptions(store.getState());

    if (
      profile?.result &&
      profile.result.uid &&
      profile.result.metricsEnabled !== false
    ) {
      addGlobalEventProperties({ uid: profile.result.uid });
    }

    if (subscriptions) {
      const subscribed_plan_ids = subscriptions
        .map((sub) => {
          if ('plan_id' in sub) {
            return sub.plan_id;
          }
          return sub.price_id;
        })
        .join(',');

      addGlobalEventProperties({ subscribed_plan_ids: subscribed_plan_ids });
    }

    if (
      globalEventProperties.uid &&
      globalEventProperties.subscribed_plan_ids
    ) {
      unsubscribe?.();
    }
  };
  unsubscribe = store.subscribe(obs);
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
    previousPlanId = undefined,
    previous_plan_id = undefined,
    previousProductId = undefined,
    previous_product_id = undefined,
    utm_campaign = undefined,
    utm_content = undefined,
    utm_medium = undefined,
    utm_referrer = undefined,
    utm_source = undefined,
    utm_term = undefined,
    ...otherEventProperties
  } = eventProperties;

  return {
    planId: planId || plan_id,
    productId: productId || product_id,
    paymentProvider,
    previousPlanId: previousPlanId || previous_plan_id,
    previousProductId: previousProductId || previous_product_id,
    error_id: error ? getErrorId(error) : undefined,
    utm_campaign,
    utm_content,
    utm_medium,
    utm_referrer,
    utm_source,
    utm_term,
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

export function updatePayment_PENDING(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.updatePayment,
    eventTypeNames.submit,
    eventProperties
  );
}

export function updatePayment_FULFILLED(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.updatePayment,
    eventTypeNames.success,
    eventProperties
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
    eventTypeNames.success,
    eventProperties
  );
}

export function createSubscriptionWithPaymentMethod_REJECTED(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.createSubscriptionWithPaymentMethod,
    eventTypeNames.fail,
    eventProperties
  );
}

export function updateDefaultPaymentMethod_PENDING(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.updateDefaultPaymentMethod,
    eventTypeNames.submit,
    eventProperties
  );
}

export function updateDefaultPaymentMethod_FULFILLED(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.updateDefaultPaymentMethod,
    eventTypeNames.success,
    eventProperties
  );
}

export function updateDefaultPaymentMethod_REJECTED(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.updateDefaultPaymentMethod,
    eventTypeNames.fail,
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
    eventGroupNames.changeSubscription,
    eventTypeNames.view,
    eventProperties
  );
}

export function updateSubscriptionPlanEngaged(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.changeSubscription,
    eventTypeNames.engage,
    eventProperties
  );
}

export function updateSubscriptionPlan_PENDING(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.changeSubscription,
    eventTypeNames.submit,
    eventProperties
  );
}

export function updateSubscriptionPlan_FULFILLED(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.changeSubscription,
    eventTypeNames.success,
    eventProperties
  );
}

export function updateSubscriptionPlan_REJECTED(
  eventProperties: EventProperties
) {
  safeLogAmplitudeEvent(
    eventGroupNames.changeSubscription,
    eventTypeNames.fail,
    eventProperties
  );
}

export function createAccountMounted(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.createAccount,
    eventTypeNames.view,
    eventProperties
  );
}

export function createAccountEngaged(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.createAccount,
    eventTypeNames.engage,
    eventProperties
  );
}

export function createAccountSignIn(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.createAccount,
    eventTypeNames.other,
    eventProperties
  );
}

export function couponMounted(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.coupon,
    eventTypeNames.view,
    eventProperties
  );
}

export function couponEngaged(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.coupon,
    eventTypeNames.engage,
    eventProperties
  );
}

export function coupon_PENDING(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.coupon,
    eventTypeNames.submit,
    eventProperties
  );
}

export function coupon_FULFILLED(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.coupon,
    eventTypeNames.success,
    eventProperties
  );
}

export function coupon_REJECTED(eventProperties: EventProperties) {
  safeLogAmplitudeEvent(
    eventGroupNames.coupon,
    eventTypeNames.fail,
    eventProperties
  );
}
