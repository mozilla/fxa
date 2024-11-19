import { StripeError } from '@stripe/stripe-js';

export type GeneralError = {
  code: string;
  errno?: number;
  message?: string;
};

// ref: fxa-auth-server/lib/error.js
const AuthServerErrno = {
  ACCOUNT_EXISTS: 101,
  INVALID_CURRENCY: 211,
  INVALID_REGION: 130,
  REJECTED_CUSTOMER_UPDATE: 181,
  REJECTED_SUBSCRIPTION_PAYMENT_TOKEN: 179,
  SUBSCRIPTION_ALREADY_CANCELLED: 180,
  UNKNOWN_SUBSCRIPTION: 177,
  UNKNOWN_SUBSCRIPTION_CUSTOMER: 176,
  UNKNOWN_SUBSCRIPTION_PLAN: 178,
  UNSUPPORTED_LOCATION: 213,
};

export enum CouponErrorMessageType {
  Expired = 'coupon-error-expired',
  LimitReached = 'coupon-error-limit-reached',
  Invalid = 'coupon-error-invalid',
  Generic = 'coupon-error-generic',
}

const BASIC_ERROR = 'basic-error-message';
const CARD_ERROR = 'card-error';
const CHARGE_EXCEEDS_SOURCE_LIMIT = 'charge-exceeds-source-limit';
const COUNTRY_CURRENCY_MISMATCH = 'country-currency-mismatch';
const CURRENCY_CURRENCY_MISMATCH = 'currency-currency-mismatch';
const DUPLICATE_TRANSACTION = 'duplicate-transaction';
const EXPIRED_CARD_ERROR = 'expired-card-error';
const FXA_NEWSLETTER_SIGNUP_ERROR = 'newsletter-signup-error';
const FXA_POST_PASSWORDLESS_SUB_ERROR = 'fxa-post-passwordless-sub-error';
const FXA_SIGNUP_ERROR = 'fxa-account-signup-error-2';
const IAP_ALREADY_SUBSCRIBED = 'iap-already-subscribed';
const INSTANT_PAYOUTS_UNSUPPORTED = 'instant-payouts-unsupported';
const INSUFFICIENT_FUNDS_ERROR = 'insufficient-funds-error';
const LOCATION_UNSUPPORTED = 'location-unsupported';
const NO_SUBSCRIPTION_CHANGE = 'no-subscription-change';
const PAYMENT_ERROR_1 = 'payment-error-1';
const PAYMENT_ERROR_2 = 'payment-error-2';
const PAYMENT_ERROR_3 = 'payment-error-3b';
const WITHDRAW_COUNT_LIMIT_EXCEEDED_ERROR =
  'withdrawal-count-limit-exceeded-error';

/*
 * errorToErrorMessageIdMap - the keys are lookups, that
 * are assembled in getErrorMessageId. The values are strings
 * that correspond to ftl strings.
 *
 * Many of these error codes are Stripe error codes, from either
 * https://stripe.com/docs/error-codes or
 * https://stripe.com/docs/declines/codes.
 */
