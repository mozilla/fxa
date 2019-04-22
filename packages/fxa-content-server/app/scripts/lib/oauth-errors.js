/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// provides functions to work with errors returned by the auth server.

'use strict';

import _ from 'underscore';
import Errors from './errors';
import Logger from './logger';
var logger = new Logger();
import Strings from './strings';
const t = msg => msg;

var UNEXPECTED_ERROR = t('Unexpected error');

/*eslint-disable sorting/sort-object-props*/
var ERRORS = {
  UNKNOWN_CLIENT: {
    errno: 101,
    message: t('Unknown client')
  },
  INCORRECT_REDIRECT: {
    errno: 103,
    message: t('Incorrect redirect_uri')
  },
  INVALID_ASSERTION: {
    errno: 104,
    message: t('Invalid assertion')
  },
  UNKNOWN_CODE: {
    errno: 105,
    message: t('Unknown code')
  },
  INCORRECT_CODE: {
    errno: 106,
    message: t('Incorrect code')
  },
  EXPIRED_CODE: {
    errno: 107,
    message: t('Expired code')
  },
  INVALID_TOKEN: {
    errno: 108,
    message: t('Invalid token')
  },
  INVALID_PARAMETER: {
    errno: 109,
    message: t('Invalid OAuth parameter: %(param)s')
  },
  INVALID_RESPONSE_TYPE: {
    errno: 110,
    message: UNEXPECTED_ERROR
  },
  UNAUTHORIZED: {
    errno: 111,
    message: t('Unauthorized')
  },
  FORBIDDEN: {
    errno: 112,
    message: t('Forbidden')
  },
  INVALID_CONTENT_TYPE: {
    errno: 113,
    message: UNEXPECTED_ERROR
  },
  INVALID_SCOPES: {
    errno: 114,
    message: Strings.interpolate(
      // `scope` should not be translated, so interpolate it in.
      t('Invalid OAuth parameter: %(param)s'), { param: 'scope' })
  },
  EXPIRED_TOKEN: {
    errno: 115,
    message: t('Expired token')
  },
  NOT_PUBLIC_CLIENT: {
    errno: 116,
    message: 'Not a public client'
  },
  INCORRECT_CODE_CHALLENGE: {
    errno: 117,
    message: 'Incorrect code_challenge'
  },
  MISSING_PKCE_PARAMETERS: {
    errno: 118,
    message: 'PKCE parameters missing'
  },
  STALE_AUTHENTICATION_TIMESTAMP: {
    errno: 119,
    message: 'Stale authentication timestamp'
  },
  MISMATCH_ACR_VALUES: {
    errno: 120,
    message: 'Mismatch acr values'
  },
  INVALID_GRANT_TYPE: {
    errno: 121,
    message: 'Invalid grant_type'
  },
  SERVICE_UNAVAILABLE: {
    errno: 998,
    message: t('System unavailable, try again soon')
  },
  UNEXPECTED_ERROR: {
    errno: 999,
    message: UNEXPECTED_ERROR
  },
  TRY_AGAIN: {
    errno: 1000,
    message: t('Something went wrong. Please close this tab and try again.')
  },
  INVALID_RESULT: {
    errno: 1001,
    message: UNEXPECTED_ERROR
  },
  /*
  Removed in PR #6017
  INVALID_RESULT_REDIRECT: {
    errno: 1002,
    message: UNEXPECTED_ERROR
  },
  INVALID_RESULT_CODE: {
    errno: 1003,
    message: UNEXPECTED_ERROR
  },
  */
  USER_CANCELED_OAUTH_LOGIN: {
    errno: 1004,
    message: t('no message')
  },
  MISSING_PARAMETER: {
    errno: 1005,
    message: t('Missing OAuth parameter: %(param)s')
  },
  INVALID_PAIRING_CLIENT: {
    errno: 1006,
    message: 'Invalid pairing client'
  },
};
/*eslint-enable sorting/sort-object-props*/

export default _.extend({}, Errors, {
  ERRORS: ERRORS,
  NAMESPACE: 'oauth',

  /**
   * Fetch the interpolation context out of the server error.
   * @param {Error} err
   * @returns {Object}
   */
  toInterpolationContext (err) {
    // For data returned by backend, see
    // https://github.com/mozilla/fxa-oauth-server/blob/master/docs/api.md#errors
    try {
      if (this.is(err, 'MISSING_PARAMETER')) {
        return {
          param: err.param
        };
      } else if (this.is(err, 'INVALID_PARAMETER')) {
        return {
          param: err.param || err.validation.keys.join(',')
        };
      }
    } catch (e) {
      // handle invalid/unexpected data from the backend.
      logger.error('Error in oauth-errors.js->toInterpolationContext: %s', String(e));
    }

    return {};
  }
});
