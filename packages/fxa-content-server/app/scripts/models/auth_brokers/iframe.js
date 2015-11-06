/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Finishes the OAuth flow by redirecting the window.

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var ChannelMixin = require('models/auth_brokers/mixins/channel');
  var OAuthAuthenticationBroker = require('models/auth_brokers/oauth');

  var IframeAuthenticationBroker = OAuthAuthenticationBroker.extend({
    type: 'iframe',
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

  module.exports = IframeAuthenticationBroker;
});
