/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const inherits = require('util').inherits;
const messages = require('@hapi/joi/lib/language').errors;
const OauthError = require('./oauth/error');
const verror = require('verror');

const ERRNO = {
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
  ECOSYSTEM_ANON_ID_UPDATE_CONFLICT: 190,
  ECOSYSTEM_ANON_ID_NO_CONDITION: 191,
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

  INTERNAL_VALIDATION_ERROR: 998,
  UNEXPECTED_ERROR: 999,
};

const DEFAULTS = {
  code: 500,
  error: 'Internal Server Error',
  errno: ERRNO.UNEXPECTED_ERROR,
  message: 'Unspecified error',
  info: 'https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#response-format',
};

const TOO_LARGE =
  /^Payload (?:content length|size) greater than maximum allowed/;

const BAD_SIGNATURE_ERRORS = [
  'Bad mac',
  'Unknown algorithm',
  'Missing required payload hash',
  'Payload is invalid',
];

// Payload properties that might help us debug unexpected errors
// when they show up in production. Obviously we don't want to
// accidentally send any sensitive data or PII to a 3rd-party,
// so the set is opt-in rather than opt-out.
const DEBUGGABLE_PAYLOAD_KEYS = new Set([
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

function AppError(options, extra, headers, error) {
  this.message = options.message || DEFAULTS.message;
  this.isBoom = true;
  this.stack = options.stack;
  if (!this.stack) {
    Error.captureStackTrace(this, AppError);
  }
  if (error) {
    // This is where verror stores the error cause passed in.
    this.jse_cause = error;
  }
  this.errno = options.errno || DEFAULTS.errno;
  this.output = {
    statusCode: options.code || DEFAULTS.code,
    payload: {
      code: options.code || DEFAULTS.code,
      errno: this.errno,
      error: options.error || DEFAULTS.error,
      message: this.message,
      info: options.info || DEFAULTS.info,
    },
    headers: headers || {},
  };
  Object.assign(this.output.payload, extra || {});
}
inherits(AppError, verror.WError);

AppError.prototype.toString = function () {
  return `Error: ${this.message}`;
};

AppError.prototype.header = function (name, value) {
  this.output.headers[name] = value;
};

AppError.prototype.backtrace = function (traced) {
  this.output.payload.log = traced;
};

/**
  Translates an error from Hapi format to our format
*/
AppError.translate = function (request, response) {
  let error;
  if (response instanceof AppError) {
    return response;
  }
  if (OauthError.isOauthRoute(request && request.route.path)) {
    return OauthError.translate(response);
  } else if (response instanceof OauthError) {
    return appErrorFromOauthError(response);
  }
  const payload = response.output.payload;
  const reason = response.reason;
  if (!payload) {
    error = AppError.unexpectedError(request);
  } else if (
    payload.statusCode === 500 &&
    /(socket hang up|ECONNREFUSED)/.test(reason)
  ) {
    // A connection to a remote service either was not made or timed out.
    if (response instanceof Error) {
      error = AppError.backendServiceFailure(
        undefined,
        undefined,
        undefined,
        response
      );
    } else {
      error = AppError.backendServiceFailure();
    }
  } else if (payload.statusCode === 401) {
    // These are common errors generated by Hawk auth lib.
    if (
      payload.message === 'Unknown credentials' ||
      payload.message === 'Invalid credentials'
    ) {
      error = AppError.invalidToken(
        `Invalid authentication token: ${payload.message}`
      );
    } else if (payload.message === 'Stale timestamp') {
      error = AppError.invalidTimestamp();
    } else if (payload.message === 'Invalid nonce') {
      error = AppError.invalidNonce();
    } else if (BAD_SIGNATURE_ERRORS.indexOf(payload.message) !== -1) {
      error = AppError.invalidSignature(payload.message);
    } else {
      error = AppError.invalidToken(
        `Invalid authentication token: ${payload.message}`
      );
    }
  } else if (payload.validation) {
    if (
      payload.message &&
      payload.message.indexOf(messages.any.required) >= 0
    ) {
      error = AppError.missingRequestParameter(payload.validation.keys[0]);
    } else {
      error = AppError.invalidRequestParameter(payload.validation);
    }
  } else if (payload.statusCode === 413 && TOO_LARGE.test(payload.message)) {
    error = AppError.requestBodyTooLarge();
  } else {
    error = new AppError({
      message: payload.message,
      code: payload.statusCode,
      error: payload.error,
      errno: payload.errno,
      info: payload.info,
      stack: response.stack,
    });

    if (response.data) {
      error.output.payload.data = JSON.stringify(response.data);
    }

    if (payload.statusCode >= 500) {
      decorateErrorWithRequest(error, request);
    }
  }
  return error;
};

// Helper functions for creating particular response types.

AppError.dbIncorrectPatchLevel = function (level, levelRequired) {
  return new AppError(
    {
      code: 400,
      error: 'Server Startup',
      errno: ERRNO.SERVER_CONFIG_ERROR,
      message: 'Incorrect Database Patch Level',
    },
    {
      level: level,
      levelRequired: levelRequired,
    }
  );
};

AppError.accountExists = function (email) {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.ACCOUNT_EXISTS,
      message: 'Account already exists',
    },
    {
      email: email,
    }
  );
};

