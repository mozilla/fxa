/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A broker that makes use of the WebChannel abstraction to communicate
 * with the browser
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const Cocktail = require('cocktail');
  const OAuthErrors = require('lib/oauth-errors');
  const ChannelMixin = require('models/auth_brokers/mixins/channel');
  const OAuthAuthenticationBroker = require('models/auth_brokers/oauth');
  const p = require('lib/promise');
  const Vat = require('lib/vat');
  const WebChannel = require('lib/channels/web');

  var proto = OAuthAuthenticationBroker.prototype;

  var QUERY_PARAMETER_SCHEMA = {
    webChannelId: Vat.string()
  };

  var WebChannelAuthenticationBroker = OAuthAuthenticationBroker.extend({
    type: 'web-channel',
    defaults: _.extend({}, proto.defaults, {
      webChannelId: null
    }),

    initialize: function (options) {
      options = options || {};

      // channel can be passed in for testing.
      this._channel = options.channel;

      return proto.initialize.call(this, options);
    },

    fetch: function () {
      var self = this;
      return proto.fetch.call(this)
        .then(function () {
          if (self._isVerificationFlow()) {
            self._setupVerificationFlow();
          } else {
            self._setupSigninSignupFlow();
          }
        });
    },

    sendOAuthResultToRelier: function (result) {
      if (result.closeWindow !== true) {
        result.closeWindow = false;
      }

      // the WebChannel does not respond, create a promise
      // that immediately resolves.
      this.send('oauth_complete', result);
      return p();
    },

    /**
     * WebChannel reliers can request access to relier-specific encryption
     * keys.  In the future this logic may be lifted into the base OAuth class
     * and made available to all reliers, but we're putting it in this subclass
     * for now to guard against accidental exposure.
     *
     * If the relier indicates that they want keys, the OAuth result will
     * get an additional property 'keys', an object containing relier-specific
     * keys 'kAr' and 'kBr'.
     */

    getOAuthResult: function (account) {
      var self = this;
      return proto.getOAuthResult.call(this, account)
        .then(function (result) {
          if (! self.relier.wantsKeys()) {
            return result;
          }

          return account.relierKeys(self.relier)
            .then(function (relierKeys) {
              result.keys = relierKeys;
              return result;
            });
        });
    },

    afterSignIn: function (account, additionalResultData) {
      if (! additionalResultData) {
        additionalResultData = {};
      }
      additionalResultData.closeWindow = true;
      return proto.afterSignIn.call(
                this, account, additionalResultData);
    },

    afterSignInConfirmationPoll (account, additionalResultData = {}) {
      additionalResultData.closeWindow = true;
      return proto.afterSignInConfirmationPoll.call(
                this, account, additionalResultData);
    },

    afterForceAuth: function (account, additionalResultData) {
      if (! additionalResultData) {
        additionalResultData = {};
      }
      additionalResultData.closeWindow = true;
      return proto.afterForceAuth.call(
                this, account, additionalResultData);
    },

    beforeSignUpConfirmationPoll: function (account) {
      // If the relier wants keys, the signup verification tab will need
      // to be able to fetch them in order to complete the flow.
      // Send them as part of the oauth session data.
      if (this.relier.wantsKeys()) {
        this.session.set('oauth', _.extend({}, this.session.oauth, {
          keyFetchToken: account.get('keyFetchToken'),
          unwrapBKey: account.get('unwrapBKey')
        }));
      }
    },

    /**
     * If the user has to go through an email verification loop, they could
     * wind up with two tabs open that are both capable of completing the OAuth
     * flow.  To avoid sending duplicate webchannel events, and to avoid double
     * use of the keyFetchToken when the relier wants keys, we coordinate via
     * session data to ensure that only a single tab completes the flow.
     *
     * If session.oauth exists then there's an outstanding flow to be completed.
     * If it is empty then another tab must have completed the flow.
     *
     * There's still a small race window that would allow both tabs to complete,
     * but it's unlikely to trigger in practice.
     */

    hasPendingOAuthFlow: function () {
      this.session.reload();
      return !! (this.session.oauth);
    },

    afterSignUpConfirmationPoll: function (account) {
      if (this.hasPendingOAuthFlow()) {
        return this.finishOAuthSignUpFlow(account);
      }
      return p();
    },

    afterCompleteSignUp: function (account) {
      // The original tab may be closed, so the verification tab should
      // send the OAuth result to the browser to ensure the flow completes.
      //
      // The slight delay here is to allow the functional tests time to
      // bind event handlers before the flow completes.
      var self = this;
      return proto.afterCompleteSignUp.call(self, account)
        .delay(100)
        .then(function (behavior) {
          if (self.hasPendingOAuthFlow()) {
            // This tab won't have access to key-fetching material, so
            // retreive it from the session if necessary.
            if (self.relier.wantsKeys()) {
              account.set('keyFetchToken', self.session.oauth.keyFetchToken);
              account.set('unwrapBKey', self.session.oauth.unwrapBKey);
            }
            return self.finishOAuthSignUpFlow(account);
          }

          return behavior;
        });
    },

    afterResetPasswordConfirmationPoll: function (account) {
      if (this.hasPendingOAuthFlow()) {
        return this.finishOAuthSignInFlow(account);
      }
      return p();
    },

    afterCompleteResetPassword: function (account) {
      // The original tab may be closed, so the verification tab should
      // send the OAuth result to the browser to ensure the flow completes.
      //
      // The slight delay here is to allow the functional tests time to
      // bind event handlers before the flow completes.
      var self = this;
      return proto.afterCompleteResetPassword.call(self, account)
        .delay(100)
        .then(function (behavior) {
          if (self.hasPendingOAuthFlow()) {
            return self.finishOAuthSignInFlow(account);
          }

          return behavior;
        });
    },

    // used by the ChannelMixin to get a channel.
    getChannel: function () {
      if (this._channel) {
        return this._channel;
      }

      var channel = new WebChannel(this.get('webChannelId'));
      channel.initialize({
        window: this.window
      });

      return channel;
    },

    _isVerificationFlow: function () {
      return !! this.getSearchParam('code');
    },

    _setupSigninSignupFlow: function () {
      this.importSearchParamsUsingSchema(QUERY_PARAMETER_SCHEMA, OAuthErrors);
    },

    _setupVerificationFlow: function () {
      var resumeObj = this.session.oauth;

      if (! resumeObj) {
        // user is verifying in a second browser. The browser is not
        // listening for messages.
        return;
      }

      this.set('webChannelId', resumeObj.webChannelId);
    }
  });

  Cocktail.mixin(
    WebChannelAuthenticationBroker,
    ChannelMixin
  );

  module.exports = WebChannelAuthenticationBroker;
});
