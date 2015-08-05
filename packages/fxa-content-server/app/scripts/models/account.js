/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This model abstracts interaction between the user's account
// and the profile server and also handles (de)serialization.

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
  'use strict';

  // Account attributes that can be persisted
  var PERSISTENT = {
    email: undefined,
    grantedPermissions: undefined,
    lastLogin: undefined,
    needsOptedInToMarketingEmail: undefined,
    hadProfileImageSetBefore: undefined,
    profileImageId: undefined,
    profileImageUrl: undefined,
    sessionToken: undefined,
    // Hint for future code spelunkers. sessionTokenContext is a misnomer,
    // what the field is really used for is to indicate whether the
    // sessionToken is shared with Sync. It will be set to `fx_desktop_v1` if
    // the sessionToken is shared. Users cannot sign out of Sync shared
    // sessions from within the content server, instead they must go into the
    // Sync panel and disconnect there. The reason this field has not been
    // renamed is because we cannot gracefully handle rollback without the
    // side effect of users being able to sign out of their Sync based
    // session. Data migration within the client goes one way. It's easy to
    // move forward, very hard to move back.
    sessionTokenContext: undefined,
    uid: undefined,
    verified: undefined
  };

  var DEFAULTS = _.extend({
    accessToken: undefined,
    customizeSync: undefined,
    keyFetchToken: undefined,
    password: undefined,
    unwrapBKey: undefined
  }, PERSISTENT);

  var ALLOWED_KEYS = Object.keys(DEFAULTS);
  var ALLOWED_PERSISTENT_KEYS = Object.keys(PERSISTENT);

  var PROFILE_SCOPE = 'profile:write';

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

      return promise;
    },

    _fetchProfileOAuthToken: function () {
      var self = this;
      return self.createOAuthToken(PROFILE_SCOPE)
        .then(function (accessToken) {
          self.set('accessToken', accessToken.get('token'));
        });
    },

    profileClient: function () {
      var self = this;
      var promise = self.fetch();

      if (self._needsAccessToken()) {
        promise = promise.then(self._fetchProfileOAuthToken.bind(self));
      }

      return promise
        .then(function () {
          return self._profileClient;
        });
    },

    isFromSync: function () {
      return this.get('sessionTokenContext') === Constants.SESSION_TOKEN_USED_FOR_SYNC;
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
      var self = this;

      return self._assertion.generate(self.get('sessionToken'))
        .then(function (assertion) {
          var params = {
            client_id: self._oAuthClientId, //eslint-disable-line camelcase
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
      if (this.get('profileImageUrl')) {
        // This is a heuristic to let us know if the user has, at some point,
        // had a custom profile image.
        this.set('hadProfileImageSetBefore', true);
      }
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

    signIn: function (relier, options) {
      var self = this;
      options = options || {};

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
          return self._fxaClient.signUpResend(
            relier,
            self.get('sessionToken'),
            {
              resume: options.resume
            }
          );
        }
      });
    },

    signUp: function (relier, options) {
      var self = this;
      options = options || {};

      return self._fxaClient.signUp(
        self.get('email'),
        self.get('password'),
        relier,
        {
          customizeSync: self.get('customizeSync'),
          resume: options.resume
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
    },

    completePasswordReset: function (token, code, relier) {
      var self = this;

      var fxaClient = self._fxaClient;
      var email = self.get('email');
      var password = self.get('password');

      return fxaClient.completePasswordReset(email, password, token, code)
        .then(function () {
          return fxaClient.signIn(
            email,
            password,
            relier,
            {
              reason: fxaClient.SIGNIN_REASON.PASSWORD_RESET
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
        var profileClient;
        var args = Array.prototype.slice.call(arguments, 0);
        return self.profileClient()
          .then(function (client) {
            profileClient = client;
            var accessToken = self.get('accessToken');
            return profileClient[method].apply(profileClient, [accessToken].concat(args));
          })
          .fail(function (err) {
            // If no oauth token existed, or it has gone stale,
            // get a new one and retry.
            if (ProfileClient.Errors.is(err, 'UNAUTHORIZED')) {
              return self._fetchProfileOAuthToken()
                .then(function () {
                  var accessToken = self.get('accessToken');
                  return profileClient[method].apply(profileClient, [accessToken].concat(args));
                })
                .fail(function (err) {
                  if (ProfileClient.Errors.is(err, 'UNAUTHORIZED')) {
                    self.unset('accessToken');
                  }
                  throw err;
                });
            }
            throw err;
          });
      };
    });

  return Account;
});
