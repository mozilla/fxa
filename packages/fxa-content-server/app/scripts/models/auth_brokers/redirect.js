/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Finishes the OAuth flow by redirecting the window.

define(function (require, exports, module) {
  'use strict';

  const HaltBehavior = require('views/behaviors/halt');
  const OAuthAuthenticationBroker = require('models/auth_brokers/oauth');
  const p = require('lib/promise');
  const Url = require('lib/url');

  var proto = OAuthAuthenticationBroker.prototype;

  var RedirectAuthenticationBroker = OAuthAuthenticationBroker.extend({
    type: 'redirect',
    initialize (options) {
      options = options || {};

      this._metrics = options.metrics;

      return proto.initialize.call(this, options);
    },

    sendOAuthResultToRelier (result) {
      var win = this.window;
      return this._metrics.flush()
        .then(function () {
          var extraParams = {};
          if (result.error) {
            extraParams['error'] = result.error;
          }
          if (result.action) {
            extraParams['action'] = result.action;
          }
          win.location.href = Url.updateSearchString(result.redirect, extraParams);
        });
    },

    /**
     * Sets a marker used to determine if this is the tab a user
     * signed up or initiated a password reset in. If the user replaces
     * the original tab with the verification tab, then the OAuth flow
     * should complete and the user redirected to the RP.
     */
    setOriginalTabMarker () {
      this.window.sessionStorage.setItem('originalTab', '1');
    },

    isOriginalTab () {
      return !! this.window.sessionStorage.getItem('originalTab');
    },

    clearOriginalTabMarker () {
      this.window.sessionStorage.removeItem('originalTab');
    },

    persistVerificationData (account) {
      // If the user replaces the current tab with the verification url,
      // finish the OAuth flow.
      return p().then(() => {
        this.setOriginalTabMarker();
        return proto.persistVerificationData.call(this, account);
      });
    },

    finishOAuthFlow (account, additionalResultData) {
      return p().then(() => {
        // There are no ill side effects if the Original Tab Marker is
        // cleared in the a tab other than the original. Always clear it just
        // to make sure the bases are covered.
        this.clearOriginalTabMarker();
        return proto.finishOAuthFlow.call(this, account, additionalResultData);
      });
    },

    afterCompleteSignUp (account) {
      // The user may have replaced the original tab with the verification
      // tab. If this is the case, send the OAuth result to the RP.
      //
      // The slight delay is to allow the functional tests time to bind
      // event handlers before the flow completes.
      return proto.afterCompleteSignUp.call(this, account)
        .delay(100)
        .then((behavior) => {
          if (this.isOriginalTab()) {
            return this.finishOAuthSignUpFlow(account)
              .then(() => {
                return new HaltBehavior();
              });
          }
          return behavior;
        });
    },

    afterCompleteResetPassword (account) {
      // The user may have replaced the original tab with the verification
      // tab. If this is the case, send the OAuth result to the RP.
      return proto.afterCompleteResetPassword.call(this, account)
        .then((behavior) => {
          if (this.isOriginalTab()) {
            return this.finishOAuthSignInFlow(account)
              .then(() => {
                return new HaltBehavior();
              });
          }

          return behavior;
        });
    }
  });

  module.exports = RedirectAuthenticationBroker;
});