AppError.unknownAccount = function (email) {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.ACCOUNT_UNKNOWN,
      message: 'Unknown account',
    },
    {
      email: email,
    }
  );
};

AppError.incorrectPassword = function (dbEmail, requestEmail) {
  if (dbEmail !== requestEmail) {
    return new AppError(
      {
        code: 400,
        error: 'Bad Request',
        errno: ERRNO.INCORRECT_EMAIL_CASE,
        message: 'Incorrect email case',
      },
      {
        email: dbEmail,
      }
    );
  }
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.INCORRECT_PASSWORD,
      message: 'Incorrect password',
    },
    {
      email: dbEmail,
    }
  );
};

AppError.unverifiedAccount = function () {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.ACCOUNT_UNVERIFIED,
    message: 'Unverified account',
  });
};

AppError.invalidVerificationCode = function (details) {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.INVALID_VERIFICATION_CODE,
      message: 'Invalid verification code',
    },
    details
  );
};

AppError.invalidRequestBody = function () {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.INVALID_JSON,
    message: 'Invalid JSON in request body',
  });
};

AppError.invalidRequestParameter = function (validation) {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.INVALID_PARAMETER,
      message: 'Invalid parameter in request body',
    },
    {
      validation: validation,
    }
  );
};

AppError.missingRequestParameter = function (param) {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.MISSING_PARAMETER,
      message: `Missing parameter in request body${param ? `: ${param}` : ''}`,
    },
    {
      param: param,
    }
  );
};

AppError.invalidSignature = function (message) {
  return new AppError({
    code: 401,
    error: 'Unauthorized',
    errno: ERRNO.INVALID_REQUEST_SIGNATURE,
    message: message || 'Invalid request signature',
  });
};

AppError.invalidToken = function (message) {
  return new AppError({
    code: 401,
    error: 'Unauthorized',
    errno: ERRNO.INVALID_TOKEN,
    message: message || 'Invalid authentication token in request signature',
  });
};

AppError.invalidTimestamp = function () {
  return new AppError(
    {
      code: 401,
      error: 'Unauthorized',
      errno: ERRNO.INVALID_TIMESTAMP,
      message: 'Invalid timestamp in request signature',
    },
    {
      serverTime: Math.floor(+new Date() / 1000),
    }
  );
};

AppError.invalidNonce = function () {
  return new AppError({
    code: 401,
    error: 'Unauthorized',
    errno: ERRNO.INVALID_NONCE,
    message: 'Invalid nonce in request signature',
  });
};

AppError.unauthorized = function unauthorized(reason) {
  return new AppError(
    {
      code: 401,
      error: 'Unauthorized',
      errno: ERRNO.INVALID_TOKEN,
      message: 'Unauthorized for route',
    },
    {
      detail: reason,
    }
  );
};

AppError.missingContentLength = function () {
  return new AppError({
    code: 411,
    error: 'Length Required',
    errno: ERRNO.MISSING_CONTENT_LENGTH_HEADER,
    message: 'Missing content-length header',
  });
};

AppError.requestBodyTooLarge = function () {
  return new AppError({
    code: 413,
    error: 'Request Entity Too Large',
    errno: ERRNO.REQUEST_TOO_LARGE,
    message: 'Request body too large',
  });
};

