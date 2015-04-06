/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'cocktail',
  'underscore',
  'lib/promise',
  'views/base',
  'views/form',
  'stache!templates/sign_up',
  'lib/session',
  'lib/auth-errors',
  'lib/strings',
  'lib/mailcheck',
  'views/mixins/password-mixin',
  'views/mixins/service-mixin',
  'views/coppa/coppa-date-picker'
],
function (Cocktail, _, p, BaseView, FormView, Template, Session, AuthErrors,
      Strings, mailcheck, PasswordMixin, ServiceMixin, CoppaDatePicker) {
  var t = BaseView.t;

  function selectAutoFocusEl(bouncedEmail, email, password) {
    if (bouncedEmail) {
      return 'email';
    } else if (! email) {
      return 'email';
    } else if (! password) {
      return 'password';
    }
    return null;
  }

  var View = FormView.extend({
    template: Template,
    className: 'sign-up',

    initialize: function (options) {
      options = options || {};

      this._formPrefill = options.formPrefill;
      this._coppa = options.coppa;
    },

    beforeRender: function () {
      if (document.cookie.indexOf('tooyoung') > -1) {
        this.navigate('cannot_create_account');
        return p(false);
      }

      this._bouncedEmail = this.ephemeralMessages.get('bouncedEmail');

      return FormView.prototype.beforeRender.call(this);
    },

    _createCoppaView: function () {
      var self = this;

      if (self._coppa) {
        return p();
      }

      var autofocusEl = this._selectAutoFocusEl();
      var coppaDatePicker = new CoppaDatePicker({
        el: self.$('#coppa'),
        screenName: self.getScreenName(),
        formPrefill: self._formPrefill,
        shouldFocus: autofocusEl === null
      });

      return coppaDatePicker.render()
        .then(function () {
          self.trackSubview(coppaDatePicker);
          coppaDatePicker.on('submit', self.validateAndSubmit.bind(self));

          self._coppa = coppaDatePicker;
        });
    },

    afterRender: function () {
      var self = this;
      self._createCoppaView()
        .then(function () {
          self.transformLinks();

          return FormView.prototype.afterRender.call(self);
        });
    },

    afterVisible: function () {
      if (this._bouncedEmail) {
        this.showValidationError('input[type=email]',
                  AuthErrors.toError('SIGNUP_EMAIL_BOUNCE'));
      }

      if (this.automatedBrowser) {
        // helps avoid 'focus' issues with Firefox Selenium Driver
        // See https://code.google.com/p/selenium/issues/detail?id=157
        this.$el.find('input[type=password]').click(function () {
          this.suggestEmail();
        }.bind(this));
      }

      return FormView.prototype.afterVisible.call(this);
    },

    events: {
      'blur input.email': 'suggestEmail'
    },

    getPrefillEmail: function () {
      // formPrefill.email comes first because users can edit the email,
      // go to another screen, edit the email again, and come back here. We
      // want the last used email.
      return this._formPrefill.get('email') || this.relier.get('email');
    },

    _selectAutoFocusEl: function () {
      var prefillEmail = this.getPrefillEmail();
      var prefillPassword = this._formPrefill.get('password');

      return selectAutoFocusEl(
            this._bouncedEmail, prefillEmail, prefillPassword);
    },

    context: function () {
      var prefillEmail = this.getPrefillEmail();
      var prefillPassword = this._formPrefill.get('password');
      var autofocusEl = this._selectAutoFocusEl();

      var relier = this.relier;
      return {
        serviceName: relier.get('serviceName'),
        isSync: relier.isSync(),
        isCustomizeSyncChecked: relier.isCustomizeSyncChecked(),
        isPasswordAutoCompleteDisabled: this.isPasswordAutoCompleteDisabled(),
        email: prefillEmail,
        password: prefillPassword,
        shouldFocusEmail: autofocusEl === 'email',
        shouldFocusPassword: autofocusEl === 'password',
        error: this.error
      };
    },

    beforeDestroy: function () {
      var formPrefill = this._formPrefill;
      formPrefill.set('email', this.getElementValue('.email'));
      formPrefill.set('password', this.getElementValue('.password'));
    },

    isValidEnd: function () {
      if (this._isEmailSameAsBouncedEmail()) {
        return false;
      }

      if (this._isEmailFirefoxDomain()) {
        return false;
      }

      if (! this._coppa.isValid()) {
        return false;
      }

      return FormView.prototype.isValidEnd.call(this);
    },

    showValidationErrorsEnd: function () {
      if (this._isEmailSameAsBouncedEmail()) {
        this.showValidationError('input[type=email]',
                AuthErrors.toError('DIFFERENT_EMAIL_REQUIRED'));
      } else if (this._isEmailFirefoxDomain()) {
        this.showValidationError('input[type=email]',
                AuthErrors.toError('DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN'));
      } else {
        this._coppa.showValidationErrors();
      }
    },

    submit: function () {
      var self = this;
      return p()
        .then(function () {
          if (! self._isUserOldEnough()) {
            return self._cannotCreateAccount();
          }

          return self._initAccount();
        });
    },

    suggestEmail: function () {
      mailcheck(this.$el.find('.email'), this.metrics, this.translator, this.window.location.search);
    },

    _isEmailSameAsBouncedEmail: function () {
      return (this._bouncedEmail &&
             (this.getElementValue('input[type=email]') === this._bouncedEmail));
    },

    _isUserOldEnough: function () {
      return this._coppa.isUserOldEnough();
    },

    _isEmailFirefoxDomain: function () {
      var email = this.$('.email').val();

      // some users input a "@firefox.com" email.
      // this is not a valid email at this time, therefore we block the attempt.
      if (email.indexOf('@firefox.com') >= 0) {
        return true;
      }

      return false;
    },

    _cannotCreateAccount: function () {
      // this is a session cookie. It will go away once:
      // 1. the user closes the tab
      // and
      // 2. the user closes the browser
      // Both of these have to happen or else the cookie
      // hangs around like a bad smell.
      document.cookie = 'tooyoung=1;';

      this.navigate('cannot_create_account');
    },

    _initAccount: function () {
      var self = this;
      var email = self.$('.email').val();
      var password = self.$('.password').val();
      var customizeSync = self.$('.customize-sync').is(':checked');
      var preVerifyToken = self.relier.get('preVerifyToken');

      if (preVerifyToken) {
        self.logScreenEvent('preverified');
      }

      if (self.relier.isSync()) {
        self.logScreenEvent('customizeSync.' + String(customizeSync));
      }

      return self.broker.beforeSignIn(email)
        .then(function () {
          return self.fxaClient.signUp(
                        email, password, self.relier, {
                          customizeSync: customizeSync
                        });
        }).then(function (accountData) {
          var account = self.user.initAccount(accountData);

          if (preVerifyToken && account.get('verified')) {
            self.logScreenEvent('preverified.success');
          }
          self.logScreenEvent('success');

          return self.user.setSignedInAccount(account)
            .then(function () {
              return account;
            });
        })
        .then(_.bind(self.onSignUpSuccess, self))
        .then(null, function (err) {
          // Account already exists. No attempt is made at signing the
          // user in directly, instead, point the user to the signin page
          // where the entered email/password will be prefilled.
          if (AuthErrors.is(err, 'ACCOUNT_ALREADY_EXISTS')) {
            return self._suggestSignIn(err);
          } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
            self.logEvent('login.canceled');
            // if user canceled login, just stop
            return;
          }

          // re-throw error, it will be handled at a lower level.
          throw err;
        });
    },

    onSignUpSuccess: function (account) {
      var self = this;
      if (account.get('verified')) {
        // user was pre-verified, notify the broker.
        return self.broker.afterSignIn(account)
          .then(function (result) {
            if (! (result && result.halt)) {
              self.navigate('signup_complete');
            }
          });
      } else {
        self.navigate('confirm', {
          data: {
            account: account
          }
        });
      }
    },

    _suggestSignIn: function (err) {
      err.forceMessage = t('Account already exists. <a href="/signin">Sign in</a>');
      return this.displayErrorUnsafe(err);
    }
  });

  Cocktail.mixin(
    View,
    PasswordMixin,
    ServiceMixin
  );

  return View;
});
