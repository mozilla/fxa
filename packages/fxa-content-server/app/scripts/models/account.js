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
  'lib/profile-client',
  'lib/constants'
], function (Backbone, _, p, AuthErrors, ProfileClient, Constants) {

  // Account attributes that can be persisted
  var PERSISTENT = {
    uid: undefined,
    email: undefined,
    sessionToken: undefined,
    sessionTokenContext: undefined,
    accessToken: undefined,
    verified: undefined,
    lastLogin: undefined
  };

  var DEFAULTS = _.extend({
    password: undefined,
    unwrapBKey: undefined,
    keyFetchToken: undefined,
    customizeSync: undefined
  }, PERSISTENT);

  var ALLOWED_KEYS = Object.keys(DEFAULTS);
  var ALLOWED_PERSISTENT_KEYS = Object.keys(PERSISTENT);

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
      self._fxaClient = options.fxaClient;
    },

    // Hydrate the account
    fetch: function () {
      var self = this;
      var promise = p();

      if (! self.get('sessionToken')) {
        return promise;
      }

      // upgrade the credentials with verified state
      if (! self.get('verified')) {
        promise = self.isVerified()
          .then(function (verified) {
            self.set('verified', verified);
          }, function () {
            // Ignore errors; we'll just fetch again when needed
          });
      }

      // upgrade the credentials with an accessToken
      promise = promise.then(function () {
        if (self._needsAccessToken()) {
          return self._getAccessTokenFromSessionToken(self.get('sessionToken'))
            .then(function (accessToken) {
              self.set('accessToken', accessToken);
            }, function () {
              // Ignore errors; we'll just fetch again when needed
            });
        }
      });

      return promise;
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

    // returns true if all attributes within ALLOWED_KEYS are undefined
    isEmpty: function () {
      var self = this;
      return ! _.find(ALLOWED_KEYS, function (key) {
        return typeof self.get(key) !== 'undefined';
      });
    },

    // If we're verified and don't have an accessToken, we should
    // go ahead and get one.
    _needsAccessToken: function () {
      return this.get('verified') && ! this.get('accessToken');
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
      return this._fxaClient.recoveryEmailStatus(this.get('sessionToken'))
        .then(function (results) {
          return results.verified;
        });
    },

    toJSON: function () {
      return _.pick(this.attributes, ALLOWED_KEYS);
    },

    toPersistentJSON: function () {
      return _.pick(this.attributes, ALLOWED_PERSISTENT_KEYS);
    }

  });

  ['getAvatar', 'getAvatars', 'postAvatar', 'deleteAvatar', 'uploadAvatar']
    .forEach(function (method) {
      Account.prototype[method] = function () {
        var self = this;
        var args = Array.prototype.slice.call(arguments, 0);
        return self.profileClient()
          .then(function (profileClient) {
            var accessToken = self.get('accessToken');
            if (! accessToken) {
              return p.reject(ProfileClient.Errors.toError('UNAUTHORIZED'));
            } else {
              return profileClient[method].apply(profileClient, [accessToken].concat(args));
            }
          });
      };
    });


  return Account;
});
