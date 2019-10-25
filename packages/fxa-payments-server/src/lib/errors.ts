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
 * - L10N
 * - handle General SubHub subscription creation failure on submit
 *   (network issue, server error)
 * - handle Payment token not valid
 */

const BASIC_ERROR = 'Something went wrong. Please try again later.';
const PAYMENT_ERROR_1 =
  'Hmm. There was a problem authorizing your payment. Try again or get in touch with your card issuer.';
const PAYMENT_ERROR_2 =
  'Hmm. There was a problem authorizing your payment. Get in touch with your card issuer.';

let errorMessageIndex: { [key: string]: string } = {
  expired_card: 'It looks like your credit card has expired. Try another card.',
  insufficient_funds:
    'It looks like your card has insufficient funds. Try another card.',
  withdrawal_count_limit_exceeded:
    'It looks like this transaction will put you over your credit limit. Try another card.',
  charge_exceeds_source_limit:
    'It looks like this transaction will put you over your daily credit limit. Try another card or in 24 hours.',
  instant_payouts_unsupported:
    "It looks like your debit card isn't setup for instant payments. Try another debit or credit card.",
  duplicate_transaction:
    'Hmm. Looks like an identical transaction was just sent. Check your payment history.',
  coupon_expired: 'It looks like that promo code has expired.',
  card_error:
    'Your transaction could not be processed. Please verify your credit card information and try again.',
  // todo: handle "parameters_exclusive": "Your already subscribed to _product_"
};

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

basicErrors.forEach(k => (errorMessageIndex[k] = BASIC_ERROR));
paymentErrors1.forEach(k => (errorMessageIndex[k] = PAYMENT_ERROR_1));
paymentErrors2.forEach(k => (errorMessageIndex[k] = PAYMENT_ERROR_2));

function getErrorMessage(type: string) {
  return errorMessageIndex[type] ? errorMessageIndex[type] : BASIC_ERROR;
}

// BASIC_ERROR and PAYMENT_ERROR_1 are exported for errors.test.tsx
export {
  AuthServerErrno,
  getErrorMessage,
  BASIC_ERROR,
  PAYMENT_ERROR_1,
  PAYMENT_ERROR_2,
};
