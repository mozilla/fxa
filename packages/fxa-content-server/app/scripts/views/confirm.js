/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'views/base',
  'stache!templates/confirm',
  'lib/promise',
  'lib/auth-errors',
  'views/mixins/resend-mixin',
  'views/mixins/service-mixin'
],
function (_, FormView, BaseView, Template, p, AuthErrors,
    ResendMixin, ServiceMixin) {
  var VERIFICATION_POLL_IN_MS = 4000; // 4 seconds

  var View = FormView.extend({
    template: Template,
    className: 'confirm',

    // used by unit tests
    VERIFICATION_POLL_IN_MS: VERIFICATION_POLL_IN_MS,

    initialize: function () {
      // Account data is passed in from sign up and sign in flows.
      // It's important for Sync flows where account data holds
      // ephemeral properties like unwrapBKey and keyFetchToken
      // that need to be sent to the browser.
      var data = this.ephemeralData();
      this._accountData = data && data.accountData;
    },

    context: function () {
      return {
        email: this.currentAccount().get('email')
      };
    },

    events: {
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #resend': BaseView.preventDefaultThen('validateAndSubmit'),
      'click a[href="/signup"]': 'bouncedEmailSignup'
    },

    bouncedEmailSignup: function () {
      // TODO add `bouncedEmail` to the User model when ready.
      this.ephemeralMessages.set('bouncedEmail', this.currentAccount().get('email'));
    },

    beforeRender: function () {
      // user cannot confirm if they have not initiated a sign up.
      if (! this.currentAccount().get('sessionToken')) {
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
          return self.broker.beforeSignUpConfirmationPoll();
        })
        .then(function () {
          self._waitForConfirmation()
            .then(function () {
              self.logScreenEvent('verification.success');
              return self.broker.afterSignUpConfirmationPoll(self._accountData);
            })
            .then(function (result) {
              if (! (result && result.halt)) {
                self.navigate('signup_complete');
              }
            }, function (err) {
              // The user's email may have bounced because it was invalid.
              // Show a message allowing the user to sign up again.
              if (AuthErrors.is(err, 'SIGNUP_EMAIL_BOUNCE')) {
                // the email bounce error message contains a link.
                self.displayErrorUnsafe(err);
              } else {
                self.displayError(err);
              }
            });
        });
    },

    _waitForConfirmation: function () {
      var self = this;
      var account = self.currentAccount();
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
      return self.fxaClient.signUpResend(self.relier,
          self.currentAccount().get('sessionToken'))
        .then(function () {
          self.displaySuccess();
        }, function (err) {
          if (AuthErrors.is(err, 'INVALID_TOKEN')) {
            return self.navigate('signup', {
              error: err
            });
          }

          // unexpected error, rethrow for display.
          throw err;
        });
    }
  });

  _.extend(View.prototype, ResendMixin, ServiceMixin);

  return View;
});
