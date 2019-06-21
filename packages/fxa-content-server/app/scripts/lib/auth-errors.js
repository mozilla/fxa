/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// provides functions to work with errors returned by the auth server.

import _ from 'underscore';
import Errors from './errors';
import Logger from './logger';
var logger = new Logger();

const t = msg => msg;

var UNEXPECTED_ERROR_MESSAGE = t('Unexpected error');
var EXPIRED_VERIFICATION_ERROR_MESSAGE = t('The link you clicked to verify your email is expired.');
var THROTTLED_ERROR_MESSAGE = t('You\'ve tried too many times. Try again later.');
// L10N Note: '%(retryAfterLocalized)s' becomes:
// 'in 10 minutes' / 'in a minute' or
// 'через 15 минут' / 'через 3 минуты' / 'через минуту'
var THROTTLED_LOCALIZED_ERROR_MESSAGE = t('You\'ve tried too many times. Try again %(retryAfterLocalized)s.');

/*eslint-disable sorting/sort-object-props*/
var ERRORS = {
  UNEXPECTED_ERROR: {
    errno: 999,
    message: UNEXPECTED_ERROR_MESSAGE
  },
  INVALID_TOKEN: {
    errno: 110,
    message: t('Invalid token')
  },
  INVALID_TIMESTAMP: {
    errno: 111,
    message: t('Invalid timestamp in request signature')
  },
  INVALID_NONCE: {
    errno: 115,
    message: t('Invalid nonce in request signature')
  },
  ACCOUNT_ALREADY_EXISTS: {
    errno: 101,
    message: t('Account already exists')
  },
  UNKNOWN_ACCOUNT: {
    errno: 102,
    message: t('Unknown account')
  },
  INCORRECT_EMAIL_CASE: {
    errno: 120,
    message: t('Incorrect email case')
  },
  INCORRECT_PASSWORD: {
    errno: 103,
    message: t('Incorrect password')
  },
  UNVERIFIED_ACCOUNT: {
    errno: 104,
    message: t('Unverified account')
  },
  INVALID_VERIFICATION_CODE: {
    errno: 105,
    message: t('Invalid verification code')
  },
  INVALID_JSON: {
    errno: 106,
    message: t('Invalid JSON in request body')
  },
  INVALID_PARAMETER: {
    errno: 107,
    message: t('Invalid parameter: %(param)s')
  },
  MISSING_PARAMETER: {
    errno: 108,
    message: t('Missing parameter: %(param)s')
  },
  INVALID_REQUEST_SIGNATURE: {
    errno: 109,
    message: t('Invalid request signature')
  },
  MISSING_CONTENT_LENGTH_HEADER: {
    errno: 112,
    message: t('Missing content-length header')
  },
  REQUEST_TOO_LARGE: {
    errno: 113,
    message: t('Request body too large')
  },
  THROTTLED: {
    errno: 114,
    message: THROTTLED_ERROR_MESSAGE
  },
  /*
  ACCOUNT_LOCKED: {
    errno: 121,
    message: t('Your account has been locked for security reasons')
  },
  ACCOUNT_NOT_LOCKED: {
    errno: 122,
    message: UNEXPECTED_ERROR_MESSAGE
  },
  */
  REQUEST_BLOCKED: {
    errno: 125,
    message: t('The request was blocked for security reasons')
  },
  ACCOUNT_RESET: {
    errno: 126,
    message: t('Your account has been locked for security reasons')
  },
  INCORRECT_UNBLOCK_CODE: {
    errno: 127,
    message: t('Invalid authorization code')
  },
  INVALID_PHONE_NUMBER: {
    errno: 129,
    message: t('Invalid phone number')
  },
  INVALID_PHONE_REGION: {
    errno: 130,
    message: t('Cannot send to this country')
  },
  SMS_ID_INVALID: {
    errno: 131,
    // should not be user facing, not wrapped in t
    message: 'SMS ID invalid'
  },
  SMS_REJECTED: {
    errno: 132,
    message: t('Could not send a message to this number')
  },
  EMAIL_SENT_COMPLAINT: {
    errno: 133,
    message: t('Your email was just returned')
  },
  EMAIL_HARD_BOUNCE: {
    errno: 134,
    message: t('Your email was just returned. Mistyped email?')
  },
  EMAIL_SOFT_BOUNCE: {
    errno: 135,
    message: t('Unable to deliver email')
  },
  // Secondary Email errors
  EMAIL_EXISTS: {
    errno: 136,
    message: t('This email was already verified by another user')
  },
  EMAIL_PRIMARY_EXISTS: {
    errno: 139,
    message: t('Secondary email must be different than your account email')
  },
  EMAIL_VERIFIED_PRIMARY_EXISTS: {
    errno: 140,
    message: t('Account already exists')
  },
  UNVERIFIED_PRIMARY_EMAIL_NEWLY_CREATED: {
    errno: 141,
    message: t('Account already exists')
  },
  LOGIN_WITH_SECONDARY_EMAIL: {
    errno: 142,
    message: t('Primary account email required for sign-in')
  },
  VERIFIED_SECONDARY_EMAIL_EXISTS: {
    errno: 144,
    message: t('Address in use by another account')
  },
  RESET_PASSWORD_WITH_SECONDARY_EMAIL: {
    errno: 145,
    message: t('Primary account email required for reset')
  },
  INVALID_SIGNIN_CODE: {
    errno: 146,
    message: t('Invalid signin code')
  },
  CHANGE_EMAIL_TO_UNVERIFIED_EMAIL: {
    errno: 147,
    message: t('Can not change primary email to an unverified email')
  },
  CHANGE_EMAIL_TO_UNOWNED_EMAIL: {
    errno: 148,
    message: t('Can not change primary email to an email that does not belong to this account')
  },
  LOGIN_WITH_INVALID_EMAIL: {
    errno: 149,
    message: t('This email can not currently be used to login')
  },
  RESEND_EMAIL_CODE_TO_UNOWNED_EMAIL: {
    errno: 150,
    message: t('Can not change primary email to an email that does not belong to this account')
  },
  FAILED_TO_SEND_EMAIL: {
    errno: 151,
    message: t('Failed to send email')
  },
  INVALID_TOKEN_VERIFICATION_CODE: {
    errno: 152,
    message: t('Valid code required')
  },
  EXPIRED_TOKEN_VERIFICATION_CODE: {
    errno: 153,
    message: t('This verification code has expired')
  },
  TOTP_TOKEN_EXISTS: {
    errno: 154,
    message: t('A TOTP token already exists for this account')
  },
  TOTP_TOKEN_NOT_FOUND: {
    errno: 155,
    message: t('TOTP token not found')
  },
  RECOVERY_CODE_NOT_FOUND: {
    errno: 156,
    message: t('Recovery code not found')
  },
  DEVICE_COMMAND_UNAVAILABLE: {
    errno: 157,
    message: t('Unavailable device command')
  },
  RECOVERY_KEY_NOT_FOUND: {
    errno: 158,
    message: t('Recovery key not found')
  },
  INVALID_RECOVERY_KEY: {
    errno: 159,
    message: t('Invalid recovery key')
  },
  TOTP_REQUIRED: {
    errno: 160,
    message: t('This request requires two step authentication enabled on your account.')
  },
  REDIS_CONFLICT: {
    errno: 165,
    message: t('Failed due to a conflicting request, please try again.')
  },
  UNKNOWN_SUBSCRIPTION_CUSTOMER: {
    errno: 176,
    message: t('Unknown customer for subscription.')
  },
  UNKNOWN_SUBSCRIPTION: {
    errno: 177,
    message: t('Unknown subscription.')
  },
  UNKNOWN_SUBSCRIPTION_PLAN: {
    errno: 178,
    message: t('Unknown plan for subscription.')
  },
  REJECTED_SUBSCRIPTION_PAYMENT_TOKEN: {
    errno: 179,
    message: t('Invalid payment token for subscription.')
  },
  // Secondary Email errors end
  SERVER_BUSY: {
    errno: 201,
    message: t('Server busy, try again soon')
  },
  FEATURE_NOT_ENABLED: {
    errno: 202,
    message: t('Feature not enabled')
  },
  BACKEND_SERVICE_FAILURE: {
    errno: 203,
    message: t('System unavailable, try again soon')
  },
  DISABLED_CLIENT_ID: {
    errno: 204,
    message: t('System unavailable, try again soon')
  },
  ENDPOINT_NOT_SUPPORTED: {
    errno: 116,
    message: t('This endpoint is no longer supported')
  },
  SERVICE_UNAVAILABLE: {
    errno: 998,
    message: t('System unavailable, try again soon')
  },
  USER_CANCELED_LOGIN: {
    errno: 1001,
    message: t('Login attempt cancelled')
  },
  SESSION_EXPIRED: {
    errno: 1002,
    message: t('Session expired. Sign in to continue.')
  },
  COOKIES_STILL_DISABLED: {
    errno: 1003,
    message: t('Cookies are still disabled')
  },
  PASSWORDS_DO_NOT_MATCH: {
    errno: 1004,
    message: t('Passwords do not match')
  },
  WORKING: {
    errno: 1005,
    message: t('Working…')
  },
  COULD_NOT_GET_PP: {
    errno: 1006,
    message: t('Could not get Privacy Notice')
  },
  COULD_NOT_GET_TOS: {
    errno: 1007,
    message: t('Could not get Terms of Service')
  },
  PASSWORDS_MUST_BE_DIFFERENT: {
    errno: 1008,
    message: t('Your new password must be different')
  },
  PASSWORD_TOO_SHORT: {
    errno: 1009,
    message: t('Must be at least 8 characters')
  },
  PASSWORD_REQUIRED: {
    errno: 1010,
    message: t('Valid password required')
  },
  EMAIL_REQUIRED: {
    errno: 1011,
    message: t('Valid email required')
  },
  /*
  Removed in issue #3137
  YEAR_OF_BIRTH_REQUIRED: {
    errno: 1012,
    message: t('Year of birth required')
  },
  */
  UNUSABLE_IMAGE: {
    errno: 1013,
    message: t('A usable image was not found')
  },
  NO_CAMERA: {
    errno: 1014,
    message: t('Could not initialize camera')
  },
  URL_REQUIRED: {
    errno: 1015,
    message: t('Valid URL required')
  },
  /*
  Removed in issue #3137
  BIRTHDAY_REQUIRED: {
    errno: 1016,
    message: t('Valid birthday required')
  },
  */
  DESKTOP_CHANNEL_TIMEOUT: {
    errno: 1017,
    message: UNEXPECTED_ERROR_MESSAGE
  },
  SIGNUP_EMAIL_BOUNCE: {
    errno: 1018,
    message: t('Your verification email was just returned. Mistyped email?')
  },
  DIFFERENT_EMAIL_REQUIRED: {
    errno: 1019,
    message: t('Valid email required')
  },
  DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN: {
    errno: 1020,
    message: t('Enter a valid email address. firefox.com does not offer email.')
  },
  CHANNEL_TIMEOUT: {
    errno: 1021,
    message: UNEXPECTED_ERROR_MESSAGE
  },
  ILLEGAL_IFRAME_PARENT: {
    errno: 1022,
    message: t('Firefox Accounts can only be placed into an IFRAME on approved sites')
  },
  INVALID_EMAIL: {
    errno: 1023,
    message: t('Valid email required')
  },
  /*
  Removed in issue #3040
  FORCE_AUTH_EMAIL_REQUIRED: {
    errno: 1024,
    message: t('/force_auth requires an email')
  },
  */
  EXPIRED_VERIFICATION_LINK: {
    errno: 1025,
    message: EXPIRED_VERIFICATION_ERROR_MESSAGE
  },
  DAMAGED_VERIFICATION_LINK: {
    errno: 1026,
    message: t('Verification link damaged')
  },
  UNEXPECTED_POSTMESSAGE_ORIGIN: {
    errno: 1027,
    message: UNEXPECTED_ERROR_MESSAGE
  },
  INVALID_IMAGE_SIZE: {
    errno: 1028,
    message: t('The image dimensions must be at least 100x100px')
  },
  IOS_SIGNUP_DISABLED: {
    errno: 1029,
    message: t('Signup is coming soon to Firefox for iOS')
  },
  /*
  Removed in issue #2950
  SIGNUP_DISABLED_BY_RELIER: {
    errno: 1030,
    message: t('Signup has been disabled')
  },
  */
  AGE_REQUIRED: {
    errno: 1031,
    message: t('You must enter your age to sign up')
  },
  INVALID_AGE: {
    errno: 1032,
    message: t('You must enter a valid age to sign up')
  },
  /*
  Removed in #4927
  NO_GRAVATAR_FOUND: {
    errno: 1032,
    message: t('No Gravatar found')
  },
    */
  INVALID_CAMERA_DIMENSIONS: {
    errno: 1033,
    message: UNEXPECTED_ERROR_MESSAGE
  },
  DELETED_ACCOUNT: {
    errno: 1034,
    message: t('Account no longer exists.')
  },
  INVALID_RESUME_TOKEN_PROPERTY: {
    errno: 1035,
    message: t('Invalid property in resume token: %(property)s')
  },
  MISSING_RESUME_TOKEN_PROPERTY: {
    errno: 1036,
    message: t('Missing property in resume token: %(property)s')
  },
  INVALID_DATA_ATTRIBUTE: {
    errno: 1037,
    message: t('Invalid data attribute: %(property)s')
  },
  MISSING_DATA_ATTRIBUTE: {
    errno: 1038,
    message: t('Missing data attribute: %(property)s')
  },
  POLLING_FAILED: {
    // this error is not visible to the user
    errno: 1039,
    message: t('Server busy, try again soon')
  },
  UNKNOWN_ACCOUNT_VERIFICATION: {
    errno: 1040,
    message: EXPIRED_VERIFICATION_ERROR_MESSAGE
  },
  REUSED_SIGNIN_VERIFICATION_CODE: {
    errno: 1041,
    message: t('That confirmation link was already used, and can only be used once.')
  },
  INPUT_REQUIRED: {
    errno: 1042,
    message: t('This is a required field')
  },
  UNBLOCK_CODE_REQUIRED: {
    errno: 1043,
    message: t('Authorization code required')
  },
  INVALID_UNBLOCK_CODE: {
    errno: 1044,
    message: t('Invalid authorization code')
  },
  DAMAGED_REJECT_UNBLOCK_LINK: {
    errno: 1045,
    message: t('Link damaged')
  },
  // logged when view.unsafeTranslate called with a string that
  // contains a variable without an `escaped` prefix
  UNSAFE_INTERPOLATION_VARIABLE_NAME: {
    errno: 1046,
    // not user facing, only used for logging, not wrapped in `t`
    message: 'String variable name does not have escape prefix: %(string)s'
  },
  // logged when view.translate called with a string that contains
  // HTML.
  HTML_WILL_BE_ESCAPED: {
    errno: 1047,
    // not user facing, only used for logging, not wrapped in `t`
    message: 'HTML will be escaped: %(string)s'
  },
  CANNOT_CHANGE_INPUT_TYPE: {
    errno: 1048,
    // not user facing, only used for logging, not wrapped in `t`
    message: 'Cannot change input type: %(type)s'
  },
  PHONE_NUMBER_REQUIRED: {
    errno: 1049,
    message: t('Phone number required')
  },
  ACCOUNT_HAS_NO_UID: {
    errno: 1050,
    // not user facing, only used for logging. Logged whenever
    // an attempt is made to write an account w/o a uid
    // to localStorage.
    message: 'Account has no uid'
  },
  INVALID_WEB_CHANNEL: {
    errno: 1051,
    message: 'Browser not configured to accept WebChannel messages from this domain'
  },
  REUSED_PRIMARY_EMAIL_VERIFICATION_CODE: {
    errno: 1052,
    message: t('That confirmation link was already used, and can only be used once.')
  },
  TOTP_CODE_REQUIRED: {
    errno: 1053,
    message: t('Two-step authentication code required')
  },
  INVALID_TOTP_CODE: {
    errno: 1054,
    message: t('Invalid two-step authentication code')
  },
  RECOVERY_CODE_REQUIRED: {
    errno: 1055,
    message: t('Recovery code required')
  },
  INVALID_RECOVERY_CODE: {
    errno: 1056,
    message: t('Invalid recovery code')
  },
  PASSWORD_SAME_AS_EMAIL: {
    errno: 1057,
    message: 'Password must not be your email address' // only used for logging, no need for translation
  },
  PASSWORD_TOO_COMMON: {
    errno: 1058,
    message: 'Password is too common' // only used for logging, no need for translation
  },
  RECOVERY_KEY_REQUIRED: {
    errno: 1059,
    message: t('Recovery key required')
  },
  TOKEN_VERIFICATION_CODE_REQUIRED: {
    errno: 1060,
    message: t('Please enter verification code')
  },
  /*
  Removed in https://github.com/mozilla/fxa/pull/1242
  TOTP_PAIRING_NOT_SUPPORTED: {
    errno: 1061,
    message: t('Accounts with two-step authentication do not support pairing at this time')
  },
   */

};
/*eslint-enable sorting/sort-object-props*/

