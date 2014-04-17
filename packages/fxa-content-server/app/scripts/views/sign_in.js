/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'p-promise',
  'views/base',
  'views/form',
  'stache!templates/sign_in',
  'lib/constants',
  'lib/session',
  'lib/password-mixin',
  'lib/url',
  'lib/auth-errors',
  'lib/oauth-client',
  'lib/assertion'
],
function (_, p, BaseView, FormView, SignInTemplate, Constants, Session, PasswordMixin, Url, AuthErrors, OAuthClient, assertion) {
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

      // Extract oAuth search params
      // QUESTION: Should we extract the oauth logic out into another view (subclass)?
      this.isOAuth = options.isOAuth;
      if (this.isOAuth) {
        this.oAuthClientID = Url.searchParam('client_id', this.window.location.search);
        this.oAuthScope = Url.searchParam('scope', this.window.location.search);
        this.oAuthState = Url.searchParam('state', this.window.location.search);
        this.oAuthRedirectUri = Url.searchParam('redirect_uri', this.window.location.search);

        this.oAuthClient = new OAuthClient();

        this.oAuthClient.getClientInfo(this.oAuthClientID).then(_.bind(function(result) {
          // QUESTION: Is it safe to store these in the Session?
          this.service = result.name;
          // QUESTION: Do we store the friendly name separately or just rely on a mapping with
          // fallback?
          this.serviceName = result.name;

          this.render();
        }, this))
        .fail(function(xhr) {
          // QUESTION: What should we do when getting client info fails?
          console.error('oauthClient.getClientInfo FAILED', xhr);
        });
      } else {
        this.service = Session.service;
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
        isSync: this.service === 'sync',
        service: this.service,
        serviceName: this.serviceName
      };
    },

    events: {
      'change .show-password': 'onPasswordVisibilityChange',
      'click a[href="/confirm_reset_password"]': 'resetPasswordNow'
    },

    submit: function () {
      var email = Session.forceAuth ? Session.forceEmail : this.$('.email').val();
      var password = this.$('.password').val();

      var self = this;

      return this.fxaClient.signIn(email, password)
        .then(function (accountData) {
          if (accountData.verified) {
            // If this is oauth then create an assertion and pass it along to the oauth server
            if (self.isOAuth) {
              assertion(Session.config.oauthUrl).then(function(ass) {
                /* jshint camelcase: false */
                self.oAuthClient.getCode({
                  assertion: ass,
                  client_id: self.oAuthClientID,
                  scope: self.oAuthScope,
                  state: self.oAuthState,
                  redirect_uri: self.oAuthRedirectUri
                }).then(function(result) {
                  // Redirect to the returned URL
                  window.location = result.redirect;
                }).fail(function(error) {
                  // QUESTION: What should we do when getting a code fails?
                  console.error('oAuthClient.getCode FAIL', error);
                });
              }).fail(function(error) {
                // QUESTION: What should we do when creating an assertion fails?
                console.error('assertion FAIL', error);
              });

            // Don't switch to settings if we're trying to log in to
            // Firefox. Firefox will show its own landing page
            } else if (Session.get('context') !== Constants.FX_DESKTOP_CONTEXT) {
              self.navigate('settings');
            } else {
              // This is the desktop context so don't do anything
            }
          } else {
            return self.fxaClient.signUpResend()
              .then(function () {
                self.navigate('confirm');
              });
          }
        })
        .then(null, _.bind(function (err) {
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
          // re-throw error, it will be handled at a lower level.
          throw err;
        }, this));
    },

    resetPasswordNow: function (event) {
      var self = this;
      return p().then(function () {
        if (event) {
          // prevent the default anchor handler (router.js->watchAnchors)
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
    }
  });

  _.extend(View.prototype, PasswordMixin);

  return View;
});
