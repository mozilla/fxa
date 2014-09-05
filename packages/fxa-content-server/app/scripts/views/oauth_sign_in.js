/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'lib/promise',
  'views/sign_in',
  'views/mixins/service-mixin'
],
function (_, p, SignInView, ServiceMixin) {
  var View = SignInView.extend({
    className: 'sign-in oauth-sign-in',

    initialize: function (options) {
      SignInView.prototype.initialize.call(this, options);

      this.setupOAuth();
    },

    beforeRender: function() {
      var self = this;
      return p().then(function () {
        return SignInView.prototype.beforeRender.call(self);
      })
      .then(_.bind(this.setServiceInfo, this));
    },

    afterRender: function() {
      this.setupOAuthLinks();
      return SignInView.prototype.afterRender.call(this);
    },

    onSignInSuccess: function() {
      return this.finishOAuthFlow({
        source: 'signin'
      });
    },

    onSignInUnverified: function() {
      // set the oauth parameters in the session so they are available
      // in the email confirmation
      this.persistOAuthParams();
      return SignInView.prototype.onSignInUnverified.call(this);
    },

    onPasswordResetNavigate: function () {
      this.persistOAuthParams();
      this.navigate('reset_password');
    }
  });

  _.extend(View.prototype, ServiceMixin);

  return View;
});