AppError.tooManyRequests = function (
  retryAfter,
  retryAfterLocalized,
  canUnblock
) {
  if (!retryAfter) {
    retryAfter = 30;
  }

  const extraData = {
    retryAfter: retryAfter,
  };

  if (retryAfterLocalized) {
    extraData.retryAfterLocalized = retryAfterLocalized;
  }

  if (canUnblock) {
    extraData.verificationMethod = 'email-captcha';
    extraData.verificationReason = 'login';
  }

  return new AppError(
    {
      code: 429,
      error: 'Too Many Requests',
      errno: ERRNO.THROTTLED,
      message: 'Client has sent too many requests',
    },
    extraData,
    {
      'retry-after': retryAfter,
    }
  );
};

AppError.requestBlocked = function (canUnblock) {
  let extra;
  if (canUnblock) {
    extra = {
      verificationMethod: 'email-captcha',
      verificationReason: 'login',
    };
  }
  return new AppError(
    {
      code: 400,
      error: 'Request blocked',
      errno: ERRNO.REQUEST_BLOCKED,
      message: 'The request was blocked for security reasons',
    },
    extra
  );
};

AppError.serviceUnavailable = function (retryAfter) {
  if (!retryAfter) {
    retryAfter = 30;
  }
  return new AppError(
    {
      code: 503,
      error: 'Service Unavailable',
      errno: ERRNO.SERVER_BUSY,
      message: 'Service unavailable',
    },
    {
      retryAfter: retryAfter,
    },
    {
      'retry-after': retryAfter,
    }
  );
};

AppError.featureNotEnabled = function (retryAfter) {
  if (!retryAfter) {
    retryAfter = 30;
  }
  return new AppError(
    {
      code: 503,
      error: 'Feature not enabled',
      errno: ERRNO.FEATURE_NOT_ENABLED,
      message: 'Feature not enabled',
    },
    {
      retryAfter: retryAfter,
    },
    {
      'retry-after': retryAfter,
    }
  );
};

AppError.gone = function () {
  return new AppError({
    code: 410,
    error: 'Gone',
    errno: ERRNO.ENDPOINT_NOT_SUPPORTED,
    message: 'This endpoint is no longer supported',
  });
};

AppError.mustResetAccount = function (email) {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.ACCOUNT_RESET,
      message: 'Account must be reset',
    },
    {
      email: email,
    }
  );
};

AppError.unknownDevice = function () {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.DEVICE_UNKNOWN,
    message: 'Unknown device',
  });
};

AppError.deviceSessionConflict = function (deviceId) {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.DEVICE_CONFLICT,
      message: 'Session already registered by another device',
    },
    { deviceId }
  );
};

AppError.invalidUnblockCode = function () {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.INVALID_UNBLOCK_CODE,
    message: 'Invalid unblock code',
  });
};

AppError.invalidPhoneNumber = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.INVALID_PHONE_NUMBER,
    message: 'Invalid phone number',
  });
};

AppError.invalidRegion = (region) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.INVALID_REGION,
      message: 'Invalid region',
    },
    {
      region,
    }
  );
};

AppError.currencyCountryMismatch = (currency, country) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.INVALID_REGION,
      message: 'Funding source country does not match plan currency.',
    },
    {
      currency,
      country,
    }
  );
};

AppError.currencyCurrencyMismatch = (currencyA, currencyB) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.INVALID_REGION,
      message: `Changing currencies is not permitted.`,
    },
    {
      currencyA,
      currencyB,
    }
  );
};

AppError.billingAgreementExists = (customerId) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.BILLING_AGREEMENT_EXISTS,
      message: `Billing agreement already on file for this customer.`,
    },
    {
      customerId,
    }
  );
};

AppError.missingPaypalPaymentToken = (customerId) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.MISSING_PAYPAL_PAYMENT_TOKEN,
      message: `PayPal payment token is missing.`,
    },
    {
      customerId,
    }
  );
};

AppError.missingPaypalBillingAgreement = (customerId) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.MISSING_PAYPAL_BILLING_AGREEMENT,
      message: `PayPal billing agreement is missing for the existing subscriber.`,
    },
    {
      customerId,
    }
  );
};

AppError.invalidMessageId = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.INVALID_MESSAGE_ID,
    message: 'Invalid message id',
  });
};

AppError.messageRejected = (reason, reasonCode) => {
  return new AppError(
    {
      code: 500,
      error: 'Internal Server Error',
      errno: ERRNO.MESSAGE_REJECTED,
      message: 'Message rejected',
    },
    {
      reason,
      reasonCode,
    }
  );
};

