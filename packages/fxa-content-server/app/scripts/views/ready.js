/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handle sign_in_complete, sign_up_complete,
 * and reset_password_complete.
 * Prints a message to the user that says
 * "All ready! You can go visit {{ service }}"
 */

'use strict';

define([
  'underscore',
  'views/base',
  'views/form',
  'stache!templates/ready',
  'lib/session',
  'lib/xss',
  'lib/strings',
  'lib/service-name',
  'lib/oauth-mixin'
],
function (_, BaseView, FormView, Template, Session, Xss, Strings, ServiceName, OAuthMixin) {
  var View = BaseView.extend({
    template: Template,
    className: 'reset_password_complete',

    initialize: function (options) {
      options = options || {};

      this.type = options.type;
    },

    beforeRender: function () {
      if (this.isOAuthSameBrowser()) {
        // We're continuing an OAuth flow from the same browser
        this.setupOAuth(Session.oauth);
        return this.setServiceInfo();
      } else if (this.isOAuth()) {
        // We're continuing an OAuth flow in a different browser
        this.setupOAuth();
        this.service = Session.service;
        return this.setServiceInfo();
      }
    },

    context: function () {
      var serviceName = this.serviceName || new ServiceName(this.translator).get(this.service);

      if (this.serviceRedirectURI) {
        serviceName = Strings.interpolate('<a href="%s" class="no-underline" id="redirectTo">%s</a>', [
          Xss.href(this.serviceRedirectURI), serviceName
        ]);
      }

      return {
        service: this.service,
        serviceName: serviceName,
        signIn: this.is('sign_in'),
        signUp: this.is('sign_up'),
        resetPassword: this.is('reset_password')
      };
    },

    events: {
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #redirectTo': BaseView.preventDefaultThen('submit')
    },

    afterRender: function() {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');
    },

    submit: function () {
      if (this.isOAuthSameBrowser()) {
        return this.finishOAuthFlow();
      } else if (this.isOAuth()) {
        return this.oAuthRedirectWithError();
      }
    },

    isOAuth: function () {
      return !!Session.service;
    },

    isOAuthSameBrowser: function () {
      return Session.oauth && Session.oauth.client_id === Session.service;
    },

    is: function (type) {
      return this.type === type;
    }
  });

  _.extend(View.prototype, OAuthMixin);

  return View;
});
