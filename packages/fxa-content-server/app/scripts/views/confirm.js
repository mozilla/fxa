/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'cocktail',
  'views/form',
  'views/base',
  'stache!templates/confirm',
  'lib/promise',
  'lib/auth-errors',
  'lib/constants',
  'views/mixins/experiment-mixin',
  'views/mixins/resend-mixin',
  'views/mixins/resume-token-mixin',
  'views/mixins/service-mixin'
],
function (Cocktail, FormView, BaseView, Template, p, AuthErrors, Constants,
  ExperimentMixin, ResendMixin, ResumeTokenMixin, ServiceMixin) {
  'use strict';

  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'confirm',

    // used by unit tests
    VERIFICATION_POLL_IN_MS: Constants.VERIFICATION_POLL_IN_MS,

    initialize: function () {
      // Account data is passed in from sign up and sign in flows.
      // It's important for Sync flows where account data holds
      // ephemeral properties like unwrapBKey and keyFetchToken
      // that need to be sent to the browser.
      var data = this.ephemeralData();
      this._account = data && this.user.initAccount(data.account);
    },

    getAccount: function () {
      return this._account;
    },

    context: function () {
      if (this.isInExperiment('openGmail')) {
        this.experimentTrigger('openGmail.triggered');
      }

      var email = this.getAccount().get('email');

      return {
        email: email,
        safeEmail: encodeURIComponent(email),
        isOpenGmailButtonVisible: this._isOpenGmailButtonVisible()
      };
    },

    _isOpenGmailButtonVisible: function () {
      return this.isInExperimentGroup('openGmail', 'treatment');
    },

    events: {
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #resend': BaseView.preventDefaultThen('validateAndSubmit'),
      'click #open-gmail': '_gmailTabOpened'
    },

    _bouncedEmailSignup: function () {
      this.ephemeralMessages.set('bouncedEmail', this.getAccount().get('email'));
      this.navigate('signup');
    },

    _gmailTabOpened: function () {
      this.experimentTrigger('openGmail.clicked');
    },

    beforeRender: function () {
      // user cannot confirm if they have not initiated a sign up.
      if (! this.getAccount().get('sessionToken')) {
        this.navigate('signup');
        return false;
      }
    },

    afterRender: function () {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');

      var self = this;
      return self.broker.persist()
        .then(function () {
          return self.broker.beforeSignUpConfirmationPoll(self.getAccount());
        })
        .then(function (result) {
          if (result && result.halt) {
            return;
          }

          self._waitForConfirmation()
            .then(function () {
              self.logScreenEvent('verification.success');
              return self.broker.afterSignUpConfirmationPoll(self.getAccount());
            })
            .then(function (result) {
              if (! (result && result.halt)) {
                // the user is definitely authenticated here.
                if (self.relier.isDirectAccess()) {
                  self.navigate('settings', {
                    success: t('Account verified successfully')
                  });
                } else {
                  self.navigate('signup_complete');
                }
              }
            }, function (err) {
              // The user's email may have bounced because it was invalid.
              // Redirect them to the sign up page with an error notice.
              if (AuthErrors.is(err, 'SIGNUP_EMAIL_BOUNCE')) {
                self._bouncedEmailSignup();
              } else {
                self.displayError(err);
              }
            });
        });
    },

    _waitForConfirmation: function () {
      var self = this;
      var account = self.getAccount();
      return self.fxaClient.recoveryEmailStatus(
          account.get('sessionToken'), account.get('uid'))
        .then(function (result) {
          if (result.verified) {
            account.set('verified', true);
            self.user.setAccount(account);
            return true;
          }

          var deferred = p.defer();

          // _waitForConfirmation will return a promise and the
          // promise chain remains unbroken.
          self.setTimeout(function () {
            deferred.resolve(self._waitForConfirmation());
          }, self.VERIFICATION_POLL_IN_MS);

          return deferred.promise;
        });
    },

    submit: function () {
      var self = this;

      self.logScreenEvent('resend');
      return self.fxaClient.signUpResend(
        self.relier,
        self.getAccount().get('sessionToken'),
        {
          resume: self.getStringifiedResumeToken()
        }
      )
      .then(function () {
        self.displaySuccess();
      })
      .fail(function (err) {
        if (AuthErrors.is(err, 'INVALID_TOKEN')) {
          return self.navigate('signup', {
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
    ExperimentMixin,
    ResendMixin,
    ResumeTokenMixin,
    ServiceMixin
  );

  return View;
});