export default _.extend({}, Errors, {
  ERRORS: ERRORS,
  NAMESPACE: 'auth',

  /**
   * Fetch the interpolation context out of the server error.
   *
   * @param {Error} err
   * @returns {Object}
   */
  toInterpolationContext (err) {
    // For data returned by backend, see
    // https://github.com/mozilla/fxa-auth-server/blob/master/error.js
    try {
      if (this.is(err, 'INVALID_PARAMETER')) {
        return {
          param: err.param || err.validation.keys
        };
      } else if (this.is(err, 'MISSING_PARAMETER')) {
        return {
          param: err.param
        };
      } else if (this.is(err, 'INVALID_RESUME_TOKEN_PROPERTY')) {
        return {
          property: err.property
        };
      } else if (this.is(err, 'MISSING_RESUME_TOKEN_PROPERTY')) {
        return {
          property: err.property
        };
      } else if (this.is(err, 'INVALID_DATA_ATTRIBUTE')) {
        return {
          property: err.property
        };
      } else if (this.is(err, 'MISSING_DATA_ATTRIBUTE')) {
        return {
          property: err.property
        };
      } else if (this.is(err, 'UNSAFE_INTERPOLATION_VARIABLE_NAME')) {
        return {
          string: err.string
        };
      } else if (this.is(err, 'HTML_WILL_BE_ESCAPED')) {
        return {
          string: err.string
        };
      } else if (this.is(err, 'CANNOT_CHANGE_INPUT_TYPE')) {
        return {
          type: err.type
        };
      } else if (this.is(err, 'THROTTLED')) {
        if (err.retryAfterLocalized) {
          // enhance the throttled message if localized retryAfter data is available
          err.message = THROTTLED_LOCALIZED_ERROR_MESSAGE;
        }

        return {
          retryAfterLocalized: err.retryAfterLocalized
        };
      }
    } catch (e) {
      // handle invalid/unexpected data from the backend.
      logger.error('Error in errors.js->toInterpolationContext: %s', String(e));
    }

    return {};
  }
});