AppError.emailComplaint = (bouncedAt) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.BOUNCE_COMPLAINT,
      message: 'Email account sent complaint',
    },
    {
      bouncedAt,
    }
  );
};

AppError.emailBouncedHard = (bouncedAt) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.BOUNCE_HARD,
      message: 'Email account hard bounced',
    },
    {
      bouncedAt,
    }
  );
};

AppError.emailBouncedSoft = (bouncedAt) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.BOUNCE_SOFT,
      message: 'Email account soft bounced',
    },
    {
      bouncedAt,
    }
  );
};

AppError.emailExists = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.EMAIL_EXISTS,
    message: 'Email already exists',
  });
};

AppError.cannotDeletePrimaryEmail = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.EMAIL_DELETE_PRIMARY,
    message: 'Can not delete primary email',
  });
};

AppError.unverifiedSession = function () {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.SESSION_UNVERIFIED,
    message: 'Unverified session',
  });
};

AppError.yourPrimaryEmailExists = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.USER_PRIMARY_EMAIL_EXISTS,
    message: 'Can not add secondary email that is same as your primary',
  });
};

AppError.verifiedPrimaryEmailAlreadyExists = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.VERIFIED_PRIMARY_EMAIL_EXISTS,
    message: 'Email already exists',
  });
};

AppError.verifiedSecondaryEmailAlreadyExists = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.VERIFIED_SECONDARY_EMAIL_EXISTS,
    message: 'Email already exists',
  });
};

// This error is thrown when someone attempts to add a secondary email
// that is the same as the primary email of another account, but the account
// was recently created ( < 24hrs).
AppError.unverifiedPrimaryEmailNewlyCreated = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.UNVERIFIED_PRIMARY_EMAIL_NEWLY_CREATED,
    message: 'Email already exists',
  });
};

AppError.unverifiedPrimaryEmailHasActiveSubscription = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.UNVERIFIED_PRIMARY_EMAIL_HAS_ACTIVE_SUBSCRIPTION,
    message: 'Account for this email has an active subscription',
  });
};

AppError.maxSecondaryEmailsReached = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.MAX_SECONDARY_EMAILS_REACHED,
    message: 'You have reached the maximum allowed secondary emails',
  });
};

AppError.alreadyOwnsEmail = () => {
  return new AppError({
    code: 400,
    error: 'Conflict',
    errno: ERRNO.ACCOUNT_OWNS_EMAIL,
    message: 'This email already exists on your account',
  });
};

AppError.cannotLoginWithSecondaryEmail = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.LOGIN_WITH_SECONDARY_EMAIL,
    message: 'Sign in with this email type is not currently supported',
  });
};

AppError.unknownSecondaryEmail = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.SECONDARY_EMAIL_UNKNOWN,
    message: 'Unknown email',
  });
};

AppError.cannotResetPasswordWithSecondaryEmail = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.RESET_PASSWORD_WITH_SECONDARY_EMAIL,
    message: 'Reset password with this email type is not currently supported',
  });
};

AppError.invalidSigninCode = function () {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.INVALID_SIGNIN_CODE,
    message: 'Invalid signin code',
  });
};

AppError.cannotChangeEmailToUnverifiedEmail = function () {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.CHANGE_EMAIL_TO_UNVERIFIED_EMAIL,
    message: 'Can not change primary email to an unverified email',
  });
};

AppError.cannotChangeEmailToUnownedEmail = function () {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.CHANGE_EMAIL_TO_UNOWNED_EMAIL,
    message:
      'Can not change primary email to an email that does not belong to this account',
  });
};

AppError.cannotLoginWithEmail = function () {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.LOGIN_WITH_INVALID_EMAIL,
    message: 'This email can not currently be used to login',
  });
};

AppError.cannotResendEmailCodeToUnownedEmail = function () {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.RESEND_EMAIL_CODE_TO_UNOWNED_EMAIL,
    message:
      'Can not resend email code to an email that does not belong to this account',
  });
};

AppError.cannotSendEmail = function (isNewAddress) {
  if (!isNewAddress) {
    return new AppError({
      code: 500,
      error: 'Internal Server Error',
      errno: ERRNO.FAILED_TO_SEND_EMAIL,
      message: 'Failed to send email',
    });
  }
  return new AppError({
    code: 422,
    error: 'Unprocessable Entity',
    errno: ERRNO.FAILED_TO_SEND_EMAIL,
    message: 'Failed to send email',
  });
};

