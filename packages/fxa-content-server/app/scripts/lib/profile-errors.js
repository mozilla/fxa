/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import Errors from './errors';
const t = msg => msg;

const THROTTLED_ERROR_MESSAGE = t(
  "You've tried too many times. Try again later."
);

var ERRORS = {
  UNAUTHORIZED: {
    errno: 100,
    message: t('Unauthorized'),
  },
  INVALID_PARAMETER: {
    errno: 101,
    message: t('Invalid parameter in request body: %(param)s'),
  },
  UNSUPPORTED_PROVIDER: {
    errno: 102,
    message: t('Unsupported image provider'),
  },
  IMAGE_PROCESSING_ERROR: {
    errno: 103,
    message: t('Image processing error'),
  },
  OAUTH_ERROR: {
    errno: 104,
    message: t('System unavailable, try again soon'),
  },
  AUTH_ERROR: {
    errno: 105,
    message: t('System unavailable, try again soon'),
  },
  INVALID_TOKEN: {
    errno: 110,
    message: t('Invalid Token'),
  },
  THROTTLED: {
    errno: 114,
    message: THROTTLED_ERROR_MESSAGE,
  },
  REQUEST_BLOCKED: {
    errno: 125,
    message: t('The request was blocked for security reasons'),
  },
  IMAGE_LOAD_ERROR: {
    errno: 997,
    message: t('Unexpected error'),
  },
  SERVICE_UNAVAILABLE: {
    errno: 998,
    message: t('System unavailable, try again soon'),
  },
  UNEXPECTED_ERROR: {
    errno: 999,
    message: t('Unexpected error'),
  },
};

export default _.extend({}, Errors, {
  ERRORS: ERRORS,
  NAMESPACE: 'profile',
});
