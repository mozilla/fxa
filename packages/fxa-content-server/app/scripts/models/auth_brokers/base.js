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
  'underscore',
], function (Backbone, p, SearchParamMixin, _) {
  'use strict';

  var BaseAuthenticationBroker = Backbone.Model.extend({
    type: 'base',

    initialize: function (options) {
      options = options || {};

      this.relier = options.relier;
      this.window = options.window || window;

      this._behaviors = _.extend({}, this.defaultBehaviors);
      this._capabilities = new Backbone.Model(this.defaultCapabilities);
    },

    /**
     * The default list of behaviors. Behaviors indicate a view's next step
     * once a broker's function has completed. A subclass can override one
     * or more behavior.
     *
     * A behavior should specify a `halt` value. In the future, `redirectTo`
     * will be supported as well.
     *
     * @property defaultBehaviors
     */
    defaultBehaviors: {
      afterChangePassword: {
        halt: false
      },
      afterCompleteResetPassword: {
        halt: false
      },
      afterCompleteSignUp: {
        halt: false
      },
      afterDeleteAccount: {
        halt: false
      },
      afterResetPasswordConfirmationPoll: {
        halt: false
      },
      afterSignIn: {
        halt: false
      },
      afterSignUpConfirmationPoll: {
        halt: false
      },
      beforeSignIn: {
        halt: false
      },
      beforeSignUpConfirmationPoll: {
        halt: false
      }
    },

    /**
     * Set a behavior
     *
     * @param {string} behaviorName
     * @param {object} value
     */
    setBehavior: function (behaviorName, value) {
      this._behaviors[behaviorName] = value;
    },

    /**
     * Get a behavior
     *
     * @param {string} behaviorName
     * @return {object}
     */
    getBehavior: function (behaviorName) {
      var behavior = this._behaviors[behaviorName];
      if (! behavior) {
        throw new Error('behavior not found for: ' + behaviorName);
      }

      return behavior;
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
     * Resolve promise with an object that contains `{ halt: true }` to
     * prevent the "signin" screen from transitioning to "settings" if
     * the browser or OAuth flow completes the action.
     *
     * @return {promise}
     */
    afterSignIn: function () {
      return p(this.getBehavior('afterSignIn'));
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
     * Resolve promise with an object that contains `{ halt: true }` to
     * prevent the "confirm" screen from transitioning to "signup_complete"
     * if the browser or OAuth flow completes the action.
     *
     * @return {promise}
     */
    afterSignUpConfirmationPoll: function () {
      return p(this.getBehavior('afterSignUpConfirmationPoll'));
    },

    /**
     * Called after signup email verification, in the verification tab.
     *
     * Resolve promise with an object that contains `{ halt: true }` to
     * prevent the "complete_signup" screen from transitioning to
     * "signup_complete" if the browser or OAuth flow completes the action.
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
     * Resolve promise with an object that contains `{ halt: true }` to
     * prevent the "reset_password" screen from transitioning to
     * "reset_password_complete" if the browser or OAuth flow completes
     * the action.
     *
     * @return {promise}
     */
    afterResetPasswordConfirmationPoll: function () {
      return p(this.getBehavior('afterResetPasswordConfirmationPoll'));
    },

    /**
     * Called after password reset email verification, in the verification tab.
     *
     * Resolve promise with an object that contains `{ halt: true }` to
     * prevent the "complete_reset_password" screen from transitioning to
     * "reset_password_complete" if the browser or OAuth flow completes
     * the action.
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
      signup: true
    },

    /**
     * Check if a capability is supported.
     *
     * @param {string} capabilityName
     * @return {boolean}
     */
    hasCapability: function (capabilityName) {
      return this._capabilities.has(capabilityName);
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
