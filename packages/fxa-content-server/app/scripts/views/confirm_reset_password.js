/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var ConfirmView = require('views/confirm');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var ResendMixin = require('views/mixins/resend-mixin');
  var ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  var ServiceMixin = require('views/mixins/service-mixin');
  var Session = require('lib/session');
  var Template = require('stache!templates/confirm_reset_password');

  var t = BaseView.t;

  var View = ConfirmView.extend({
    template: Template,
    className: 'confirm-reset-password',

    initialize: function (options) {
      options = options || {};
      this._verificationPollMS = options.verificationPollMS ||
              this.VERIFICATION_POLL_IN_MS;

      var data = this.ephemeralData();
      this._email = data.email;
      this._passwordForgotToken = data.passwordForgotToken;
    },

    events: {
      'click #resend': BaseView.preventDefaultThen('validateAndSubmit')
    },

    context: function () {
      return {
        email: this._email,
        encodedEmail: encodeURIComponent(this._email),
        forceAuth: this.broker.isForceAuth()
      };
    },

    beforeRender: function () {
      // user cannot confirm if they have not initiated a reset password
      if (! this._passwordForgotToken) {
        this.navigate('reset_password');
        return false;
      }
    },

    afterVisible: function () {
      var self = this;

      return self.broker.persistVerificationData(this.user.initAccount({ email: this._email }))
        .then(function () {
          return self._waitForConfirmation()
            .then(function (sessionInfo) {
              self.logViewEvent('verification.success');
              // The original window should finish the flow if the user
              // completes verification in the same browser and has sessionInfo
              // passed over from tab 2.
              if (sessionInfo) {
                return self._finishPasswordResetSameBrowser(sessionInfo);
              }

              return self._finishPasswordResetDifferentBrowser();
            })
            .fail(self.displayError.bind(self));
        });
    },

    _waitForConfirmation: function () {
      var self = this;
      var confirmationDeferred = self._confirmationDeferred = p.defer();
      var confirmationPromise = self._confirmationPromise = confirmationDeferred.promise;

      // If either the `login` message comes through or the `login` message
      // timeout elapses after the server confirms the user is verified,
      // stop waiting all together and move to the next view.
      function onComplete(response) {
        self._stopWaiting();
        self._confirmationDeferred.resolve(response);
      }

      function onError(err) {
        self._stopWaiting();
        self._confirmationDeferred.reject(err);
      }

      /**
       * A short message on password reset verification:
       *
       * If the user initiates a password reset from about:accounts,
       * about:accounts listens for a `login` message from FxA within the
       * about:accounts tab and ignores messages from other tabs (including the
       * verification tab). This is unfortunate, because for password reset,
       * the sessionToken, kA and kB are generated in the verification tab.
       * To sign the user in and send the `login` message, all the users data
       * needs to be sent from the verification tab to this tab so we can send
       * it off to the browser.
       *
       * We hope the user verifies in this browser, but we are not assured of
       * that. The only way we know if the user verified in this browser is if
       * a `login` message is received.
       *
       * When the user attempts a password reset, we have no idea whether the
       * user is going to verify in the same browser. The only way we know if
       * the user verified in this browser is if a `login` message is received
       * from the inter-tab channel.
       *
       * Because we have no idea if the user will verify in this browser,
       * assume they will not. Start polling the server to see if the user has
       * verified. If the server eventually reports the user has successfully
       * reset their password, assume the user has completed in a different
       * browser. In this case the best we can do is ask the user to sign in
       * again. Once the user has entered their updated creds, we can then
       * notify the browser.
       *
       * If a `complete_reset_password_tab_open` message is received, hooray,
       * the user has opened the password reset link in this browser. At this
       * point we can assume the user will complete verification in this
       * browser. It's not 100% certain the user will complete, but most
       * likely. Stop polling the server. The server poll is no longer needed,
       * and in fact makes things more complex. Instead, wait for the `login`
       * message that will arrive once the user finishes the password reset.
       *
       * Once the `login` message has arrived, notify the browser. BOOM.
       */
      this.notifier.on(Notifier.COMPLETE_RESET_PASSWORD_TAB_OPEN, function () {
        if (! self._isWaitingForLoginMessage) {
          self._waitForLoginMessage().then(onComplete, onError);
          self._stopWaitingForServerConfirmation();
        }
      });

      self._waitForServerConfirmation().then(onComplete, onError);

      return confirmationPromise;
    },

    _finishPasswordResetSameBrowser: function (sessionInfo) {
      var self = this;
      var account = self.user.initAccount(sessionInfo);

      // The OAuth flow needs the sessionToken to finish the flow.
      return self.user.setSignedInAccount(account)
        .then(function () {
          self.displaySuccess(t('Password reset'));

          return self.invokeBrokerMethod(
                  'afterResetPasswordConfirmationPoll', account);
        })
        .then(function () {
          if (self.relier.isDirectAccess()) {
            // user is most definitely signed in since sessionInfo
            // was passed in. Just ship direct access users to /settings
            self.navigate('settings', {
              success: t('Account verified successfully')
            });
          } else {
            self.navigate('reset_password_complete');
          }
        });
    },

    _getSignInRoute: function () {
      return this.broker.transformLink('/signin').replace(/^\//, '');
    },

    _finishPasswordResetDifferentBrowser: function () {
      var self = this;
      // user verified in a different browser, make them sign in. OAuth
      // users will be redirected back to the RP, Sync users will be
      // taken to the Sync controlled completion page.
      Session.clear();
      self.navigate(self._getSignInRoute(), {
        success: t('Password reset successfully. Sign in to continue.')
      });
    },

    _isWaitingForServerConfirmation: false,
    _waitForServerConfirmation: function () {
      var self = this;
      // only check if still waiting.
      this._isWaitingForServerConfirmation = true;
      return self.fxaClient.isPasswordResetComplete(self._passwordForgotToken)
        .then(function (isComplete) {
          if (! self._isWaitingForServerConfirmation) {
            // we no longer care about the response, the other tab has opened.
            // drop the response on the ground and never resolve.
            return p.defer().promise;
          } else if (isComplete) {
            return null;
          }

          var deferred = p.defer();
          self._waitForServerConfirmationTimeout = self.setTimeout(function () {
            if (self._isWaitingForServerConfirmation) {
              deferred.resolve(self._waitForServerConfirmation());
            }
          }, self._verificationPollMS);

          return deferred.promise;
        });
    },

    _stopWaitingForServerConfirmation: function () {
      if (this._waitForServerConfirmationTimeout) {
        this.clearTimeout(this._waitForServerConfirmationTimeout);
      }
      this._isWaitingForServerConfirmation = false;
    },

    _isWaitingForLoginMessage: false,
    _waitForLoginMessage: function () {
      var deferred = p.defer();

      this._isWaitingForLoginMessage = true;
      this.notifier.on(
          Notifier.SIGNED_IN, deferred.resolve.bind(deferred));

      return deferred.promise;
    },

    _stopListeningForInterTabMessages: function () {
      this._isWaitingForLoginMessage = false;
      this.notifier.off();
      // Sensitive data is passed between tabs using localStorage.
      // Delete the data from storage as soon as possible.
      this.notifier.clear();
    },

    _stopWaiting: function () {
      this._stopWaitingForServerConfirmation();
      this._stopListeningForInterTabMessages();
    },

    submit: function () {
      var self = this;
      self.logViewEvent('resend');

      return self.fxaClient.passwordResetResend(
        self._email,
        self._passwordForgotToken,
        self.relier,
        {
          resume: self.getStringifiedResumeToken()
        }
      )
      .then(function () {
        self.displaySuccess();
      })
      .fail(function (err) {
        if (AuthErrors.is(err, 'INVALID_TOKEN')) {
          return self.navigate('reset_password', {
            error: err
          });
        }

        // unexpected error, rethrow for display.
        throw err;
      });
    },

    // The ResendMixin overrides beforeSubmit. Unless set to undefined,
    // Cocktail runs both the original version and the overridden version.
    beforeSubmit: undefined
  });

  Cocktail.mixin(
    View,
    ResendMixin,
    ResumeTokenMixin,
    ServiceMixin
  );

  module.exports = View;
});
