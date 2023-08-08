/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthServerError } from 'fxa-auth-client/browser';
import * as Sentry from '@sentry/browser';
import { FtlMsgResolver } from 'fxa-react/lib/utils';

export type AuthUiError = AuthServerError & { version?: number };

const UNEXPECTED_ERROR_MESSAGE = 'Unexpected error';
const EXPIRED_VERIFICATION_ERROR_MESSAGE =
  'The link you clicked to confirm your email is expired.';
const REUSED_SINGLE_USE_CONFIRMATION_CODE_ERROR_MESSAGE =
  'That confirmation link was already used, and can only be used once.';

// We add a `version` value onto the errors for translations. This allows us to signal to translators (via the string ID) that a string has been updated.
const ERRORS = {
  UNEXPECTED_ERROR: {
    errno: 999,
    message: UNEXPECTED_ERROR_MESSAGE,
  },
  INVALID_TOKEN: {
    errno: 110,
    message: 'Invalid token',
  },
  INVALID_TIMESTAMP: {
    errno: 111,
    message: 'Invalid timestamp in request signature',
  },
  INVALID_NONCE: {
    errno: 115,
    message: 'Invalid nonce in request signature',
  },
  ACCOUNT_ALREADY_EXISTS: {
    errno: 101,
    message: 'Account already exists',
  },
  UNKNOWN_ACCOUNT: {
    errno: 102,
    message: 'Unknown account',
  },
  INCORRECT_EMAIL_CASE: {
    errno: 120,
    message: 'Incorrect email case',
  },
  INCORRECT_PASSWORD: {
    errno: 103,
    message: 'Incorrect password',
  },
  UNVERIFIED_ACCOUNT: {
    errno: 104,
    message: 'Unconfirmed account',
    version: 2,
  },
  INVALID_VERIFICATION_CODE: {
    errno: 105,
    message: 'Invalid confirmation code',
    version: 2,
  },
  INVALID_JSON: {
    errno: 106,
    message: 'Invalid JSON in request body',
  },
  /*
    INVALID_PARAMETER: {
        errno: 107,
        message: 'Invalid parameter: %(param)s'
    },
    MISSING_PARAMETER: {
        errno: 108,
        message: 'Missing parameter: %(param)s'
    },
     */
  INVALID_REQUEST_SIGNATURE: {
    errno: 109,
    message: 'Invalid request signature',
  },
  MISSING_CONTENT_LENGTH_HEADER: {
    errno: 112,
    message: 'Missing content-length header',
  },
  REQUEST_TOO_LARGE: {
    errno: 113,
    message: 'Request body too large',
  },
  THROTTLED: {
    errno: 114,
    message: "You've tried too many times. Try again later.",
  },
  /*
    ACCOUNT_LOCKED: {
      errno: 121,
      message: 'Your account has been locked for security reasons')
    },
    ACCOUNT_NOT_LOCKED: {
      errno: 122,
      message: UNEXPECTED_ERROR_MESSAGE
    },
    */
  REQUEST_BLOCKED: {
    errno: 125,
    message: 'The request was blocked for security reasons',
  },
  ACCOUNT_RESET: {
    errno: 126,
    message: 'Your account has been locked for security reasons',
  },
  INCORRECT_UNBLOCK_CODE: {
    errno: 127,
    message: 'Invalid authorization code',
  },
  INVALID_PHONE_NUMBER: {
    errno: 129,
    message: 'Invalid phone number',
  },
  INVALID_PHONE_REGION: {
    errno: 130,
    message: 'Cannot send to this country',
  },
  // We don't currently support sms but still keep the error codes to avoid conflicts
  SMS_ID_INVALID: {
    errno: 131,
    // should not be user facing, not wrapped in t
    message: 'SMS ID invalid',
  },
  SMS_REJECTED: {
    errno: 132,
    message: 'Could not send a message to this number',
  },
  EMAIL_SENT_COMPLAINT: {
    errno: 133,
    message: 'Your email was just returned',
  },
  EMAIL_HARD_BOUNCE: {
    errno: 134,
    message: 'Your email was just returned. Mistyped email?',
  },
  EMAIL_SOFT_BOUNCE: {
    errno: 135,
    message: 'Unable to deliver email',
  },
  EMAIL_EXISTS: {
    errno: 136,
    message: 'This email was already confirmed by another user',
    version: 2,
  },
  UNVERIFIED_SESSION: {
    errno: 138,
    message: 'Unconfirmed session',
    version: 2,
  },
  EMAIL_PRIMARY_EXISTS: {
    errno: 139,
    message: 'Secondary email must be different than your account email',
  },
  EMAIL_VERIFIED_PRIMARY_EXISTS: {
    errno: 140,
    message: 'Account already exists',
  },
  MAX_SECONDARY_EMAILS_REACHED: {
    errno: 188,
    message: 'You have reached the maximum allowed secondary emails',
  },
  ACCOUNT_OWNS_EMAIL: {
    errno: 189,
    message: 'This email already exists on your account',
  },
  UNVERIFIED_PRIMARY_EMAIL_NEWLY_CREATED: {
    errno: 141,
    message: 'Account already exists',
  },
  LOGIN_WITH_SECONDARY_EMAIL: {
    errno: 142,
    message: 'Primary account email required for sign-in',
  },
  VERIFIED_SECONDARY_EMAIL_EXISTS: {
    errno: 144,
    message: 'Address in use by another account',
  },
  RESET_PASSWORD_WITH_SECONDARY_EMAIL: {
    errno: 145,
    message: 'Primary account email required for reset',
  },
  INVALID_SIGNIN_CODE: {
    errno: 146,
    message: 'Invalid signin code',
  },
  CHANGE_EMAIL_TO_UNVERIFIED_EMAIL: {
    errno: 147,
    message: 'Can not change primary email to an unconfirmed email',
    version: 2,
  },
  CHANGE_EMAIL_TO_UNOWNED_EMAIL: {
    errno: 148,
    message:
      'Can not change primary email to an email that does not belong to this account',
  },
  LOGIN_WITH_INVALID_EMAIL: {
    errno: 149,
    message: 'This email can not currently be used to login',
  },
  RESEND_EMAIL_CODE_TO_UNOWNED_EMAIL: {
    errno: 150,
    message:
      'Can not change primary email to an email that does not belong to this account',
  },
  FAILED_TO_SEND_EMAIL: {
    errno: 151,
    message: 'Failed to send email',
  },
  INVALID_OTP_CODE: {
    errno: 152,
    message: 'Valid code required',
  },
  EXPIRED_TOKEN_VERIFICATION_CODE: {
    errno: 153,
    message: 'This confirmation code has expired',
    version: 2,
  },
  TOTP_TOKEN_EXISTS: {
    errno: 154,
    message: 'A TOTP token already exists for this account',
  },
  TOTP_TOKEN_NOT_FOUND: {
    errno: 155,
    message: 'TOTP token not found',
  },
  RECOVERY_CODE_NOT_FOUND: {
    errno: 156,
    message: 'Backup authentication code not found',
  },
  DEVICE_COMMAND_UNAVAILABLE: {
    errno: 157,
    message: 'Unavailable device command',
  },
  RECOVERY_KEY_NOT_FOUND: {
    errno: 158,
    message: 'Account recovery key not found',
  },
  INVALID_RECOVERY_KEY: {
    errno: 159,
    message: 'Invalid account recovery key',
  },
  TOTP_REQUIRED: {
    errno: 160,
    message:
      'This request requires two step authentication enabled on your account.',
  },
  RECOVERY_KEY_ALREADY_EXISTS: {
    errno: 161,
    message: 'Account recovery key already exists.',
  },
  REDIS_CONFLICT: {
    errno: 165,
    message: 'Failed due to a conflicting request, please try again.',
  },
  INSUFFICIENT_ACR_VALUES: {
    errno: 170,
    message:
      'This request requires two step authentication enabled on your account.',
  },
  UNKNOWN_SUBSCRIPTION_CUSTOMER: {
    errno: 176,
    message: 'Unknown customer for subscription.',
  },
  UNKNOWN_SUBSCRIPTION: {
    errno: 177,
    message: 'Unknown subscription.',
  },
  UNKNOWN_SUBSCRIPTION_PLAN: {
    errno: 178,
    message: 'Unknown plan for subscription.',
  },
  REJECTED_SUBSCRIPTION_PAYMENT_TOKEN: {
    errno: 179,
    message: 'Invalid payment token for subscription.',
  },
  SUBSCRIPTION_ALREADY_CANCELLED: {
    errno: 180,
    message: 'Subscription has already been cancelled',
  },
  REJECTED_CUSTOMER_UPDATE: {
    errno: 181,
    message: 'Update was rejected, please try again',
  },
  INVALID_EXPIRED_SIGNUP_CODE: {
    errno: 183,
    message: 'Invalid or expired confirmation code',
    version: 2,
  },
  SERVER_BUSY: {
    errno: 201,
    message: 'Server busy, try again soon',
  },
  FEATURE_NOT_ENABLED: {
    errno: 202,
    message: 'Feature not enabled',
  },
  BACKEND_SERVICE_FAILURE: {
    errno: 203,
    message: 'System unavailable, try again soon',
  },
  DISABLED_CLIENT_ID: {
    errno: 204,
    message: 'System unavailable, try again soon',
  },
  ENDPOINT_NOT_SUPPORTED: {
    errno: 116,
    message: 'This endpoint is no longer supported',
  },
  SERVICE_UNAVAILABLE: {
    errno: 998,
    message: 'System unavailable, try again soon',
  },
  USER_CANCELED_LOGIN: {
    errno: 1001,
    message: 'Login attempt cancelled',
  },
  SESSION_EXPIRED: {
    errno: 1002,
    message: 'Session expired. Sign in to continue.',
  },
  COOKIES_STILL_DISABLED: {
    errno: 1003,
    message: 'Cookies are still disabled',
  },
  PASSWORDS_DO_NOT_MATCH: {
    errno: 1004,
    message: 'Passwords do not match',
  },
  WORKING: {
    errno: 1005,
    message: 'Working…',
  },
  COULD_NOT_GET_PP: {
    errno: 1006,
    message: 'Could not get Privacy Notice',
  },
  COULD_NOT_GET_TOS: {
    errno: 1007,
    message: 'Could not get Terms of Service',
  },
  PASSWORDS_MUST_BE_DIFFERENT: {
    errno: 1008,
    message: 'Your new password must be different',
  },
  PASSWORD_TOO_SHORT: {
    errno: 1009,
    message: 'Must be at least 8 characters',
  },
  PASSWORD_REQUIRED: {
    errno: 1010,
    message: 'Valid password required',
  },
  EMAIL_REQUIRED: {
    errno: 1011,
    message: 'Valid email required',
  },
  /*
    Removed in issue #3137
    YEAR_OF_BIRTH_REQUIRED: {
      errno: 1012,
      message: 'Year of birth required')
    },
    */
  UNUSABLE_IMAGE: {
    errno: 1013,
    message: 'A usable image was not found',
  },
  NO_CAMERA: {
    errno: 1014,
    message: 'Could not initialize camera',
  },
  URL_REQUIRED: {
    errno: 1015,
    message: 'Valid URL required',
  },
  /*
    Removed in issue #3137
    BIRTHDAY_REQUIRED: {
      errno: 1016,
      message: 'Valid birthday required')
    },
    */
  DESKTOP_CHANNEL_TIMEOUT: {
    errno: 1017,
    message: UNEXPECTED_ERROR_MESSAGE,
  },
  SIGNUP_EMAIL_BOUNCE: {
    errno: 1018,
    message: 'Your confirmation email was just returned. Mistyped email?',
    version: 2,
  },
  DIFFERENT_EMAIL_REQUIRED: {
    errno: 1019,
    message: 'Valid email required',
  },
  DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN: {
    errno: 1020,
    message: 'Enter a valid email address. firefox.com does not offer email.',
  },
  CHANNEL_TIMEOUT: {
    errno: 1021,
    message: UNEXPECTED_ERROR_MESSAGE,
  },
  ILLEGAL_IFRAME_PARENT: {
    errno: 1022,
    message:
      'Firefox Accounts can only be placed into an IFRAME on approved sites',
  },
  INVALID_EMAIL: {
    errno: 1023,
    message: 'Valid email required',
  },
  /*
    Removed in issue #3040
    FORCE_AUTH_EMAIL_REQUIRED: {
      errno: 1024,
      message: '/force_auth requires an email')
    },
    */
  EXPIRED_VERIFICATION_LINK: {
    errno: 1025,
    message: EXPIRED_VERIFICATION_ERROR_MESSAGE,
    version: 2,
  },
  DAMAGED_VERIFICATION_LINK: {
    errno: 1026,
    message: 'Confirmation link damaged',
    version: 2,
  },
  UNEXPECTED_POSTMESSAGE_ORIGIN: {
    errno: 1027,
    message: UNEXPECTED_ERROR_MESSAGE,
  },
  INVALID_IMAGE_SIZE: {
    errno: 1028,
    message: 'The image dimensions must be at least 100x100px',
  },
  IOS_SIGNUP_DISABLED: {
    errno: 1029,
    message: 'Signup is coming soon to Firefox for iOS',
  },
  /*
    Removed in issue #2950
    SIGNUP_DISABLED_BY_RELIER: {
      errno: 1030,
      message: 'Signup has been disabled')
    },
    */
  AGE_REQUIRED: {
    errno: 1031,
    message: 'You must enter your age to sign up',
  },
  INVALID_AGE: {
    errno: 1032,
    message: 'You must enter a valid age to sign up',
  },
  /*
    Removed in #4927
    NO_GRAVATAR_FOUND: {
      errno: 1032,
      message: 'No Gravatar found')
    },
      */
  INVALID_CAMERA_DIMENSIONS: {
    errno: 1033,
    message: UNEXPECTED_ERROR_MESSAGE,
  },
  DELETED_ACCOUNT: {
    errno: 1034,
    message: 'Account no longer exists.',
  },
  /*
    INVALID_RESUME_TOKEN_PROPERTY: {
        errno: 1035,
        message: 'Invalid property in resume token: %(property)s'
    },
    MISSING_RESUME_TOKEN_PROPERTY: {
        errno: 1036,
        message: 'Missing property in resume token: %(property)s'
    },
    INVALID_DATA_ATTRIBUTE: {
        errno: 1037,
        message: 'Invalid data attribute: %(property)s'
    },
    MISSING_DATA_ATTRIBUTE: {
        errno: 1038,
        message: 'Missing data attribute: %(property)s'
    },
     */
  POLLING_FAILED: {
    // this error is not visible to the user
    errno: 1039,
    message: 'Server busy, try again soon',
  },
  UNKNOWN_ACCOUNT_VERIFICATION: {
    errno: 1040,
    message: EXPIRED_VERIFICATION_ERROR_MESSAGE,
    version: 2,
  },
  REUSED_SIGNIN_VERIFICATION_CODE: {
    errno: 1041,
    message: REUSED_SINGLE_USE_CONFIRMATION_CODE_ERROR_MESSAGE,
    version: 2,
  },
  INPUT_REQUIRED: {
    errno: 1042,
    message: 'This is a required field',
  },
  UNBLOCK_CODE_REQUIRED: {
    errno: 1043,
    message: 'Authorization code required',
  },
  INVALID_UNBLOCK_CODE: {
    errno: 1044,
    message: 'Invalid authorization code',
  },
  DAMAGED_REJECT_UNBLOCK_LINK: {
    errno: 1045,
    message: 'Link damaged',
  },
  /*
    // logged when view.unsafeTranslate called with a string that
    // contains a variable without an `escaped` prefix
    UNSAFE_INTERPOLATION_VARIABLE_NAME: {
        errno: 1046,
        // not user facing, only used for logging, not wrapped in `t`
        message: 'String variable name does not have escape prefix: %(string)s',
    },
    // logged when view.translate called with a string that contains
    // HTML.
    HTML_WILL_BE_ESCAPED: {
        errno: 1047,
        // not user facing, only used for logging, not wrapped in `t`
        message: 'HTML will be escaped: %(string)s',
    },
    CANNOT_CHANGE_INPUT_TYPE: {
        errno: 1048,
        // not user facing, only used for logging, not wrapped in `t`
        message: 'Cannot change input type: %(type)s',
    },
    PHONE_NUMBER_REQUIRED: {
        errno: 1049,
        message: 'Phone number required'
    },
     */
  ACCOUNT_HAS_NO_UID: {
    errno: 1050,
    // not user facing, only used for logging. Logged whenever
    // an attempt is made to write an account w/o a uid
    // to localStorage.
    message: 'Account has no uid',
  },
  INVALID_WEB_CHANNEL: {
    errno: 1051,
    message:
      'Browser not configured to accept WebChannel messages from this domain',
  },
  REUSED_PRIMARY_EMAIL_VERIFICATION_CODE: {
    errno: 1052,
    message: REUSED_SINGLE_USE_CONFIRMATION_CODE_ERROR_MESSAGE,
    version: 2,
  },
  TOTP_CODE_REQUIRED: {
    errno: 1053,
    message: 'Two-step authentication code required',
  },
  INVALID_TOTP_CODE: {
    errno: 1054,
    message: 'Invalid two-step authentication code',
  },
  RECOVERY_CODE_REQUIRED: {
    errno: 1055,
    message: 'Backup authentication code required',
  },
  INVALID_RECOVERY_CODE: {
    errno: 1056,
    message: 'Invalid backup authentication code',
  },
  PASSWORD_SAME_AS_EMAIL: {
    errno: 1057,
    message: 'Password must not be your email address', // only used for logging, no need for translation
  },
  PASSWORD_TOO_COMMON: {
    errno: 1058,
    message: 'Password is too common', // only used for logging, no need for translation
  },
  RECOVERY_KEY_REQUIRED: {
    errno: 1059,
    message: 'Account recovery key required',
  },
  OTP_CODE_REQUIRED: {
    errno: 1060,
    message: 'Please enter confirmation code',
    version: 2,
  },
  /*
    Removed in https://github.com/mozilla/fxa/pull/1242
    TOTP_PAIRING_NOT_SUPPORTED: {
      errno: 1061,
      message: 'Accounts with two-step authentication do not support pairing at this time')
    },
     */
  INVALID_REDIRECT_TO: {
    errno: 1062,
    message: 'Invalid redirect',
  },
  /*
    Removed in https://github.com/mozilla/fxa/pull/2658
    COULD_NOT_GET_SUBPLAT_TOS: {
      errno: 1063,
      message: 'Could not get Subscription Platform Terms of Service'
    },
    INVALID_EMAIL_DOMAIN: {
        errno: 1064,
        message: 'Mistyped email? %(domain)s does not offer email.'
    },
     */
  IMAGE_TOO_LARGE: {
    errno: 1065,
    message: 'The image file size is too large to be uploaded.',
  },
};

