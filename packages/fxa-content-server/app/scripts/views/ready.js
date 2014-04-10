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
  'lib/strings'
],
function (_, BaseView, Template, Session, Xss, Strings) {
  var View = BaseView.extend({
    template: Template,
    className: 'reset_password_complete',

    initialize: function (options) {
      options = options || {};

      this.type = options.type;
    },

    context: function () {
      var service = Session.service;

      if (Session.redirectTo) {
        service = Strings.interpolate('<a href="%s" class="no-underline" id="redirectTo">%s</a>', [
          Xss.href(Session.redirectTo), Session.service
        ]);
      }

      return {
        service: service,
        signIn: this.is('sign_in'),
        signUp: this.is('sign_up'),
        resetPassword: this.is('reset_password')
      };
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
