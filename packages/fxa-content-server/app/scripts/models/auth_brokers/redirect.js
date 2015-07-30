/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Finishes the OAuth flow by redirecting the window.

define([
  'lib/promise',
  'lib/constants',
  'lib/url',
  'models/auth_brokers/oauth'
], function (p, Constants, Url, OAuthAuthenticationBroker) {
  'use strict';

  var RedirectAuthenticationBroker = OAuthAuthenticationBroker.extend({
    type: 'redirect',
    initialize: function (options) {
      options = options || {};

      this._metrics = options.metrics;

      return OAuthAuthenticationBroker.prototype.initialize.call(this, options);
    },

    sendOAuthResultToRelier: function (result) {
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
    setOriginalTabMarker: function () {
      this.window.sessionStorage.setItem('originalTab', '1');
    },

    isOriginalTab: function () {
      return !! this.window.sessionStorage.getItem('originalTab');
    },

    clearOriginalTabMarker: function () {
      this.window.sessionStorage.removeItem('originalTab');
    },

    persist: function () {
      // If the user replaces the current tab with the verification url,
      // finish the OAuth flow.
      var self = this;
      return p().then(function () {
        self.setOriginalTabMarker();
        return OAuthAuthenticationBroker.prototype.persist.call(self);
      });
    },

    finishOAuthFlow: function (account, additionalResultData) {
      var self = this;
      return p().then(function () {
        // There are no ill side effects if the Original Tab Marker is
        // cleared in the a tab other than the original. Always clear it just
        // to make sure the bases are covered.
        self.clearOriginalTabMarker();
        return OAuthAuthenticationBroker.prototype
          .finishOAuthFlow.call(self, account, additionalResultData);
      });
    },

    afterCompleteSignUp: function (account) {
      // The user may have replaced the original tab with the verification
      // tab. If this is the case, send the OAuth result to the RP.
      //
      // The slight delay is to allow the functional tests time to bind
      // event handlers before the flow completes.
      var self = this;

      return p().delay(100).then(function () {
        if (self.isOriginalTab() || self.canVerificationRedirect()) {
          return self.finishOAuthSignUpFlow(account)
            .then(function () {
              return { halt: true };
            });
        }
      });
    },

    canVerificationRedirect: function () {
      // checks if the relier is using the verificationRedirect option
      // then automatically redirects to the relier if an oauth session is present
      var verificationRedirect = this.relier.get('verificationRedirect');

      return this.session.oauth && verificationRedirect === Constants.VERIFICATION_REDIRECT_ALWAYS;
    },

    afterCompleteResetPassword: function (account) {
      // The user may have replaced the original tab with the verification
      // tab. If this is the case, send the OAuth result to the RP.
      var self = this;
      return p().then(function () {
        if (self.isOriginalTab()) {
          return self.finishOAuthSignInFlow(account)
            .then(function () {
              return { halt: true };
            });
        }
      });
    }
  });

  return RedirectAuthenticationBroker;
});
