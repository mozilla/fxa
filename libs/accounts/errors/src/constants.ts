/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Standard error numbers
 */
export const ERRNO = {
  SERVER_CONFIG_ERROR: 100,
  ACCOUNT_EXISTS: 101,
  ACCOUNT_UNKNOWN: 102,
  INCORRECT_PASSWORD: 103,
  ACCOUNT_UNVERIFIED: 104,
  INVALID_VERIFICATION_CODE: 105,
  INVALID_JSON: 106,
  INVALID_PARAMETER: 107,
  MISSING_PARAMETER: 108,
  INVALID_REQUEST_SIGNATURE: 109,
  INVALID_TOKEN: 110,
  INVALID_TIMESTAMP: 111,
  MISSING_CONTENT_LENGTH_HEADER: 112,
  REQUEST_TOO_LARGE: 113,
  THROTTLED: 114,
  INVALID_NONCE: 115,
  ENDPOINT_NOT_SUPPORTED: 116,
  INCORRECT_EMAIL_CASE: 120,
  // ACCOUNT_LOCKED: 121,
  // ACCOUNT_NOT_LOCKED: 122,
  DEVICE_UNKNOWN: 123,
  DEVICE_CONFLICT: 124,
  REQUEST_BLOCKED: 125,
  ACCOUNT_RESET: 126,
  INVALID_UNBLOCK_CODE: 127,
  // MISSING_TOKEN: 128,
  INVALID_PHONE_NUMBER: 129,
  INVALID_REGION: 130,
  INVALID_MESSAGE_ID: 131,
  MESSAGE_REJECTED: 132,
  BOUNCE_COMPLAINT: 133,
  BOUNCE_HARD: 134,
  BOUNCE_SOFT: 135,
  EMAIL_EXISTS: 136,
  EMAIL_DELETE_PRIMARY: 137,
  SESSION_UNVERIFIED: 138,
  USER_PRIMARY_EMAIL_EXISTS: 139,
  VERIFIED_PRIMARY_EMAIL_EXISTS: 140,
  MAX_SECONDARY_EMAILS_REACHED: 188,
  ACCOUNT_OWNS_EMAIL: 189,
  // If there exists an account that was created under 24hrs and
  // has not verified their email address, this error is thrown
  // if another user attempts to add that email to their account
  // as a secondary email.
  UNVERIFIED_PRIMARY_EMAIL_NEWLY_CREATED: 141,
  LOGIN_WITH_SECONDARY_EMAIL: 142,
  SECONDARY_EMAIL_UNKNOWN: 143,
  VERIFIED_SECONDARY_EMAIL_EXISTS: 144,
  RESET_PASSWORD_WITH_SECONDARY_EMAIL: 145,
  INVALID_SIGNIN_CODE: 146,
  CHANGE_EMAIL_TO_UNVERIFIED_EMAIL: 147,
  CHANGE_EMAIL_TO_UNOWNED_EMAIL: 148,
  LOGIN_WITH_INVALID_EMAIL: 149,
  RESEND_EMAIL_CODE_TO_UNOWNED_EMAIL: 150,
  FAILED_TO_SEND_EMAIL: 151,
  INVALID_TOKEN_VERIFICATION_CODE: 152,
  EXPIRED_TOKEN_VERIFICATION_CODE: 153,
  TOTP_TOKEN_EXISTS: 154,
  TOTP_TOKEN_NOT_FOUND: 155,
  RECOVERY_CODE_NOT_FOUND: 156,
  DEVICE_COMMAND_UNAVAILABLE: 157,
  RECOVERY_KEY_NOT_FOUND: 158,
  RECOVERY_KEY_INVALID: 159,
  TOTP_REQUIRED: 160,
  RECOVERY_KEY_EXISTS: 161,
  UNKNOWN_CLIENT_ID: 162,
  INVALID_SCOPES: 163,
  STALE_AUTH_AT: 164,
  REDIS_CONFLICT: 165,
  NOT_PUBLIC_CLIENT: 166,
  INCORRECT_REDIRECT_URI: 167,
  INVALID_RESPONSE_TYPE: 168,
  MISSING_PKCE_PARAMETERS: 169,
  INSUFFICIENT_ACR_VALUES: 170,
  INCORRECT_CLIENT_SECRET: 171,
  UNKNOWN_AUTHORIZATION_CODE: 172,
  MISMATCH_AUTHORIZATION_CODE: 173,
  EXPIRED_AUTHORIZATION_CODE: 174,
  INVALID_PKCE_CHALLENGE: 175,
  UNKNOWN_SUBSCRIPTION_CUSTOMER: 176,
  UNKNOWN_SUBSCRIPTION: 177,
  UNKNOWN_SUBSCRIPTION_PLAN: 178,
  REJECTED_SUBSCRIPTION_PAYMENT_TOKEN: 179,
  SUBSCRIPTION_ALREADY_CANCELLED: 180,
  REJECTED_CUSTOMER_UPDATE: 181,
  REFRESH_TOKEN_UNKNOWN: 182,
  INVALID_EXPIRED_OTP_CODE: 183,
  SUBSCRIPTION_ALREADY_CHANGED: 184,
  INVALID_PLAN_UPDATE: 185,
  PAYMENT_FAILED: 186,
  SUBSCRIPTION_ALREADY_EXISTS: 187,
  UNKNOWN_SUBSCRIPTION_FOR_SOURCE: 188,
  BILLING_AGREEMENT_EXISTS: 192,
  MISSING_PAYPAL_PAYMENT_TOKEN: 193,
  MISSING_PAYPAL_BILLING_AGREEMENT: 194,
  UNVERIFIED_PRIMARY_EMAIL_HAS_ACTIVE_SUBSCRIPTION: 195,
  IAP_INVALID_TOKEN: 196,
  IAP_INTERNAL_OTHER: 197,
  IAP_UNKNOWN_APPNAME: 198,
  INVALID_PROMOTION_CODE: 199,
  SERVER_BUSY: 201,
  FEATURE_NOT_ENABLED: 202,
  BACKEND_SERVICE_FAILURE: 203,
  DISABLED_CLIENT_ID: 204,
  THIRD_PARTY_ACCOUNT_ERROR: 205,
  CANNOT_CREATE_PASSWORD: 206,
  ACCOUNT_CREATION_REJECTED: 207,
  IAP_PURCHASE_ALREADY_REGISTERED: 208,
  INVALID_INVOICE_PREVIEW_REQUEST: 209,
  UNABLE_TO_LOGIN_NO_PASSWORD_SET: 210,
  INVALID_CURRENCY: 211,
  SUBSCRIPTION_PROMO_CODE_NOT_APPLIED: 212,
  UNSUPPORTED_LOCATION: 213,
  RECOVERY_PHONE_NUMBER_ALREADY_EXISTS: 214,
  RECOVERY_PHONE_NUMBER_DOES_NOT_EXIST: 215,
  SMS_SEND_RATE_LIMIT_EXCEEDED: 216,
  INVALID_CLOUDTASK_EMAILTYPE: 217,
  RECOVERY_PHONE_REMOVE_MISSING_RECOVERY_CODES: 218,
  RECOVERY_PHONE_REGISTRATION_LIMIT_REACHED: 219,
  TOTP_SECRET_DOES_NOT_EXIST: 220,
  RECOVERY_CODES_ALREADY_EXISTS: 221,
  INSUFFICIENT_AAL: 222,
  INVALID_MFA_TOKEN: 223,
  INTERNAL_VALIDATION_ERROR: 998,
  UNEXPECTED_ERROR: 999,
};

