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
    finishOAuthFlow: function (result) {
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
    }
  });

  return RedirectAuthenticationBroker;
});
