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

  function getParentOrigin(context) {
    return context.send('ping')
      .then(function (data) {
        return data.origin;
      });
  }

  function getExpectedParentOrigin(relier) {
    // redirectUri comes from the oauthClient's getClientInfo, which is
    // populated on app start before the broker.
    var anchor = document.createElement('a');
    anchor.href = relier.get('redirectUri');

    return anchor.origin;
  }

  function checkOriginAllowedToIframe() {
    /*jshint validthis: true*/
    var self = this;
    return p.all([
      getParentOrigin(self),
      getExpectedParentOrigin(self.relier)
    ]).spread(function (parentOrigin, expectedOrigin) {
      if (parentOrigin !== expectedOrigin) {
        throw AuthErrors.toError('ILLEGAL_IFRAME_PARENT');
      }
    });
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
      if (! this._channel) {
        this._channel = new IframeChannel();
        this._channel.init({
          window: this.window
        });
      }

      return this._channel;
    },

    selectStartPage: function () {
      return checkOriginAllowedToIframe.call(this)
        .then(null, function (err) {
          if (AuthErrors.is(err, 'ILLEGAL_IFRAME_PARENT')) {
            return 'illegal_iframe';
          }
          throw err;
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
    }
  });

  _.extend(IframeAuthenticationBroker.prototype, ChannelMixin);

  return IframeAuthenticationBroker;
});
