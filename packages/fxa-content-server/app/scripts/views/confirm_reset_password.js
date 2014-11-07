/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'jquery',
  'views/confirm',
  'views/base',
  'stache!templates/confirm_reset_password',
  'lib/promise',
  'lib/session',
  'lib/constants',
  'lib/auth-errors',
  'views/mixins/resend-mixin',
  'views/mixins/service-mixin'
],
function (_, $, ConfirmView, BaseView, Template, p, Session, Constants,
      AuthErrors, ResendMixin, ServiceMixin) {
  var t = BaseView.t;

  var SESSION_UPDATE_TIMEOUT_MS = 10000;

  var View = ConfirmView.extend({
    template: Template,
    className: 'confirm-reset-password',

    initialize: function (options) {
      options = options || {};
      this._interTabChannel = options.interTabChannel;
      this._sessionUpdateTimeoutMS = options.sessionUpdateTimeoutMS ||
              SESSION_UPDATE_TIMEOUT_MS;

      var data = this.ephemeralData();
      this._email = data.email;
      this._passwordForgotToken = data.passwordForgotToken;
    },

    events: {
      'click #resend': BaseView.preventDefaultThen('validateAndSubmit'),
      'click a[href="/signin"]': 'savePrefillEmailForSignin',
      'click a[href="/oauth/signin"]': 'savePrefillEmailForSignin'
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

    _getSignInRoute: function () {
      if (this.relier.isOAuth()) {
        return 'oauth/signin';
      }
      return 'signin';
    },

    afterRender: function () {
      var bounceGraphic = this.$el.find('.graphic');
      bounceGraphic.addClass('pulse');
      var self = this;

      if (self.relier.isOAuth()) {
        this.setupOAuthLinks();
      }

      // this sequence is a bit tricky and needs to be explained.
      //
      // For OAuth and Sync, we are trying to make it so users who complete
      // the password reset flow in another tab of the same browser are
      // able to finish signing in if the original tab is still open.
      // After requesting the password reset, the original tab sits and polls
      // the server querying whether the password reset is complete.
      //
      // This crypto stuff needs to occur in the original tab because OAuth
      // reliers and sync may only have the appropriate state in the original
      // tab. This means, for password reset, we have to ship information like
      // the unwrapBKey and keyFetchToken from tab 2 to tab 1. We have a plan,
      // albeit a complex one.
      //
      // In tab 2, two auth server calls are made after the user
      // fills out the new passwords and submits the form:
      //
      // 1. /account/reset
      // 2. /account/login
      //
      // The first call resets the password, the second signs the user in
      // so that Sync/OAuth key/code generation can occur.
      //
      // tab 1 will be notified that the password reset is complete
      // after step 1. The problem is, tab 1 can only do its crypto
      // business after step 2 and after the information has been shipped from
      // tab 2 to tab 1.
      //
      // To communicate between tabs, a special channel is set up that makes
      // use of localStorage as the comms medium. When tab 1 starts its poll,
      // it also starts listening for messages on localStorage. This is in
      // case the tab 2 finishes both #1 and #2 before the poll completes.
      // If a message is received by time the poll completes, take the
      // information from the message and sign the user in.
      //
      // If a message has not been received by time the poll completes,
      // assume we are either in a second browser or in between steps #1 and
      // #2. Start a timeout in case the user verifies in a second browser
      // and the message is never received. If the timeout is reached,
      // force a manual signin of the user.
      //
      // If a message is received before the timeout hits, HOORAY!
      return self.broker.persist()
        .then(function () {
          self._waitForConfirmation()
            .then(function (sessionInfo) {
              self.logScreenEvent('verification.success');
              // The original window should finish the flow if the user
              // completes verification in the same browser and has sessionInfo
              // passed over from tab 2.
              if (sessionInfo) {
                return self._finishPasswordResetSameBrowser(sessionInfo);
              }

              return self._finishPasswordResetDifferentBrowser();
            })
            .then(null, function (err) {
              self.displayError(err);
            });
        });
    },

    _waitForConfirmation: function () {
      var self = this;
      return p.all([
        self._waitForSessionUpdate(),
        self._waitForServerConfirmationNotice()
          .then(function () {
            if (! self._isWaitForSessionUpdateComplete) {
              self._startSessionUpdateWaitTimeout();
            }
          })
      ]).spread(function (sessionInfo) {
        return sessionInfo;
      });
    },

    _finishPasswordResetSameBrowser: function (sessionInfo) {
      var self = this;

      // The OAuth flow needs the sessionToken to finish the flow.
      return self.user.setCurrentAccount(sessionInfo)
        .then(function () {
          self.displaySuccess(t('Password reset'));

          return self.broker.afterResetPasswordConfirmationPoll()
            .then(function (result) {
              if (! (result && result.halt)) {
                self.navigate('reset_password_complete');
              }
            });
        });
    },

    _finishPasswordResetDifferentBrowser: function () {
      var self = this;
      // user verified in a different browser, make them sign in. OAuth
      // users will be redirected back to the RP, Sync users will be
      // taken to the Sync controlled completion page.
      Session.clear();
      Session.set('prefillEmail', self._email);
      self.navigate(self._getSignInRoute(), {
        success: t('Password reset. Sign in to continue.')
      });
    },

    _waitForServerConfirmationNotice: function () {
      var self = this;
      return self.fxaClient.isPasswordResetComplete(self._passwordForgotToken)
        .then(function (isComplete) {
          if (isComplete) {
            return true;
          }

          var deferred = p.defer();

          self.setTimeout(function () {
            // _waitForServerConfirmationNotice will return a promise and the
            // promise chain remains unbroken.
            deferred.resolve(self._waitForServerConfirmationNotice());
          }, self.VERIFICATION_POLL_IN_MS);

          return deferred.promise;
        });
    },

    _waitForSessionUpdate: function () {
      var deferred = p.defer();
      var self = this;
      self._deferred = deferred;

      self._sessionUpdateNotificationHandler = _.bind(self._sessionUpdateWaitComplete, self);
      self._interTabChannel.on('login', self._sessionUpdateNotificationHandler);

      return deferred.promise;
    },

    _startSessionUpdateWaitTimeout: function () {
      var self = this;
      self._sessionUpdateWaitTimeoutHandler =
            _.bind(self._sessionUpdateWaitComplete, self, null);
      self._sessionUpdateWaitTimeout =
            self.setTimeout(self._sessionUpdateWaitTimeoutHandler,
                self._sessionUpdateTimeoutMS);
    },

    _sessionUpdateWaitComplete: function (event) {
      var self = this;
      var data = event && event.data;

      self._isWaitForSessionUpdateComplete = true;

      self.clearTimeout(self._sessionUpdateWaitTimeout);
      self._interTabChannel.off('login', self._sessionUpdateNotificationHandler);
      // Sensitive data is passed between tabs using localStorage.
      // Delete the data from storage as soon as possible.
      self._interTabChannel.clearMessages();
      self._deferred.resolve(data);
    },

    submit: function () {
      var self = this;
      self.logScreenEvent('resend');

      return self.fxaClient.passwordResetResend(self._email,
                      self._passwordForgotToken, self.relier)
        .then(function () {
          self.displaySuccess();
        }, function (err) {
          if (AuthErrors.is(err, 'INVALID_TOKEN')) {
            return self.navigate('reset_password', {
              error: err
            });
          }

          // unexpected error, rethrow for display.
          throw err;
        });
    },

    savePrefillEmailForSignin: function () {
      Session.set('prefillEmail', this._email);
    }
  });

  _.extend(View.prototype, ResendMixin, ServiceMixin);

  return View;
});
