/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redirect users that browse to `/` to `signup` or `settings`
 * depending on whether the user is authenticated.
 *
 * @module views/index
 */
import AuthErrors from '../lib/auth-errors';
import CachedCredentialsMixin from './mixins/cached-credentials-mixin';
import Cocktail from 'cocktail';
import CoppaMixin from './mixins/coppa-mixin';
import EmailFirstExperimentMixin from './mixins/email-first-experiment-mixin';
import FirefoxFamilyServicesTemplate from '../templates/partial/firefox-family-services.mustache';
import TokenCodeExperimentMixin from './mixins/token-code-experiment-mixin';
import FlowBeginMixin from './mixins/flow-begin-mixin';
import FormPrefillMixin from './mixins/form-prefill-mixin';
import FormView from './form';
import mailcheck from '../lib/mailcheck';
import ServiceMixin from './mixins/service-mixin';
import SignedInNotificationMixin from './mixins/signed-in-notification-mixin';
import SyncSuggestionMixin from './mixins/sync-suggestion-mixin';
import Template from 'templates/index.mustache';

const EMAIL_SELECTOR = 'input[type=email]';

class IndexView extends FormView {
  template = Template;

  partialTemplates = {
    unsafeFirefoxFamilyHTML: FirefoxFamilyServicesTemplate,
  };

  get viewName() {
    return 'enter-email';
  }

  getAccount() {
    return this.model.get('account');
  }

  beforeRender() {
    const account = this.getAccount();
    const relierEmail = this.relier.get('email');
    if (account) {
      this.formPrefill.set(account.pick('email'));
    } else if (relierEmail) {
      this.formPrefill.set('email', relierEmail);
    }
  }

  afterRender() {
    // 1. COPPA checks whether the user is too young in beforeRender.
    // So that COPPA takes precedence, do all other checks afterwards.
    // 2. bounced signup emails get email-first automatically
    // 3. action=email is specified by the firstrun page to specify
    // the email-first flow
    if (this._hasEmailBounced()) {
      // show the index page with an error screen
      return this.chooseEmailActionPage();
    }

    const isLegacySigninSignupDisabled = this.broker.getCapability(
      'disableLegacySigninSignup'
    );
    const action = this.relier.get('action');

    if (isLegacySigninSignupDisabled && action !== 'force_auth') {
      return this.chooseEmailActionPage();
    }

    if (action && action !== 'email') {
      this.replaceCurrentPage(action);
    } else if (
      this.isInEmailFirstExperimentGroup('treatment') ||
      action === 'email'
    ) {
      return this.chooseEmailActionPage();
    } else if (this.getSignedInAccount().get('sessionToken')) {
      this.replaceCurrentPage('settings');
    } else {
      this.replaceCurrentPage('signup');
    }
  }

  afterVisible() {
    if (this._hasEmailBounced()) {
      this.showValidationError(
        'input[type=email]',
        AuthErrors.toError('SIGNUP_EMAIL_BOUNCE')
      );
    }
  }

  chooseEmailActionPage() {
    const relierEmail = this.relier.get('email');
    const accountFromPreviousScreen = this.getAccount();
    const suggestedAccount = this.suggestedAccount();
    // let's the router know to use the email-first signin/signup page
    this.notifier.trigger('email-first-flow');

    if (accountFromPreviousScreen) {
      // intentionally empty
      // shows the email-first template, the prefill email was set in beforeRender
    } else if (typeof relierEmail === 'string') {
      // the relier email is in the form already since it was used as the prefillEmail
      // in beforeRender. Check whether the email is valid, and if so submit. If the
      // email is not valid then show a validation error to help the user. See #6584
      if (this.isValid()) {
        return this.checkEmail(relierEmail);
      } else {
        // the email was not valid, show any validation errors.
        // The relier email set used as the prefill email in beforeRender.
        this.showValidationErrors();
      }
    } else if (this.allowSuggestedAccount(suggestedAccount)) {
      this.replaceCurrentPage('signin', {
        account: suggestedAccount,
      });
    }
    // else, show the email-first template.
  }

  submit() {
    return this.checkEmail(this._getEmail());
  }

  isValidEnd() {
    if (this._isEmailFirefoxDomain(this._getEmail())) {
      return false;
    }

    if (this._isCommonDomainMistake()) {
      return false;
    }

    if (this._isEmailSameAsBouncedEmail()) {
      return false;
    }

    return super.isValidEnd.call(this);
  }

  showValidationErrorsEnd() {
    if (this._isEmailSameAsBouncedEmail()) {
      this.showValidationError(
        'input[type=email]',
        AuthErrors.toError('DIFFERENT_EMAIL_REQUIRED')
      );
    } else if (this._isEmailFirefoxDomain(this._getEmail())) {
      this.showValidationError(
        EMAIL_SELECTOR,
        AuthErrors.toError('DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN')
      );
    }
  }

  _getEmail() {
    return this.getElementValue(EMAIL_SELECTOR);
  }

  _isEmailFirefoxDomain(email) {
    // "@firefox" or "@firefox.com" email addresses are not valid
    // at this time, therefore block the attempt.
    return /@firefox(\.com)?$/.test(email);
  }

  _hasEmailBounced() {
    const account = this.getAccount('account');
    return account && account.get('hasBounced');
  }

  _isEmailSameAsBouncedEmail() {
    if (!this._hasEmailBounced()) {
      return false;
    }

    const bouncedEmail = this.getAccount('account').get('email');

    return (
      bouncedEmail && bouncedEmail === this.getElementValue('input[type=email]')
    );
  }

  _isCommonDomainMistake() {
    return mailcheck(this.$(EMAIL_SELECTOR), this);
  }

  /**
   * Check `email`. If registered, send the user to `signin`,
   * if not registered, `signup`
   *
   * @param {String} email
   * @returns {Promise}
   */
  checkEmail(email) {
    let account = this.user.initAccount({
      email,
    });

    // before checking whether the email exists, check
    // that accounts can be merged.
    return this.invokeBrokerMethod('beforeSignIn', account)
      .then(() => this.user.checkAccountEmailExists(account))
      .then(exists => {
        const nextEndpoint = exists ? 'signin' : 'signup';
        if (exists) {
          // If the account exists, use the stored account
          // so that any stored avatars are displayed on
          // the next page.
          account = this.user.getAccountByEmail(email);
          // the returned account could be the default,
          // ensure it's email is set.
          account.set('email', email);
        }
        this.navigate(nextEndpoint, { account });
      });
  }
}

Cocktail.mixin(
  IndexView,
  CachedCredentialsMixin,
  CoppaMixin({}),
  EmailFirstExperimentMixin(),
  TokenCodeExperimentMixin,
  FlowBeginMixin,
  FormPrefillMixin,
  ServiceMixin,
  SignedInNotificationMixin,
  SyncSuggestionMixin({
    entrypoint: 'fxa:enter_email',
    flowEvent: 'link.signin',
  })
);

export default IndexView;
