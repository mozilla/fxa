/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Stripe,
  StripeCardElement,
  StripeElementsOptions,
  StripeError,
} from '@stripe/stripe-js';
import { CheckoutType } from 'fxa-shared/subscriptions/types';
import { SubscriptionCreateAuthServerAPIs } from '../routes/Product/SubscriptionCreate';
import { Customer, Plan } from '../store/types';
import {
  handlePasswordlessSignUp,
  PasswordlessSignupHandlerParam,
} from './account';
import { isExistingStripeCustomer, needsCustomer } from './customer';
import { GeneralError } from './errors';

export type RetryStatus = undefined | { invoiceId: string };
export type PaymentError = undefined | StripeError;
export type SubscriptionPaymentHandlerParam = {
  stripe: Pick<Stripe, 'createPaymentMethod' | 'confirmCardPayment'>;
  name: string;
  email: string;
  card: StripeCardElement | null;
  idempotencyKey: string;
  selectedPlan: Plan;
  customer: Customer | null;
  checkoutType: CheckoutType;
  retryStatus: RetryStatus;
  promotionCode?: string;
  apiDetachFailedPaymentMethod: SubscriptionCreateAuthServerAPIs['apiDetachFailedPaymentMethod'];
  onFailure: (error: PaymentError | GeneralError) => void;
  onRetry: (status: RetryStatus) => void;
  onSuccess: () => void;
};

export type SubscriptionCreateStripeAPIs = Pick<
  Stripe,
  'createPaymentMethod' | 'confirmCardPayment'
>;

export async function handlePasswordlessSubscription({
  email,
  clientId,
  stripe,
  name,
  card,
  idempotencyKey,
  selectedPlan,
  customer,
  checkoutType,
  retryStatus,
  promotionCode,
  apiCreateCustomer,
  apiCreateSubscriptionWithPaymentMethod,
  apiRetryInvoice,
  apiDetachFailedPaymentMethod,
  onFailure,
  onRetry,
  onSuccess,
}: PasswordlessSignupHandlerParam &
  SubscriptionPaymentHandlerParam &
  SubscriptionCreateAuthServerAPIs) {
  try {
    await handlePasswordlessSignUp({
      email,
      clientId,
    });

    return handleSubscriptionPayment({
      stripe,
      name,
      email,
      card,
      idempotencyKey,
      selectedPlan,
      customer,
      checkoutType,
      retryStatus,
      promotionCode,
      apiCreateCustomer,
      apiCreateSubscriptionWithPaymentMethod,
      apiRetryInvoice,
      apiDetachFailedPaymentMethod,
      onFailure,
      onRetry,
      onSuccess,
    });
  } catch (e) {
    onFailure(e);
  }
}

export async function handleSubscriptionPayment({
  stripe,
  name,
  card,
  email,
  idempotencyKey,
  selectedPlan,
  customer,
  checkoutType,
  retryStatus,
  promotionCode,
  apiCreateCustomer,
  apiCreateSubscriptionWithPaymentMethod,
  apiRetryInvoice,
  apiDetachFailedPaymentMethod,
  onFailure,
  onRetry,
  onSuccess,
}: SubscriptionPaymentHandlerParam & SubscriptionCreateAuthServerAPIs) {
  // If there's an existing card on record, GOTO 3

  if (isExistingStripeCustomer(customer)) {
    const createSubscriptionResult =
      await apiCreateSubscriptionWithPaymentMethod({
        priceId: selectedPlan.plan_id,
        productId: selectedPlan.product_id,
        promotionCode: promotionCode,
        checkoutType: checkoutType,
      });
    return handlePaymentIntent({
      customer,
      invoiceId: createSubscriptionResult.latest_invoice.id,
      invoiceStatus: createSubscriptionResult.latest_invoice.status,
      paymentIntentStatus:
        createSubscriptionResult.latest_invoice.payment_intent?.status,
      paymentIntentClientSecret:
        createSubscriptionResult.latest_invoice.payment_intent?.client_secret,
      paymentMethodId:
        createSubscriptionResult.latest_invoice.payment_intent?.payment_method,
      stripe,
      apiDetachFailedPaymentMethod,
      onSuccess,
      onFailure,
      onRetry,
    });
  }

  // 1. Create the payment method.
  const { paymentMethod, error: paymentError } =
    await stripe.createPaymentMethod({
      type: 'card',
      card: card as StripeCardElement,
      billing_details: {
        name,
        email,
      },
    });
  if (paymentError) {
    return onFailure(paymentError);
  }
  if (!paymentMethod) {
    return onFailure({ type: 'card_error' });
  }

  // 2. Create the customer, if necessary.
  if (needsCustomer(customer)) {
    // We look up the customer by UID & email on the server.
    // No need to retain the result of this call for later.
    await apiCreateCustomer({
      displayName: name,
    });
  }

  const commonPaymentIntentParams = {
    paymentMethodId: paymentMethod.id,
    stripe,
    apiDetachFailedPaymentMethod,
    onSuccess,
    onFailure,
    onRetry,
  };

  if (!retryStatus) {
    // 3a. Attempt to create the subscription.
    const createSubscriptionResult =
      await apiCreateSubscriptionWithPaymentMethod({
        priceId: selectedPlan.plan_id,
        productId: selectedPlan.product_id,
        paymentMethodId: paymentMethod.id,
        promotionCode: promotionCode,
        checkoutType: checkoutType,
      });
    return handlePaymentIntent({
      customer,
      invoiceId: createSubscriptionResult.latest_invoice.id,
      invoiceStatus: createSubscriptionResult.latest_invoice.status,
      paymentIntentStatus:
        createSubscriptionResult.latest_invoice.payment_intent?.status,
      paymentIntentClientSecret:
        createSubscriptionResult.latest_invoice.payment_intent?.client_secret,
      ...commonPaymentIntentParams,
    });
  } else {
    // 3b. Retry payment for the subscription invoice created earlier.
    const { invoiceId } = retryStatus;
    const retryInvoiceResult = await apiRetryInvoice({
      invoiceId: retryStatus.invoiceId,
      paymentMethodId: paymentMethod.id,
      idempotencyKey,
    });
    return handlePaymentIntent({
      customer,
      invoiceId,
      invoiceStatus: retryInvoiceResult.status,
      paymentIntentStatus: retryInvoiceResult.payment_intent.status,
      paymentIntentClientSecret:
        retryInvoiceResult.payment_intent.client_secret,
      ...commonPaymentIntentParams,
    });
  }
}

