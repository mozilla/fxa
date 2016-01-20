/* This Source Code Form is subject to the terms of the Mozilla Public * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var BaseView = require('views/base');
  var CheckboxMixin = require('views/mixins/checkbox-mixin');
  var Cocktail = require('cocktail');
  var CoppaAgeInput = require('views/coppa/coppa-age-input');
  var ExperimentMixin = require('views/mixins/experiment-mixin');
  var FormView = require('views/form');
  var mailcheck = require('lib/mailcheck');
  var MigrationMixin = require('views/mixins/migration-mixin');
  var p = require('lib/promise');
  var PasswordMixin = require('views/mixins/password-mixin');
  var PasswordStrengthMixin = require('views/mixins/password-strength-mixin');
  var ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  var ServiceMixin = require('views/mixins/service-mixin');
  var SignedInNotificationMixin = require('views/mixins/signed-in-notification-mixin');
  var SignInSuccessMixin = require('views/mixins/signin-success-mixin')();
  var SignUpDisabledMixin = require('views/mixins/signup-disabled-mixin');
  var SignUpSuccessMixin = require('views/mixins/signup-success-mixin');
  var Template = require('stache!templates/sign_up');

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

  function signIn (account, password) {
    return this.user.signInAccount(account, password, this.relier, {
      resume: this.getStringifiedResumeToken()
    })
    .then(this.onSignInSuccess.bind(this, account))
    .fail(this.onSignUpError.bind(this));
  }

  function signUp (account, password) {
    return this.user.signUpAccount(account, password, this.relier, {
      resume: this.getStringifiedResumeToken()
    })
    .then(this.invokeBrokerMethod.bind(this, 'afterSignUp'))
    .then(this.onSignUpSuccess.bind(this, account))
    .fail(this.onSignUpError.bind(this));
  }

  var View = FormView.extend({
    template: Template,
    className: 'sign-up',

    initialize: function (options) {
      options = options || {};

      this._formPrefill = options.formPrefill;
      this._coppa = options.coppa;
      this._able = options.able;
    },

    beforeRender: function () {
      if (document.cookie.indexOf('tooyoung') > -1) {
        this.navigate('cannot_create_account');
        return p(false);
      } else if (this.isSignupDisabled()) {
        this.navigate('signin', {
          error: this.getSignupDisabledReason()
        });
        return p(false);
      }

      return FormView.prototype.beforeRender.call(this);
    },

    _createCoppaView: function () {
      var self = this;

      if (self._coppa) {
        return p();
      }

      var autofocusEl = this._selectAutoFocusEl();
      var coppaOptions = {
        el: self.$('#coppa'),
        formPrefill: self._formPrefill,
        metrics: self.metrics,
        shouldFocus: autofocusEl === null,
        viewName: self.getViewName()
      };

      var coppaView = new CoppaAgeInput(coppaOptions);

      return coppaView.render()
        .then(function () {
          self.trackChildView(coppaView);
          coppaView.on('submit', self.validateAndSubmit.bind(self));

          self._coppa = coppaView;
        });
    },

    afterRender: function () {
      var self = this;

      self.logViewEvent('email-optin.visible.' +
          String(self._isEmailOptInEnabled()));

      return self._createCoppaView()
        .then(function () {
          self.transformLinks();

          return FormView.prototype.afterRender.call(self);
        });
    },

    afterVisible: function () {
      if (this.model.get('bouncedEmail')) {
        this.showValidationError('input[type=email]',
                  AuthErrors.toError('SIGNUP_EMAIL_BOUNCE'));
      }

      if (this.broker.isAutomatedBrowser()) {
        // helps avoid 'focus' issues with Firefox Selenium Driver
        // See https://code.google.com/p/selenium/issues/detail?id=157
        this.$el.find('input[type=password]').click(function () {
          this.onEmailBlur();
        }.bind(this));
      }

      if (this.isPasswordStrengthCheckEnabled()) {
        // load the password strength checker early so the user does
        // not need to wait once they fill out the password.
        this.getPasswordStrengthChecker();
      }

      return FormView.prototype.afterVisible.call(this);
    },

    events: {
      'blur input.email': 'onEmailBlur',
      'blur input.password': 'onPasswordBlur',
      'click #amo-migration a': 'onAmoSignIn'
    },

    getPrefillEmail: function () {
      // formPrefill.email comes first because users can edit the email,
      // go to another view, edit the email again, and come back here. We
      // want the last used email.
      return this._formPrefill.get('email') || this.relier.get('email');
    },

    _selectAutoFocusEl: function () {
      var prefillEmail = this.getPrefillEmail();
      var prefillPassword = this._formPrefill.get('password');

      return selectAutoFocusEl(
            this.model.get('bouncedEmail'), prefillEmail, prefillPassword);
    },

    context: function () {
      var prefillEmail = this.getPrefillEmail();
      var prefillPassword = this._formPrefill.get('password');
      var autofocusEl = this._selectAutoFocusEl();

      var relier = this.relier;
      var isSync = relier.isSync();
      var context = {
        chooseWhatToSyncCheckbox: this.broker.hasCapability('chooseWhatToSyncCheckbox'),
        email: prefillEmail,
        error: this.error,
        isAmoMigration: this.isAmoMigration(),
        isCustomizeSyncChecked: relier.isCustomizeSyncChecked(),
        isEmailOptInVisible: this._isEmailOptInEnabled(),
        isPasswordAutoCompleteDisabled: this.isPasswordAutoCompleteDisabled(),
        isSync: isSync,
        isSyncMigration: this.isSyncMigration(),
        password: prefillPassword,
        serviceName: relier.get('serviceName'),
        shouldFocusEmail: autofocusEl === 'email',
        shouldFocusPassword: autofocusEl === 'password',
        signinUri: this.broker.transformLink('/signin')
      };

      if (isSync && this.isInExperiment('syncCheckbox')) {
        this.notifier.trigger('syncCheckbox.triggered');
        if (this.isInExperimentGroup('syncCheckbox', 'treatment')) {
          context.isSyncTop = isSync;
          context.isSync = null;
        }
      }

      return context;
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

      // We're not checking the COPPA validity here
      // in case an existing user wants to sign in.

      return FormView.prototype.isValidEnd.call(this);
    },

    showValidationErrorsEnd: function () {
      if (this._isEmailSameAsBouncedEmail()) {
        this.showValidationError('input[type=email]',
                AuthErrors.toError('DIFFERENT_EMAIL_REQUIRED'));
      } else if (this._isEmailFirefoxDomain()) {
        this.showValidationError('input[type=email]',
                AuthErrors.toError('DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN'));
      }
    },

    submit: function () {
      var self = this;
      return p()
        .then(function () {
          if (self._isUserOldEnough()) {
            self.notifier.trigger('signup.submit');
            return self._initAccount(signUp);
          }

          // COPPA is not valid, but maybe this is an existing user
          // that wants to sign in. Let them try to sign in then, if
          // that fails, come back here and show the COPPA error.
          // https://github.com/mozilla/fxa-content-server/issues/2778
          return self._initAccount(signIn)
            .fail(function (err) {
              if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
                if (self._coppa.hasValue()) {
                  self.notifier.trigger('signup.tooyoung');
                  return self._cannotCreateAccount();
                }

                return self.displayError(t('You must enter your age to sign up'));
              }

              throw err;
            });
        });
    },

    onPasswordBlur: function () {
      var password = this.getElementValue('.password');
      this.checkPasswordStrength(password);
    },

    onEmailBlur: function () {
      if (this.isInExperiment('mailcheck')) {
        mailcheck(this.$el.find('.email'), this.metrics, this.translator, this);
      }
    },

    onAmoSignIn: function () {
      // The user has chosen to sign in with a different email, clear the
      // email from the relier so it's not used again on the signin page.
      this.relier.unset('email');
      this.$('input[type=email]').val('');
    },

    _isEmailSameAsBouncedEmail: function () {
      var bouncedEmail = this.model.get('bouncedEmail');

      return bouncedEmail &&
             bouncedEmail === this.getElementValue('input[type=email]');
    },

    _isUserOldEnough: function () {
      return this._coppa.isUserOldEnough();
    },

    _isEmailFirefoxDomain: function () {
      var email = this.getElementValue('.email');

      // "@firefox" or "@firefox.com" email addresses are not valid
      // at this time, therefore block the attempt.
      return /@firefox(\.com)?$/.test(email);
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

    _initAccount: function (action) {
      var self = this;

      var password = self.getElementValue('.password');
      var preVerifyToken = self.relier.get('preVerifyToken');
      var account = self.user.initAccount({
        customizeSync: self.$('.customize-sync').is(':checked'),
        email: self.getElementValue('.email'),
        needsOptedInToMarketingEmail: self.$('.marketing-email-optin').is(':checked')
      });

      if (preVerifyToken) {
        self.logViewEvent('preverified');
      }

      if (self.relier.isSync()) {
        var customizeSync = account.get('customizeSync');
        self.logViewEvent('customizeSync.' + String(customizeSync));

        if (customizeSync && self.isInExperiment('syncCheckbox')) {
          self.notifier.trigger('syncCheckbox.clicked');
        }
      }

      return self.invokeBrokerMethod('beforeSignIn', account.get('email'))
        .then(action.bind(self, account, password));
    },

    onSignUpError: function (err) {
      var self = this;
      if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
        // Account already exists, sign-in was attempted but password was wrong.
        var redirectPath = '/signin';
        if (self.relier.isOAuth()) {
          redirectPath = '/oauth/signin';
        }
        return self.navigate(redirectPath, {
          error: err
        });
      } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
        self.logEvent('login.canceled');
        // if user canceled login, just stop
        return;
      }

      // re-throw error, it will be handled at a lower level.
      throw err;
    },

    _suggestSignIn: function (err) {
      err.forceMessage = t('Account already exists. <a href="/signin">Sign in</a>');
      return this.displayErrorUnsafe(err);
    },

    _isEmailOptInEnabled: function () {
      return !! this._able.choose('communicationPrefsVisible', {
        lang: this.navigator.language
      });
    }
  });

  Cocktail.mixin(
    View,
    CheckboxMixin,
    ExperimentMixin,
    MigrationMixin,
    PasswordMixin,
    PasswordStrengthMixin,
    ResumeTokenMixin,
    ServiceMixin,
    SignedInNotificationMixin,
    SignInSuccessMixin,
    SignUpDisabledMixin,
    SignUpSuccessMixin
  );

  module.exports = View;
});
