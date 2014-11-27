/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Finishes the OAuth flow by redirecting the window.

'use strict';

define([
  'lib/promise',
  'models/auth_brokers/oauth'
], function (p, OAuthAuthenticationBroker) {

  var RedirectAuthenticationBroker = OAuthAuthenticationBroker.extend({
    sendOAuthResultToRelier: function (result) {
      var win = this.window;
      return p()
        .then(function () {
          var redirectTo = result.redirect;

          if (result.error) {
            // really, we should be parsing the URL and adding the error
            // parameter. That requires more code than this.
            var separator = redirectTo.indexOf('?') === -1 ? '?' : '&';
            redirectTo += (separator + 'error=' + encodeURIComponent(result.error));
          }

          win.location.href = redirectTo;
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

    finishOAuthFlow: function () {
      var self = this;
      return p().then(function () {
        // There are no ill side effects if if the Original Tab Marker is
        // cleared in the a tab other than the original. Always clear it just
        // to make sure the bases are covered.
        self.clearOriginalTabMarker();
        return OAuthAuthenticationBroker.prototype.finishOAuthFlow.call(self);
      });
    },

    afterCompleteSignUp: function () {
      // The user may have replaced the original tab with the verification
      // tab. If this is the case, send the OAuth result to the RP.
      //
      // The slight delay is to allow the functional tests time to bind
      // event handlers before the flow completes.
      var self = this;
      return p().delay(100).then(function () {
        if (self.isOriginalTab()) {
          return self.finishOAuthFlow()
            .then(function () {
              return { halt: true };
            });
        }
      });
    },

    afterCompleteResetPassword: function () {
      // The user may have replaced the original tab with the verification
      // tab. If this is the case, send the OAuth result to the RP.
      var self = this;
      return p().then(function () {
        if (self.isOriginalTab()) {
          return self.finishOAuthFlow()
            .then(function () {
              return { halt: true };
            });
        }
      });
    }
  });

  return RedirectAuthenticationBroker;
});
