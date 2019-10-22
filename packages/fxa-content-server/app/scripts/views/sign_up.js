/* This Source Code Form is subject to the terms of the Mozilla Public * License, v. 2.0.
 * If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AccountResetMixin from './mixins/account-reset-mixin';
import AuthErrors from '../lib/auth-errors';
import Cocktail from 'cocktail';
import CoppaMixin from './mixins/coppa-mixin';
import EmailFirstExperimentMixin from './mixins/email-first-experiment-mixin';
import EmailOptInMixin from './mixins/email-opt-in-mixin';
import ExperimentMixin from './mixins/experiment-mixin';
import FirefoxFamilyServicesTemplate from '../templates/partial/firefox-family-services.mustache';
import FlowBeginMixin from './mixins/flow-begin-mixin';
import FormPrefillMixin from './mixins/form-prefill-mixin';
import FormView from './form';
import mailcheck from '../lib/mailcheck';
import PasswordMixin from './mixins/password-mixin';
import ServiceMixin from './mixins/service-mixin';
import SignedInNotificationMixin from './mixins/signed-in-notification-mixin';
import SignInMixin from './mixins/signin-mixin';
import SignUpMixin from './mixins/signup-mixin';
import SyncSuggestionMixin from './mixins/sync-suggestion-mixin';
import Template from 'templates/sign_up.mustache';

const t = msg => msg;

const proto = FormView.prototype;

var View = FormView.extend(
  {
    template: Template,
    partialTemplates: {
      unsafeFirefoxFamilyHTML: FirefoxFamilyServicesTemplate,
    },
    className: 'sign-up',

    beforeRender() {
      var error = this.model.get('error');
      if (error && AuthErrors.is(error, 'DELETED_ACCOUNT')) {
        error.forceMessage = t('Account no longer exists. Recreate it?');
      }

      return proto.beforeRender.call(this);
    },

    afterVisible() {
      if (this.model.get('bouncedEmail')) {
        this.showValidationError(
          'input[type=email]',
          AuthErrors.toError('SIGNUP_EMAIL_BOUNCE')
        );
      }

      if (this.broker.isAutomatedBrowser()) {
        // helps avoid 'focus' issues with Firefox Selenium Driver
        // See https://code.google.com/p/selenium/issues/detail?id=157
        this.$el.find('input[type=password]').click(
          function() {
            this.onEmailBlur();
          }.bind(this)
        );
      }

      return proto.afterVisible.call(this);
    },

    events: {
      'blur input.email': 'onEmailBlur',
    },

    getPrefillEmail() {
      // formPrefill.email comes first because users can edit the email,
      // go to another view, edit the email again, and come back here. We
      // want the last used email.
      return this.formPrefill.get('email') || this.relier.get('email');
    },

    setInitialContext(context) {
      var forceEmail = this.model.get('forceEmail');
      var prefillEmail = this.getPrefillEmail();

      var relier = this.relier;
      var isSync = relier.isSync();

      context.set({
        email: prefillEmail,
        error: this.error,
        forceEmail: forceEmail,
        isSignInEnabled: !forceEmail,
        isSync: isSync,
      });
    },

    isValidEnd() {
      if (!this._doPasswordsMatch()) {
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

    showValidationErrorsEnd() {
      if (!this._doPasswordsMatch()) {
        this.displayError(AuthErrors.toError('PASSWORDS_DO_NOT_MATCH'));
      } else if (this._isEmailSameAsBouncedEmail()) {
        this.showValidationError(
          'input[type=email]',
          AuthErrors.toError('DIFFERENT_EMAIL_REQUIRED')
        );
      } else if (this._isEmailFirefoxDomain()) {
        this.showValidationError(
          'input[type=email]',
          AuthErrors.toError('DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN')
        );
      }
    },

    submit() {
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
      return Promise.resolve()
        .then(() => {
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
        .catch(err => {
          if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
            this.logEvent('login.canceled');
            // if user canceled login, just stop
            return;
          }

          throw err;
        });
    },

    _checkMailcheckResult() {
      var emailEl = this.$el.find('.email');

      var emailValue = emailEl.val();
      var mailcheckValue = emailEl.data('mailcheckValue');

      if (emailValue.length > 0 && mailcheckValue === emailValue) {
        this.logEvent('mailcheck.corrected');
      }
    },

    _signUp(account, password) {
      this._checkMailcheckResult(this);
      return this.signUp(account, password).catch(
        this.onSignUpError.bind(this, account, password)
      );
    },

    onSignUpError(account, password, err) {
      if (AuthErrors.is(err, 'ACCOUNT_ALREADY_EXISTS')) {
        // account exists and is verified,
        // attempt to sign in the user.
        return this._signIn(account, password);
      }

      // re-throw error, it will be handled at a lower level.
      throw err;
    },

    _signIn(account, password) {
      return this.signIn(account, password).catch(
        this.onSignInError.bind(this, account, password)
      );
    },

    onSignInError(account, password, err) {
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
          this.showValidationError(
            this.$('#age'),
            AuthErrors.toError('AGE_REQUIRED')
          );
          return;
        }
      } else if (AuthErrors.is(err, 'ACCOUNT_RESET')) {
        return this.notifyOfResetAccount(account);
      }

      // re-throw error, it will be handled at a lower level.
      throw err;
    },

    onEmailBlur() {
      mailcheck(this.$el.find('.email'), this);
    },

    _isEmailSameAsBouncedEmail() {
      var bouncedEmail = this.model.get('bouncedEmail');

      return (
        bouncedEmail &&
        bouncedEmail === this.getElementValue('input[type=email]')
      );
    },

    _isEmailFirefoxDomain() {
      var email = this.getElementValue('.email');

      // "@firefox" or "@firefox.com" email addresses are not valid
      // at this time, therefore block the attempt.
      return /@firefox(\.com)?$/.test(email);
    },

    _doPasswordsMatch() {
      return (
        this.getElementValue('#password') === this.getElementValue('#vpassword')
      );
    },

    _initAccount() {
      const account = this.user.initAccount({
        email: this.getElementValue('.email'),
      });

      if (this.isAnyNewsletterVisible()) {
        account.set({
          newsletters: this.getOptedIntoNewsletters(),
        });
      }

      return account;
    },

    _suggestSignIn(err) {
      err.forceMessage = t(
        'Account already exists. <a href="/signin">Sign in</a>'
      );
      return this.unsafeDisplayError(err);
    },
  },
  {
    ENTRYPOINT: 'fxa:signup',
  }
);

Cocktail.mixin(
  View,
  AccountResetMixin,
  CoppaMixin({ required: false }),
  EmailFirstExperimentMixin({ treatmentPathname: '/' }),
  EmailOptInMixin,
  ExperimentMixin,
  FlowBeginMixin,
  FormPrefillMixin,
  PasswordMixin,
  ServiceMixin,
  SignInMixin,
  SignUpMixin,
  SignedInNotificationMixin,
  SyncSuggestionMixin({
    entrypoint: View.ENTRYPOINT,
    flowEvent: 'link.signin',
  })
);

export default View;
