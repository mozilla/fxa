import { StripeError } from '@stripe/stripe-js';

export type GeneralError = {
  code: string;
  errno?: number;
  message?: string;
};

// ref: fxa-auth-server/lib/error.js
const AuthServerErrno = {
  UNKNOWN_SUBSCRIPTION_CUSTOMER: 176,
  UNKNOWN_SUBSCRIPTION: 177,
  UNKNOWN_SUBSCRIPTION_PLAN: 178,
  REJECTED_SUBSCRIPTION_PAYMENT_TOKEN: 179,
  SUBSCRIPTION_ALREADY_CANCELLED: 180,
  REJECTED_CUSTOMER_UPDATE: 181,
};

/*
 * Todos:
 * - handle General SubHub subscription creation failure on submit
 *   (network issue, server error)
 * - handle Payment token not valid
 */

const CARD_ERROR = 'card-error';
const BASIC_ERROR = 'basic-error-message';
const PAYMENT_ERROR_1 = 'payment-error-1';
const PAYMENT_ERROR_2 = 'payment-error-2';
const PAYMENT_ERROR_3 = 'payment-error-3b';
const FXA_SIGNUP_ERROR = 'fxa-account-signup-error-2';
const FXA_NEWSLETTER_SIGNUP_ERROR = 'newsletter-signup-error';
const FXA_POST_PASSWORDLESS_SUB_ERROR = 'fxa-post-passwordless-sub-error';

/*
 * errorToErrorMessageMap - the keys are lookups, that
 * are assembled in getErrorMessage. The values are strings
 * that correspond to ftl strings.
 */
const errorToErrorMessageMap: { [key: string]: string } = {
  expired_card: 'expired-card-error',
  insufficient_funds: 'insufficient-funds-error',
  withdrawal_count_limit_exceeded: 'withdrawal-count-limit-error',
  charge_exceeds_source_limit: 'charge-exceeds-source-limit-error',
  instant_payouts_unsupported: 'instant-payouts-unsupported-error',
  duplicate_transaction: 'duplicate-transaction-error',
  coupon_expired: 'coupon-expired-error',
  card_error: 'card-error',
  // todo: handle "parameters_exclusive": "Your already subscribed to _product_"
  // Currency errors
  'Funding source country does not match plan currency.':
    'country-currency-mismatch',
  'Changing currencies is not permitted.': 'currency-currency-mismatch',
  no_subscription_change: 'no-subscription-change',
  iap_already_subscribed: 'iap-already-subscribed',
};

const cardErrors = ['card_declined', 'incorrect_cvc'];

const basicErrors = [
  'api_key_expired',
  'platform_api_key_expired',
  'rate_limit',
  'UNKNOWN', // TODO: General SubHub subscription creation failure on submit (network issue, server error)
  'api_connection_error',
  'api_error',
  'invalid_request_error',
  'UNKNOWN', // TODO: Payment token not valid
  'state_unsupported',
  'invalid_source_usage',
  'invoice_no_customer_line_items',
  'invoice_no_subscription_line_items',
  'invoice_not_editable',
  'invoice_upcoming_none',
  'missing',
  'order_creation_failed',
  'order_required_settings',
  'order_status_invalid',
  'order_upstream_timeout',
  'payment_intent_incompatible_payment_method',
  'payment_intent_unexpected_state',
  'payment_method_unactivated',
  'payment_method_unexpected_state',
  'payouts_not_allowed',
  'resource_already_exists',
  'resource_missing',
  'secret_key_required',
  'sepa_unsupported_account',
  'shipping_calculation_failed',
  'tax_id_invalid',
  'taxes_calculation_failed',
  'tls_version_unsupported',
  'token_already_used',
  'token_in_use',
  'transfers_not_allowed',
];

const paymentErrors1 = [
  'approve_with_id',
  'issuer_not_available',
  'processing_error',
  'reenter_transaction',
  'try_again_later',
  'payment_intent_authentication_failure',
  'setup_intent_authentication_failure',
  'processing_error',
];

const paymentErrors2 = [
  'call_issuer',
  'card_not_supported',
  'card_velocity_exceeded',
  'do_not_honor',
  'do_not_try_again',
  'fraudulent',
  'generic_decline',
  'invalid_account',
  'lost_card',
  'merchant_blacklist',
  'new_account_information_available',
  'no_action_taken',
  'not_permitted',
  'pickup_card',
  'restricted_card',
  'revocation_of_all_authorizations',
  'revocation_of_authorization',
  'security_violation',
  'service_not_allowed',
  'stolen_card',
  'stop_payment_order',
  'transaction_not_allowed',
];

const paymentErrors3 = ['general-paypal-error'];
const signupErrors = ['fxa_account_signup_error'];
const newsletterSignupErrors = ['fxa_newsletter_signup_error'];
const postSuccessSubErrors = ['fxa_fetch_profile_customer_error'];

cardErrors.forEach((k) => (errorToErrorMessageMap[k] = CARD_ERROR));
basicErrors.forEach((k) => (errorToErrorMessageMap[k] = BASIC_ERROR));
paymentErrors1.forEach((k) => (errorToErrorMessageMap[k] = PAYMENT_ERROR_1));
paymentErrors2.forEach((k) => (errorToErrorMessageMap[k] = PAYMENT_ERROR_2));
paymentErrors3.forEach((k) => (errorToErrorMessageMap[k] = PAYMENT_ERROR_3));
signupErrors.forEach((k) => (errorToErrorMessageMap[k] = FXA_SIGNUP_ERROR));
newsletterSignupErrors.forEach(
  (k) => (errorToErrorMessageMap[k] = FXA_NEWSLETTER_SIGNUP_ERROR)
);
postSuccessSubErrors.forEach(
  (k) => (errorToErrorMessageMap[k] = FXA_POST_PASSWORDLESS_SUB_ERROR)
);

function getErrorMessage(error: undefined | StripeError | GeneralError) {
  if (!error) {
    return BASIC_ERROR;
  }
  let lookup = 'UNKNOWN';
  // Handle case where we need to lookup by message (e.g. currency error)
  if (error.message && errorToErrorMessageMap[error.message]) {
    lookup = error.message;
  } else if (error.code && errorToErrorMessageMap[error.code]) {
    lookup = error.code;
  }
  return errorToErrorMessageMap[lookup];
}

// BASIC_ERROR and PAYMENT_ERROR_1 are exported for errors.test.tsx
export {
  AuthServerErrno,
  getErrorMessage,
  BASIC_ERROR,
  PAYMENT_ERROR_1,
  PAYMENT_ERROR_2,
  PAYMENT_ERROR_3,
};
