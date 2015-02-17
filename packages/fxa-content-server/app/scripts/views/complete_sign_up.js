/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'views/base',
  'stache!templates/complete_sign_up',
  'lib/auth-errors',
  'lib/validate',
  'lib/promise',
  'views/mixins/resend-mixin'
],
function (_, FormView, BaseView, CompleteSignUpTemplate, AuthErrors, Validate, p, ResendMixin) {
  var t = BaseView.t;

  var CompleteSignUpView = FormView.extend({
    template: CompleteSignUpTemplate,
    className: 'complete_sign_up',

    events: {
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #resend': BaseView.preventDefaultThen('validateAndSubmit')
    },

    initialize: function (options) {
      options = options || {};

      try {
        this.importSearchParam('uid');
        this.importSearchParam('code');

        // Remove any spaces that are probably due to a MUA adding
        // line breaks in the middle of the link.
        this._uid = this.uid.replace(/ /g, '');
        this._code = this.code.replace(/ /g, '');
      } catch (e) {
        this._isLinkDamaged = true;
      }

      this._account = options.account || this.user.getAccountByUid(this._uid);

      // cache the email in case we need to attempt to resend the
      // verification link
      this._email = this._account.get('email');
    },

    getAccount: function () {
      return this._account;
    },

    beforeRender: function () {
      if (! this._doesLinkValidate()) {
        // One or more parameters fails validation. Abort and show an
        // error message before doing any more checks.
        this.logEvent('complete_sign_up.link_damaged');
        return true;
      }

      var self = this;
      return self.fxaClient.verifyCode(self._uid, self._code)
          .then(function () {
            self.logEvent('complete_sign_up.verification.success');
            return self.broker.afterCompleteSignUp(self.getAccount());
          })
          .then(function (result) {
            if (result && result.halt) {
              return false;
            }

            if (! self.relier.isDirectAccess()) {
              self.navigate('signup_complete');
              return false;
            }

            return self.getAccount().isSignedIn()
              .then(function (isSignedIn) {
                if (isSignedIn) {
                  self.navigate('settings', {
                    success: t('Account verified successfully')
                  });
                } else {
                  self.navigate('signup_complete');
                }
                return false;
              });
          })
          .then(null, function (err) {
            if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
              self._isLinkExpired = true;
              self.logEvent('complete_sign_up.link_expired');
            } else if (AuthErrors.is(err, 'INVALID_VERIFICATION_CODE') ||
                AuthErrors.is(err, 'INVALID_PARAMETER')) {
              // These errors show a link damaged screen
              self._isLinkDamaged = true;
              self.logEvent('complete_sign_up.link_damaged');
            } else {
              // all other errors show the standard error box.
              self._error = self.translateError(err);
            }
            return true;
          });
    },

    _doesLinkValidate: function () {
      return Validate.isUidValid(this._uid) &&
             Validate.isCodeValid(this._code) &&
             ! this._isLinkDamaged;
    },

    context: function () {
      var doesLinkValidate = this._doesLinkValidate();
      var isLinkExpired = this._isLinkExpired;

      return {
        // If the link is invalid, print a special error message.
        isLinkDamaged: ! doesLinkValidate,
        isLinkExpired: isLinkExpired,

        // This is only the case if you've signed up in the
        // same browser you opened the verification link in.
        canResend: this._canResend(),
        error: this._error
      };
    },

    _canResend: function () {
      return !! this._getResendSessionToken();
    },

    // This returns the latest sessionToken associated with the user's email
    // address. We intentionally don't cache it during view initialization so that
    // we can capture sessionTokens from accounts created (in this browser)
    // since the view was loaded.
    _getResendSessionToken: function () {
      return this.user.getAccountByEmail(this._email).get('sessionToken');
    },

    // This is called when a user follows an expired verification link
    // and clicks the "Resend" link.
    submit: function () {
      var self = this;

      self.logEvent('complete_sign_up.resend');

      return self.fxaClient.signUpResend(self.relier, self._getResendSessionToken())
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

  _.extend(CompleteSignUpView.prototype, ResendMixin);

  return CompleteSignUpView;
});
