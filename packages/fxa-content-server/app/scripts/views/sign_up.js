/* This Source Code Form is subject to the terms of the Mozilla Public * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AccountResetMixin = require('views/mixins/account-reset-mixin');
  const AuthErrors = require('lib/auth-errors');
  const BaseView = require('views/base');
  const CheckboxMixin = require('views/mixins/checkbox-mixin');
  const Cocktail = require('cocktail');
  const CoppaAgeInput = require('views/coppa/coppa-age-input');
  const ExperimentMixin = require('views/mixins/experiment-mixin');
  const FlowBeginMixin = require('views/mixins/flow-begin-mixin');
  const FlowEventsMixin = require('views/mixins/flow-events-mixin');
  const FormView = require('views/form');
  const mailcheck = require('lib/mailcheck');
  const MigrationMixin = require('views/mixins/migration-mixin');
  const p = require('lib/promise');
  const PasswordMixin = require('views/mixins/password-mixin');
  const ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  const ServiceMixin = require('views/mixins/service-mixin');
  const SignedInNotificationMixin = require('views/mixins/signed-in-notification-mixin');
  const SignInMixin = require('views/mixins/signin-mixin');
  const SignUpMixin = require('views/mixins/signup-mixin');
  const SyncAuthMixin = require('views/mixins/sync-auth-mixin');
  const Template = require('stache!templates/sign_up');
  const UserAgentMixin = require('lib/user-agent-mixin');

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

    initialize (options) {
      options = options || {};

      this._formPrefill = options.formPrefill;
      this._coppa = options.coppa;
      this._able = options.able;
    },

    beforeRender () {
      if (document.cookie.indexOf('tooyoung') > -1) {
        this.navigate('cannot_create_account');
        return p(false);
      }

      var error = this.model.get('error');
      if (error && AuthErrors.is(error, 'DELETED_ACCOUNT')) {
        error.forceMessage = t('Account no longer exists. Recreate it?');
      }

      return FormView.prototype.beforeRender.call(this);
    },

    _createCoppaView () {
      if (this._coppa) {
        return p();
      }

      var autofocusEl = this._selectAutoFocusEl();
      var coppaOptions = {
        el: this.$('#coppa'),
        formPrefill: this._formPrefill,
        metrics: this.metrics,
        notifier: this.notifier,
        shouldFocus: autofocusEl === null,
        viewName: this.getViewName()
      };

      var coppaView = new CoppaAgeInput(coppaOptions);

      return coppaView.render()
        .then(() => {
          this.trackChildView(coppaView);
          // CoppaAgeInput inherits from FormView, which cancels submit events.
          // Explicitly propagate submit events from the COPPA input so that the
          // rest of our event-handling, e.g. the flow.engage event, works.
          coppaView.on('submit', () => this.trigger('submit'));

          this._coppa = coppaView;
        });
    },

    afterRender () {
      this.logViewEvent('email-optin.visible.' +
          String(this._isEmailOptInEnabled()));

      return this._createCoppaView()
        .then(() => FormView.prototype.afterRender.call(this));
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

      return FormView.prototype.afterVisible.call(this);
    },

    events: {
      'blur input.email': 'onEmailBlur',
      'click #amo-migration a': 'onAmoSignIn',
      'click #suggest-sync .dismiss': 'onSuggestSyncDismiss'
    },

    getPrefillEmail () {
      // formPrefill.email comes first because users can edit the email,
      // go to another view, edit the email again, and come back here. We
      // want the last used email.
      return this._formPrefill.get('email') || this.relier.get('email');
    },

    _selectAutoFocusEl () {
      var prefillEmail = this.model.get('forceEmail') || this.getPrefillEmail();
      var prefillPassword = this._formPrefill.get('password');

      return selectAutoFocusEl(
            this.model.get('bouncedEmail'), prefillEmail, prefillPassword);
    },

    context () {
      var autofocusEl = this._selectAutoFocusEl();
      var forceEmail = this.model.get('forceEmail');
      var prefillEmail = this.getPrefillEmail();
      var prefillPassword = this._formPrefill.get('password');

      var relier = this.relier;
      var isSync = relier.isSync();

      var context = {
        chooseWhatToSyncCheckbox: this.broker.hasCapability('chooseWhatToSyncCheckbox'),
        email: prefillEmail,
        error: this.error,
        forceEmail: forceEmail,
        isAmoMigration: this.isAmoMigration(),
        isCustomizeSyncChecked: relier.isCustomizeSyncChecked(),
        isEmailOptInVisible: this._isEmailOptInEnabled(),
        isSignInEnabled: ! forceEmail,
        isSync: isSync,
        isSyncMigration: this.isSyncMigration(),
        password: prefillPassword,
        serviceName: relier.get('serviceName'),
        shouldFocusEmail: autofocusEl === 'email',
        shouldFocusPassword: autofocusEl === 'password',
        showSyncSuggestion: this.isSyncSuggestionEnabled()
      };

      let escapedSyncSuggestionUrl;
      if (this.isSyncAuthSupported()) {
        escapedSyncSuggestionUrl = this.getEscapedSyncUrl('signup', View.ENTRYPOINT);
      } else {
        escapedSyncSuggestionUrl = encodeURI(
                'https://mozilla.org/firefox/sync?' +
                'utm_source=fx-website&utm_medium=fx-accounts&' +
                'utm_campaign=fx-signup&utm_content=fx-sync-get-started');
      }
      context.escapedSyncSuggestionAttrs = `data-flow-event="link.signin" href="${escapedSyncSuggestionUrl}"`;

      return context;
    },

    beforeDestroy () {
      var formPrefill = this._formPrefill;
      formPrefill.set('email', this.getElementValue('.email'));
      formPrefill.set('password', this.getElementValue('.password'));
    },

    isValidEnd () {
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
      if (this._isEmailSameAsBouncedEmail()) {
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
      return p().then(() => {
        var account = this._initAccount();
        var password = this.getElementValue('.password');

        if (this._isUserOldEnough()) {
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
      .fail((err) => {
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
        .fail(this.onSignUpError.bind(this, account, password));
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
        .fail(this.onSignInError.bind(this, account, password));
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
        if (this._coppa.hasValue()) {
          this.notifier.trigger('signup.tooyoung');
          return this._cannotCreateAccount();
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

    onSuggestSyncDismiss () {
      this.$('#suggest-sync').hide();
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

    _isUserOldEnough () {
      return this._coppa.isUserOldEnough();
    },

    _isEmailFirefoxDomain () {
      var email = this.getElementValue('.email');

      // "@firefox" or "@firefox.com" email addresses are not valid
      // at this time, therefore block the attempt.
      return /@firefox(\.com)?$/.test(email);
    },

    _cannotCreateAccount () {
      // this is a session cookie. It will go away once:
      // 1. the user closes the tab
      // and
      // 2. the user closes the browser
      // Both of these have to happen or else the cookie
      // hangs around like a bad smell.
      document.cookie = 'tooyoung=1;';

      this.navigate('cannot_create_account');
    },

    _initAccount () {
      var account = this.user.initAccount({
        customizeSync: this.$('.customize-sync').is(':checked'),
        email: this.getElementValue('.email'),
        needsOptedInToMarketingEmail: this.$('.marketing-email-optin').is(':checked')
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
    },

    _isEmailOptInEnabled () {
      return !! this._able.choose('communicationPrefsVisible', {
        lang: this.navigator.language
      });
    }
  }, {
    ENTRYPOINT: 'fxa:signup'
  });

  Cocktail.mixin(
    View,
    AccountResetMixin,
    CheckboxMixin,
    ExperimentMixin,
    // FlowEventsMixin must be mixed in before FlowBeginMixin
    FlowEventsMixin,
    FlowBeginMixin,
    MigrationMixin,
    PasswordMixin,
    ResumeTokenMixin,
    ServiceMixin,
    SignInMixin,
    SignUpMixin,
    SignedInNotificationMixin,
    SyncAuthMixin,
    UserAgentMixin
  );

  module.exports = View;
});
