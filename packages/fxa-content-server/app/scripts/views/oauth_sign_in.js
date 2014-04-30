/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'p-promise',
  'views/sign_in',
  'lib/session',
  'lib/oauth-mixin',
  'lib/oauth-errors'
],
function (_, p, SignInView, Session, OAuthMixin, oAuthErrors) {
  var View = SignInView.extend({
    className: 'sign-in oauth-sign-in',

    initialize: function (options) {
      SignInView.prototype.initialize.call(this, options);

      this.setupOAuth();
    },

    beforeRender: function() {
      return this.setServiceInfo();
    },

    onSignInSuccess: function() {
      var self = this;
      return this.finishOAuthFlow();
    }
  });

  _.extend(View.prototype, OAuthMixin);

  return View;
});
