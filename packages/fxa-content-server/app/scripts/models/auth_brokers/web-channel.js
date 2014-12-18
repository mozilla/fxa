/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A broker that makes use of the WebChannel abstraction to communicate
 * with the browser
 */

'use strict';

define([
  'underscore',
  'models/auth_brokers/oauth',
  'models/auth_brokers/mixins/channel',
  'lib/promise',
  'lib/channels/web'
], function (_, OAuthAuthenticationBroker, ChannelMixin, p, WebChannel) {

  var WebChannelAuthenticationBroker = OAuthAuthenticationBroker.extend({
    defaults: _.extend({}, OAuthAuthenticationBroker.prototype.defaults, {
      webChannelId: null
    }),

    initialize: function (options) {
      options = options || {};

      // channel can be passed in for testing.
      this._channel = options.channel;

      return OAuthAuthenticationBroker.prototype.initialize.call(this, options);
    },

    fetch: function () {
      var self = this;
      return OAuthAuthenticationBroker.prototype.fetch.call(this)
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

    afterSignIn: function (account) {
      return OAuthAuthenticationBroker.prototype.afterSignIn.call(
                this, account, { closeWindow: true });
    },

    afterCompleteSignUp: function (account) {
      // The original tab may be closed, so the verification tab should
      // send the OAuth result to the browser to ensure the flow completes.
      //
      // The slight delay is to allow the functional tests time to bind
      // event handlers before the flow completes.
      var self = this;
      return p().delay(100).then(_.bind(self.finishOAuthFlow, self, account));
    },

    afterCompleteResetPassword: function (account) {
      // The original tab may be closed, so the verification tab should
      // send the OAuth result to the browser to ensure the flow completes.
      return this.finishOAuthFlow(account);
    },

    // used by the ChannelMixin to get a channel.
    getChannel: function () {
      if (this._channel) {
        return this._channel;
      }

      var channel = new WebChannel(this.get('webChannelId'));
      channel.init({
        window: this.window
      });

      return channel;
    },

    _isVerificationFlow: function () {
      return !! this.getSearchParam('code');
    },

    _setupSigninSignupFlow: function () {
      this.importSearchParam('webChannelId');
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

  _.extend(WebChannelAuthenticationBroker.prototype, ChannelMixin);
  return WebChannelAuthenticationBroker;
});
