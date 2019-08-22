/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A broker is a model that knows how to handle interaction with
 * the outside world.
 */

import AuthErrors from '../../lib/auth-errors';
import Backbone from 'backbone';
import Cocktail from 'cocktail';
import Environment from '../../lib/environment';
import NotifierMixin from '../../lib/channels/notifier-mixin';
import NavigateBehavior from '../../views/behaviors/navigate';
import NavigateOrRedirectBehavior from '../../views/behaviors/navigate-or-redirect';
import NullBehavior from '../../views/behaviors/null';
import SameBrowserVerificationModel from '../verification/same-browser';
import UrlMixin from '../mixins/url';
import SettingsIfSignedInBehavior from '../../views/behaviors/settings';
import Vat from '../../lib/vat';
import VerificationMethods from '../../lib/verification-methods';
import VerificationReasons from '../../lib/verification-reasons';

const t = msg => msg;

const QUERY_PARAMETER_SCHEMA = {
  automatedBrowser: Vat.boolean(),
};

const BaseAuthenticationBroker = Backbone.Model.extend({
  type: 'base',

  initialize(options = {}) {
    this.relier = options.relier;
    this.window = options.window || window;
    this.environment = new Environment(this.window);

    this._behaviors = new Backbone.Model(this.defaultBehaviors);
    this._capabilities = new Backbone.Model(this.defaultCapabilities);
    this._fxaClient = options.fxaClient;
    this._metrics = options.metrics;

    this._notificationChannel = options.notificationChannel;
    if (this._notificationChannel) {
      // optimistically set fxaStatus to `true` if the channel says it's supported.
      // The request for fxaccounts:fxa_status could fail with a `no such channel`
      // error if the browser is not configured to accept WebChannel messages
      // from this FxA server, which often happens when testing against
      // non-production servers. See #5114
      //const isFxaStatusSupported = this._notificationChannel.isFxaStatusSupported();
      const isFxaStatusSupported = true;
      this.setCapability('fxaStatus', isFxaStatusSupported);

      if (isFxaStatusSupported) {
        this.on('fxa_status', response => this.onFxaStatus(response));
      }
    }
  },

  /**
   * Handle a response to the `fxa_status` message.
   *
   * @param {any} [response={}]
   * @private
   */
  onFxaStatus(response = {}) {
    this.setCapability(
      'supportsPairing',
      response.capabilities && response.capabilities.pairing
    );
  },

  notifications: {
    'once!view-shown': 'afterLoaded',
  },

  /**
   * The default list of behaviors. Behaviors indicate a view's next step
   * once a broker's function has completed. A subclass can override one
   * or more behavior.
   *
   * @property defaultBehaviors
   */
  defaultBehaviors: {
    afterChangePassword: new NullBehavior(),
    afterCompletePrimaryEmail: new SettingsIfSignedInBehavior(
      new NavigateBehavior('primary_email_verified'),
      {
        success: t('Primary email verified successfully'),
      }
    ),
    afterCompleteResetPassword: new NullBehavior(),
    afterCompleteSecondaryEmail: new SettingsIfSignedInBehavior(
      new NavigateBehavior('secondary_email_verified'),
      {
        success: t('Secondary email verified successfully'),
      }
    ),
    afterCompleteSignIn: new NavigateBehavior('signin_verified'),
    afterCompleteSignInWithCode: new NavigateBehavior('settings'),
    afterCompleteSignUp: new NavigateOrRedirectBehavior('signup_verified'),
    afterDeleteAccount: new NullBehavior(),
    afterForceAuth: new NavigateBehavior('signin_confirmed'),
    afterResetPasswordConfirmationPoll: new NullBehavior(),
    afterSignIn: new NavigateBehavior('signin_confirmed'),
    afterSignInConfirmationPoll: new NavigateBehavior('signin_confirmed'),
    afterSignUp: new NavigateBehavior('confirm'),
    afterSignUpConfirmationPoll: new NavigateOrRedirectBehavior(
      'signup_confirmed'
    ),
    afterSignUpRequireTOTP: new NavigateBehavior('signin'),
    beforeSignIn: new NullBehavior(),
    beforeSignUpConfirmationPoll: new NullBehavior(),
  },

  /**
   * Set a behavior
   *
   * @param {String} behaviorName
   * @param {Object} value
   */
  setBehavior(behaviorName, value) {
    this._behaviors.set(behaviorName, value);
  },

  /**
   * Get a behavior
   *
   * @param {String} behaviorName
   * @return {Object}
   */
  getBehavior(behaviorName) {
    if (!this._behaviors.has(behaviorName)) {
      throw new Error('behavior not found for: ' + behaviorName);
    }

    return this._behaviors.get(behaviorName);
  },

  /**
   * Initialize the broker with any necessary data.
   *
   * @returns {Promise}
   */
  fetch() {
    return Promise.resolve()
      .then(() => {
        const isPairing = this._isPairing();
        this._isForceAuth = this._isForceAuthUrl();
        this.importSearchParamsUsingSchema(QUERY_PARAMETER_SCHEMA, AuthErrors);

        if (this.hasCapability('fxaStatus')) {
          return this._fetchFxaStatus({
            isPairing,
          });
        }
      })
      .then(() => {
        const signinCode = this.relier && this.relier.get('signinCode');
        if (signinCode) {
          return this._consumeSigninCode(signinCode);
        }
      });
  },

  /**
   * Notify the browser that it should open pairing preferences
   *
   * @method openPairPreferences
   * @returns {Promise} resolves when notification is sent.
   */
  openPairPreferences() {
    if (this.hasCapability('supportsPairing')) {
      const channel = this._notificationChannel;
      return channel.send(channel.COMMANDS.PAIR_PREFERENCES);
    }
  },

  /**
   * Request FXA_STATUS info from the UA.
   *
   * @param {Object} [statusOptions] extra options for the status message.
   * @returns {Promise} resolves when complete.
   * @private
   */
  _fetchFxaStatus(statusOptions = {}) {
    const channel = this._notificationChannel;
    const isPairing = statusOptions.isPairing;

    return channel
      .request(channel.COMMANDS.FXA_STATUS, {
        isPairing,
        service: this.relier.get('service'),
      })
      .then(
        (response = {}) => {
          // The browser will respond with a signedInUser in the following cases:
          // - non-PB mode, service=*
          // - PB mode, service=sync
          this.set('browserSignedInAccount', response.signedInUser);
          // In the future, additional data will be returned
          // in the response, handle it here.
          this.trigger('fxa_status', response);
        },
        err => {
          // The browser is not configured to accept WebChannel messages from
          // this FxA server. fxaStatus is not supported. Error has
          // already been logged and can be ignored. See #5114
          if (AuthErrors.is(err, 'INVALID_WEB_CHANNEL')) {
            this.setCapability('fxaStatus', false);
            return;
          }

          throw err;
        }
      );
  },

  /**
   * Consume the `signinCode` for account data. If successfully consumed,
   * `signinCodeAccount` will be available via this.get.
   *
   * @param {String} signinCode
   * @returns {Promise} resolves when complete.
   * @private
   */
  _consumeSigninCode(signinCode) {
    this._metrics._initializeFlowModel();
    const { flowId, flowBeginTime } = this._metrics.getFlowEventMetadata();
    return this._fxaClient
      .consumeSigninCode(signinCode, flowId, flowBeginTime)
      .then(
        response => {
          this.set('signinCodeAccount', response);
        },
        err => {
          // log and ignore any errors. The user should still
          // be able to sign in normally.
          this._metrics.logError(err);
        }
      );
  },

  /**
   * Called after the first view is rendered. Can be used
   * to notify the RP the system is loaded.
   *
   * @returns {Promise}
   */
  afterLoaded() {
    return Promise.resolve();
  },

  /**
   * Called before sign in. Can be used to prevent sign in.
   *
   * @param {Object} account
   * @return {Promise}
   */
  beforeSignIn(/* account */) {
    return Promise.resolve(this.getBehavior('beforeSignIn'));
  },

  /**
   * Called after sign in. Can be used to notify the RP that the user
   * has signed in.
   *
   * @param {Object} account
   * @return {Promise}
   */
  afterSignIn(/* account */) {
    return Promise.resolve(this.getBehavior('afterSignIn'));
  },

  /**
   * Called after sign in confirmation poll. Can be used to notify the RP
   * that the user has signed in and confirmed their email address to verify
   * they want to allow the signin.
   *
   * @param {Object} account
   * @return {Promise}
   */
  afterSignInConfirmationPoll(/* account */) {
    return Promise.resolve(this.getBehavior('afterSignInConfirmationPoll'));
  },

  /**
   * Called after signin email verification, in the verification tab.
   *
   * @param {Object} account
   * @return {Promise}
   */
  afterCompleteSignIn(account) {
    return this.unpersistVerificationData(account).then(() =>
      this.getBehavior('afterCompleteSignIn')
    );
  },

  afterCompleteSignInWithCode() {
    return Promise.resolve(this.getBehavior('afterCompleteSignInWithCode'));
  },

  /**
   * Called after primary email verification, in the verification tab.
   *
   * @param {Object} account
   * @return {Promise}
   */
  afterCompletePrimaryEmail(account) {
    return this.unpersistVerificationData(account).then(() =>
      this.getBehavior('afterCompletePrimaryEmail')
    );
  },

  /**
   * Called after secondary email verification, in the verification tab.
   *
   * @param {Object} account
   * @return {Promise}
   */
  afterCompleteSecondaryEmail(account) {
    return this.unpersistVerificationData(account).then(() =>
      this.getBehavior('afterCompleteSecondaryEmail')
    );
  },

  /**
   * Called after a force auth.
   *
   * @param {Object} account
   * @return {Promise}
   */
  afterForceAuth(/* account */) {
    return Promise.resolve(this.getBehavior('afterForceAuth'));
  },

  /**
   * Called before confirmation polls to persist any data that is needed
   * for email verification. Useful for storing data that may be needed
   * by the verification tab.
   *
   * @param {Object} account
   * @return {Promise}
   */
  persistVerificationData(account) {
    return Promise.resolve().then(() => {
      // verification info is persisted to localStorage so that
      // the same `context` is used if the user verifies in the same browser.
      // If the user verifies in a different browser, the
      // default (direct access) context will be used.
      var verificationInfo = createSameBrowserVerificationModel(
        account,
        'context'
      );

      verificationInfo.set({
        context: this.relier.get('context'),
      });

      return verificationInfo.persist();
    });
  },

  /**
   * Clear persisted verification data for the account
   *
   * @param {Object} account
   * @return {Promise}
   */
  unpersistVerificationData(account) {
    return Promise.resolve().then(function() {
      clearSameBrowserVerificationModel(account, 'context');
    });
  },

  /**
   * Called after the user has signed up but before the screen has
   * transitioned to the "confirm your email" view.
   *
   * @param {Object} account
   * @return {Promise}
   */
  afterSignUp(account) {
    if (account.get('verified')) {
      // If the account is already verified, go to the step after /confirm
      return this.afterSignUpConfirmationPoll(account);
    }
    return Promise.resolve(this.getBehavior('afterSignUp'));
  },

  /**
   * Called before signup email confirmation poll starts. Can be used
   * to notify the RP that the user has successfully signed up but
   * has not yet completed verification.
   *
   * @param {Object} account
   * @return {Promise}
   */
  beforeSignUpConfirmationPoll(/* account */) {
    return Promise.resolve(this.getBehavior('beforeSignUpConfirmationPoll'));
  },

  /**
   * Called after signup email confirmation poll completes. Can be used
   * to notify the RP that the user has successfully signed up and
   * completed verification.
   *
   * @param {Object} account
   * @return {Promise}
   */
  afterSignUpConfirmationPoll(/* account */) {
    return Promise.resolve(this.getBehavior('afterSignUpConfirmationPoll'));
  },

  /**
   * Called after signup email verification, in the verification tab.
   *
   * @param {Object} account
   * @return {Promise}
   */
  afterCompleteSignUp(account) {
    return this.unpersistVerificationData(account).then(() =>
      this.getBehavior('afterCompleteSignUp')
    );
  },

  /**
   * Called after password reset email confirmation poll completes.
   * Can be used to notify the RP that the user has successfully reset their
   * password.
   *
   * @param {Object} account
   * @return {Promise}
   */
  afterResetPasswordConfirmationPoll(account) {
    return Promise.resolve().then(() => {
      if (
        account.get('verificationMethod') === VerificationMethods.TOTP_2FA &&
        account.get('verificationReason') === VerificationReasons.SIGN_IN
      ) {
        return new NavigateBehavior('signin_totp_code', { account });
      }

      return this.getBehavior('afterResetPasswordConfirmationPoll');
    });
  },

  /**
   * Called after password reset email verification, in the verification tab.
   *
   * @param {Object} account
   * @return {Promise}
   */
  afterCompleteResetPassword(account) {
    return this.unpersistVerificationData(account).then(() => {
      // Users with TOTP enabled need to enter a TOTP code to complete password reset.
      if (
        account.get('verificationMethod') === VerificationMethods.TOTP_2FA &&
        account.get('verificationReason') === VerificationReasons.SIGN_IN
      ) {
        return new NavigateBehavior('signin_totp_code', { account });
      }

      return this.getBehavior('afterCompleteResetPassword');
    });
  },

  /**
   * Called after a user has changed their password.
   *
   * @param {Object} account
   * @return {Promise}
   */
  afterChangePassword(/* account */) {
    return Promise.resolve(this.getBehavior('afterChangePassword'));
  },

  /**
   * Called after a user has deleted their account.
   *
   * @param {Object} account
   * @return {Promise}
   */
  afterDeleteAccount(/* account */) {
    return Promise.resolve(this.getBehavior('afterDeleteAccount'));
  },

  /**
   * Transform the signin/signup links if necessary
   *
   * @param {String} link
   * @returns {String}
   */
  transformLink(link) {
    return link;
  },

  /**
   * Check if the relier wants to force the user to auth with
   * a particular email.
   *
   * @returns {Boolean}
   */
  isForceAuth() {
    return !!this._isForceAuth;
  },

  _isForceAuthUrl() {
    var pathname = this.window.location.pathname;
    return pathname === '/force_auth' || pathname === '/oauth/force_auth';
  },

  _isPairing() {
    const pathname = this.window.location.pathname;

    return pathname.indexOf('/pair') === 0;
  },

  /**
   * Is the browser being automated? Set to true for selenium tests.
   *
   * @returns {Boolean}
   */
  isAutomatedBrowser() {
    return !!this.get('automatedBrowser');
  },

  /**
   * The default list of capabilities. Set to a capability's value to
   * a truthy value to indicate whether it's supported.
   *
   * @property defaultCapabilities
   */
  defaultCapabilities: {
    /**
     * If the provided UID no longer exists on the auth server, can
     * the user sign up/in with the same email address but a different
     * uid?
     */
    allowUidChange: false,
    /**
     * Does the browser handle screen transitions after
     * an email verification?
     */
    browserTransitionsAfterEmailVerification: true,
    /**
     * Should the signup page show the `Choose what to sync` checkbox
     */
    chooseWhatToSyncCheckbox: true,
    /**
     * Should external links be converted to text?
     */
    convertExternalLinksToText: false,
    /**
     * Is the email-first flow supported?
     */
    emailFirst: false,
    /**
     * should the *_complete pages show the marketing snippet?
     */
    emailVerificationMarketingSnippet: true,
    /**
     * Should the UA be queried for FxA data?
     */
    fxaStatus: false,
    /**
     * Should the view handle signed-in notifications from other tabs?
     */
    handleSignedInNotification: true,
    /**
     * If the user has an existing sessionToken, can we safely re-use it
     * on subsequent signin attempts rather than generating a new token each time?
     */
    reuseExistingSession: false,
    /**
     * Is signup supported? the fx_ios_v1 broker can disable it.
     */
    signup: true,
    /**
     * Does this environment support pairing?
     */
    supportsPairing: false,
    /**
     * Are token codes flow supported?
     */
    tokenCode: false,
  },

  /**
   * Check if a capability is supported. A capability is not supported
   * if it's value is not a member of or falsy in `this.defaultCapabilities`.
   *
   * @param {String} capabilityName
   * @return {Boolean}
   */
  hasCapability(capabilityName) {
    return (
      this._capabilities.has(capabilityName) &&
      !!this._capabilities.get(capabilityName)
    );
  },

  /**
   * Set a capability value.
   *
   * @param {String} capabilityName
   * @param {Variant} capabilityValue
   */
  setCapability(capabilityName, capabilityValue) {
    this._capabilities.set(capabilityName, capabilityValue);
  },

  /**
   * Remove support for a capability
   *
   * @param {String} capabilityName
   */
  unsetCapability(capabilityName) {
    this._capabilities.unset(capabilityName);
  },

  /**
   * Get the capability value
   *
   * @param {String} capabilityName
   * @return {Variant}
   */
  getCapability(capabilityName) {
    return this._capabilities.get(capabilityName);
  },
});

function createSameBrowserVerificationModel(account, namespace) {
  return new SameBrowserVerificationModel(
    {},
    {
      email: account.get('email'),
      namespace: namespace,
      uid: account.get('uid'),
    }
  );
}

function clearSameBrowserVerificationModel(account, namespace) {
  var verificationInfo = createSameBrowserVerificationModel(account, namespace);

  verificationInfo.clear();
}

Cocktail.mixin(BaseAuthenticationBroker, NotifierMixin, UrlMixin);

export default BaseAuthenticationBroker;