export async function handlePaymentIntent({
  customer,
  invoiceId,
  invoiceStatus,
  paymentIntentStatus,
  paymentIntentClientSecret,
  paymentMethodId,
  stripe,
  apiDetachFailedPaymentMethod,
  onSuccess,
  onFailure,
  onRetry,
}: {
  customer: Customer | null;
  invoiceId: string;
  invoiceStatus: string;
  paymentIntentStatus: string | null | undefined;
  paymentIntentClientSecret: string | null | undefined;
  paymentMethodId: string | undefined;
  stripe: Pick<Stripe, 'confirmCardPayment'>;
  apiDetachFailedPaymentMethod: SubscriptionCreateAuthServerAPIs['apiDetachFailedPaymentMethod'];
  onFailure: (error: PaymentError) => void;
  onRetry: (status: RetryStatus) => void;
  onSuccess: () => void;
}): Promise<void> {
  // An invoice with amount less than Stripe minimums won't have a paymentIntent.
  if (!paymentIntentStatus && invoiceStatus === 'paid') {
    return onSuccess();
  }

  switch (paymentIntentStatus) {
    case 'succeeded': {
      return onSuccess();
    }
    case 'requires_payment_method': {
      // If this happens when a customer is trying to subscribe to their first
      // product, detach the payment method.  The user must enter a working
      // card to move on; we'll get a working payment method from that.
      // This does not affect functionality, thus not blocking.
      if (
        (!customer || (customer && customer.subscriptions.length === 0)) &&
        paymentMethodId
      ) {
        apiDetachFailedPaymentMethod({ paymentMethodId });
      }
      return onRetry({ invoiceId });
    }
    case 'requires_action': {
      if (!paymentIntentClientSecret) {
        return onFailure({ type: 'api_error' });
      }
      const confirmResult = await stripe.confirmCardPayment(
        paymentIntentClientSecret,
        { payment_method: paymentMethodId }
      );
      if (confirmResult.error) {
        return onFailure(confirmResult.error);
      }
      if (!confirmResult.paymentIntent) {
        return onFailure({ type: 'api_error' });
      }
      return handlePaymentIntent({
        customer,
        invoiceId,
        invoiceStatus,
        paymentIntentStatus: confirmResult.paymentIntent.status,
        paymentIntentClientSecret: confirmResult.paymentIntent.client_secret,
        paymentMethodId,
        stripe,
        apiDetachFailedPaymentMethod,
        onSuccess,
        onFailure,
        onRetry,
      });
    }
    // Other payment_intent.status cases?
    default: {
      console.error('Unexpected payment intent status', paymentIntentStatus);
      return onFailure({ type: 'api_error' });
    }
  }
}

export const STRIPE_ELEMENT_STYLES = {
  style: {
    base: {
      fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      fontSize: '16px',
      fontWeight: '500',
      '::placeholder': {
        color: '#767676',
        fontSize: '16px',
        fontWeight: '400',
        height: '45px',
        lineHeight: 'normal',
      },
      '::-moz-placeholder': {
        lineHeight: '45px',
      },
      '&:-moz-ui-invalid': {
        boxShadow: 'none',
      },
    },
    invalid: {
      color: '#0c0c0d',
    },
  },
};

// TODO: Move to fxa-shared/l10n?
// see also: https://stripe.com/docs/js/appendix/supported_locales
enum stripeLocales {
  'ar',
  'bg',
  'cs',
  'da',
  'de',
  'el',
  'et',
  'en',
  'es',
  'fi',
  'fr',
  'he',
  'hu',
  'id',
  'it',
  'ja',
  'lt',
  'lv',
  'ms',
  'mt',
  'nb',
  'nl',
  'pl',
  'pt-BR',
  'pt',
  'ro',
  'ru',
  'sk',
  'sl',
  'sv',
  'tk',
  'zh',
}

/**
 * Stripe locales do not exactly match FxA locales. Mostly language tags
 * without subtags. This function should convert / normalize as necessary.
 */
type StripeLocale = StripeElementsOptions['locale'];
export const localeToStripeLocale = (locale?: string): StripeLocale => {
  if (locale) {
    if (locale in stripeLocales) {
      return locale as StripeLocale;
    }
    const lang = locale.split('-').shift();
    if (lang && lang in stripeLocales) {
      return lang as StripeLocale;
    }
  }
  return 'auto';
};
