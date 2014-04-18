/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'views/form',
  'stache!templates/change_password',
  'lib/session',
  'lib/password-mixin'
],
function (_, BaseView, FormView, Template, Session, PasswordMixin) {
  var t = BaseView.t;

  var View = FormView.extend({
    // user must be authenticated to change password
    mustAuth: true,

    template: Template,
    className: 'change-password',

    events: {
      'click #back': 'back',
      'keyup #back': 'backOnEnter',
      'change .show-password': 'onPasswordVisibilityChange'
    },

    context: function () {
      return {
        isSync: Session.service === 'sync'
      };
    },

    afterRender: function() {
      this.togglePlaceholderPattern();
    },

    submit: function () {
      var email = Session.email;
      var oldPassword = this.$('#old_password').val();
      var newPassword = this.$('#new_password').val();

      if (oldPassword === newPassword) {
        return this.displayError(
                    t('Your new password must be different'));
      }

      this.hideError();

      var self = this;
      return this.fxaClient.changePassword(email, oldPassword, newPassword)
                .then(function () {
                  self.$('.password').val('');
                  self.$('form').hide();

                  self.displaySuccess();
                });
    }
  });

  _.extend(View.prototype, PasswordMixin);

  return View;
});
