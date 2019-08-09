/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The base relier. It's the base of all other reliers, or a NullRelier,
 * depending on how you want to use it.
 */

import Backbone from 'backbone';

var Relier = Backbone.Model.extend({
  defaults: {
    context: null,
  },

  fetch() {
    return Promise.resolve(true);
  },

  /**
   * Check if the relier is using the oauth flow
   *
   * @returns {Boolean}
   */
  isOAuth() {
    return false;
  },

  /**
   * Check if the relier is Sync for Firefox Desktop
   *
   * @returns {Boolean}
   */
  isSync() {
    return false;
  },

  /**
   * Check if the relier wants access to the account encryption keys.
   *
   * @returns {Boolean}
   */
  wantsKeys() {
    return false;
  },

  /**
   * Return `true` if the relier wants two step authentication.
   *
   * @returns {Boolean} `true` if relier asks for two step authentication, false otw.
   */
  wantsTwoStepAuthentication() {
    return false;
  },

  /**
   * Get the resume token info to be passed along in the email
   * verification links
   *
   * @returns {Object}
   */
  pickResumeTokenInfo() {
    return {};
  },

  /**
   * Indicates whether the relier is trusted
   *
   * @returns {Boolean}
   */
  isTrusted() {
    return true;
  },

  /**
   * Indicate whether the given accounts needs any additional permissions
   *
   * @returns {Boolean}
   */
  accountNeedsPermissions(/* account */) {
    return false;
  },
});

export default Relier;
