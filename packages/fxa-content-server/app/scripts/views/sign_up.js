/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'stache!templates/sign_up',
  'lib/session'
],
function (BaseView, SignUpTemplate, Session) {
  var SignUpView = BaseView.extend({
    template: SignUpTemplate,
    className: 'sign-up',

    events: {
      'submit form': 'signUp'
    },

    signUp: function (event) {
      event.preventDefault();

      if (! (this._validateEmail() && this._validatePassword())) {
        return;
      }

      Session.email = this.$('.email').val();
      Session.password = this.$('.password').val();

      router.navigate('age', { trigger: true });
    },

    _validateEmail: function () {
      return this.isElementValid('.email');
    },

    _validatePassword: function () {
      return this.isElementValid('.password');
    }
  });

  return SignUpView;
});
