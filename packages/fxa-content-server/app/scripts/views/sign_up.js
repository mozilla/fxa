/* This Source Code Form is subject to the terms of the Mozilla Public * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AccountResetMixin = require('./mixins/account-reset-mixin');
  const AuthErrors = require('../lib/auth-errors');
  const BaseView = require('./base');
  const CheckboxMixin = require('./mixins/checkbox-mixin');
  const Cocktail = require('cocktail');
  const CoppaMixin = require('./mixins/coppa-mixin');
  const EmailFirstExperimentMixin = require('./mixins/email-first-experiment-mixin');
  const EmailOptInMixin = require('./mixins/email-opt-in-mixin');
  const ExperimentMixin = require('./mixins/experiment-mixin');
  const FloatingPlaceholderMixin = require('./mixins/floating-placeholder-mixin');
  const FlowBeginMixin = require('./mixins/flow-begin-mixin');
  const FormPrefillMixin = require('./mixins/form-prefill-mixin');
  const FormView = require('./form');
  const mailcheck = require('../lib/mailcheck');
  const MigrationMixin = require('./mixins/migration-mixin');
  const PasswordMixin = require('./mixins/password-mixin');
  const ServiceMixin = require('./mixins/service-mixin');
  const SignedInNotificationMixin = require('./mixins/signed-in-notification-mixin');
  const SignInMixin = require('./mixins/signin-mixin');
  const SignUpMixin = require('./mixins/signup-mixin');
  const SyncSuggestionMixin = require('./mixins/sync-suggestion-mixin');
  const Template = require('stache!templates/sign_up');

  var t = BaseView.t;

  function selectAutoFocusEl(bouncedEmail, email, password) {
    if (bouncedEmail) {
      return 'input[type=email]';
    } else if (! email) {
      return 'input[type=email]';
    } else if (! password) {
      return 'input[type=password]';
    } else {
      return '#age';
    }
  }

  const proto = FormView.prototype;

  var View = FormView.extend({
    template: Template,
    className: 'sign-up',

    beforeRender () {
      var error = this.model.get('error');
      if (error && AuthErrors.is(error, 'DELETED_ACCOUNT')) {
        error.forceMessage = t('Account no longer exists. Recreate it?');
      }

      return proto.beforeRender.call(this);
    },

    afterRender () {
      const autofocusEl = this._selectAutoFocusEl();
      this.$(autofocusEl).attr('autofocus', 'autofocus');
      this.logViewEvent(`password-confirm.visible.${this._isPasswordConfirmEnabled()}`);

      return proto.afterRender.call(this);
    },

    afterVisible () {
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

      return proto.afterVisible.call(this);
    },

    events: {
      'blur input.email': 'onEmailBlur',
      'click #amo-migration a': 'onAmoSignIn'
    },

    getPrefillEmail () {
      // formPrefill.email comes first because users can edit the email,
      // go to another view, edit the email again, and come back here. We
      // want the last used email.
      return this.formPrefill.get('email') || this.relier.get('email');
    },

    _selectAutoFocusEl () {
      var prefillEmail = this.model.get('forceEmail') || this.getPrefillEmail();
      var prefillPassword = this.formPrefill.get('password');

      return selectAutoFocusEl(
            this.model.get('bouncedEmail'), prefillEmail, prefillPassword);
    },

    setInitialContext (context) {
      var forceEmail = this.model.get('forceEmail');
      var prefillEmail = this.getPrefillEmail();

      var relier = this.relier;
      var isSync = relier.isSync();

      context.set({
        chooseWhatToSyncCheckbox: this.broker.hasCapability('chooseWhatToSyncCheckbox'),
        email: prefillEmail,
        error: this.error,
        forceEmail: forceEmail,
        isAmoMigration: this.isAmoMigration(),
        isCustomizeSyncChecked: relier.isCustomizeSyncChecked(),
        isSignInEnabled: ! forceEmail,
        isSync: isSync,
        isSyncMigration: this.isSyncMigration(),
        showPasswordConfirm: this._isPasswordConfirmEnabled()
      });
    },

    isValidEnd () {
      if (! this._doPasswordsMatch()) {
        return false;
      }

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

    showValidationErrorsEnd () {
      if (! this._doPasswordsMatch()) {
        this.displayError(AuthErrors.toError('PASSWORDS_DO_NOT_MATCH'));
      } else if (this._isEmailSameAsBouncedEmail()) {
        this.showValidationError('input[type=email]',
                AuthErrors.toError('DIFFERENT_EMAIL_REQUIRED'));
      } else if (this._isEmailFirefoxDomain()) {
        this.showValidationError('input[type=email]',
                AuthErrors.toError('DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN'));
      }
    },

    submit () {
      this.notifier.trigger('signup.submit');
      /**
       * The semi-convoluted flow:
       * 1. Check if the user has filled in COPPA and is old enough.
       *   1a. If old enough, sign up the user.
       *     1a1. If sign up succeeds, hooray!
       *     1a2. If sign up fails with ACCOUNT_ALREADY_EXISTS,
       *     attempt to sign in. Go to step 1b1.
       *   1b. If the user is not old enough or hasn't filled in coppa,
       *   try to sign in.
       *     1b1. If sign in succeeds, hooray!
       *     1b2. If INCORRECT_PASSWORD, send the user to /signin
       *     1b3. If UNKNOWN_ACCOUNT, user has not filled in COPPA or is too
       *     young.
       *       1b3a. If not filled in, tell user to fill in age.
       *       1b3b. If too young, go to the too young screen.
       */
      return Promise.resolve().then(() => {
        var account = this._initAccount();
        var password = this.getElementValue('#password');

        if (this.isUserOldEnough()) {
          // User filled out COPPA, attempt a signup.
          // If user already exists, they will be signed in.
          return this._signUp(account, password);
        }

        // COPPA is not valid, but maybe this is an existing user
        // that wants to sign in. Let them try to sign in then, if
        // that fails, show a COPPA error.
        // https://github.com/mozilla/fxa-content-server/issues/2778
        return this._signIn(account, password);
      })
      .catch((err) => {
        if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
          this.logEvent('login.canceled');
          // if user canceled login, just stop
          return;
        }

        throw err;
      });
    },

    _checkMailcheckResult () {
      var emailEl = this.$el.find('.email');

      var emailValue = emailEl.val();
      var mailcheckValue = emailEl.data('mailcheckValue');

      if (emailValue.length > 0 && mailcheckValue === emailValue) {
        this.logEvent('mailcheck.corrected');
      }
    },

    _signUp (account, password) {
      this._checkMailcheckResult(this);
      return this.signUp(account, password)
        .catch(this.onSignUpError.bind(this, account, password));
    },

    onSignUpError (account, password, err) {
      if (AuthErrors.is(err, 'ACCOUNT_ALREADY_EXISTS')) {
        // account exists and is verified,
        // attempt to sign in the user.
        return this._signIn(account, password);
      }

      // re-throw error, it will be handled at a lower level.
      throw err;
    },

    _signIn (account, password) {
      return this.signIn(account, password)
        .catch(this.onSignInError.bind(this, account, password));
    },

    onSignInError (account, password, err) {
      // only verified users who already have an account will see
      // the INCORRECT_PASSWORD error.
      if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
        return this._suggestSignIn(err);
      } else if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
        // Users who correctly filled in COPPA and are of age
        // were sent to sign up already. This is a user who was
        // attempting to sign in. If the account is unknown,
        // something is up with COPPA. Print the
        // appropriate message.
        if (this.coppaHasValue()) {
          return this.tooYoung();
        } else {
          this.showValidationError(this.$('#age'), AuthErrors.toError('AGE_REQUIRED'));
          return;
        }
      } else if (AuthErrors.is(err, 'ACCOUNT_RESET')) {
        return this.notifyOfResetAccount(account);
      }

      // re-throw error, it will be handled at a lower level.
      throw err;
    },

    onEmailBlur () {
      mailcheck(this.$el.find('.email'), this);
    },

    onAmoSignIn () {
      // The user has chosen to sign in with a different email, clear the
      // email from the relier so it's not used again on the signin page.
      this.relier.unset('email');
      this.$('input[type=email]').val('');
    },

    _isEmailSameAsBouncedEmail () {
      var bouncedEmail = this.model.get('bouncedEmail');

      return bouncedEmail &&
             bouncedEmail === this.getElementValue('input[type=email]');
    },

    _isEmailFirefoxDomain () {
      var email = this.getElementValue('.email');

      // "@firefox" or "@firefox.com" email addresses are not valid
      // at this time, therefore block the attempt.
      return /@firefox(\.com)?$/.test(email);
    },

    _isPasswordConfirmEnabled () {
      return !! this.isInExperimentGroup('signupPasswordConfirm', 'treatment');
    },

    _doPasswordsMatch() {
      if (this._isPasswordConfirmEnabled()) {
        return this.getElementValue('#password') === this.getElementValue('#vpassword');
      } else {
        return true;
      }
    },

    _initAccount () {
      var account = this.user.initAccount({
        customizeSync: this.$('.customize-sync').is(':checked'),
        email: this.getElementValue('.email'),
        needsOptedInToMarketingEmail: this.hasOptedInToMarketingEmail()
      });

      if (this.relier.isSync()) {
        var customizeSync = account.get('customizeSync');
        this.logViewEvent('customizeSync.' + String(customizeSync));
      }

      return account;
    },

    _suggestSignIn (err) {
      err.forceMessage = t('Account already exists. <a href="/signin">Sign in</a>');
      return this.unsafeDisplayError(err);
    }
  }, {
    ENTRYPOINT: 'fxa:signup'
  });

  Cocktail.mixin(
    View,
    AccountResetMixin,
    CheckboxMixin,
    CoppaMixin({ required: false }),
    EmailFirstExperimentMixin({ treatmentPathname: '/' }),
    EmailOptInMixin,
    ExperimentMixin,
    FloatingPlaceholderMixin,
    FlowBeginMixin,
    FormPrefillMixin,
    MigrationMixin,
    PasswordMixin,
    ServiceMixin,
    SignInMixin,
    SignUpMixin,
    SignedInNotificationMixin,
    SyncSuggestionMixin({
      entrypoint: View.ENTRYPOINT,
      flowEvent: 'link.signin',
      pathname: 'signup'
    })
  );

  module.exports = View;
});