export const OAUTH_ERRNO = {
  UNKNOWN_CLIENT: 101,
  INCORRECT_SECRET: 102,
  INCORRECT_REDIRECT: 103,
  INVALID_ASSERTION: 104,
  UNKNOWN_CODE: 105,
  INCORRECT_CODE: 106,
  EXPIRED_CODE: 107,
  INVALID_TOKEN: 108,
  INVALID_PARAMETER: 109,
  INVALID_RESPONSE_TYPE: 110,
  UNAUTHORIZED: 111,
  FORBIDDEN: 112,
  INVALID_CONTENT_TYPE: 113,
  INVALID_SCOPES: 114,
  EXPIRED_TOKEN: 115,
  NOT_PUBLIC_CLIENT: 116,
  INCORRECT_CODE_CHALLENGE: 117,
  MISSING_PKCE_PARAMETERS: 118,
  STALE_AUTH_AT: 119,
  MISMATCH_ACR_VALUES: 120,
  INVALID_GRANT_TYPE: 121,
  UNKNOWN_TOKEN: 122,
  SERVER_UNAVAILABLE: 201,
  DISABLED_CLIENT_ID: 202,
};

export const OAUTH_ERROR_MESSAGES: Record<keyof typeof OAUTH_ERRNO, string> = {
  UNKNOWN_CLIENT: 'Unknown client',
  INCORRECT_SECRET: 'Incorrect secret',
  INCORRECT_REDIRECT: 'Incorrect redirect_uri',
  INVALID_ASSERTION: 'Invalid assertion',
  UNKNOWN_CODE: 'Unknown code',
  INCORRECT_CODE: 'Incorrect code',
  EXPIRED_CODE: 'Expired code',
  INVALID_TOKEN: 'Invalid token',
  INVALID_PARAMETER: 'Invalid request parameter',
  INVALID_RESPONSE_TYPE: 'Invalid response_type',
  UNAUTHORIZED: 'Unauthorized for route',
  FORBIDDEN: 'Forbidden',
  INVALID_CONTENT_TYPE:
    'Content-Type must be either application/json or application/x-www-form-urlencoded',
  INVALID_SCOPES: 'Requested scopes are not allowed',
  EXPIRED_TOKEN: 'Expired token',
  NOT_PUBLIC_CLIENT: 'Not a public client',
  INCORRECT_CODE_CHALLENGE: 'Incorrect code_challenge',
  MISSING_PKCE_PARAMETERS: 'Public clients require PKCE OAuth parameters',
  STALE_AUTH_AT: 'Stale authentication timestamp',
  MISMATCH_ACR_VALUES: 'Mismatch acr value',
  INVALID_GRANT_TYPE: 'Invalid grant_type',
  UNKNOWN_TOKEN: 'Unknown token',
  SERVER_UNAVAILABLE: 'System unavailable, try again soon',
  DISABLED_CLIENT_ID: 'This client has been temporarily disabled',
};

