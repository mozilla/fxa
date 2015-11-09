/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A broker is a model that knows how to handle interaction with
 * the outside world.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Backbone = require('backbone');
  var NullBehavior = require('views/behaviors/null');
  var p = require('lib/promise');
  var SameBrowserVerificationModel = require('models/verification/same-browser');
  var SearchParamMixin = require('models/mixins/search-param');

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
      afterCompleteAccountUnlock: new NullBehavior(),
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
     * Called after the first view is rendered. Can be used
     * to notify the RP the system is loaded.
     */
    afterLoaded: function () {
      return p();
    },


    /**
     * Called before sign in. Can be used to prevent sign in.
     *
     * @param {object} account
     * @return {promise}
     */
    beforeSignIn: function (/* account */) {
      return p(this.getBehavior('beforeSignIn'));
    },

    /**
     * Called after sign in. Can be used to notify the RP that the user
     * has signed in or signed up with a valid preVerifyToken.
     *
     * @param {object} account
     * @return {promise}
     */
    afterSignIn: function (/* account */) {
      return p(this.getBehavior('afterSignIn'));
    },

    /**
     * Called after a force auth.
     *
     * @param {object} account
     * @return {promise}
     */
    afterForceAuth: function (/* account */) {
      return p(this.getBehavior('afterForceAuth'));
    },

    /**
     * Called before confirmation polls to persist any data that is needed
     * for email verification. Useful for storing data that may be needed
     * by the verification tab.
     *
     * @param {object} account
     * @return {promise}
     */
    persistVerificationData: function (account) {
      var self = this;

      return p().then(function () {
        // verification info is persisted to localStorage so that
        // the same `context` is used if the user verifies in the same browser.
        // If the user verifies in a different browser, the
        // default (direct access) context will be used.
        var verificationInfo =
              createSameBrowserVerificationModel(account, 'context');

        verificationInfo.set({
          context: self.relier.get('context')
        });

        return verificationInfo.persist();
      });
    },

    /**
     * Clear persisted verification data for the account
     *
     * @param {object} account
     * @return {promise}
     */
    unpersistVerificationData: function (account) {
      return p().then(function () {
        clearSameBrowserVerificationModel(account, 'context');
      });
    },

    /**
     * Called after the user has signed up but before the screen has
     * transitioned to the "confirm your email" view.
     *
     * @param {object} account
     * @return {promise}
     */
    afterSignUp: function (/* account */) {
      return p(this.getBehavior('afterSignUp'));
    },

    /**
     * Called before signup email confirmation poll starts. Can be used
     * to notify the RP that the user has successfully signed up but
     * has not yet completed verification.
     *
     * @param {object} account
     * @return {promise}
     */
    beforeSignUpConfirmationPoll: function (/* account */) {
      return p(this.getBehavior('beforeSignUpConfirmationPoll'));
    },

    /**
     * Called after signup email confirmation poll completes. Can be used
     * to notify the RP that the user has successfully signed up and
     * completed verification.
     *
     * @param {object} account
     * @return {promise}
     */
    afterSignUpConfirmationPoll: function (/* account */) {
      return p(this.getBehavior('afterSignUpConfirmationPoll'));
    },

    /**
     * Called after signup email verification, in the verification tab.
     *
     * @param {object} account
     * @return {promise}
     */
    afterCompleteSignUp: function (account) {
      var self = this;
      return self.unpersistVerificationData(account)
        .then(function () {
          return self.getBehavior('afterCompleteSignUp');
        });
    },

    /**
     * Called after password reset email confirmation poll completes.
     * Can be used to notify the RP that the user has sucessfully reset their
     * password.
     *
     * @param {object} account
     * @return {promise}
     */
    afterResetPasswordConfirmationPoll: function (/* account */) {
      return p(this.getBehavior('afterResetPasswordConfirmationPoll'));
    },

    /**
     * Called after password reset email verification, in the verification tab.
     *
     * @param {object} account
     * @return {promise}
     */
    afterCompleteResetPassword: function (account) {
      var self = this;
      return self.unpersistVerificationData(account)
        .then(function () {
          return self.getBehavior('afterCompleteResetPassword');
        });
    },

    /**
     * Called after a user has changed their password.
     *
     * @param {object} account
     * @return {promise}
     */
    afterChangePassword: function (/* account */) {
      return p(this.getBehavior('afterChangePassword'));
    },

    /**
     * Called after a user has deleted their account.
     *
     * @param {object} account
     * @return {promise}
     */
    afterDeleteAccount: function (/* account */) {
      return p(this.getBehavior('afterDeleteAccount'));
    },

    /**
     * Called after an account is unlocked, in the verification tab.
     *
     * @param {object} account
     * @return {promise}
     */
    afterCompleteAccountUnlock: function (account) {
      var self = this;
      return self.unpersistVerificationData(account)
        .then(function () {
          return self.getBehavior('afterCompleteAccountUnlock');
        });
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

  _.extend(BaseAuthenticationBroker.prototype, SearchParamMixin);

  module.exports = BaseAuthenticationBroker;
});
