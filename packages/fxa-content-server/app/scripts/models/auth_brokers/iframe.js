/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Finishes the OAuth flow by redirecting the window.

'use strict';

define([
  'underscore',
  'jquery',
  'lib/promise',
  'lib/channels/iframe',
  'lib/auth-errors',
  'models/auth_brokers/oauth',
  'models/auth_brokers/mixins/channel'
], function (_, $, p, IframeChannel, AuthErrors, OAuthAuthenticationBroker,
        ChannelMixin) {

  // A `ping` is sent out to the expected relier. The relier must respond.
  // No response will be received if the parent is either:
  // 1. not set up to respond correctly
  // 2. not the expected origin
  //
  // either case is an error
  function checkIframedByExpectedOrigin(context) {
    //jshint validthis: true
    return context.send('ping');
  }

  var IframeAuthenticationBroker = OAuthAuthenticationBroker.extend({
    initialize: function (options) {
      options = options || {};

      // channel can be passed in for testing.
      this._channel = options.channel;

      return OAuthAuthenticationBroker.prototype.initialize.call(
          this, options);
    },

    // used by the ChannelMixin to get a channel.
    getChannel: function () {
      return this._channel;
    },

    selectStartPage: function () {
      var self = this;
      return checkIframedByExpectedOrigin(self)
        .then(function () {
          return OAuthAuthenticationBroker.prototype.selectStartPage.call(self);
        });
    },

    sendOAuthResultToRelier: function (result) {
      return this.send('oauth_complete', result);
    },

    canCancel: function () {
      return true;
    },

    cancel: function () {
      return this.send('oauth_cancel');
    },

    afterLoaded: function () {
      return this.send('loaded');
    }
  });

  _.extend(IframeAuthenticationBroker.prototype, ChannelMixin);

  return IframeAuthenticationBroker;
});
