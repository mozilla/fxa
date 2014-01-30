/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'stache!templates/change_password',
  'lib/fxa-client',
  'lib/session',
  'lib/password-mixin',
  'lib/url'
],
function (_, BaseView, Template, FxaClient, Session, PasswordMixin, Url) {
  var gettext = BaseView.gettext;

  var View = BaseView.extend({
    // user must be authenticated to change password
    mustAuth: true,

    template: Template,
    className: 'change-password',

    events: {
      'click #back': 'back',
      'keyup #back': 'backOnEnter',
      'submit form': BaseView.preventDefaultThen('changePassword'),
      'keyup input': 'enableButtonWhenValid',
      'change input': 'enableButtonWhenValid',
      'change .show-password': 'onPasswordVisibilityChange'
    },

    context: function () {
      return {
        isSync: Url.searchParam('service') === 'sync'
      };
    },

    isValid: function () {
      return this.isElementValid('#old_password') &&
             this.isElementValid('#new_password');
    },

    changePassword: function () {
      if (! this.isValid()) {
        return;
      }

      var email = Session.email;
      var oldPassword = this._getOldPassword();
      var newPassword = this._getNewPassword();

      if (oldPassword === newPassword) {
        return this.displayError(
                    gettext('old and new passwords must be different'));
      }

      this.hideError();

      var self = this;
      var client = new FxaClient();
      client.changePassword(email, oldPassword, newPassword)
            .then(function () {
              self.$('.password').val('');
              self.$('form').hide();

              self.displaySuccess();
            }, function (err) {
              self.displayError(err.msg || err.message);
            });
    },

    _getOldPassword: function () {
      return this.$('#old_password').val();
    },

    _getNewPassword: function () {
      return this.$('#new_password').val();
    }
  });

  _.extend(View.prototype, PasswordMixin);

  return View;
});
