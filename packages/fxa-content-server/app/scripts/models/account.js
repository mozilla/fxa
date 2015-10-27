/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This model abstracts interaction between the user's account
// and the profile server and also handles (de)serialization.

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var AuthErrors = require('lib/auth-errors');
  var Backbone = require('backbone');
  var Constants = require('lib/constants');
  var MarketingEmailPrefs = require('models/marketing-email-prefs');
  var OAuthToken = require('models/oauth-token');
  var p = require('lib/promise');
  var ProfileClient = require('lib/profile-client');
  var ProfileImage = require('models/profile-image');

  // Account attributes that can be persisted
  var PERSISTENT = {
    displayName: undefined,
    email: undefined,
    grantedPermissions: undefined,
    hadProfileImageSetBefore: undefined,
    lastLogin: undefined,
    needsOptedInToMarketingEmail: undefined,
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
    declinedSyncEngines: undefined,
    keyFetchToken: undefined,
    password: undefined,
    unwrapBKey: undefined
  }, PERSISTENT);

  var ALLOWED_KEYS = Object.keys(DEFAULTS);
  var ALLOWED_PERSISTENT_KEYS = Object.keys(PERSISTENT);

  var PROFILE_SCOPE = 'profile profile:write';

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

      /**
       * Keeps track of outstanding assertion generation requests, keyed
       * by sessionToken. Used to prevent multiple concurrent assertion
       * requests for the same sessionToken.
       */
      self._assertionPromises = {};

      self._boundOnChange = self.onChange.bind(self);
      self.on('change', self._boundOnChange);
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
          }); /* HACK: See eslint/eslint#1801 */ // eslint-disable-line indent
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
      return self.fetch()
        .then(function () {
          // If the account is not verified fail before attempting to fetch a token
          if (! self.get('verified')) {
            throw AuthErrors.toError('UNVERIFIED_ACCOUNT');
          } else if (self._needsAccessToken()) {
            return self._fetchProfileOAuthToken();
          }
        })
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

    _generateAssertion: function () {
      var self = this;

      var sessionToken = self.get('sessionToken');

      // assertions live for 25 years, they can be cached and reused while
      // this browser tab is open.
      var existingAssertionPromise = self._assertionPromises[sessionToken];

      if (existingAssertionPromise) {
        return existingAssertionPromise;
      }

      var assertionPromise = self._assertion.generate(sessionToken);

      self._assertionPromises[sessionToken] = assertionPromise;

      return assertionPromise;
    },

    createOAuthToken: function (scope) {
      var self = this;

      return self._generateAssertion()
        .then(function (assertion) {
          var params = {
            assertion: assertion,
            client_id: self._oAuthClientId, //eslint-disable-line camelcase
            scope: scope
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
      this.set({
        profileImageId: profileImage.get('id'),
        profileImageUrl: profileImage.get('url')
      });

      if (this.get('profileImageUrl')) {
        // This is a heuristic to let us know if the user has, at some point,
        // had a custom profile image.
        this.set('hadProfileImageSetBefore', true);
      }
    },

    onChange: function () {
      // if any data is set outside of the `fetchProfile` function,
      // clear the cache and force a reload of the profile the next time.
      delete this._profileFetchPromise;
    },

    _profileFetchPromise: null,
    fetchProfile: function () {
      var self = this;

      // Avoid multiple views making profile requests by caching
      // the profile fetch request. Only allow one for a given account,
      // and then re-use the data after that. See #3053
      if (self._profileFetchPromise) {
        return self._profileFetchPromise;
      }

      // ignore change events while populating known good data.
      // Unbinding the change event here ignores the `set` from
      // the call to _fetchProfileOAuthToken made in `getProfile`.
      self.off('change', self._boundOnChange);

      self._profileFetchPromise = self.getProfile()
        .then(function (result) {
          var profileImage = new ProfileImage({ url: result.avatar });

          self.setProfileImage(profileImage);
          self.set('displayName', result.displayName);

          self.on('change', self._boundOnChange);
        });

      return self._profileFetchPromise;
    },

    fetchCurrentProfileImage: function () {
      var self = this;
      var profileImage = new ProfileImage();

      return self.getAvatar()
        .then(function (result) {
          profileImage = new ProfileImage({ id: result.id, url: result.avatar });
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

    signOut: function () {
      return this._fxaClient.signOut(this.get('sessionToken'));
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
          // settings view.
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
    },

    /**
     * Fetch the account's device list and populate the `devices` collection.
     *
     * @param {object} devices - Devices collection
     * @returns {promise} - resolves when complete
     */
    fetchDevices: function (devices) {
      var sessionToken = this.get('sessionToken');

      return this._fxaClient.deviceList(sessionToken)
        .then(devices.set.bind(devices));
    },

    /**
     * Delete the device from the account
     *
     * @param {object} device - Device model to remove
     * @returns {promise} - resolves when complete
     *
     * @param {object} devices - Devices collection
     * @returns {promise} - resolves when complete
     */
    destroyDevice: function (device) {
      var deviceId = device.get('id');
      var sessionToken = this.get('sessionToken');

      return this._fxaClient.deviceDestroy(sessionToken, deviceId)
        .then(function () {
          device.destroy();
        });
    }
  });

  [
    'getProfile',
    'getAvatar',
    'getAvatars',
    'postAvatar',
    'deleteAvatar',
    'uploadAvatar',
    'postDisplayName'
  ]
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

  module.exports = Account;
});
