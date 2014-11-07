/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This model abstracts interaction between the user's account
// and the profile server and also handles (de)serialization.

'use strict';

define([
  'backbone',
  'underscore',
  'lib/promise',
  'lib/auth-errors',
  'lib/constants'
], function (Backbone, _, p, AuthErrors, Constants) {

  var DEFAULTS = {
    uid: undefined,
    email: undefined,
    sessionToken: undefined,
    sessionTokenContext: undefined,
    accessToken: undefined,
    verified: undefined,
    lastLogin: undefined
  };

  var ALLOWED_KEYS = Object.keys(DEFAULTS);

  var Account = Backbone.Model.extend({
    defaults: DEFAULTS,

    initialize: function (options) {
      options = options || {};
      var self = this;

      if (options.accountData) {
        ALLOWED_KEYS.forEach(function (key) {
          self.set(key, options.accountData[key]);
        });
      }

      self._oAuthClientId = options.oAuthClientId;
      self._oAuthClient = options.oAuthClient;
      self._assertion = options.assertion;
      self._profileClient = options.profileClient;
    },

    // Hydrate the account
    fetch: function () {
      var self = this;

      // upgrade the credentials with an accessToken
      if (self._needsAccessToken()) {
        return self._getAccessTokenFromSessionToken(self.get('sessionToken'))
          .then(function (accessToken) {
            self.set('accessToken', accessToken);
            // if we can sign a cert, we must be verified
            self.set('verified', true);
          }, function (err) {
            if (AuthErrors.is(err, 'UNVERIFIED_ACCOUNT')) {
              self.set('verified', false);
              return;
            }
          });
      } else {
        return p();
      }
    },

    profileClient: function () {
      var self = this;
      return self.fetch()
        .then(function () {
          return self._profileClient;
        });
    },

    isFromSync: function () {
      return this.get('sessionTokenContext') === Constants.FX_DESKTOP_CONTEXT;
    },

    isEmpty: function () {
      return ! _.find(this.attributes, function (attr) {
        return !!attr;
      });
    },

    // If the account doesn't have an accessToken (or isn't verified),
    // we should attempt to fetch an access token. That will determine if
    // the account has since been verified and retrieve said access token.
    // The sessionToken is needed to perform the fetch.
    _needsAccessToken: function () {
      return this.get('sessionToken') &&
        (! this.get('accessToken') || ! this.get('verified'));
    },

    _getAccessTokenFromSessionToken: function (sessionToken) {
      /* jshint camelcase: false */
      var self = this;
      var params = {
        client_id: self._oAuthClientId,
        scope: 'profile:write'
      };

      return self._assertion.generate(sessionToken)
        .then(function (assertion) {
          params.assertion = assertion;
          return self._oAuthClient.getToken(params);
        })
        .then(function (result) {
          return result.access_token;
        });
    },

    isVerified: function () {
      return this._getAccessTokenFromSessionToken(this.get('sessionToken'))
        .then(function () {
          return true;
        }, function (err) {
          if (AuthErrors.is(err, 'UNVERIFIED_ACCOUNT')) {
            return false;
          }

          throw err;
        });
    }

  });

  ['getAvatar', 'getAvatars', 'postAvatar', 'deleteAvatar', 'uploadAvatar']
    .forEach(function (method) {
      Account.prototype[method] = function () {
        var self = this;
        var args = Array.prototype.slice.call(arguments, 0);
        return self.profileClient()
          .then(function (profileClient) {
            return profileClient[method].apply(profileClient, [self.get('accessToken')].concat(args));
          });
      };
    });


  return Account;
});