type ErrorKey = keyof typeof ERRORS;
type ErrorVal = { errno: number; message: string; version?: number };

export const getLocalizedErrorMessage = (
  ftlMsgResolver: FtlMsgResolver,
  err: AuthUiError
) => {
  let localizedError: string;

  if (err.errno && AuthUiErrorNos[err.errno]) {
    if (err.retryAfterLocalized && err.errno === AuthUiErrors.THROTTLED.errno) {
      // For throttling errors where a localized retry after value is provided
      localizedError = ftlMsgResolver.getMsg(
        composeAuthUiErrorTranslationId(err),
        AuthUiErrorNos[err.errno].message,
        { retryAfter: err.retryAfterLocalized }
      );
    } else if (err.errno === AuthUiErrors.THROTTLED.errno) {
      // For throttling errors where a localized retry after value is not available
      localizedError = ftlMsgResolver.getMsg(
        'auth-error-114-generic',
        AuthUiErrorNos[114].message
      );
    } else {
      // for all other recognized auth UI errors
      localizedError = ftlMsgResolver.getMsg(
        composeAuthUiErrorTranslationId(err),
        AuthUiErrorNos[err.errno].message
      );
    }
  } else {
    const unexpectedError = AuthUiErrors.UNEXPECTED_ERROR;
    localizedError = ftlMsgResolver.getMsg(
      composeAuthUiErrorTranslationId(unexpectedError),
      unexpectedError.message
    );
  }
  return localizedError;
};

