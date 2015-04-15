/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A broker that knows how to communicate with Firefox when used for Sync.
 */

'use strict';

define([
  'underscore',
  'models/auth_brokers/base',
  'models/auth_brokers/mixins/channel',
  'lib/promise',
  'lib/auth-errors',
  'lib/channels/fx-desktop',
  'lib/url'
], function (_, BaseAuthenticationBroker, ChannelMixin, p, AuthErrors,
        FxDesktopChannel, Url) {

  var FxDesktopAuthenticationBroker = BaseAuthenticationBroker.extend({
    initialize: function (options) {
      options = options || {};

      // channel can be passed in for testing.
      this._channel = options.channel;
      this._session = options.session;
      this._metrics = options.metrics;

      return BaseAuthenticationBroker.prototype.initialize.call(
          this, options);
    },

    afterLoaded: function () {
      return this.send('loaded');
    },

    beforeSignIn: function (email) {
      var self = this;
      // This will send a message over the channel to determine whether
      // we should cancel the login to sync or not based on Desktop
      // specific checks and dialogs. It throws an error with
      // message='USER_CANCELED_LOGIN' and errno=1001 if that's the case.
      return self.send('can_link_account', { email: email })
        .then(function (response) {
          if (response && response.data && ! response.data.ok) {
            throw AuthErrors.toError('USER_CANCELED_LOGIN');
          }

          self._verifiedCanLinkAccount = true;
        }, function (err) {
          console.error('beforeSignIn failed with', err);
          // If the browser doesn't implement this command, then it will
          // handle prompting the relink warning after sign in completes.
          // This can likely be changed to 'reject' after Fx31 hits nightly,
          // because all browsers will likely support 'can_link_account'
        });
    },

    afterSignIn: function (account) {
      return this._notifyRelierOfLogin(account)
        .then(function () {
          // the browser will take over from here,
          // don't let the screen transition.
          return { halt: true };
        });
    },

    beforeSignUpConfirmationPoll: function (account) {
      // The Sync broker notifies the browser of an unverified login
      // before the user has verified her email. This allows the user
      // to close the original tab or open the verification link in
      // the about:accounts tab and have Sync still successfully start.
      return this._notifyRelierOfLogin(account)
        .then(function () {
          // the browser is already polling, no need for the content server
          // code to poll as well, otherwise two sets of polls are going on
          // for the same user.
          return { halt: true };
        });
    },

    afterResetPasswordConfirmationPoll: function (account) {
      return this._notifyRelierOfLogin(account)
        .then(function () {
          // the browser will take over from here,
          // don't let the screen transition.
          return { halt: true };
        });
    },

    afterChangePassword: function (account) {
      // no response is expected, so do not wait for one
      this.send('change_password', this._getLoginData(account));
      return p();
    },

    afterDeleteAccount: function (account) {
      // no response is expected, so do not wait for one
      this.send('delete_account', {
        email: account.get('email'),
        uid: account.get('uid')
      });
      return p();
    },

    // used by the ChannelMixin to get a channel.
    getChannel: function () {
      var channel = this._channel || new FxDesktopChannel();

      channel.init({
        window: this.window,
        // Fx Desktop browser will send messages with an origin of the string
        // `null`. These messages are trusted by the channel by default.
        //
        // 1) Fx on iOS and functional tests will send messages from the
        // content server itself. Accept messages from the content
        // server to handle these cases.
        // 2) Fx 18 (& FxOS 1.*) do not support location.origin. Build the origin from location.href
        origin: this.window.location.origin || Url.getOrigin(this.window.location.href),
        metrics: this._metrics
      });

      return channel;
    },

    _notifyRelierOfLogin: function (account) {
      return this.send('login', this._getLoginData(account));
    },

    _getLoginData: function (account) {
      var ALLOWED_FIELDS = [
        'email',
        'uid',
        'sessionToken',
        'sessionTokenContext',
        'unwrapBKey',
        'keyFetchToken',
        'customizeSync',
        'verified'
      ];

      var loginData = {};
      _.each(ALLOWED_FIELDS, function (field) {
        loginData[field] = account.get(field);
      });

      loginData.verified = !! loginData.verified;
      loginData.verifiedCanLinkAccount = !! this._verifiedCanLinkAccount;
      return loginData;
    }
  });

  _.extend(FxDesktopAuthenticationBroker.prototype, ChannelMixin);

  return FxDesktopAuthenticationBroker;
});

