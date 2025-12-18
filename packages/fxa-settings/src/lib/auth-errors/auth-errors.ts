/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthServerError } from 'fxa-auth-client/browser';
import { ERRNO } from '@fxa/accounts/errors';

export type AuthUiError = AuthServerError & { version?: number };

const UNEXPECTED_ERROR_MESSAGE = 'Unexpected error';
const EXPIRED_VERIFICATION_ERROR_MESSAGE =
  'The link you clicked to confirm your email is expired.';
const REUSED_SINGLE_USE_CONFIRMATION_CODE_ERROR_MESSAGE =
  'That confirmation link was already used, and can only be used once.';

// We add a `version` value onto the errors for translations. This allows us to signal to translators (via the string ID) that a string has been updated.
const ERRORS = {
  ACCOUNT_ALREADY_EXISTS: {
    errno: ERRNO.ACCOUNT_EXISTS,
    message: 'Account already exists',
  },
  UNKNOWN_ACCOUNT: {
    errno: ERRNO.ACCOUNT_UNKNOWN,
    message: 'Unknown account',
  },
  INCORRECT_PASSWORD: {
    errno: ERRNO.INCORRECT_PASSWORD,
    message: 'Incorrect password',
  },
  UNVERIFIED_ACCOUNT: {
    errno: ERRNO.ACCOUNT_UNVERIFIED,
    message: 'Unconfirmed account',
    version: 2,
  },
  INVALID_VERIFICATION_CODE: {
    errno: ERRNO.INVALID_VERIFICATION_CODE,
    message: 'Invalid confirmation code',
    version: 2,
  },
  INVALID_JSON: {
    errno: ERRNO.INVALID_JSON,
    message: 'Invalid JSON in request body',
  },
  /*
    INVALID_PARAMETER: {
        errno: ERRNO.INVALID_PARAMETER,
        message: 'Invalid parameter: %(param)s'
    },
    MISSING_PARAMETER: {
        errno: ERRNO.MISSING_PARAMETER,
        message: 'Missing parameter: %(param)s'
    },
     */
  INVALID_REQUEST_SIGNATURE: {
    errno: ERRNO.INVALID_REQUEST_SIGNATURE,
    message: 'Invalid request signature',
  },
  INVALID_TOKEN: {
    errno: ERRNO.INVALID_TOKEN,
    message: 'Invalid token',
  },
  INVALID_TIMESTAMP: {
    errno: ERRNO.INVALID_TIMESTAMP,
    message: 'Invalid timestamp in request signature',
  },
  MISSING_CONTENT_LENGTH_HEADER: {
    errno: ERRNO.MISSING_CONTENT_LENGTH_HEADER,
    message: 'Missing content-length header',
  },
  REQUEST_TOO_LARGE: {
    errno: ERRNO.REQUEST_TOO_LARGE,
    message: 'Request body too large',
  },
  THROTTLED: {
    errno: ERRNO.THROTTLED,
    message: "You've tried too many times. Try again later.",
  },
  INVALID_NONCE: {
    errno: ERRNO.INVALID_NONCE,
    message: 'Invalid nonce in request signature',
  },
  ENDPOINT_NOT_SUPPORTED: {
    errno: ERRNO.ENDPOINT_NOT_SUPPORTED,
    message: 'This endpoint is no longer supported',
  },
  INCORRECT_EMAIL_CASE: {
    errno: ERRNO.INCORRECT_EMAIL_CASE,
    message: 'Incorrect email case',
  },
  /*
    ACCOUNT_LOCKED: {
      errno: ERRNO.ACCOUNT_LOCKED,
      message: 'Your account has been locked for security reasons')
    },
    ACCOUNT_NOT_LOCKED: {
      errno: ERRNO.ACCOUNT_NOT_LOCKED,
      message: UNEXPECTED_ERROR_MESSAGE
    },
    */
  REQUEST_BLOCKED: {
    errno: ERRNO.REQUEST_BLOCKED,
    message: 'The request was blocked for security reasons',
  },
  ACCOUNT_RESET: {
    errno: ERRNO.ACCOUNT_RESET,
    message: 'Your account has been locked for security reasons',
  },
  INCORRECT_UNBLOCK_CODE: {
    errno: ERRNO.INVALID_UNBLOCK_CODE,
    message: 'Invalid authorization code',
  },
  INVALID_PHONE_NUMBER: {
    errno: ERRNO.INVALID_PHONE_NUMBER,
    message:
      'You entered an invalid phone number. Please check it and try again.',
    version: 2,
  },
  INVALID_PHONE_REGION: {
    errno: ERRNO.INVALID_REGION,
    message: 'Cannot send to this country',
  },
  // Important! errno: ERRNO.INVALID_MESSAGE_ID has been deprecated. This is no longer a valid errno and should not be reused.
  // Important! errno: ERRNO.MESSAGE_REJECTED has been deprecated. This is no longer a valid errno and should not be reused.
  EMAIL_SENT_COMPLAINT: {
    errno: ERRNO.BOUNCE_COMPLAINT,
    message: 'Your email was just returned',
  },
  EMAIL_HARD_BOUNCE: {
    errno: ERRNO.BOUNCE_HARD,
    message: 'Your email was just returned. Mistyped email?',
  },
  EMAIL_SOFT_BOUNCE: {
    errno: ERRNO.BOUNCE_SOFT,
    message: 'Unable to deliver email',
  },
  EMAIL_EXISTS: {
    errno: ERRNO.EMAIL_EXISTS,
    message: 'This email was already confirmed by another user',
    version: 2,
  },
  UNVERIFIED_SESSION: {
    errno: ERRNO.SESSION_UNVERIFIED,
    message: 'Unconfirmed session',
    version: 2,
  },
  EMAIL_PRIMARY_EXISTS: {
    errno: ERRNO.USER_PRIMARY_EMAIL_EXISTS,
    message: 'Secondary email must be different than your account email',
  },
  EMAIL_VERIFIED_PRIMARY_EXISTS: {
    errno: ERRNO.VERIFIED_PRIMARY_EMAIL_EXISTS,
    message: 'Account already exists',
  },
  MAX_SECONDARY_EMAILS_REACHED: {
    errno: ERRNO.MAX_SECONDARY_EMAILS_REACHED,
    message: 'You have reached the maximum allowed secondary emails',
  },
  ACCOUNT_OWNS_EMAIL: {
    errno: ERRNO.ACCOUNT_OWNS_EMAIL,
    message: 'This email already exists on your account',
  },
  UNVERIFIED_PRIMARY_EMAIL_NEWLY_CREATED: {
    errno: ERRNO.UNVERIFIED_PRIMARY_EMAIL_NEWLY_CREATED,
    message: 'Account already exists',
  },
  LOGIN_WITH_SECONDARY_EMAIL: {
    errno: ERRNO.LOGIN_WITH_SECONDARY_EMAIL,
    message: 'Primary account email required for sign-in',
  },
  VERIFIED_SECONDARY_EMAIL_EXISTS: {
    errno: ERRNO.VERIFIED_SECONDARY_EMAIL_EXISTS,
    message:
      'This email is reserved by another account. Try again later or use a different email address.',
  },
  RESET_PASSWORD_WITH_SECONDARY_EMAIL: {
    errno: ERRNO.RESET_PASSWORD_WITH_SECONDARY_EMAIL,
    message: 'Primary account email required for reset',
  },
  INVALID_SIGNIN_CODE: {
    errno: ERRNO.INVALID_SIGNIN_CODE,
    message: 'Invalid signin code',
  },
  CHANGE_EMAIL_TO_UNVERIFIED_EMAIL: {
    errno: ERRNO.CHANGE_EMAIL_TO_UNVERIFIED_EMAIL,
    message: 'Can not change primary email to an unconfirmed email',
    version: 2,
  },
  CHANGE_EMAIL_TO_UNOWNED_EMAIL: {
    errno: ERRNO.CHANGE_EMAIL_TO_UNOWNED_EMAIL,
    message:
      'Can not change primary email to an email that does not belong to this account',
  },
  LOGIN_WITH_INVALID_EMAIL: {
    errno: ERRNO.LOGIN_WITH_INVALID_EMAIL,
    message: 'This email can not currently be used to login',
  },
  RESEND_EMAIL_CODE_TO_UNOWNED_EMAIL: {
    errno: ERRNO.RESEND_EMAIL_CODE_TO_UNOWNED_EMAIL,
    message:
      'Can not resend email code to an email that does not belong to this account',
    version: 2,
  },
  FAILED_TO_SEND_EMAIL: {
    errno: ERRNO.FAILED_TO_SEND_EMAIL,
    message: 'Failed to send email',
  },
  INVALID_OTP_CODE: {
    errno: ERRNO.INVALID_TOKEN_VERIFICATION_CODE,
    message: 'Valid code required',
  },
  EXPIRED_TOKEN_VERIFICATION_CODE: {
    errno: ERRNO.EXPIRED_TOKEN_VERIFICATION_CODE,
    message: 'This confirmation code has expired',
    version: 2,
  },
  TOTP_TOKEN_EXISTS: {
    errno: ERRNO.TOTP_TOKEN_EXISTS,
    message: 'A TOTP token already exists for this account',
  },
  TOTP_TOKEN_NOT_FOUND: {
    errno: ERRNO.TOTP_TOKEN_NOT_FOUND,
    message: 'TOTP token not found',
  },
  RECOVERY_CODE_NOT_FOUND: {
    errno: ERRNO.RECOVERY_CODE_NOT_FOUND,
    message: 'Backup authentication code not found',
  },
  DEVICE_COMMAND_UNAVAILABLE: {
    errno: ERRNO.DEVICE_COMMAND_UNAVAILABLE,
    message: 'Unavailable device command',
  },
  RECOVERY_KEY_NOT_FOUND: {
    errno: ERRNO.RECOVERY_KEY_NOT_FOUND,
    message: 'Account recovery key not found',
  },
  INVALID_RECOVERY_KEY: {
    errno: ERRNO.RECOVERY_KEY_INVALID,
    message: 'Invalid account recovery key',
  },
  TOTP_REQUIRED: {
    errno: ERRNO.TOTP_REQUIRED,
    message:
      'This request requires two step authentication enabled on your account.',
  },
  RECOVERY_KEY_ALREADY_EXISTS: {
    errno: ERRNO.RECOVERY_KEY_EXISTS,
    message: 'Account recovery key already exists.',
  },
  REDIS_CONFLICT: {
    errno: ERRNO.REDIS_CONFLICT,
    message: 'Failed due to a conflicting request, please try again.',
  },
  INSUFFICIENT_ACR_VALUES: {
    errno: ERRNO.INSUFFICIENT_ACR_VALUES,
    message:
      'This request requires two step authentication enabled on your account.',
  },
  UNKNOWN_SUBSCRIPTION_CUSTOMER: {
    errno: ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER,
    message: 'Unknown customer for subscription.',
  },
  UNKNOWN_SUBSCRIPTION: {
    errno: ERRNO.UNKNOWN_SUBSCRIPTION,
    message: 'Unknown subscription.',
  },
  UNKNOWN_SUBSCRIPTION_PLAN: {
    errno: ERRNO.UNKNOWN_SUBSCRIPTION_PLAN,
    message: 'Unknown plan for subscription.',
  },
  REJECTED_SUBSCRIPTION_PAYMENT_TOKEN: {
    errno: ERRNO.REJECTED_SUBSCRIPTION_PAYMENT_TOKEN,
    message: 'Invalid payment token for subscription.',
  },
  SUBSCRIPTION_ALREADY_CANCELLED: {
    errno: ERRNO.SUBSCRIPTION_ALREADY_CANCELLED,
    message: 'Subscription has already been cancelled',
  },
  REJECTED_CUSTOMER_UPDATE: {
    errno: ERRNO.REJECTED_CUSTOMER_UPDATE,
    message: 'Update was rejected, please try again',
  },
  INVALID_EXPIRED_OTP_CODE: {
    errno: ERRNO.INVALID_EXPIRED_OTP_CODE,
    message: 'Invalid or expired confirmation code',
    version: 2,
  },
  SERVER_BUSY: {
    errno: ERRNO.SERVER_BUSY,
    message: 'Server busy, try again soon',
  },
  FEATURE_NOT_ENABLED: {
    errno: ERRNO.FEATURE_NOT_ENABLED,
    message: 'Feature not enabled',
  },
  BACKEND_SERVICE_FAILURE: {
    errno: ERRNO.BACKEND_SERVICE_FAILURE,
    message: 'System unavailable, try again soon',
  },
  DISABLED_CLIENT_ID: {
    errno: ERRNO.DISABLED_CLIENT_ID,
    message: 'System unavailable, try again soon',
  },
  CANNOT_CREATE_PASSWORD: {
    errno: ERRNO.CANNOT_CREATE_PASSWORD,
    message: 'Can not create password, password already set',
  },
  RECOVERY_PHONE_NUMBER_ALREADY_EXISTS: {
    errno: ERRNO.RECOVERY_PHONE_NUMBER_ALREADY_EXISTS,
    message: 'Recovery phone number already exists',
  },
  RECOVERY_PHONE_NUMBER_DOES_NOT_EXIST: {
    errno: ERRNO.RECOVERY_PHONE_NUMBER_DOES_NOT_EXIST,
    message: 'Recovery phone number does not exist',
  },
  SMS_SEND_RATE_LIMIT_EXCEEDED: {
    errno: ERRNO.SMS_SEND_RATE_LIMIT_EXCEEDED,
    message: 'Text message limit reached',
  },
  RECOVERY_PHONE_REMOVE_MISSING_RECOVERY_CODES: {
    errno: ERRNO.RECOVERY_PHONE_REMOVE_MISSING_RECOVERY_CODES,
    message:
      'Unable to remove recovery phone, missing backup authentication codes.',
  },
  RECOVERY_PHONE_REGISTRATION_LIMIT_REACHED: {
    errno: ERRNO.RECOVERY_PHONE_REGISTRATION_LIMIT_REACHED,
    message:
      'This phone number has been registered with too many accounts. Please try a different number.',
  },
  TOTP_SECRET_DOES_NOT_EXIST: {
    errno: ERRNO.TOTP_SECRET_DOES_NOT_EXIST,
    message: 'TOTP secret does not exist',
  },
  INSUFFICIENT_AAL: {
    errno: ERRNO.INSUFFICIENT_AAL,
    message: 'Insufficient AAL',
  },
  INVALID_MFA_TOKEN: {
    errno: ERRNO.INVALID_MFA_TOKEN,
    message: 'Invalid or expired MFA token',
  },
  SERVICE_UNAVAILABLE: {
    errno: ERRNO.INTERNAL_VALIDATION_ERROR,
    message: 'System unavailable, try again soon',
  },
  UNEXPECTED_ERROR: {
    errno: ERRNO.UNEXPECTED_ERROR,
    message: UNEXPECTED_ERROR_MESSAGE,
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
    message: 'Mistyped email? firefox.com isn’t a valid email service',
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
    */
  INVALID_EMAIL_DOMAIN: {
    errno: 1064,
    message: 'Mistyped email? %(domain)s isn’t a valid email service',
    interpolate: true,
  },
  IMAGE_TOO_LARGE: {
    errno: 1065,
    message: 'The image file size is too large to be uploaded.',
  },
  EMAIL_MASK_NEW_ACCOUNT: {
    errno: 1066,
    message: 'Email masks can’t be used to create an account.',
  },
  MX_LOOKUP_WARNING: {
    errno: 1067,
    message: 'Mistyped email?',
  },
};

type ErrorKey = keyof typeof ERRORS;
type ErrorVal = { errno: number; message: string; version?: number };

export const AuthUiErrors: { [key in ErrorKey]: AuthUiError } = (
  Object.entries(ERRORS) as [[ErrorKey, ErrorVal]]
).reduce(
  (acc: { [key in ErrorKey]: AuthUiError }, [k, v]) => {
    const e = new Error(v.message) as AuthUiError;
    e.errno = v.errno;
    e.version = v.version;
    acc[k] = e;
    return acc;
  },
  {} as Record<ErrorKey, AuthUiError>
);

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

/**
 * TypeGuard for AuthUiErrors
 */
export function isAuthUiError(error: any): error is AuthUiError {
  return (
    typeof error === 'object' &&
    typeof error?.errno === 'number' &&
    typeof error?.message === 'string'
  );
}