/**
 * Takes an object and swaps keys with values. Useful when a value -> key look up is needed.
 * @param obj - Object to swap keys and values on
 * @returns An object with keys and values reveresed.
 */
function swapObjectKeysAndValues(obj: { [key: string]: string | number }) {
  const result: { [key: string | number]: string } = {};
  for (const key in obj) {
    result[obj[key]] = key;
  }
  return result;
}
/**
 * A reversed map of errnos.
 */
export const ERRNO_REVERSE_MAP = swapObjectKeysAndValues(ERRNO);
export const OAUTH_ERRNO_REVERSE_MAP = swapObjectKeysAndValues(OAUTH_ERRNO);

/**
 * The Default Unexpected Error State
 */
export const DEFAULT_ERRROR = {
  code: 500,
  error: 'Internal Server Error',
  errno: ERRNO.UNEXPECTED_ERROR,
  message: 'Unspecified error',
  info: 'https://mozilla.github.io/ecosystem-platform/api#section/Response-format',
};

/**
 * List of errors that should not be sent to Sentry
 */
export const IGNORED_ERROR_NUMBERS = [
  ERRNO.BOUNCE_HARD,
  ERRNO.BOUNCE_SOFT,
  ERRNO.BOUNCE_COMPLAINT,
];

/**
 * Regex to determine if message is a payload too large message.
 */
export const TOO_LARGE =
  /^Payload (?:content length|size) greater than maximum allowed/;

/**
 * Set of errors indicating a bad request signature
 */
export const BAD_SIGNATURE_ERRORS = [
  'Bad mac',
  'Unknown algorithm',
  'Missing required payload hash',
  'Payload is invalid',
];

/**
 * Payload properties that might help us debug unexpected errors
 * when they show up in production. Obviously we don't want to
 * accidentally send any sensitive data or PII to a 3rd-party,
 * so the set is opt-in rather than opt-out.
 */
export const DEBUGGABLE_PAYLOAD_KEYS = new Set([
  'availableCommands',
  'capabilities',
  'client_id',
  'code',
  'command',
  'duration',
  'excluded',
  'features',
  'messageId',
  'metricsContext',
  'name',
  'preVerified',
  'publicKey',
  'reason',
  'redirectTo',
  'reminder',
  'scope',
  'service',
  'target',
  'to',
  'TTL',
  'ttl',
  'type',
  'unblockCode',
  'verificationMethod',
]);
