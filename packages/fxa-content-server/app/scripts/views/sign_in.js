/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'views/form',
  'stache!templates/sign_in',
  'lib/session',
  'lib/fxa-client',
  'lib/password-mixin',
  'lib/url',
  'lib/auth-errors'
],
function (_, BaseView, FormView, SignInTemplate, Session, FxaClient, PasswordMixin, Url, AuthErrors) {
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
        error = '/force_auth requres an email';
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
      'change .show-password': 'onPasswordVisibilityChange'
    },

    submit: function () {
      var email = Session.forceAuth ? Session.forceEmail : this.$('.email').val();
      var password = this.$('.password').val();

      var client = new FxaClient();
      var self = this;
      client.signIn(email, password)
            .then(function (accountData) {
              if (accountData.verified) {
                self.navigate('settings');
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
              }

              this.displayError(err);
            }, this));
    }
  });

  _.extend(View.prototype, PasswordMixin);

  return View;
});