AppError.invalidTokenVerficationCode = function (details) {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.INVALID_TOKEN_VERIFICATION_CODE,
      message: 'Invalid token verification code',
    },
    details
  );
};

AppError.expiredTokenVerficationCode = function (details) {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.EXPIRED_TOKEN_VERIFICATION_CODE,
      message: 'Expired token verification code',
    },
    details
  );
};

AppError.totpTokenAlreadyExists = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.TOTP_TOKEN_EXISTS,
    message: 'TOTP token already exists for this account.',
  });
};

AppError.totpTokenNotFound = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.TOTP_TOKEN_NOT_FOUND,
    message: 'TOTP token not found.',
  });
};

AppError.recoveryCodeNotFound = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.RECOVERY_CODE_NOT_FOUND,
    message: 'Recovery code not found.',
  });
};

AppError.unavailableDeviceCommand = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.DEVICE_COMMAND_UNAVAILABLE,
    message: 'Unavailable device command.',
  });
};

AppError.recoveryKeyNotFound = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.RECOVERY_KEY_NOT_FOUND,
    message: 'Recovery key not found.',
  });
};

AppError.recoveryKeyInvalid = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.RECOVERY_KEY_INVALID,
    message: 'Recovery key is not valid.',
  });
};

AppError.totpRequired = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.TOTP_REQUIRED,
    message:
      'This request requires two step authentication enabled on your account.',
  });
};

AppError.recoveryKeyExists = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.RECOVERY_KEY_EXISTS,
    message: 'Recovery key already exists.',
  });
};

AppError.unknownClientId = (clientId) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.UNKNOWN_CLIENT_ID,
      message: 'Unknown client_id',
    },
    {
      clientId,
    }
  );
};

AppError.incorrectClientSecret = (clientId) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.INCORRECT_CLIENT_SECRET,
      message: 'Incorrect client_secret',
    },
    {
      clientId,
    }
  );
};

AppError.staleAuthAt = (authAt) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.STALE_AUTH_AT,
      message: 'Stale auth timestamp',
    },
    {
      authAt,
    }
  );
};

AppError.notPublicClient = function notPublicClient() {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.NOT_PUBLIC_CLIENT,
    message: 'Not a public client',
  });
};

AppError.redisConflict = () => {
  return new AppError({
    code: 409,
    error: 'Conflict',
    errno: ERRNO.REDIS_CONFLICT,
    message: 'Redis WATCH detected a conflicting update',
  });
};

AppError.incorrectRedirectURI = (redirectUri) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.INCORRECT_REDIRECT_URI,
      message: 'Incorrect redirect URI',
    },
    {
      redirectUri,
    }
  );
};

AppError.unknownAuthorizationCode = (code) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.UNKNOWN_AUTHORIZATION_CODE,
      message: 'Unknown authorization code',
    },
    {
      code,
    }
  );
};

AppError.mismatchAuthorizationCode = (code, clientId) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.MISMATCH_AUTHORIZATION_CODE,
      message: 'Mismatched authorization code',
    },
    {
      code,
      clientId,
    }
  );
};

AppError.expiredAuthorizationCode = (code, expiredAt) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.EXPIRED_AUTHORIZATION_CODE,
      message: 'Expired authorization code',
    },
    {
      code,
      expiredAt,
    }
  );
};

AppError.invalidResponseType = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.INVALID_RESPONSE_TYPE,
    message: 'Invalid response_type',
  });
};

AppError.invalidScopes = (invalidScopes) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.INVALID_SCOPES,
      message: 'Requested scopes are not allowed',
    },
    {
      invalidScopes,
    }
  );
};

AppError.missingPkceParameters = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.MISSING_PKCE_PARAMETERS,
    message: 'Public clients require PKCE OAuth parameters',
  });
};

AppError.invalidPkceChallenge = (pkceHashValue) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.INVALID_PKCE_CHALLENGE,
      message: 'Public clients require PKCE OAuth parameters',
    },
    {
      pkceHashValue,
    }
  );
};

AppError.invalidPromoCode = (promotionCode) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.INVALID_PROMOTION_CODE,
      message: 'Invalid promotion code',
    },
    {
      promotionCode,
    }
  );
};

