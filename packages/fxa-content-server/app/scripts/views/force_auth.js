/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'p-promise',
  'views/base',
  'views/sign_in',
  'stache!templates/force_auth',
  'lib/session',
  'lib/url'
],
function (p, BaseView, SignInView, Template, Session, Url) {
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
      Session.set('forceAuth', true);

      var email = Url.searchParam('email', this.window.location.search);
      if (email) {
        // email indicates the signed in email. Use forceEmail to avoid
        // collisions across sessions.
        Session.set('forceEmail', email);
      }
    },

    context: function () {
      var fatalError = '';
      if (! Session.forceEmail) {
        fatalError = t('/force_auth requires an email');
      }

      return {
        email: Session.forceEmail,
        password: this._prefillPassword,
        forceAuth: Session.forceAuth,
        fatalError: fatalError
      };
    },

    events: {
      'click a[href="/confirm_reset_password"]': 'resetPasswordNow',
      // Backbone does not add SignInView's events, so this must be duplicated.
      'change .show-password': 'onPasswordVisibilityChange'
    },

    beforeDestroy: function () {
      Session.set('prefillPassword', this.$('.password').val());
    },

    submit: function () {
      var email = Session.forceEmail;
      var password = this.$('.password').val();

      return this._signIn(email, password);
    },

    resetPasswordNow: BaseView.cancelEventThen(function () {
      var self = this;
      return p().then(function () {
        // If the user is already making a request, ban submission.
        if (self.isSubmitting()) {
          throw new Error('submit already in progress');
        }

        var email = Session.forceEmail;
        self._isSubmitting = true;
        return self.fxaClient.passwordReset(email)
                .then(function () {
                  self._isSubmitting = false;
                  self.navigate('confirm_reset_password');
                }, function (err) {
                  self._isSubmitting = false;
                  self.displayError(err);
                });
      });
    })
  });

  return View;
});
