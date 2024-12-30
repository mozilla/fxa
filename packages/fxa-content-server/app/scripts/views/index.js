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
import ExperimentMixin from './mixins/experiment-mixin';
import ThirdPartyAuth from '../templates/partial/third-party-auth.mustache';
import FlowBeginMixin from './mixins/flow-begin-mixin';
import FormPrefillMixin from './mixins/form-prefill-mixin';
import FormView from './form';
import GleanMetrics from '../lib/glean';
import ServiceMixin from './mixins/service-mixin';
import SignedInNotificationMixin from './mixins/signed-in-notification-mixin';
import ThirdPartyAuthMixin from './mixins/third-party-auth-mixin';
import Template from 'templates/index.mustache';
import checkEmailDomain from '../lib/email-domain-validator';
import PocketMigrationMixin from './mixins/pocket-migration-mixin';
import BrandMessagingMixin from './mixins/brand-messaging-mixin';
import MonitorClientMixin from './mixins/monitor-client-mixin';
import RelayClientMixin from './mixins/relay-client-mixin';
import { isEmailMask } from 'fxa-shared/email/helpers';

const EMAIL_SELECTOR = 'input[type=email]';

const t = (msg) => msg;

class IndexView extends FormView {
  template = Template;

  constructor(options) {
    super(options);
    this.config = options.config || {};
  }

  setInitialContext(context) {
    MonitorClientMixin.setInitialContext.call(this, context);
    RelayClientMixin.setInitialContext.call(this, context);
    context.set({
      unsafeThirdPartyAuthHTML: this.renderTemplate(ThirdPartyAuth, {
        showSeparator: true,
      }),
      showSubscriptionTerms:
        context.get('isMonitorClient') ||
        context.get('isRelayClient') ||
        this.relier.isOAuthNativeRelay(),
    });
  }

  get viewName() {
    return 'enter-email';
  }

  getAccount() {
    return this.model.get('account');
  }

  beforeRender() {
    const account = this.getAccount();
    const relierEmail = this.relier.get('email');
    const prefillEmailFromReact = this.relier.get('prefillEmail');
    if (account) {
      this.formPrefill.set(account.pick('email'));
    } else if (relierEmail) {
      this.formPrefill.set('email', relierEmail);
    } else if (prefillEmailFromReact) {
      this.formPrefill.set('email', prefillEmailFromReact);
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
    } else if (action === 'force_auth') {
      this.replaceCurrentPage(action);
    } else if (action) {
      return this.chooseEmailActionPage();
    } else if (this.getSignedInAccount().get('sessionToken')) {
      this.replaceCurrentPage('settings');
    } else {
      return this.chooseEmailActionPage();
    }
  }

  logView() {
    GleanMetrics.emailFirst.view();
    return super.logView.call(this);
  }

  afterVisible() {
    super.afterVisible();

    if (this._hasEmailBounced()) {
      this.showValidationError(
        'input[type=email]',
        AuthErrors.toError('SIGNUP_EMAIL_BOUNCE')
      );
    }

    // The CAD via QR and newsletters experiment are mutally exclusive
    // so a user can only be enrolled in one of them at a time. This
    // select the experiment the user will belong to.
    this.getAndReportExperimentGroup('newsletterCadChooser');

    // This is so we can show the delete success message after redirect
    // from the settings beta.
    if (this.getSearchParam('delete_account_success')) {
      this.displaySuccess(t('Account deleted successfully'));
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
      // Don't redirect to `/signin` if the React query param `prefillEmail`
      // exists. This signals to content-server we want to stay on the index
      // screen with that email prefilled.
    } else if (
      this.allowSuggestedAccount(suggestedAccount) &&
      !this.relier.get('prefillEmail') &&
      !this._hasEmailBounced()
    ) {
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
    // the added 'i' disallows uppercase letters
    const firefoxMail = new RegExp('@firefox(\\.com)?$', 'i');
    return firefoxMail.test(email);
  }

  _hasEmailBounced() {
    const account = this.getAccount('account');

    return (
      this.getSearchParam('bouncedEmail') ||
      (account && account.get('hasBounced'))
    );
  }

  _isEmailSameAsBouncedEmail() {
    if (!this._hasEmailBounced()) {
      return false;
    }

    const bouncedEmail =
      this.getSearchParam('bouncedEmail') ||
      this.getAccount('account').get('email');

    return (
      bouncedEmail && bouncedEmail === this.getElementValue('input[type=email]')
    );
  }

  // This way we can stub out the call to checkEmailDomain in tests; there is no
  // way to stub the actual function with sinon since we are using ES Modules.
  _validateEmailDomain() {
    const $emailInputEl = this.$(EMAIL_SELECTOR);

    if (this.config.mxRecordValidation) {
      if (this.config.mxRecordValidation.enabled === false) {
        return Promise.resolve(true);
      }

      if ($emailInputEl && this.config.mxRecordValidation.exclusions.length) {
        const [, domain] = $emailInputEl.val().split('@');
        if (this.config.mxRecordValidation.exclusions.includes(domain)) {
          return Promise.resolve(true);
        }
      }
    }

    return checkEmailDomain($emailInputEl, this);
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
      .then(() => this.user.checkAccountStatus(account))
      .then(({ exists, hasPassword, hasLinkedAccount }) => {
        const nextEndpoint = exists ? 'signin' : 'signup';

        // If a Relay email mask is being used for a new account, show an error
        if (nextEndpoint === 'signup' && isEmailMask(email)) {
          this.showValidationError(
            EMAIL_SELECTOR,
            AuthErrors.toError('EMAIL_MASK_NEW_ACCOUNT')
          );
          return;
        }

        // Temporary hack for React work that allows us to pass the entered `email` as
        // a param. When 'signup' and 'signin' flows are both finished and we're ready,
        // we can convert the index page over and pass this along with router state
        // instead of param.
        this.user.set({
          emailFromIndex: email,
          hasPassword: hasPassword,
          hasLinkedAccount: hasLinkedAccount,
        });
        if (exists) {
          // If the account exists, use the stored account
          // so that any stored avatars are displayed on
          // the next page.
          account = this.user.getAccountByEmail(email);
          // the returned account could be the default,
          // ensure its values are set.
          account.set('email', email);
          this.navigate(nextEndpoint, { account });
        } else {
          // The email address does not belong to a current user. Validate its
          // domain name.
          return (
            this._validateEmailDomain()
              .then(() => this.navigate(nextEndpoint, { account }))
              // checkEmailDomain will display the appropriate error
              // messsage/tooltip; we don't need additional error handling here.
              .catch((e) => {})
          );
        }
      });
  }
}

Cocktail.mixin(
  IndexView,
  CachedCredentialsMixin,
  CoppaMixin({}),
  ExperimentMixin,
  FlowBeginMixin,
  FormPrefillMixin,
  ServiceMixin,
  ThirdPartyAuthMixin,
  SignedInNotificationMixin,
  BrandMessagingMixin,
  PocketMigrationMixin,
  MonitorClientMixin,
  RelayClientMixin
);

export default IndexView;
