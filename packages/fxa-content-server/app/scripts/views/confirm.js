/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'views/base',
  'stache!templates/confirm',
  'lib/session',
  'lib/promise',
  'lib/auth-errors',
  'views/mixins/resend-mixin',
  'views/mixins/service-mixin'
],
function (_, FormView, BaseView, Template, Session, p, AuthErrors, ResendMixin,
    ServiceMixin) {
  var VERIFICATION_POLL_IN_MS = 4000; // 4 seconds

  var View = FormView.extend({
    template: Template,
    className: 'confirm',

    // used by unit tests
    VERIFICATION_POLL_IN_MS: VERIFICATION_POLL_IN_MS,

    context: function () {
      return {
        email: Session.email
      };
    },

    events: {
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #resend': BaseView.preventDefaultThen('validateAndSubmit')
    },

    beforeRender: function () {
      // user cannot confirm if they have not initiated a sign up.
      if (! Session.sessionToken) {
        this.navigate('signup');
        return false;
      } else if (this.relier.isOAuth()) {
        this.setupOAuth();
      }
    },

    afterRender: function () {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');

      var self = this;
      self._waitForVerification()
        .then(function () {
          // The original window should always finish the OAuth flow.
          if (self.relier.isOAuth()) {
            self.finishOAuthFlow({
              source: 'signup'
            });
          } else {
            self.navigate('signup_complete');
          }
        }, function (err) {
          self.displayError(err);
        });
    },

    _waitForVerification: function () {
      var self = this;
      return self.fxaClient.recoveryEmailStatus(Session.sessionToken)
        .then(function (result) {
          if (result.verified) {
            return true;
          }

          var deferred = p.defer();

          // _waitForVerification will return a promise and the
          // promise chain remains unbroken.
          self.setTimeout(function () {
            deferred.resolve(self._waitForVerification());
          }, self.VERIFICATION_POLL_IN_MS);

          return deferred.promise;
        });
    },

    submit: function () {
      var self = this;

      self.logEvent('confirm.resend');
      return self.fxaClient.signUpResend(self.relier)
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