export const composeAuthUiErrorTranslationId = (err: {
  errno?: number;
  message?: string;
}) => {
  /* all of these checks for fields/values being present look a little wonky, but allow us to work with
   * the AuthUiError type, which has all optional fields. Previously this wasn't an issue bc we didn't use
   * a utility.
   */

  if (err.errno && err.errno in AuthUiErrorNos) {
    const error = AuthUiErrorNos[err.errno];
    return `auth-error-${err.errno}${error.version ? '-' + error.version : ''}`;
  }
  /*
   * We opt to return an empty string instead of throwing an error so that this can't break in prod.
   * Instead, we log to sentry.
   */
  const logMessage = err.errno
    ? `composeAuthUiErrorTranslationId: There is no matching error in AuthUiErrors. error: ${JSON.stringify(
        err
      )}`
    : `composeAuthUiErrorTranslationId: No error number given, unable to create a localization ID for AuthUiError string. error: ${JSON.stringify(
        err
      )}`;
  Sentry.captureMessage(logMessage);
  return '';
};

export const AuthUiErrors: { [key in ErrorKey]: AuthUiError } = (
  Object.entries(ERRORS) as [[ErrorKey, ErrorVal]]
).reduce((acc: { [key in ErrorKey]: AuthUiError }, [k, v]) => {
  const e = new Error(v.message) as AuthUiError;
  e.errno = v.errno;
  e.version = v.version;
  acc[k] = e;
  return acc;
}, {} as Record<ErrorKey, AuthUiError>);

export const AuthUiErrorNos: {
  [key: number]: AuthUiError;
} = (Object.entries(ERRORS) as [[ErrorKey, ErrorVal]]).reduce(
  (acc: { [key: number]: AuthUiError }, [k, v]) => {
    const e = new Error(v.message) as AuthUiError;
    e.errno = v.errno;
    e.version = v.version;
    acc[e.errno] = e;
    return acc;
  },
  {} as Record<ErrorKey, number>
);

(() => {
  const errnos: number[] = [];
  for (const x of Object.values(ERRORS)) {
    if (errnos.includes(x.errno)) {
      console.warn(`${x.errno} is a duplicate auth error number.`);
      continue;
    }
    errnos.push(x.errno);
  }
})();