AppError.unknownCustomer = (uid) => {
  return new AppError(
    {
      code: 404,
      error: 'Not Found',
      errno: ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER,
      message: 'Unknown customer',
    },
    {
      uid,
    }
  );
};

AppError.unknownSubscription = (subscriptionId) => {
  return new AppError(
    {
      code: 404,
      error: 'Not Found',
      errno: ERRNO.UNKNOWN_SUBSCRIPTION,
      message: 'Unknown subscription',
    },
    {
      subscriptionId,
    }
  );
};

AppError.unknownAppName = (appName) => {
  return new AppError(
    {
      code: 404,
      error: 'Not Found',
      errno: ERRNO.IAP_UNKNOWN_APPNAME,
      message: 'Unknown subscription',
    },
    {
      appName,
    }
  );
};

AppError.unknownSubscriptionPlan = (planId) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.UNKNOWN_SUBSCRIPTION_PLAN,
      message: 'Unknown subscription plan',
    },
    {
      planId,
    }
  );
};

AppError.rejectedSubscriptionPaymentToken = (message, paymentError) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.REJECTED_SUBSCRIPTION_PAYMENT_TOKEN,
      message,
    },
    paymentError
  );
};

AppError.rejectedCustomerUpdate = (message, paymentError) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.REJECTED_CUSTOMER_UPDATE,
      message,
    },
    paymentError
  );
};

AppError.subscriptionAlreadyCancelled = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.SUBSCRIPTION_ALREADY_CANCELLED,
    message: 'Subscription has already been cancelled',
  });
};

AppError.invalidPlanUpdate = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.INVALID_PLAN_UPDATE,
    message: 'Subscription plan is not a valid update',
  });
};

AppError.paymentFailed = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.PAYMENT_FAILED,
    message: 'Payment method failed',
  });
};

AppError.subscriptionAlreadyChanged = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.SUBSCRIPTION_ALREADY_CHANGED,
    message: 'Subscription has already been cancelled',
  });
};

AppError.subscriptionAlreadyExists = () => {
  return new AppError({
    code: 409,
    error: 'Already subscribed',
    errno: ERRNO.SUBSCRIPTION_ALREADY_EXISTS,
    message: 'User already subscribed.',
  });
};

AppError.userAlreadySubscribedToProduct = () => {
  return new AppError({
    code: 409,
    error: 'Already subscribed to product with different plan',
    errno: ERRNO.SUBSCRIPTION_ALREADY_EXISTS,
    message: 'User already subscribed to product with different plan.',
  });
};

AppError.iapInvalidToken = (error) => {
  const extra = error ? [{}, undefined, error] : [];
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.IAP_INVALID_TOKEN,
      message: 'Invalid token',
    },
    ...extra
  );
};

AppError.iapInternalError = (error) => {
  const extra = error ? [{}, undefined, error] : [];
  return new AppError(
    {
      code: 500,
      error: 'Internal Error',
      errno: ERRNO.IAP_INTERNAL_OTHER,
      message: 'IAP Internal Error',
    },
    ...extra
  );
};

AppError.insufficientACRValues = (foundValue) => {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: ERRNO.INSUFFICIENT_ACR_VALUES,
      message:
        'Required Authentication Context Reference values could not be satisfied',
    },
    {
      foundValue,
    }
  );
};

AppError.unknownRefreshToken = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.REFRESH_TOKEN_UNKNOWN,
    message: 'Unknown refresh token',
  });
};

AppError.invalidOrExpiredOtpCode = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.INVALID_EXPIRED_OTP_CODE,
    message: 'Invalid or expired verification code',
  });
};

AppError.anonIdUpdateConflict = (headerName) => {
  return new AppError({
    code: 412,
    error: 'Precondition Failed',
    errno: ERRNO.ECOSYSTEM_ANON_ID_UPDATE_CONFLICT,
    message: `Could not update Ecosystem Anon ID because criteria set by ${headerName} was not met`,
  });
};

AppError.anonIdNoCondition = (headerName) => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.ECOSYSTEM_ANON_ID_NO_CONDITION,
    message:
      'Header If-None-Match or If-Match is required to perform the request',
  });
};

AppError.thirdPartyAccountError = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: ERRNO.THIRD_PARTY_ACCOUNT_ERROR,
    message: 'Could not login with third party account, please try again later',
  });
};