const errorToErrorMessageIdMap: { [key: string]: string } = {
  // card errors
  card_declined: CARD_ERROR,
  incorrect_cvc: CARD_ERROR,

  // basic errors
  api_key_expired: BASIC_ERROR,
  api_connection_error: BASIC_ERROR,
  api_error: BASIC_ERROR,
  invalid_request_error: BASIC_ERROR,
  invalid_source_usage: BASIC_ERROR,
  invoice_no_customer_line_items: BASIC_ERROR,
  invoice_no_subscription_line_items: BASIC_ERROR,
  invoice_not_editable: BASIC_ERROR,
  invoice_upcoming_none: BASIC_ERROR,
  platform_api_key_expired: BASIC_ERROR,
  rate_limit: BASIC_ERROR,
  state_unsupported: BASIC_ERROR,
  unknown: BASIC_ERROR,

  // https://stripe.com/docs/error-codes#missing
  missing: BASIC_ERROR,
  order_creation_failed: BASIC_ERROR,
  order_required_settings: BASIC_ERROR,
  order_status_invalid: BASIC_ERROR,
  order_upstream_timeout: BASIC_ERROR,
  payment_intent_incompatible_payment_method: BASIC_ERROR,
  payment_intent_unexpected_state: BASIC_ERROR,
  payment_method_unactivated: BASIC_ERROR,
  payment_method_unexpected_state: BASIC_ERROR,
  payouts_not_allowed: BASIC_ERROR,
  resource_already_exists: BASIC_ERROR,
  resource_missing: BASIC_ERROR,
  secret_key_required: BASIC_ERROR,
  sepa_unsupported_account: BASIC_ERROR,
  shipping_calculation_failed: BASIC_ERROR,
  tax_id_invalid: BASIC_ERROR,
  taxes_calculation_failed: BASIC_ERROR,
  tls_version_unsupported: BASIC_ERROR,
  token_already_used: BASIC_ERROR,
  token_in_use: BASIC_ERROR,
  transfers_not_allowed: BASIC_ERROR,

  // payment error 1
  approve_with_id: PAYMENT_ERROR_1,
  issuer_not_available: PAYMENT_ERROR_1,
  payment_intent_authentication_failure: PAYMENT_ERROR_1,
  processing_error: PAYMENT_ERROR_1,
  reenter_transaction: PAYMENT_ERROR_1,
  setup_intent_authentication_failure: PAYMENT_ERROR_1,
  try_again_later: PAYMENT_ERROR_1,

  // payment error 2
  call_issuer: PAYMENT_ERROR_2,
  card_not_supported: PAYMENT_ERROR_2,
  card_velocity_exceeded: PAYMENT_ERROR_2,
  do_not_honor: PAYMENT_ERROR_2,
  do_not_try_again: PAYMENT_ERROR_2,
  fraudulent: PAYMENT_ERROR_2,
  generic_decline: PAYMENT_ERROR_2,
  invalid_account: PAYMENT_ERROR_2,
  lost_card: PAYMENT_ERROR_2,
  merchant_blacklist: PAYMENT_ERROR_2,
  new_account_information_available: PAYMENT_ERROR_2,
  no_action_taken: PAYMENT_ERROR_2,
  not_permitted: PAYMENT_ERROR_2,
  pickup_card: PAYMENT_ERROR_2,
  restricted_card: PAYMENT_ERROR_2,
  revocation_of_all_authorizations: PAYMENT_ERROR_2,
  revocation_of_authorization: PAYMENT_ERROR_2,
  security_violation: PAYMENT_ERROR_2,
  service_not_allowed: PAYMENT_ERROR_2,
  stolen_card: PAYMENT_ERROR_2,
  stop_payment_order: PAYMENT_ERROR_2,
  transaction_not_allowed: PAYMENT_ERROR_2,

  // payment error 3
  general_paypal_error: PAYMENT_ERROR_3,

  // account sign up errors
  fxa_account_signup_error: FXA_SIGNUP_ERROR,

  // newsletter signup errors
  fxa_newsletter_signup_error: FXA_NEWSLETTER_SIGNUP_ERROR,

  // post success subscription errors
  card_error: CARD_ERROR,
  charge_exceeds_source_limit: 'charge-exceeds-source-limit-error',
  duplicate_transaction: 'duplicate-transaction-error',
  expired_card: EXPIRED_CARD_ERROR,
  fxa_fetch_profile_customer_error: FXA_POST_PASSWORDLESS_SUB_ERROR,
  instant_payouts_unsupported: 'instant-payouts-unsupported-error',
  insufficient_funds: INSUFFICIENT_FUNDS_ERROR,
  withdrawal_count_limit_exceeded: WITHDRAW_COUNT_LIMIT_EXCEEDED_ERROR,

  // Currency errors
  country_currency_mismatch: COUNTRY_CURRENCY_MISMATCH,
  currency_currency_mismatch: CURRENCY_CURRENCY_MISMATCH,

  // IAP and/or upgrade errors
  iap_already_subscribed: IAP_ALREADY_SUBSCRIBED,
  iap_upgrade_contact_support: 'iap-upgrade-contact-support',
  no_subscription_change: NO_SUBSCRIPTION_CHANGE,

  // Unsupported location
  location_unsupported: LOCATION_UNSUPPORTED,
};

