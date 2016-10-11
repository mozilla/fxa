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

    initialize (options) {
      options = options || {};

      // channel can be passed in for testing.
      this._channel = options.channel;

      return proto.initialize.call(this, options);
    },

    fetch () {
      return proto.fetch.call(this)
        .then(() => {
          if (this._isVerificationFlow()) {
            this._setupVerificationFlow();
          } else {
            this._setupSigninSignupFlow();
          }
        });
    },

    sendOAuthResultToRelier (result) {
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

    getOAuthResult (account) {
      return proto.getOAuthResult.call(this, account)
        .then((result) => {
          if (! this.relier.wantsKeys()) {
            return result;
          }

          return account.relierKeys(this.relier)
            .then((relierKeys) => {
              result.keys = relierKeys;
              return result;
            });
        });
    },

    afterSignIn (account, additionalResultData) {
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

    afterForceAuth (account, additionalResultData) {
      if (! additionalResultData) {
        additionalResultData = {};
      }
      additionalResultData.closeWindow = true;
      return proto.afterForceAuth.call(
                this, account, additionalResultData);
    },

    beforeSignUpConfirmationPoll (account) {
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

    hasPendingOAuthFlow () {
      this.session.reload();
      return !! (this.session.oauth);
    },

    afterSignUpConfirmationPoll (account) {
      if (this.hasPendingOAuthFlow()) {
        return this.finishOAuthSignUpFlow(account);
      }
      return p();
    },

    afterCompleteSignUp (account) {
      // The original tab may be closed, so the verification tab should
      // send the OAuth result to the browser to ensure the flow completes.
      //
      // The slight delay here is to allow the functional tests time to
      // bind event handlers before the flow completes.
      return proto.afterCompleteSignUp.call(this, account)
        .delay(100)
        .then((behavior) => {
          if (this.hasPendingOAuthFlow()) {
            // This tab won't have access to key-fetching material, so
            // retreive it from the session if necessary.
            if (this.relier.wantsKeys()) {
              account.set('keyFetchToken', this.session.oauth.keyFetchToken);
              account.set('unwrapBKey', this.session.oauth.unwrapBKey);
            }
            return this.finishOAuthSignUpFlow(account);
          }

          return behavior;
        });
    },

    afterResetPasswordConfirmationPoll (account) {
      if (this.hasPendingOAuthFlow()) {
        return this.finishOAuthSignInFlow(account);
      }
      return p();
    },

    afterCompleteResetPassword (account) {
      // The original tab may be closed, so the verification tab should
      // send the OAuth result to the browser to ensure the flow completes.
      //
      // The slight delay here is to allow the functional tests time to
      // bind event handlers before the flow completes.
      return proto.afterCompleteResetPassword.call(this, account)
        .delay(100)
        .then((behavior) => {
          if (this.hasPendingOAuthFlow()) {
            return this.finishOAuthSignInFlow(account);
          }

          return behavior;
        });
    },

    // used by the ChannelMixin to get a channel.
    getChannel () {
      if (this._channel) {
        return this._channel;
      }

      var channel = new WebChannel(this.get('webChannelId'));
      channel.initialize({
        window: this.window
      });

      return channel;
    },

    _isVerificationFlow () {
      return !! this.getSearchParam('code');
    },

    _setupSigninSignupFlow () {
      this.importSearchParamsUsingSchema(QUERY_PARAMETER_SCHEMA, OAuthErrors);
    },

    _setupVerificationFlow () {
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
