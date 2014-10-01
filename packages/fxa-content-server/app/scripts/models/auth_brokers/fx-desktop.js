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
  'lib/constants'
], function (_, BaseAuthenticationBroker, ChannelMixin, p, AuthErrors,
        FxDesktopChannel, Constants) {

  var FxDesktopAuthenticationBroker = BaseAuthenticationBroker.extend({
    initialize: function (options) {
      options = options || {};

      // channel can be passed in for testing.
      this._channel = options.channel;
      this._session = options.session;

      return BaseAuthenticationBroker.prototype.initialize.call(
          this, options);
    },

    fetch: function () {
      var self = this;

      return BaseAuthenticationBroker.prototype.fetch.call(self)
        .then(function () {
          // only fetch session_status if the user is trying to sign up or
          // sign in. If session_status is fetched during verification,
          // the browser is not listening and a channel timeout occurs.
          if (! self._isSignUpOrSignIn()) {
            return;
          }

          return self.send('session_status', {})
            .then(function (response) {
              return response.data;
            })
            .then(_.bind(self._initializeSession, self));
        });
    },

    selectStartPage: function () {
      var self = this;
      return p().then(function () {
        var canRedirect = self.window.location.pathname === '/';
        if (canRedirect) {
          if (self.isForceAuth()) {
            return 'force_auth';
          } else if (self._isUserAuthenticated()) {
            return 'settings';
          } else {
            return 'signup';
          }
        }
      });
    },

    checkCanLinkAccount: function (email) {
      var self = this;
      // This will send a message over the channel to determine whether
      // we should cancel the login to sync or not based on Desktop
      // specific checks and dialogs. It throws an error with
      // message='USER_CANCELED_LOGIN' and errno=1001 if that's the case.
      self._verifiedCanLinkAccount = true;
      return self.send('can_link_account', { email: email })
        .then(function (response) {
          if (response && response.data && ! response.data.ok) {
            throw AuthErrors.toError('USER_CANCELED_LOGIN');
          }

          self._verifiedCanLinkAccount = true;
        }, function (err) {
          console.error('checkCanLinkAccount failed with', err);
          // If the browser doesn't implement this command, then it will
          // handle prompting the relink warning after sign in completes.
          // This can likely be changed to 'reject' after Fx31 hits nightly,
          // because all browsers will likely support 'can_link_account'
        });
    },

    notifyOfLogin: function () {
      return this.send('login', this._getLoginData());
    },

    afterSignIn: function () {
      return this.notifyOfLogin();
    },

    shouldShowSettingsAfterSignIn: function () {
      return false;
    },

    afterSignUpConfirmationPoll: function () {
      return this.notifyOfLogin();
    },

    afterResetPasswordConfirmationPoll: function () {
      return this.notifyOfLogin();
    },

    shouldShowResetPasswordCompleteAfterPoll: function () {
      return false;
    },

    // used by the ChannelMixin to get a channel.
    getChannel: function () {
      var channel = this._channel || new FxDesktopChannel();

      channel.init({
        window: this.window
      });

      return channel;
    },

    _initializeSession: function (sessionStatus) {
      var self = this;
      var session = self._session;
      self._sessionStatus = sessionStatus;

      return p().then(function () {
        if (self.isForceAuth()) {
          session.clear();
        } else if (! sessionStatus) {
          session.clear();
        } else {
          // TODO - this should go in a User model when ready.
          session.set('email', sessionStatus.email);
        }
      });
    },

    _isSignUpOrSignIn: function () {
      return this.getSearchParam('context') === Constants.FX_DESKTOP_CONTEXT;
    },

    _isUserAuthenticated: function () {
      return !! (this._sessionStatus && this._sessionStatus.email);
    },

    _getLoginData: function () {
      var ALLOWED_FIELDS = [
        'email',
        'uid',
        'sessionToken',
        'sessionTokenContext',
        'unwrapBKey',
        'keyFetchToken',
        'customizeSync',
        'cachedCredentials'
      ];

      var session = this._session;
      var loginData = {};
      _.each(ALLOWED_FIELDS, function (field) {
        loginData[field] = session[field];
      });

      loginData.verifiedCanLinkAccount = !! this._verifiedCanLinkAccount;
      return loginData;
    }
  });

  _.extend(FxDesktopAuthenticationBroker.prototype, ChannelMixin);

  return FxDesktopAuthenticationBroker;
});

