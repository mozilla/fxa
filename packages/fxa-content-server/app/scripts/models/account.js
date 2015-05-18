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
  'models/profile-image',
  'models/oauth-token',
  'models/marketing-email-prefs'
], function (Backbone, _, p, AuthErrors, ProfileClient, Constants,
  ProfileImage, OAuthToken, MarketingEmailPrefs) {
  // Account attributes that can be persisted
  var PERSISTENT = {
    accessToken: undefined,
    email: undefined,
    grantedPermissions: undefined,
    lastLogin: undefined,
    needsOptedInToMarketingEmail: undefined,
    profileImageId: undefined,
    profileImageUrl: undefined,
    sessionToken: undefined,
    sessionTokenContext: undefined,
    uid: undefined,
    verified: undefined
  };

  var DEFAULTS = _.extend({
    customizeSync: undefined,
    keyFetchToken: undefined,
    password: undefined,
    unwrapBKey: undefined
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
      self._marketingEmailClient = options.marketingEmailClient;
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
          return self.createOAuthToken('profile:write')
            .then(function (accessToken) {
              self.set('accessToken', accessToken.get('token'));
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

    createOAuthToken: function (scope) {
      /* jshint camelcase: false */
      var self = this;

      return self._assertion.generate(self.get('sessionToken'))
        .then(function (assertion) {
          var params = {
            client_id: self._oAuthClientId,
            scope: scope,
            assertion: assertion
          };
          return self._oAuthClient.getToken(params);
        })
        .then(function (result) {
          return new OAuthToken({
            oAuthClient: self._oAuthClient,
            token: result.access_token
          });
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
          self.setProfileImage(profileImage);
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
    },

    getMarketingEmailPrefs: function () {
      var self = this;

      var emailPrefs = new MarketingEmailPrefs({
        account: self,
        marketingEmailClient: self._marketingEmailClient
      });

      return emailPrefs;
    },

    changePassword: function (oldPassword, newPassword, relier) {
      // Try to sign the user in before checking whether the
      // passwords are the same. If the user typed the incorrect old
      // password, they should know that first.
      var self = this;

      var fxaClient = self._fxaClient;
      var email = self.get('email');

      return fxaClient.checkPassword(email, oldPassword)
        .then(function () {
          if (oldPassword === newPassword) {
            throw AuthErrors.toError('PASSWORDS_MUST_BE_DIFFERENT');
          }

          return fxaClient.changePassword(email, oldPassword, newPassword);
        })
        .then(function () {
          // sign the user in, keeping the current sessionTokenContext. This
          // prevents sync users from seeing the `sign out` button on the
          // settings screen.
          return fxaClient.signIn(
            email,
            newPassword,
            relier,
            {
              reason: fxaClient.SIGNIN_REASON.PASSWORD_CHANGE,
              sessionTokenContext: self.get('sessionTokenContext')
            }
          );
        })
        .then(function (updatedSessionData) {
          self.set(updatedSessionData);
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