// Dictionary of fluentIds and corresponding human-readable error messages
// Each error ID key should have a matching error ID property in errorToErrorMessageIdMap
const fallbackErrorMessage: { [key: string]: string } = {
  // specific error messages
  [CHARGE_EXCEEDS_SOURCE_LIMIT]:
    'It looks like this transaction will put you over your daily credit limit. Try another card or in 24 hours.',
  [COUNTRY_CURRENCY_MISMATCH]:
    'The currency of this subscription is not valid for the country associated with your payment.',
  [CURRENCY_CURRENCY_MISMATCH]: 'Sorry. You can’t switch between currencies.',
  [DUPLICATE_TRANSACTION]:
    'Hmm. Looks like an identical transaction was just sent. Check your payment history.',
  [EXPIRED_CARD_ERROR]:
    'It looks like your credit card has expired. Try another card.',
  [IAP_ALREADY_SUBSCRIBED]:
    'You’re already subscribed through the { $mobileAppStore }.',
  [INSTANT_PAYOUTS_UNSUPPORTED]:
    'It looks like your debit card isn’t setup for instant payments. Try another debit or credit card.',
  [INSUFFICIENT_FUNDS_ERROR]:
    'It looks like your card has insufficient funds. Try another card.',
  [LOCATION_UNSUPPORTED]:
    'Your current location is not supported according to our Terms of Service.',
  [NO_SUBSCRIPTION_CHANGE]: 'Sorry. You can’t change your subscription plan.',
  [WITHDRAW_COUNT_LIMIT_EXCEEDED_ERROR]:
    'It looks like this transaction will put you over your credit limit. Try another card.',

  // generic messages for groups of similar errors
  [BASIC_ERROR]: 'Something went wrong. Please try again later.',
  [CARD_ERROR]:
    'Your transaction could not be processed. Please verify your credit card information and try again.',
  [PAYMENT_ERROR_1]:
    'Hmm. There was a problem authorizing your payment. Try again or get in touch with your card issuer.',
  [PAYMENT_ERROR_2]:
    'Hmm. There was a problem authorizing your payment. Get in touch with your card issuer.',
  [PAYMENT_ERROR_3]:
    'An unexpected error has occurred while processing your payment, please try again.',
  [FXA_NEWSLETTER_SIGNUP_ERROR]:
    'You’re not signed up for product update emails. You can try again in your account settings.',
  [FXA_POST_PASSWORDLESS_SUB_ERROR]:
    'Subscription confirmed, but the confirmation page failed to load. Please check your email to set up your account.',
  [FXA_SIGNUP_ERROR]:
    'A system error caused your { $productName } sign-up to fail. Your payment method has not been charged. Please try again.',

  // coupon error messages
  [CouponErrorMessageType.Expired]: 'The code you entered has expired.',
  [CouponErrorMessageType.Generic]:
    'An error occurred processing the code. Please try again.',
  [CouponErrorMessageType.Invalid]: 'The code you entered is invalid.',
  [CouponErrorMessageType.LimitReached]:
    'The code you entered has reached its limit.',
};

// Gets the l10n fluent ID for an error
function getErrorMessageId(error: undefined | StripeError | GeneralError) {
  if (!error) {
    return BASIC_ERROR;
  }
  let lookup = 'unknown';
  if (error.code && errorToErrorMessageIdMap[error.code]) {
    lookup = error.code;
  } else if ('errno' in error) {
    switch (error.errno) {
      case AuthServerErrno.INVALID_REGION:
        lookup = 'country_currency_mismatch';
        break;
      case AuthServerErrno.INVALID_CURRENCY:
        lookup = 'currency_currency_mismatch';
        break;
      case AuthServerErrno.UNSUPPORTED_LOCATION:
        lookup = 'location_unsupported';
        break;
    }
  }
  return errorToErrorMessageIdMap[lookup];
}

// takes in a fluentId and returns the corresponding human-readable error message
// if no key is provided or it cannot be found in the dictionary, return basic error message
const getFallbackTextByFluentId = (key?: string) => {
  if (!key || !fallbackErrorMessage[key]) {
    return fallbackErrorMessage[BASIC_ERROR];
  }

  return fallbackErrorMessage[key];
};

// BASIC_ERROR, COUNTRY_CURRENCY_MISMATCH, LOCATION_UNSUPPORTED, and PAYMENT_ERROR_1 are exported for errors.test.tsx
export {
  AuthServerErrno,
  getErrorMessageId,
  getFallbackTextByFluentId,
  BASIC_ERROR,
  COUNTRY_CURRENCY_MISMATCH,
  LOCATION_UNSUPPORTED,
  PAYMENT_ERROR_1,
  PAYMENT_ERROR_2,
  PAYMENT_ERROR_3,
};
