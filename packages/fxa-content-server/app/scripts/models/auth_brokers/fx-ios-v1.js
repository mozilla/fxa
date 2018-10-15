/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in the Firefox for iOS 1.0 ... < 2.0.
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const FxDesktopV1AuthenticationBroker = require('../auth_brokers/fx-desktop-v1');
  const NavigateBehavior = require('../../views/behaviors/navigate');
  const UserAgent = require('../../lib/user-agent');

  const proto = FxDesktopV1AuthenticationBroker.prototype;

  const FxiOSV1AuthenticationBroker = FxDesktopV1AuthenticationBroker.extend({
    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      chooseWhatToSyncCheckbox: false,
      chooseWhatToSyncWebV1: true,
      convertExternalLinksToText: true
    }),

    initialize (options = {}) {
      proto.initialize.call(this, options);

      const userAgent = new UserAgent(this._getUserAgentString());
      const version = userAgent.parseVersion();

      // We enable then disable this capability if necessary and not the opposite,
      // because initialize() sets chooseWhatToSyncWebV1Engines and
      // new UserAgent() can't be called before initialize().
      if (! this._supportsChooseWhatToSync(version)) {
        this.setCapability('chooseWhatToSyncWebV1', false);
      }

      // Fx for iOS allows the user to see the "confirm your email" screen,
      // but never takes it away after the user verifies. Allow the poll
      // so that the user sees the "Signup complete!" screen after they
      // verify their email.
      this.setBehavior(
        'afterSignInConfirmationPoll', new NavigateBehavior('signin_confirmed'));
      this.setBehavior(
        'afterSignUpConfirmationPoll', new NavigateBehavior('signup_confirmed'));
    },

    /**
     * Get the user-agent string. For functional testing
     * purposes, first attempts to fetch a UA string from the
     * `forceUA` query parameter, if that is not found, use
     * the browser's.
     *
     * @returns {String}
     * @private
     */
    _getUserAgentString () {
      return this.getSearchParam('forceUA') || this.window.navigator.userAgent;
    },

    /**
     * Check if the browser supports Choose What To Sync
     * for newly created accounts.
     *
     * @param {Object} version
     * @returns {Boolean}
     * @private
     */
    _supportsChooseWhatToSync (version) {
      return version.major >= 11;
    },

    /**
     * Notify the relier of login.
     *
     * @param {Object} account
     * @returns {Promise}
     * @private
     */
    _notifyRelierOfLogin (account) {
      return proto._notifyRelierOfLogin.call(this, account);
    },

    /**
     * Notify the relier that a sign-in with a code was performed.
     *
     * @param {Object} account
     * @returns {Promise}
     * @private
     */
    afterCompleteSignInWithCode (account) {
      return this._notifyRelierOfLogin(account)
        .then(() => proto.afterCompleteSignInWithCode.call(this, account));
    },
  });

  module.exports = FxiOSV1AuthenticationBroker;
});
