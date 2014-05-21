/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'views/sign_up',
  'lib/session',
  'lib/oauth-mixin'
],
function (_, BaseView, SignUpView, Session, OAuthMixin) {
  var View = SignUpView.extend({
    className: 'sign-up oauth-sign-up',

    initialize: function (options) {
      /* jshint camelcase: false */
      SignUpView.prototype.initialize.call(this, options);

      // Set up OAuth so we can retrieve the pretty service name
      this.setupOAuth();

      Session.set('service', this._oAuthParams.client_id);
    },

    beforeRender: function () {
      return this.setServiceInfo();
    },

    afterRender: function() {
      this.$('.sign-in').attr('href', '/oauth/signin');
    },

    onSignUpSuccess: function () {
      // Store oauth state for when/if the oauth flow completes
      // in this browser
      Session.set('oauth', this._oAuthParams);
      this.navigate('confirm');
    }
  });

  _.extend(View.prototype, OAuthMixin);

  return View;
});