AppError.backendServiceFailure = (service, operation, extra, error) => {
  if (extra) {
    return new AppError(
      {
        code: 500,
        error: 'Internal Server Error',
        errno: ERRNO.BACKEND_SERVICE_FAILURE,
        message: 'A backend service request failed.',
      },
      {
        service,
        operation,
        ...extra,
      },
      {},
      error
    );
  }
  return new AppError(
    {
      code: 500,
      error: 'Internal Server Error',
      errno: ERRNO.BACKEND_SERVICE_FAILURE,
      message: 'A backend service request failed.',
    },
    {
      service,
      operation,
    },
    {},
    error
  );
};

AppError.disabledClientId = (clientId, retryAfter) => {
  if (!retryAfter) {
    retryAfter = 30;
  }
  return new AppError(
    {
      code: 503,
      error: 'Client Disabled',
      errno: ERRNO.DISABLED_CLIENT_ID,
      message: 'This client has been temporarily disabled',
    },
    {
      clientId,
      retryAfter,
    },
    {
      'retry-after': retryAfter,
    }
  );
};

AppError.internalValidationError = (op, data, error) => {
  return new AppError(
    {
      code: 500,
      error: 'Internal Server Error',
      errno: ERRNO.INTERNAL_VALIDATION_ERROR,
      message: 'An internal validation check failed.',
    },
    {
      op,
      data,
    },
    {},
    error
  );
};

AppError.unexpectedError = (request) => {
  const error = new AppError({});
  decorateErrorWithRequest(error, request);
  return error;
};

AppError.missingSubscriptionForSourceError = (op, data) =>
  new AppError(
    {
      code: 500,
      error: 'Missing subscription for source',
      errno: ERRNO.UNKNOWN_SUBSCRIPTION_FOR_SOURCE,
      message: 'Failed to find a subscription associated with Stripe source.',
    },
    {
      op,
      data,
    }
  );

function decorateErrorWithRequest(error, request) {
  if (request) {
    error.output.payload.request = {
      // request.app.devices and request.app.metricsContext are async, so can't be included here
      acceptLanguage: request.app.acceptLanguage,
      locale: request.app.locale,
      userAgent: request.app.ua,
      method: request.method,
      path: request.path,
      query: request.query,
      payload: scrubPii(request.payload),
      headers: scrubHeaders(request.headers),
    };
  }
}

function scrubPii(payload) {
  if (!payload) {
    return;
  }

  return Object.entries(payload).reduce((scrubbed, [key, value]) => {
    if (DEBUGGABLE_PAYLOAD_KEYS.has(key)) {
      scrubbed[key] = value;
    }

    return scrubbed;
  }, {});
}

function scrubHeaders(headers) {
  const scrubbed = { ...headers };
  delete scrubbed['x-forwarded-for'];
  return scrubbed;
}

function appErrorFromOauthError(err) {
  switch (err.errno) {
    case 101:
      return AppError.unknownClientId(err.clientId);
    case 102:
      return AppError.incorrectClientSecret(err.clientId);
    case 103:
      return AppError.incorrectRedirectURI(err.redirectUri);
    case 104:
      return AppError.invalidToken();
    case 105:
      return AppError.unknownAuthorizationCode(err.code);
    case 106:
      return AppError.mismatchAuthorizationCode(err.code, err.clientId);
    case 107:
      return AppError.expiredAuthorizationCode(err.code, err.expiredAt);
    case 108:
      return AppError.invalidToken();
    case 109:
      return AppError.invalidRequestParameter(err.validation);
    case 110:
      return AppError.invalidResponseType();
    case 114:
      return AppError.invalidScopes(err.invalidScopes);
    case 116:
      return AppError.notPublicClient();
    case 117:
      return AppError.invalidPkceChallenge(err.pkceHashValue);
    case 118:
      return AppError.missingPkceParameters();
    case 119:
      return AppError.staleAuthAt(err.authAt);
    case 120:
      return AppError.insufficientACRValues(err.foundValue);
    case 121:
      return AppError.invalidRequestParameter('grant_type');
    case 122:
      return AppError.unknownRefreshToken();
    case 201:
      return AppError.serviceUnavailable(err.retryAfter);
    case 202:
      return AppError.disabledClientId(err.clientId);
    default:
      return err;
  }
}

module.exports = AppError;
module.exports.ERRNO = ERRNO;
