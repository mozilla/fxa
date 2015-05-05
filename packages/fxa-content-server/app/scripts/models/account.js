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
  'lib/constants',
  'models/profile-image'
], function (Backbone, _, p, AuthErrors, ProfileClient, Constants, ProfileImage) {

  // Account attributes that can be persisted
  var PERSISTENT = {
    uid: undefined,
    email: undefined,
    sessionToken: undefined,
    sessionTokenContext: undefined,
    accessToken: undefined,
    verified: undefined,
    profileImageUrl: undefined,
    profileImageId: undefined,
    lastLogin: undefined,
    grantedPermissions: undefined
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
          if (typeof options.accountData[key] !== 'undefined') {
            self.set(key, options.accountData[key]);
          }
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

    // returns true if all attributes within ALLOWED_KEYS are defaults
    isDefault: function () {
      var self = this;
      return ! _.find(ALLOWED_KEYS, function (key) {
        return self.get(key) !== DEFAULTS[key];
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

    isSignedIn: function () {
      return this._fxaClient.isSignedIn(this.get('sessionToken'));
    },

    toJSON: function () {
      return _.pick(this.attributes, ALLOWED_KEYS);
    },

    toPersistentJSON: function () {
      return _.pick(this.attributes, ALLOWED_PERSISTENT_KEYS);
    },

    setProfileImage: function (profileImage) {
      this.set('profileImageUrl', profileImage.get('url'));
      this.set('profileImageId', profileImage.get('id'));
    },

    fetchCurrentProfileImage: function () {
      var self = this;
      var profileImage = new ProfileImage();

      return self.getAvatar()
        .then(function (result) {
          profileImage = new ProfileImage({ url: result.avatar, id: result.id });
          return profileImage.fetch();
        })
        .then(function () {
          return profileImage;
        });
    },

    signIn: function (relier) {
      var self = this;
      return p().then(function () {
        var password = self.get('password');
        var sessionToken = self.get('sessionToken');
        var email = self.get('email');

        if (password) {
          return self._fxaClient.signIn(email, password, relier);
        } else if (sessionToken) {
          // We have a cached Sync session so just check that it hasn't expired.
          // The result includes the latest verified state
          return self._fxaClient.recoveryEmailStatus(sessionToken);
        } else {
          throw AuthErrors.toError('UNEXPECTED_ERROR');
        }
      })
      .then(function (updatedSessionData) {
        self.set(updatedSessionData);

        if (! self.get('verified')) {
          return self._fxaClient.signUpResend(relier, self.get('sessionToken'));
        }
      });
    },

    signUp: function (relier) {
      var self = this;
      return self._fxaClient.signUp(self.get('email'), self.get('password'), relier,
        {
          customizeSync: self.get('customizeSync')
        })
        .then(function (updatedSessionData) {
          self.set(updatedSessionData);
        });
    },

    saveGrantedPermissions: function (clientId, clientPermissions) {
      var permissions = this.get('grantedPermissions') || {};
      permissions[clientId] = clientPermissions;
      this.set('grantedPermissions', permissions);
    },

    hasGrantedPermissions: function (clientId, scope) {
      if (! scope) {
        return true;
      }
      return this.ungrantedPermissions(clientId, scope).length === 0;
    },

    ungrantedPermissions: function (clientId, clientPermissions) {
      var permissions = this.get('grantedPermissions') || {};
      var clientGrantedPermissions = permissions[clientId] || [];
      return _.difference(clientPermissions, clientGrantedPermissions);
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
