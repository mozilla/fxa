/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A broker is a model that knows how to handle interaction with
 * the outside world.
 */
'use strict';

define([
  'underscore',
  'backbone',
  'lib/promise',
  'models/mixins/search-param'
], function (_, Backbone, p, SearchParamMixin) {

  var BaseAuthenticationBroker = Backbone.Model.extend({
    initialize: function (options) {
      options = options || {};

      this.relier = options.relier;
      this.window = options.window || window;
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
        });
    },

    /**
     * Select the start page. Returned promise can resolve to a string that
     * will cause the start page to redirect. If returned promise resolves
     * to a 'falsy' value, no redirection will occur.
     * @returns {Promise}
     */
    selectStartPage: function () {
      // the default is to use the page set in the URL
      return p();
    },

    /**
     * Check whether the can link account warning should be shown
     */
    checkCanLinkAccount: function () {
      return p();
    },

    /**
     * Called after sign in
     */
    afterSignIn: function () {
      return p();
    },

    /**
     * Should the settings screen be shown after the user signs in.
     */
    shouldShowSettingsAfterSignIn: function () {
      return true;
    },

    /**
     * Called in the original tab before the poll to check if the email is
     * confirmed starts.
     */
    beforeSignUpConfirmationPoll: function () {
      return p();
    },

    /**
     * Called in the original tab after the poll that checks if the email is
     * confirmed has finished.
     */
    afterSignUpConfirmationPoll: function () {
      return p();
    },

    /**
     * Should the signup_complete screen be shown in the original
     * tab after the confirmation poll completes
     */
    shouldShowSignUpCompleteAfterPoll: function () {
      return true;
    },

    /**
     * Called in the verification tab after an email is verified.
     */
    afterSignUpVerified: function () {
      return p();
    },

    /**
     * Called in the original tab before the poll to check if the password
     * is reset starts.
     */
    beforeResetPasswordConfirmationPoll: function () {
      return p();
    },

    /**
     * Called in the original tab after the poll that checks if the password
     * is reset has finished.
     */
    afterResetPasswordConfirmationPoll: function () {
      return p();
    },

    /**
     * Should the reset_password_complete screen be shown in the original
     * tab after the reset password confirmation poll completes
     */
    shouldShowResetPasswordCompleteAfterPoll: function () {
      return true;
    },

    /**
     * Called in the verification tab after the password has been reset.
     */
    afterResetPasswordVerified: function () {
      return p();
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
      return this.window.location.pathname === '/force_auth';
    }
  });

  _.extend(BaseAuthenticationBroker.prototype, SearchParamMixin);

  return BaseAuthenticationBroker;
});
