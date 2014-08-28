/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'lib/promise',
  'views/base',
  'views/sign_up',
  'views/mixins/service-mixin'
],
function (_, p, BaseView, SignUpView, ServiceMixin) {
  var View = SignUpView.extend({
    className: 'sign-up oauth-sign-up',

    initialize: function (options) {
      /* jshint camelcase: false */
      SignUpView.prototype.initialize.call(this, options);

      // Set up OAuth so we can retrieve the pretty service name
      this.setupOAuth();
    },

    beforeRender: function() {
      var self = this;
      return p().then(function () {
          return SignUpView.prototype.beforeRender.call(self);
        })
        .then(_.bind(this.setServiceInfo, this));
    },

    afterRender: function() {
      this.setupOAuthLinks();
      return SignUpView.prototype.afterRender.call(this);
    },

    onSignUpSuccess: function (accountData) {
      // Store oauth state for when/if the oauth flow completes
      // in this browser
      this.persistOAuthParams();
      return SignUpView.prototype.onSignUpSuccess.call(this, accountData);
    }
  });

  _.extend(View.prototype, ServiceMixin);

  return View;
});
