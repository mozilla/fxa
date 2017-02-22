/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This model abstracts interaction between the user's account
// and the profile server and also handles (de)serialization.

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const Cocktail = require('cocktail');
  const Constants = require('lib/constants');
  const MarketingEmailPrefs = require('models/marketing-email-prefs');
  const OAuthErrors = require('lib/oauth-errors');
  const OAuthToken = require('models/oauth-token');
  const p = require('lib/promise');
  const ProfileErrors = require('lib/profile-errors');
  const ProfileImage = require('models/profile-image');
  const ResumeTokenMixin = require('models/mixins/resume-token');
  const SignInReasons = require('lib/sign-in-reasons');
  const vat = require('lib/vat');

  var NEWSLETTER_ID = Constants.MARKETING_EMAIL_NEWSLETTER_ID;

  // Account attributes that can be persisted
  var PERSISTENT = {
    displayName: undefined,
    email: undefined,
    grantedPermissions: undefined,
    hadProfileImageSetBefore: undefined,
    lastLogin: undefined,
    needsOptedInToMarketingEmail: undefined,
    // password field intentionally omitted to avoid unintentional leaks
    permissions: undefined,
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
    // password field intentionally omitted to avoid unintentional leaks
    unwrapBKey: undefined,
    verificationMethod: undefined,
    verificationReason: undefined
  }, PERSISTENT);

  var ALLOWED_KEYS = Object.keys(DEFAULTS);
  var ALLOWED_PERSISTENT_KEYS = Object.keys(PERSISTENT);

  var CONTENT_SERVER_OAUTH_SCOPE = 'profile profile:write clients:write';

  var PERMISSIONS_TO_KEYS = {
    'profile:avatar': 'profileImageUrl',
    'profile:display_name': 'displayName',
    'profile:email': 'email',
    'profile:uid': 'uid'
  };

  var Account = Backbone.Model.extend({
    defaults: DEFAULTS,

    initialize (accountData, options = {}) {
      this._oAuthClientId = options.oAuthClientId;
      this._oAuthClient = options.oAuthClient;
      this._assertion = options.assertion;
      this._profileClient = options.profileClient;
      this._fxaClient = options.fxaClient;
      this._marketingEmailClient = options.marketingEmailClient;
      this._metrics = options.metrics;
      this._sentryMetrics = options.sentryMetrics;

      /**
       * Keeps track of outstanding assertion generation requests, keyed
       * by sessionToken. Used to prevent multiple concurrent assertion
       * requests for the same sessionToken.
       */
      this._assertionPromises = {};

      // upgrade old `grantedPermissions` to the new `permissions`.
      this._upgradeGrantedPermissions();

      this._boundOnChange = this.onChange.bind(this);
      this.on('change', this._boundOnChange);
    },

    resumeTokenFields: ['email'],

    resumeTokenSchema: {
      email: vat.email()
    },

    // Hydrate the account
    fetch () {
      if (! this.get('sessionToken') || this.get('verified')) {
        return p();
      }

      // upgrade the credentials with verified state
      return this.sessionStatus()
        .fail((err) => {
          // if invalid token then invalidate session
          if (AuthErrors.is(err, 'INVALID_TOKEN')) {
            return this._invalidateSession();
          }

          // Ignore UNAUTHORIZED errors; we'll just fetch again when needed
          // Otherwise report the error
          if (! AuthErrors.is(err, 'UNAUTHORIZED') && this._sentryMetrics) {
            this._sentryMetrics.captureException(err);
          }
        });
    },

    _invalidateSession () {
      // Invalid token can happen if user uses 'Disconnect'
      // in Firefox Desktop. Only 'set' will trigger model
      // change, using 'unset' will not.
      //
      // Details:
      // github.com/jashkenas/backbone/issues/949 and
      // github.com/jashkenas/backbone/issues/946
      this.set({
        accessToken: null,
        sessionToken: null,
        sessionTokenContext: null
      });
    },

    _fetchProfileOAuthToken () {
      return this.createOAuthToken(CONTENT_SERVER_OAUTH_SCOPE)
        .then((accessToken) => {
          this.set('accessToken', accessToken.get('token'));
        });
    },

    profileClient () {
      return this.fetch().then(() => {
        // If the account is not verified fail before attempting to fetch a token
        if (! this.get('verified')) {
          throw AuthErrors.toError('UNVERIFIED_ACCOUNT');
        } else if (this._needsAccessToken()) {
          return this._fetchProfileOAuthToken();
        }
      })
      .then(() => this._profileClient);
    },

    isFromSync () {
      return this.get('sessionTokenContext') === Constants.SESSION_TOKEN_USED_FOR_SYNC;
    },

    // returns true if all attributes within ALLOWED_KEYS are defaults
    isDefault () {
      return ! _.find(ALLOWED_KEYS, (key) => {
        return this.get(key) !== DEFAULTS[key];
      });
    },

    // If we're verified and don't have an accessToken, we should
    // go ahead and get one.
    _needsAccessToken () {
      return this.get('verified') && ! this.get('accessToken');
    },

    _generateAssertion () {
      var sessionToken = this.get('sessionToken');
      if (! sessionToken) {
        return p.reject(AuthErrors.toError('INVALID_TOKEN'));
      }

      // assertions live for 25 years, they can be cached and reused while
      // this browser tab is open.
      var existingAssertionPromise = this._assertionPromises[sessionToken];

      if (existingAssertionPromise) {
        return existingAssertionPromise;
      }

      var assertionPromise = this._assertion.generate(sessionToken);

      this._assertionPromises[sessionToken] = assertionPromise;

      return assertionPromise;
    },

    createOAuthToken (scope) {
      return this._generateAssertion()
        .then((assertion) => {
          var params = {
            assertion: assertion,
            client_id: this._oAuthClientId, //eslint-disable-line camelcase
            scope: scope
          };
          return this._oAuthClient.getToken(params);
        })
        .then((result) => {
          return new OAuthToken({
            oAuthClient: this._oAuthClient,
            token: result.access_token
          });
        });
    },

    /**
     * Check the status of the account's current session. Status information
     * includes whether the session is verified, and if not, the reason
     * it must be verified and by which method.
     *
     * @returns {Promise} resolves with the account's current session
     * information if session is valid. Rejects with an INVALID_TOKEN error
     * if session is invalid.
     *
     * Session information:
     * {
     *   email: <canonicalized email>,
     *   verified: <boolean>
     *   verificationMethod: <see lib/verification-methods.js>
     *   verificationReason: <see lib/verification-reasons.js>
     * }
     */
    sessionStatus () {
      var sessionToken = this.get('sessionToken');
      if (! sessionToken) {
        return p.reject(AuthErrors.toError('INVALID_TOKEN'));
      }

      return this._fxaClient.recoveryEmailStatus(sessionToken)
        .then((resp) => {
          // The session info may have changed since when it was last stored.
          // Store the server's view of the world. This will update the model
          // with the canonicalized email.
          this.set(resp);
          return resp;
        }, (err) => {
          if (AuthErrors.is(err, 'INVALID_TOKEN')) {
            // sessionToken is no longer valid, kill it.
            this.unset('sessionToken');
          }

          throw err;
        });
    },

    /**
     * Wait for the session to become verified.
     *
     * @param {Number} pollIntervalInMs
     * @returns {Promise}
     */
    waitForSessionVerification (pollIntervalInMs) {
      return this.sessionStatus()
        .then((result) => {
          if (result.verified) {
            return;
          }

          return p()
            .delay(pollIntervalInMs)
            .then(() => this.waitForSessionVerification(pollIntervalInMs));
        })
        .fail((err) => {
          // The user's email may have bounced because it's invalid. Check
          // if the account still exists, if it doesn't, it means the email
          // bounced. Show a message allowing the user to sign up again.
          //
          // This makes the huge assumption that a confirmation email
          // was sent.
          if (AuthErrors.is(err, 'INVALID_TOKEN') && this.has('uid')) {
            return this.checkUidExists()
              .then((accountExists) => {
                if (! accountExists) {
                  throw AuthErrors.toError('SIGNUP_EMAIL_BOUNCE');
                }

                // account exists, but sessionToken has been invalidated.
                throw err;
              });
          }

          throw err;
        });
    },

    isSignedIn () {
      return this._fxaClient.isSignedIn(this.get('sessionToken'));
    },

    toJSON () {
      /*
       * toJSON is explicitly disabled because it fetches all attributes
       * on the model, making accidental data exposure easier than it
       * should be. Use the [pick](http:*underscorejs.org/#pick) method
       * instead, which requires a list of attributes to get.
       *
       * e.g.:
       * var accountData = account.pick('email', 'uid');
       */
      throw new Error('toJSON is explicitly disabled, use `.pick` instead');
    },

    toPersistentJSON () {
      return this.pick(ALLOWED_PERSISTENT_KEYS);
    },

    setProfileImage (profileImage) {
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

    onChange () {
      // if any data is set outside of the `fetchProfile` function,
      // clear the cache and force a reload of the profile the next time.
      delete this._profileFetchPromise;
    },

    _profileFetchPromise: null,
    fetchProfile () {
      // Avoid multiple views making profile requests by caching
      // the profile fetch request. Only allow one for a given account,
      // and then re-use the data after that. See #3053
      if (this._profileFetchPromise) {
        return this._profileFetchPromise;
      }

      // ignore change events while populating known good data.
      // Unbinding the change event here ignores the `set` from
      // the call to _fetchProfileOAuthToken made in `getProfile`.
      this.off('change', this._boundOnChange);

      this._profileFetchPromise = this.getProfile()
        .then((result) => {
          var profileImage = new ProfileImage({ url: result.avatar });

          this.setProfileImage(profileImage);
          this.set('displayName', result.displayName);

          this.on('change', this._boundOnChange);
        });

      return this._profileFetchPromise;
    },

    fetchCurrentProfileImage () {
      var profileImage = new ProfileImage();

      return this.getAvatar()
        .then((result) => {
          profileImage = new ProfileImage({ id: result.id, url: result.avatar });
          this.setProfileImage(profileImage);
          return profileImage.fetch();
        })
        .then(() => profileImage);
    },

    /**
     * Sign in an existing user.
     *
     * @param {String} password - The user's password
     * @param {Object} relier - Relier being signed in to
     * @param {Object} [options]
     *   @param {String} [options.reason] - Reason for the sign in.
     *   See definitions in sign-in-reasons.js. Defaults to
     *   SIGN_IN_REASONS.SIGN_IN.
     *   @param {String} [options.resume] - Resume token to send
     *   in verification email if user is unverified.
     *   @param {String} [options.unblockCode] - Unblock code.
     * @returns {Promise} - resolves when complete
     */
    signIn (password, relier, options = {}) {
      return p().then(() => {
        var email = this.get('email');
        var sessionToken = this.get('sessionToken');

        if (password) {
          return this._fxaClient.signIn(email, password, relier, {
            metricsContext: this._metrics.getFlowEventMetadata(),
            reason: options.reason || SignInReasons.SIGN_IN,
            resume: options.resume,
            // if the email case is incorrect, handle it locally so the model
            // can be updated with the correct case.
            skipCaseError: true,
            unblockCode: options.unblockCode
          });
        } else if (sessionToken) {
          // We have a cached Sync session so just check that it hasn't expired.
          // The result includes the latest verified state
          return this._fxaClient.recoveryEmailStatus(sessionToken);
        } else {
          throw AuthErrors.toError('UNEXPECTED_ERROR');
        }
      })
      .then((updatedSessionData) => {
        this.set(updatedSessionData);
        return updatedSessionData;
      })
      .fail((err) => {
        if (AuthErrors.is(err, 'INCORRECT_EMAIL_CASE')) {
          // The server will respond with the canonical email
          // for this account. Use it hereafter.
          this.set('email', err.email);
          return this.signIn(password, relier, options);
        }

        throw err;
      });
    },

    /**
     * Sign up a new user.
     *
     * @param {String} password - The user's password
     * @param {Object} relier - Relier being signed in to
     * @param {Object} [options]
     * @param {String} [options.resume] - Resume token to send in verification
     * email if user is unverified.
     * @returns {Promise} - resolves when complete
     */
    signUp (password, relier, options = {}) {
      return this._fxaClient.signUp(
        this.get('email'),
        password,
        relier,
        {
          customizeSync: this.get('customizeSync'),
          metricsContext: this._metrics.getFlowEventMetadata(),
          resume: options.resume
        })
        .then((updatedSessionData) => {
          this.set(updatedSessionData);
        });
    },

    /**
     * Retry a sign up
     *
     * @param {Object} relier
     * @param {Object} [options]
     * @param {String} [options.resume] resume token
     * @returns {Promise} - resolves when complete
     */
    retrySignUp (relier, options = {}) {
      return this._fxaClient.signUpResend(
        relier,
        this.get('sessionToken'),
        {
          resume: options.resume
        }
      );
    },

    /**
     * Verify the account using the verification code
     *
     * @param {String} code - the verification code
     * @param {Object} [options]
     * @param {Object} [options.service] - the service issuing signup request
     * @returns {Promise} - resolves when complete
     */
    verifySignUp (code, options = {}) {
      return this._fxaClient.verifyCode(
        this.get('uid'),
        code,
        options
      )
      .then(() => {
        this.set('verified', true);

        if (this.get('needsOptedInToMarketingEmail')) {
          this.unset('needsOptedInToMarketingEmail');
          var emailPrefs = this.getMarketingEmailPrefs();
          return emailPrefs.optIn(NEWSLETTER_ID);
        }
      });
    },

    /**
     * Check whether the account's email is registered.
     *
     * @returns {Promise} resolves to `true` if email is registered,
     * `false` otw.
     */
    checkEmailExists () {
      return this._fxaClient.checkAccountExistsByEmail(this.get('email'));
    },

    /**
     * Check whether the account's UID is registered.
     *
     * @returns {Promise} resolves to `true` if the uid is registered,
     * `false` otw.
     */
    checkUidExists () {
      return this._fxaClient.checkAccountExists(this.get('uid'));
    },

    /**
     * Sign out the user
     *
     * @returns {Promise} - resolves when complete
     */
    signOut () {
      return this._fxaClient.signOut(this.get('sessionToken'));
    },

    /**
     * Destroy the account, remove it from the server
     *
     * @param {String} password - The user's password
     * @returns {Promise} - resolves when complete
     */
    destroy (password) {
      return this._fxaClient.deleteAccount(
        this.get('email'),
        password
      )
      .then(() => {
        this.trigger('destroy', this);
      });
    },

    /**
     * convert the old `grantedPermissions` field to the new
     * `permissions` field. `grantedPermissions` was only filled
     * with permissions that were granted. `permissions` contains
     * each permission that the user has made a choice for, as
     * well as its status.
     *
     * @private
     */
    _upgradeGrantedPermissions () {
      if (this.has('grantedPermissions')) {
        var grantedPermissions = this.get('grantedPermissions');

        for (var clientId in grantedPermissions) {
          var clientPermissions = {};
          grantedPermissions[clientId].forEach(function (permissionName) {
            // if the permission is in grantedPermissions, it's
            // status is `true`
            clientPermissions[permissionName] = true;
          });

          this.setClientPermissions(clientId, clientPermissions);
        }

        this.unset('grantedPermissions');
      }
    },

    /**
     * Return the permissions the client has seen as well as their state.
     *
     * Example returned object:
     * {
     *   'profile:display_name': false,
     *   'profile:email': true
     * }
     *
     * @param {String} clientId
     * @returns {Object}
     */
    getClientPermissions (clientId) {
      var permissions = this.get('permissions') || {};
      return permissions[clientId] || {};
    },

    /**
     * Get the value of a single permission
     *
     * @param {String} clientId
     * @param {String} permissionName
     * @returns {Boolean}
     */
    getClientPermission (clientId, permissionName) {
      var clientPermissions = this.getClientPermissions(clientId);
      return clientPermissions[permissionName];
    },

    /**
     * Set the permissions for a client. `permissions`
     * should be an object with the following format:
     * {
     *   'profile:display_name': false,
     *   'profile:email': true
     * }
     *
     * @param {String} clientId
     * @param {Object} clientPermissions
     */
    setClientPermissions (clientId, clientPermissions) {
      var allPermissions = this.get('permissions') || {};
      allPermissions[clientId] = clientPermissions;
      this.set('permissions', allPermissions);
    },

    /**
     * Check whether all the passed in permissions have been
     * seen previously.
     *
     * @param {String} clientId
     * @param {String[]} permissions
     * @returns {Boolean} `true` if client has seen all the permissions,
     *  `false` otw.
     */
    hasSeenPermissions (clientId, permissions) {
      var seenPermissions = Object.keys(this.getClientPermissions(clientId));
      // without's signature is `array, *values)`,
      // *values cannot be an array, so convert to a form without can use.
      var args = [permissions].concat(seenPermissions);
      var notSeen = _.without.apply(_, args);
      return notSeen.length === 0;
    },

    /**
     * Return a list of permissions that have
     * corresponding account values.
     *
     * @param {String[]} permissionNames
     * @returns {String[]}
     */
    getPermissionsWithValues (permissionNames) {
      return permissionNames.map((permissionName) => {
        var accountKey = PERMISSIONS_TO_KEYS[permissionName];

        // filter out permissions we do not know about
        if (! accountKey) {
          return null;
        }

        // filter out permissions for which the account does not have a value
        if (! this.has(accountKey)) {
          return null;
        }

        return permissionName;
      }).filter((permissionName) => permissionName !== null);
    },

    getMarketingEmailPrefs () {
      var emailPrefs = new MarketingEmailPrefs({
        account: this,
        marketingEmailClient: this._marketingEmailClient
      });

      return emailPrefs;
    },

    /**
     * Change the user's password
     *
     * @param {String} oldPassword
     * @param {String} newPassword
     * @param {Object} relier
     * @returns {Promise}
     */
    changePassword (oldPassword, newPassword, relier) {
      // Try to sign the user in before checking whether the
      // passwords are the same. If the user typed the incorrect old
      // password, they should know that first.
      var fxaClient = this._fxaClient;
      var email = this.get('email');

      return fxaClient.checkPassword(email, oldPassword)
        .then(() => {
          if (oldPassword === newPassword) {
            throw AuthErrors.toError('PASSWORDS_MUST_BE_DIFFERENT');
          }

          return fxaClient.changePassword(
            email,
            oldPassword,
            newPassword,
            this.get('sessionToken'),
            this.get('sessionTokenContext'),
            relier
          );
        })
        .then(this.set.bind(this));
    },

    /**
     * Override set to only allow fields listed in ALLOWED_FIELDS
     *
     * @method set
     */
    set: _.wrap(Backbone.Model.prototype.set, function (func, attribute, value, options) {

      var attributes;
      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(attribute)) {
        attributes = attribute;
      } else {
        attributes = {};
        attributes[attribute] = value;
      }

      for (var key in attributes) {
        if (! _.contains(ALLOWED_KEYS, key)) {
          throw new Error(key + ' cannot be set on an Account');
        }
      }

      return func.call(this, attribute, value, options);
    }),

    /**
     * Complete a password reset
     *
     * @param {String} password - the user's new password
     * @param {String} token - email verification token
     * @param {String} code - email verification code
     * @param {Object} relier - relier being signed in to.
     * @returns {Promise} - resolves when complete
     */
    completePasswordReset (password, token, code, relier) {
      return this._fxaClient.completePasswordReset(
        this.get('email'),
        password,
        token,
        code,
        relier,
        {
          metricsContext: this._metrics.getFlowEventMetadata()
        }
      )
      .then(this.set.bind(this));
    },

    /**
     * Fetch the account's device list and populate into the collection
     *
     * @returns {Promise} - resolves when complete
     */
    fetchDevices () {
      return this._fxaClient.deviceList(this.get('sessionToken'))
        .then((devices) => {
          devices.map((item) => {
            item.clientType = Constants.CLIENT_TYPE_DEVICE;
          });

          return devices;
        });
    },

    /**
     * Fetch the account's OAuth Apps and populate into the collection
     *
     * @returns {Promise} resolves when the action completes
     */
    fetchOAuthApps () {
      return this._oAuthClient.fetchOAuthApps(this.get('accessToken'))
        .fail((err) => {
          if (OAuthErrors.is(err, 'UNAUTHORIZED')) {
            // the accessToken is short lived.
            // retry once with a fresh token.
            return this._fetchProfileOAuthToken().then(() => {
              return this._oAuthClient.fetchOAuthApps(this.get('accessToken'));
            });
          }

          throw err;
        })
        .then((oAuthApps) => {
          oAuthApps.map((item) => {
            item.clientType = Constants.CLIENT_TYPE_OAUTH_APP;
          });

          return oAuthApps;
        });
    },

    /**
     * Delete the device from the account
     *
     * @param {Object} device - Device model to remove
     * @returns {Promise} - resolves when complete
     */
    destroyDevice (device) {
      var deviceId = device.get('id');
      var sessionToken = this.get('sessionToken');

      return this._fxaClient.deviceDestroy(sessionToken, deviceId)
        .then(function () {
          device.destroy();
        });
    },


    /**
     * Delete the device from the account
     *
     * @param {Object} oAuthApp - OAuthApp model to remove
     * @returns {Promise} - resolves when complete
     */
    destroyOAuthApp (oAuthApp) {
      var oAuthAppId = oAuthApp.get('id');
      var accessToken = this.get('accessToken');

      return this._oAuthClient.destroyOAuthApp(accessToken, oAuthAppId)
        .fail((err) => {
          if (OAuthErrors.is(err, 'UNAUTHORIZED')) {
            // the accessToken is short lived.
            // retry once with a fresh token.
            return this._fetchProfileOAuthToken().then(() => {
              return this._oAuthClient.destroyOAuthApp(accessToken, oAuthAppId);
            });
          }

          throw err;
        })
        .then(() => {
          oAuthApp.destroy();
        });
    },

    /**
     * Initiate a password reset
     *
     * @param {Object} relier
     * @param {Object} [options]
     * @param {String} [options.resume] resume token
     * @returns {Promise}
     */
    resetPassword (relier, options = {}) {
      return this._fxaClient.passwordReset(
        this.get('email'),
        relier,
        {
          metricsContext: this._metrics.getFlowEventMetadata(),
          resume: options.resume
        }
      );
    },

    /**
     * Retry a password reset
     *
     * @param {String} passwordForgotToken
     * @param {Object} relier
     * @param {Object} [options]
     * @param {String} [options.resume] resume token
     * @returns {Promise}
     */
    retryResetPassword (passwordForgotToken, relier, options = {}) {
      return this._fxaClient.passwordResetResend(
        this.get('email'),
        passwordForgotToken,
        relier,
        {
          metricsContext: this._metrics.getFlowEventMetadata(),
          resume: options.resume
        }
      );
    },

    /**
     * Fetch keys for the account. Requires account to have
     * `keyFetchToken` and `unwrapBKey`
     *
     * @returns {Promise} that resolves with the account keys, if they
     *   can be generated, resolves with null otherwise.
     */
    accountKeys () {
      if (! this.has('keyFetchToken') || ! this.has('unwrapBKey')) {
        return p(null);
      }

      return this._fxaClient.accountKeys(
          this.get('keyFetchToken'), this.get('unwrapBKey'));
    },

    /**
     * Fetch keys that can be used by a relier.
     *
     * @param {Object} relier
     * @returns {Promise} that resolves with the relier keys, if they
     *   can be generated, resolves with null otherwise.
     */
    relierKeys (relier) {
      return this.accountKeys()
        .then((accountKeys) => {
          if (! accountKeys) {
            return null;
          }

          return relier.deriveRelierKeys(accountKeys, this.get('uid'));
        });
    },

    /**
     * Check whether password reset is complete for the given token
     *
     * @param {String} token
     * @returns {Promise} resolves to a boolean, true if password reset has
     * been completed for the given token, false otw.
     */
    isPasswordResetComplete (token) {
      return this._fxaClient.isPasswordResetComplete(token);
    },

    /**
     * Send an unblock email.
     *
     * @returns {Promise} resolves when complete
     */
    sendUnblockEmail () {
      return this._fxaClient.sendUnblockEmail(
        this.get('email'),
        {
          metricsContext: this._metrics.getFlowEventMetadata()
        }
      );
    },

    /**
     * Reject a login unblock code.
     *
     * @param {String} unblockCode
     * @returns {Promise} resolves when complete
     */
    rejectUnblockCode (unblockCode) {
      return this._fxaClient.rejectUnblockCode(
        this.get('uid'),
        unblockCode
      );
    },

    /**
     * Send an SMS.
     *
     * @param {String} phoneNumber - target phone number
     * @param {Number} messageId - ID of message
     * @returns {Promise}
     */
    sendSms (phoneNumber, messageId) {
      return this._fxaClient.sendSms(
        this.get('sessionToken'),
        phoneNumber,
        messageId,
        {
          metricsContext: this._metrics.getFlowEventMetadata()
        }
      );
    }
  }, {
    ALLOWED_KEYS: ALLOWED_KEYS,
    PERMISSIONS_TO_KEYS: PERMISSIONS_TO_KEYS
  });

  [
    'getProfile',
    'getAvatar',
    'postAvatar',
    'deleteAvatar',
    'uploadAvatar',
    'postDisplayName'
  ]
    .forEach(function (method) {
      Account.prototype[method] = function (...args) {
        let profileClient;
        return this.profileClient()
          .then((client) => {
            profileClient = client;
            const accessToken = this.get('accessToken');
            return profileClient[method].call(profileClient, accessToken, ...args);
          })
          .fail((err) => {
            if (ProfileErrors.is(err, 'INVALID_TOKEN')) {
              this._invalidateSession();
            } else if (ProfileErrors.is(err, 'UNAUTHORIZED')) {
              // If no oauth token existed, or it has gone stale,
              // get a new one and retry.
              return this._fetchProfileOAuthToken()
                .then(() => {
                  const accessToken = this.get('accessToken');
                  return profileClient[method].call(profileClient, accessToken, ...args);
                })
                .fail((err) => {
                  if (ProfileErrors.is(err, 'UNAUTHORIZED')) {
                    this.unset('accessToken');
                  }
                  throw err;
                });
            }
            throw err;
          });
      };
    });

  Cocktail.mixin(
    Account,
    ResumeTokenMixin
  );

  module.exports = Account;
});
