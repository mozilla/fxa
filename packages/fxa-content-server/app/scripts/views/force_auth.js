/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'lib/promise',
  'views/base',
  'views/form',
  'views/sign_in',
  'stache!templates/force_auth',
  'lib/session'
],
function (p, BaseView, FormView, SignInView, Template, Session) {
  var t = BaseView.t;

  var View = SignInView.extend({
    template: Template,
    className: 'sign-in',

    initialize: function (options) {
      options = options || {};

      // The session is cleared just after this. Store
      // the prefillPassword so it can be inserted into the DOM.
      this._prefillPassword = Session.prefillPassword;

      // forceAuth means a user must sign in as a specific user.
      // kill the user's local session, set forceAuth flag
      Session.clear();
    },

    context: function () {
      var fatalError = '';
      var email = this.relier.get('email');
      if (! email) {
        fatalError = t('/force_auth requires an email');
      }

      return {
        email: email,
        avatar: this._getAvatar(),
        password: this._prefillPassword,
        fatalError: fatalError
      };
    },

    events: {
      'click a[href="/confirm_reset_password"]': BaseView.cancelEventThen('resetPasswordNow'),
      // Backbone does not add SignInView's events, so this must be duplicated.
      'change .show-password': 'onPasswordVisibilityChange'
    },

    beforeDestroy: function () {
      Session.set('prefillPassword', this.$('.password').val());
    },

    submit: function () {
      var email = this.relier.get('email');
      var password = this.$('.password').val();

      return this._signIn(email, {
        password: password
      });
    },

    resetPasswordNow: function () {
      var self = this;
      return p().then(function () {
        // If the user is already making a request, ban submission.
        if (self.isSubmitting()) {
          throw new Error('submit already in progress');
        }

        var email = self.relier.get('email');
        self._isSubmitting = true;
        return self.fxaClient.passwordReset(email, self.relier)
                .then(function () {
                  self._isSubmitting = false;
                  self.navigate('confirm_reset_password');
                }, function (err) {
                  self._isSubmitting = false;
                  self.displayError(err);
                });
      });
    },

    /**
     * Return user's "Session.avatar" if the session email is the same as the force email.
     */

    afterVisible: function () {
      var email = this.relier.get('email');

      FormView.prototype.afterVisible.call(this);

      // Only display the profile image if it's for the same account as the
      // forced email
      if (email === Session.email) {
        return this._displayProfileImage();
      }
    }
  });

  return View;
});
