/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A broker is a model that knows how to handle interaction with
 * the outside world.
 */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const Cocktail = require('cocktail');
  const Environment = require('lib/environment');
  const NotifierMixin = require('lib/channels/notifier-mixin');
  const NavigateBehavior = require('views/behaviors/navigate');
  const NullBehavior = require('views/behaviors/null');
  const p = require('lib/promise');
  const SameBrowserVerificationModel = require('models/verification/same-browser');
  const SearchParamMixin = require('models/mixins/search-param');
  const Vat = require('lib/vat');

  var QUERY_PARAMETER_SCHEMA = {
    automatedBrowser: Vat.boolean()
  };

  var BaseAuthenticationBroker = Backbone.Model.extend({
    type: 'base',

    initialize (options = {}) {
      this.relier = options.relier;
      this.window = options.window || window;
      this.environment = new Environment(this.window);

      this._behaviors = new Backbone.Model(this.defaultBehaviors);
      this._capabilities = new Backbone.Model(this.defaultCapabilities);
    },

    notifications: {
      'once!view-shown': 'afterLoaded'
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
      afterCompleteResetPassword: new NullBehavior(),
      afterCompleteSignUp: new NullBehavior(),
      afterDeleteAccount: new NullBehavior(),
      afterForceAuth: new NullBehavior(),
      afterResetPasswordConfirmationPoll: new NullBehavior(),
      afterSignIn: new NullBehavior(),
      afterSignInConfirmationPoll: new NavigateBehavior('signin_confirmed'),
      afterSignUp: new NullBehavior(),
      afterSignUpConfirmationPoll: new NavigateBehavior('signup_confirmed'),
      beforeSignIn: new NullBehavior(),
      beforeSignUpConfirmationPoll: new NullBehavior()
    },

    /**
     * Set a behavior
     *
     * @param {String} behaviorName
     * @param {Object} value
     */
    setBehavior (behaviorName, value) {
      this._behaviors.set(behaviorName, value);
    },

    /**
     * Get a behavior
     *
     * @param {String} behaviorName
     * @return {Object}
     */
    getBehavior (behaviorName) {
      if (! this._behaviors.has(behaviorName)) {
        throw new Error('behavior not found for: ' + behaviorName);
      }

      return this._behaviors.get(behaviorName);
    },

    /**
     * initialize the broker with any necessary data.
     * @returns {Promise}
     */
    fetch () {
      return p().then(() => {
        this._isForceAuth = this._isForceAuthUrl();
        this.importSearchParamsUsingSchema(QUERY_PARAMETER_SCHEMA, AuthErrors);
      });
    },

    /**
     * Called after the first view is rendered. Can be used
     * to notify the RP the system is loaded.
     *
     * @returns {Promise}
     */
    afterLoaded () {
      return p();
    },

    /**
     * Called before sign in. Can be used to prevent sign in.
     *
     * @param {Object} account
     * @return {Promise}
     */
    beforeSignIn (/* account */) {
      return p(this.getBehavior('beforeSignIn'));
    },

    /**
     * Called after sign in. Can be used to notify the RP that the user
     * has signed in.
     *
     * @param {Object} account
     * @return {Promise}
     */
    afterSignIn (/* account */) {
      return p(this.getBehavior('afterSignIn'));
    },

    /**
     * Called after sign in confirmation poll. Can be used to notify the RP
     * that the user has signed in and confirmed their email address to verify
     * they want to allow the signin.
     *
     * @param {Object} account
     * @return {Promise}
     */
    afterSignInConfirmationPoll (/* account */) {
      return p(this.getBehavior('afterSignInConfirmationPoll'));
    },

    /**
     * Called after a force auth.
     *
     * @param {Object} account
     * @return {Promise}
     */
    afterForceAuth (/* account */) {
      return p(this.getBehavior('afterForceAuth'));
    },

    /**
     * Called before confirmation polls to persist any data that is needed
     * for email verification. Useful for storing data that may be needed
     * by the verification tab.
     *
     * @param {Object} account
     * @return {Promise}
     */
    persistVerificationData (account) {
      return p().then(() => {
        // verification info is persisted to localStorage so that
        // the same `context` is used if the user verifies in the same browser.
        // If the user verifies in a different browser, the
        // default (direct access) context will be used.
        var verificationInfo =
              createSameBrowserVerificationModel(account, 'context');

        verificationInfo.set({
          context: this.relier.get('context')
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
    unpersistVerificationData (account) {
      return p().then(function () {
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
    afterSignUp (/* account */) {
      return p(this.getBehavior('afterSignUp'));
    },

    /**
     * Called before signup email confirmation poll starts. Can be used
     * to notify the RP that the user has successfully signed up but
     * has not yet completed verification.
     *
     * @param {Object} account
     * @return {Promise}
     */
    beforeSignUpConfirmationPoll (/* account */) {
      return p(this.getBehavior('beforeSignUpConfirmationPoll'));
    },

    /**
     * Called after signup email confirmation poll completes. Can be used
     * to notify the RP that the user has successfully signed up and
     * completed verification.
     *
     * @param {Object} account
     * @return {Promise}
     */
    afterSignUpConfirmationPoll (/* account */) {
      return p(this.getBehavior('afterSignUpConfirmationPoll'));
    },

    /**
     * Called after signup email verification, in the verification tab.
     *
     * @param {Object} account
     * @return {Promise}
     */
    afterCompleteSignUp (account) {
      return this.unpersistVerificationData(account)
        .then(() => this.getBehavior('afterCompleteSignUp'));
    },

    /**
     * Called after password reset email confirmation poll completes.
     * Can be used to notify the RP that the user has successfully reset their
     * password.
     *
     * @param {Object} account
     * @return {Promise}
     */
    afterResetPasswordConfirmationPoll (/* account */) {
      return p(this.getBehavior('afterResetPasswordConfirmationPoll'));
    },

    /**
     * Called after password reset email verification, in the verification tab.
     *
     * @param {Object} account
     * @return {Promise}
     */
    afterCompleteResetPassword (account) {
      return this.unpersistVerificationData(account)
        .then(() => this.getBehavior('afterCompleteResetPassword'));
    },

    /**
     * Called after a user has changed their password.
     *
     * @param {Object} account
     * @return {Promise}
     */
    afterChangePassword (/* account */) {
      return p(this.getBehavior('afterChangePassword'));
    },

    /**
     * Called after a user has deleted their account.
     *
     * @param {Object} account
     * @return {Promise}
     */
    afterDeleteAccount (/* account */) {
      return p(this.getBehavior('afterDeleteAccount'));
    },

    /**
     * Transform the signin/signup links if necessary
     *
     * @param {String} link
     * @returns {String}
     */
    transformLink (link) {
      return link;
    },

    /**
     * Check if the relier wants to force the user to auth with
     * a particular email.
     *
     * @returns {Boolean}
     */
    isForceAuth () {
      return !! this._isForceAuth;
    },

    _isForceAuthUrl () {
      var pathname = this.window.location.pathname;
      return pathname === '/force_auth' || pathname === '/oauth/force_auth';
    },

    /**
     * Is the browser being automated? Set to true for selenium tests.
     *
     * @returns {Boolean}
     */
    isAutomatedBrowser () {
      return !! this.get('automatedBrowser');
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
       * Should the signup page show the `Choose what to sync` checkbox
       */
      chooseWhatToSyncCheckbox: true,
      /**
       * Should external links be converted to text?
       */
      convertExternalLinksToText: false,
      /**
       * should the *_complete pages show the marketing snippet?
       */
      emailVerificationMarketingSnippet: true,
      /**
       * Should the view handle signed-in notifications from other tabs?
       */
      handleSignedInNotification: true,
      /**
       * Is signup supported? the fx_ios_v1 broker can disable it.
       */
      signup: true
    },

    /**
     * Check if a capability is supported. A capability is not supported
     * if it's value is not a member of or falsy in `this.defaultCapabilities`.
     *
     * @param {String} capabilityName
     * @return {Boolean}
     */
    hasCapability (capabilityName) {
      return this._capabilities.has(capabilityName) &&
             !! this._capabilities.get(capabilityName);
    },

    /**
     * Set a capability value.
     *
     * @param {String} capabilityName
     * @param {Variant} capabilityValue
     */
    setCapability (capabilityName, capabilityValue) {
      this._capabilities.set(capabilityName, capabilityValue);
    },

    /**
     * Remove support for a capability
     *
     * @param {String} capabilityName
     */
    unsetCapability (capabilityName) {
      this._capabilities.unset(capabilityName);
    },

    /**
     * Get the capability value
     *
     * @param {String} capabilityName
     * @return {Variant}
     */
    getCapability (capabilityName) {
      return this._capabilities.get(capabilityName);
    }
  });

  function createSameBrowserVerificationModel (account, namespace) {
    return new SameBrowserVerificationModel({}, {
      email: account.get('email'),
      namespace: namespace,
      uid: account.get('uid')
    });
  }

  function clearSameBrowserVerificationModel (account, namespace) {
    var verificationInfo =
            createSameBrowserVerificationModel(account, namespace);

    verificationInfo.clear();
  }

  Cocktail.mixin(
    BaseAuthenticationBroker,
    NotifierMixin,
    SearchParamMixin
  );

  module.exports = BaseAuthenticationBroker;
});
