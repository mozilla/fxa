/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'p-promise',
  'views/sign_in',
  'lib/session',
  'lib/oauth-mixin'
],
function (_, p, SignInView, Session, OAuthMixin) {
  var View = SignInView.extend({
    className: 'sign-in oauth-sign-in',

    initialize: function (options) {
      SignInView.prototype.initialize.call(this, options);

      this.setupOAuth();
    },

    beforeRender: function() {
      return this.setServiceInfo();
    },

    afterRender: function() {
      this.$('.sign-up').attr('href', '/oauth/signup');
    },

    onSignInSuccess: function() {
      return this.finishOAuthFlow();
    }
  });

  _.extend(View.prototype, OAuthMixin);

  return View;
});
