/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model mixin to work with ResumeTokens.
 *
 * Expects the following properties on `this`:
 *
 *   - resumeTokenFields: array of fields that are serialized to and
 *                        parsed from the resume token.
 *
 *   - resumeTokenSchema: array of vat validators that will be applied
 *                        when parsing from the resume token.
 *
 *   - sentryMetrics: object for reporting validation errors to Sentry.
 */

import AuthErrors from '../../lib/auth-errors';
import ErrorUtils from '../../lib/error-utils';
import ResumeToken from '../resume-token';
import vat from '../../lib/vat';

export default {
  /**
   * Get an object of values that should be stored in a ResumeToken
   *
   * @method pickResumeTokenInfo
   * @returns {Object}
   */
  pickResumeTokenInfo() {
    if (this.resumeTokenFields) {
      return this.pick(this.resumeTokenFields);
    }
  },

  /**
   * Sets model properties from a stringified ResumeToken, unless said token
   * is invalid according to `this.resumeTokenSchema`. A stringified ResumeToken
   * is generally one passed in the `resume` query parameter.
   *
   * @method populateFromStringifiedResumeToken
   * @param {String} stringifiedResumeToken
   */
  populateFromStringifiedResumeToken(stringifiedResumeToken) {
    if (this.resumeTokenFields) {
      var resumeToken = ResumeToken.createFromStringifiedResumeToken(
        stringifiedResumeToken
      );

      this.populateFromResumeToken(resumeToken);
    }
  },

  /**
   * Sets model properties from a ResumeToken, unless said token
   * is invalid according to `this.resumeTokenSchema`.
   *
   * @method populateFromResumeToken
   * @param {ResumeToken} resumeToken
   * @returns {undefined}
   */
  populateFromResumeToken(resumeToken) {
    if (this.resumeTokenFields) {
      var pickedResumeToken = resumeToken.pick(this.resumeTokenFields);

      var error = validateResumeToken.call(this, pickedResumeToken);
      if (error) {
        return reportValidationError.call(this, error);
      }

      this.set(pickedResumeToken);
    }
  },
};

function validateResumeToken(resumeToken) {
  if (this.resumeTokenSchema) {
    return vat.validate(resumeToken, this.resumeTokenSchema).error;
  }
}

function reportValidationError(error) {
  if (error instanceof ReferenceError) {
    error = AuthErrors.toMissingResumeTokenPropertyError(error.key);
  } else {
    error = AuthErrors.toInvalidResumeTokenPropertyError(error.key);
  }

  ErrorUtils.captureError(error, this.sentryMetrics);
}
