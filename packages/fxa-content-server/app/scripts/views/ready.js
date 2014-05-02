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
  'stache!templates/ready',
  'lib/session',
  'lib/xss',
  'lib/strings',
  'lib/service-name'
],
function (_, BaseView, Template, Session, Xss, Strings, ServiceName) {
  var View = BaseView.extend({
    template: Template,
    className: 'reset_password_complete',

    initialize: function (options) {
      options = options || {};

      this.type = options.type;
    },

    context: function () {
      var service = Session.service;
      var serviceName = new ServiceName(this.translator).get(service);

      if (Session.redirectTo) {
        serviceName = Strings.interpolate('<a href="%s" class="no-underline" id="redirectTo">%s</a>', [
          Xss.href(Session.redirectTo), serviceName
        ]);
      }

      return {
        service: service,
        serviceName: serviceName,
        signIn: this.is('sign_in'),

        signUp: this.is('sign_up'),
        showSignUpMarketing: this._showSignUpMarketing(),

        resetPassword: this.is('reset_password')
      };
    },

    _showSignUpMarketing: function () {
      if (! this.is('sign_up')) {
        return false;
      }

      // For UA information, see
      // https://developer.mozilla.org/docs/Gecko_user_agent_string_reference

      var ua = this.window.navigator.userAgent;

      // covers both B2G and Firefox for Android
      var isMobileFirefox = ua.indexOf('Mobile') > -1 && ua.indexOf('Firefox') > -1;
      var isTabletFirefox = ua.indexOf('Tablet') > -1 && ua.indexOf('Firefox') > -1;

      return ! (isMobileFirefox || isTabletFirefox);
    },

    afterRender: function() {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');
    },

    is: function (type) {
      return this.type === type;
    }
  });

  return View;
});
