/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'views/form',
  'stache!templates/sign_in',
  'lib/constants',
  'lib/session',
  'lib/fxa-client',
  'lib/password-mixin',
  'lib/url',
  'lib/auth-errors'
],
function (_, BaseView, FormView, SignInTemplate, Constants, Session, FxaClient, PasswordMixin, Url, AuthErrors) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: SignInTemplate,
    className: 'sign-in',

    initialize: function (options) {
      options = options || {};

      // reset any force auth status.
      Session.set('forceAuth', false);

      if (options.forceAuth) {
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
      }
    },

    context: function () {
      var error = '';
      if (Session.forceAuth && !Session.forceEmail) {
        error = t('/force_auth requires an email');
      }

      var email = (Session.forceAuth && Session.forceEmail) ||
                   Session.prefillEmail;

      return {
        email: email,
        forceAuth: Session.forceAuth,
        error: error,
        isSync: Session.service === 'sync'
      };
    },

    events: {
      'change .show-password': 'onPasswordVisibilityChange',
      'click a[href="/confirm_reset_password"]': 'resetPasswordNow'
    },

    submit: function () {
      var email = Session.forceAuth ? Session.forceEmail : this.$('.email').val();
      var password = this.$('.password').val();

      var client = new FxaClient();
      var self = this;
      client.signIn(email, password)
            .then(function (accountData) {
              if (accountData.verified) {
                // Don't switch to settings if we're trying to log in to
                // Firefox. Firefox will show its own landing page
                if (Session.get('context') !== Constants.FX_DESKTOP_CONTEXT) {
                  self.navigate('settings');
                }
              } else {
                return client.signUpResend()
                  .then(function () {
                    self.navigate('confirm');
                  });
              }
            })
            .done(null, _.bind(function (err) {
              if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
                // email indicates the signed in email. Use prefillEmail
                // to avoid collisions across sessions.
                Session.set('prefillEmail', email);
                var msg = t('Unknown account. <a href="/signup">Sign up</a>');
                return self.displayErrorUnsafe(msg);
              } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
                // if user canceled login, just stop
                return;
              }
              this.displayError(err);
            }, this));
    },

    resetPasswordNow: function (event) {
      if (event) {
        // prevent the default anchor hanlder (router.js->watchAnchors)
        // from sending the user to the confirm_reset_password page.
        // The redirection for this action is taken care of after
        // the request is submitted.
        event.preventDefault();
        event.stopPropagation();
      }

      // Only force auth has the ability to submit a password reset
      // request from here. See issue #549
      if (! Session.forceAuth) {
        console.error('resetPasswordNow can only be called from /force_auth');
        return;
      }

      var email = Session.forceEmail;
      var client = new FxaClient();
      var self = this;
      client.passwordReset(email)
              .then(function () {
                self.navigate('confirm_reset_password');
              }, function (err) {
                self.displayError(err);
              });
    }
  });

  _.extend(View.prototype, PasswordMixin);

  return View;
});
