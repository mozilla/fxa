/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A broker is a model that knows how to handle interaction with
 * the outside world.
 */

define([
  'backbone',
  'lib/promise',
  'models/mixins/search-param',
  'views/behaviors/null',
  'underscore',
], function (Backbone, p, SearchParamMixin, NullBehavior, _) {
  'use strict';

  var BaseAuthenticationBroker = Backbone.Model.extend({
    type: 'base',

    initialize: function (options) {
      options = options || {};

      this.relier = options.relier;
      this.window = options.window || window;

      this._behaviors = new Backbone.Model(this.defaultBehaviors);
      this._capabilities = new Backbone.Model(this.defaultCapabilities);
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
      afterSignUp: new NullBehavior(),
      afterSignUpConfirmationPoll: new NullBehavior(),
      beforeSignIn: new NullBehavior(),
      beforeSignUpConfirmationPoll: new NullBehavior()
    },

    /**
     * Set a behavior
     *
     * @param {string} behaviorName
     * @param {object} value
     */
    setBehavior: function (behaviorName, value) {
      this._behaviors.set(behaviorName, value);
    },

    /**
     * Get a behavior
     *
     * @param {string} behaviorName
     * @return {object}
     */
    getBehavior: function (behaviorName) {
      if (! this._behaviors.has(behaviorName)) {
        throw new Error('behavior not found for: ' + behaviorName);
      }

      return this._behaviors.get(behaviorName);
    },

    /**
     * initialize the broker with any necessary data.
     * @returns {Promise}
     */
    fetch: function () {
      var self = this;
      return p()
        .then(function () {
          self._isForceAuth = self._isForceAuthUrl();
          self.importBooleanSearchParam('automatedBrowser');
        });
    },

    /*
     * Check if the environment supports the cancelling of the flow.
     */
    canCancel: function () {
      return false;
    },

    /**
     * The user wants to cancel
     */
    cancel: function () {
      return p();
    },

    /**
     * Called after the first screen is rendered. Can be used
     * to notify the RP the system is loaded.
     */
    afterLoaded: function () {
      return p();
    },


    /**
     * Called before sign in. Can be used to prevent sign in.
     */
    beforeSignIn: function () {
      return p(this.getBehavior('beforeSignIn'));
    },

    /**
     * Called after sign in. Can be used to notify the RP that the user
     * has signed in or signed up with a valid preVerifyToken.
     *
     * @return {promise}
     */
    afterSignIn: function () {
      return p(this.getBehavior('afterSignIn'));
    },

    /**
     * Called after a force auth.
     *
     * @return {promise}
     */
    afterForceAuth: function () {
      return p(this.getBehavior('afterForceAuth'));
    },

    /**
     * Called before confirmation polls to persist any data that is needed
     * for email verification. Useful for storing data that may be needed
     * by the verification tab.
     */
    persist: function () {
      return p();
    },

    /**
     * Called after the user has signed up but before the screen has
     * transitioned to the "confirm your email" screen.
     *
     * @return {promise}
     */
    afterSignUp: function () {
      return p(this.getBehavior('afterSignUp'));
    },

    /**
     * Called before signup email confirmation poll starts. Can be used
     * to notify the RP that the user has successfully signed up but
     * has not yet completed verification.
     *
     * @return {promise}
     */
    beforeSignUpConfirmationPoll: function () {
      return p(this.getBehavior('beforeSignUpConfirmationPoll'));
    },

    /**
     * Called after signup email confirmation poll completes. Can be used
     * to notify the RP that the user has successfully signed up and
     * completed verification.
     *
     * @return {promise}
     */
    afterSignUpConfirmationPoll: function () {
      return p(this.getBehavior('afterSignUpConfirmationPoll'));
    },

    /**
     * Called after signup email verification, in the verification tab.
     *
     * @return {promise}
     */
    afterCompleteSignUp: function () {
      return p(this.getBehavior('afterCompleteSignUp'));
    },

    /**
     * Called after password reset email confirmation poll completes.
     * Can be used to notify the RP that the user has sucessfully reset their
     * password.
     *
     * @return {promise}
     */
    afterResetPasswordConfirmationPoll: function () {
      return p(this.getBehavior('afterResetPasswordConfirmationPoll'));
    },

    /**
     * Called after password reset email verification, in the verification tab.
     *
     * @return {promise}
     */
    afterCompleteResetPassword: function () {
      return p(this.getBehavior('afterCompleteResetPassword'));
    },

    /**
     * Called after a user has changed their password.
     *
     * @return {promise}
     */
    afterChangePassword: function () {
      return p(this.getBehavior('afterChangePassword'));
    },

    /**
     * Called after a user has deleted their account.
     *
     * @return {promise}
     */
    afterDeleteAccount: function () {
      return p(this.getBehavior('afterDeleteAccount'));
    },

    /**
     * Transform the signin/signup links if necessary
     */
    transformLink: function (link) {
      return link;
    },

    /**
     * Check if the relier wants to force the user to auth with
     * a particular email.
     */
    isForceAuth: function () {
      return !! this._isForceAuth;
    },

    _isForceAuthUrl: function () {
      var pathname = this.window.location.pathname;
      return pathname === '/force_auth' || pathname === '/oauth/force_auth';
    },

    /**
     * Is the browser being automated? Set to true for selenium tests.
     */
    isAutomatedBrowser: function () {
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
       * should the *_complete pages show the marketing snippet?
       */
      emailVerificationMarketingSnippet: true,
      /**
       * Is signup supported? the fx_ios_v1 broker can disable it.
       */
      signup: true,
      /**
       * Should the *_complete pages show a `Sync preferences` button
       * if the relier is Firefox Sync?
       */
      syncPreferencesNotification: false
    },

    /**
     * Check if a capability is supported. A capability is not supported
     * if it's value is not a member of or falsy in `this.defaultCapabilities`.
     *
     * @param {string} capabilityName
     * @return {boolean}
     */
    hasCapability: function (capabilityName) {
      return this._capabilities.has(capabilityName) &&
             !! this._capabilities.get(capabilityName);
    },

    /**
     * Set whether a capability is supported
     *
     * @param {string} capabilityName
     * @param {variant} capabilityValue
     */
    setCapability: function (capabilityName, capabilityValue) {
      this._capabilities.set(capabilityName, capabilityValue);
    },

    /**
     * Remove support for a capability
     *
     * @param {string} capabilityName
     */
    unsetCapability: function (capabilityName) {
      this._capabilities.unset(capabilityName);
    },

    /**
     * Get the capability value
     *
     * @param {string} capabilityName
     * @return {variant}
     */
    getCapability: function (capabilityName) {
      return this._capabilities.get(capabilityName);
    }
  });

  _.extend(BaseAuthenticationBroker.prototype, SearchParamMixin);

  return BaseAuthenticationBroker;
});
