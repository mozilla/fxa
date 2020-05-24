/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Helper methods to determine why a user must verify
 *
 * @class VerificationReasonMixin
 */

import _ from 'underscore';
import VerificationReasons from '../../lib/verification-reasons';

function findKey(haystack, needle) {
  return _.findKey(haystack, function (value) {
    return value === needle;
  });
}

export default {
  initialize(options) {
    if (!this.model.has('type')) {
      this.model.set('type', options.type || VerificationReasons.SIGN_UP);
    }
  },

  /**
   * Check if verification is for sign in
   *
   * @returns {Boolean}
   */
  isSignIn() {
    return this.model.get('type') === VerificationReasons.SIGN_IN;
  },

  /**
   * Check if verification is for sign up
   *
   * @returns {Boolean}
   */
  isSignUp() {
    return this.model.get('type') === VerificationReasons.SIGN_UP;
  },

  /**
   * Is a primary email being verified?
   *
   * @returns {Boolean}
   */
  isPrimaryEmail() {
    return (
      this.model.get('type') === VerificationReasons.PRIMARY_EMAIL_VERIFIED
    );
  },

  /**
   * Is a secondary email being verified?
   *
   * @returns {Boolean}
   */
  isSecondaryEmail() {
    return (
      this.model.get('type') === VerificationReasons.SECONDARY_EMAIL_VERIFIED
    );
  },

  /**
   * Get the key in VerificationReasons for the given verification reason
   *
   * @param {String} verificationReason
   * @returns {String}
   */
  keyOfVerificationReason(verificationReason) {
    return findKey(VerificationReasons, verificationReason);
  },
};
