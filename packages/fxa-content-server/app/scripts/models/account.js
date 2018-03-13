/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This model abstracts interaction between the user's account
// and the profile server and also handles (de)serialization.

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const AuthErrors = require('../lib/auth-errors');
  const Backbone = require('backbone');
  const Cocktail = require('cocktail');
  const Constants = require('../lib/constants');
  const MarketingEmailPrefs = require('./marketing-email-prefs');
  const OAuthErrors = require('../lib/oauth-errors');
  const OAuthToken = require('./oauth-token');
  const ProfileErrors = require('../lib/profile-errors');
  const ProfileImage = require('./profile-image');
  const ResumeTokenMixin = require('./mixins/resume-token');
  const SignInReasons = require('../lib/sign-in-reasons');
  const UserAgent = require('../lib/user-agent');
  const vat = require('../lib/vat');

  // Account attributes that can be persisted
  var PERSISTENT = {
    displayName: undefined,
    email: undefined,
    grantedPermissions: undefined,
    hadProfileImageSetBefore: undefined,
    lastLogin: undefined,
    // starting with train-91, needsOptedInToMarketing is store in the
    // ResumeToken. After a train, we can stop persisting this field to
    // localStorage. However, we need to be sure that hydrating from
    // localStorage can still load this field, in case we haven't seen
    // the user since. Is it enough to just move this field to the
    // 'defaults'?
    needsOptedInToMarketingEmail: undefined,
    // password field intentionally omitted to avoid unintentional leaks
    permissions: undefined,
    profileImageId: undefined,
    profileImageUrl: undefined,
    profileImageUrlDefault: undefined,
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
    offeredSyncEngines: undefined,
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
      this._notifier = options.notifier;
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

    resumeTokenFields: ['email', 'needsOptedInToMarketingEmail'],

    resumeTokenSchema: {
      email: vat.email(),
      needsOptedInToMarketingEmail: vat.boolean()
    },

    // Hydrate the account
    fetch () {
      if (! this.get('sessionToken') || this.get('verified')) {
        return Promise.resolve();
      }

      // upgrade the credentials with verified state
      return this.sessionStatus()
        .catch((err) => {
          // if invalid token then invalidate session
          if (AuthErrors.is(err, 'INVALID_TOKEN')) {
            this.discardSessionToken();
          }

          // Ignore UNAUTHORIZED errors; we'll just fetch again when needed
          // Otherwise report the error
          if (! AuthErrors.is(err, 'UNAUTHORIZED') && this._sentryMetrics) {
            this._sentryMetrics.captureException(err);
          }
        });
    },

    discardSessionToken () {
      // Only 'set' will trigger model change, using 'unset' will not.
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
      }).then(() => this._profileClient);
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

    /**
     * Get an assertion that can be used to get an OAuth token
     *
     * @returns {Promise} resolves to the assertion
     */
    _generateAssertion () {
      var sessionToken = this.get('sessionToken');
      if (! sessionToken) {
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
      }

      var existingAssertionPromise = this._assertionPromises[sessionToken];

      if (this._isAssertionValid(existingAssertionPromise)) {
        return existingAssertionPromise;
      }

      var assertionPromise = this._assertion.generate(sessionToken);
      // assertions live for about 6 hours.
      // reuse the same assertion if created in the past hour
      assertionPromise.__expiresAt = Date.now() + 1000 * 60 * 60;

      this._assertionPromises[sessionToken] = assertionPromise;

      return assertionPromise;
    },

    /**
     * Check if the assertion promise result is still valid
     *
     * @param {Promise} assertionPromise
     * @returns {Boolean}
     */
    _isAssertionValid (assertionPromise) {
      return !! (assertionPromise &&
                 assertionPromise.__expiresAt &&
                 assertionPromise.__expiresAt >= Date.now());
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
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
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
     * This function simply returns the session status of the user. It differs
     * from `sessionStatus` function above because it is not used to determine
     * which view to take a user after the login. This function also does not
     * have the restriction to be backwards compatible to legacy clients.
     *
     * @returns {Promise} resolves with the account's current session
     * information if session is valid. Rejects with an INVALID_TOKEN error
     * if session is invalid.
     *
     * Session information:
     * {
     *   email: <canonicalized email>,
     *   verified: <boolean>
     *   emailVerified: <boolean>
     *   sessionVerified: <boolean>
     * }
     */
    sessionVerificationStatus () {
      const sessionToken = this.get('sessionToken');
      if (! sessionToken) {
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
      }

      return this._fxaClient.sessionVerificationStatus(sessionToken)
        .then((resp) => {
          return resp;
        }, (err) => {
          if (AuthErrors.is(err, 'INVALID_TOKEN')) {
            // sessionToken is no longer valid, kill it.
            this.unset('sessionToken');
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
        profileImageUrl: profileImage.get('url'),
        profileImageUrlDefault: profileImage.get('default')
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
          var profileImage = new ProfileImage({ default: result.avatarDefault, url: result.avatar });

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
          profileImage = new ProfileImage({ default: result.avatarDefault, id: result.id, url: result.avatar });
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
     *   @param {String} [options.originalLoginEmail] - Login used to login with originally.
     * @returns {Promise} - resolves when complete
     */
    signIn (password, relier, options = {}) {
      var email = this.get('email');
      return Promise.resolve().then(() => {
        var sessionToken = this.get('sessionToken');
        if (password) {
          const signinOptions = {
            metricsContext: this._metrics.getFlowEventMetadata(),
            reason: options.reason || SignInReasons.SIGN_IN,
            resume: options.resume,
            // if the email case is incorrect, handle it locally so the model
            // can be updated with the correct case.
            skipCaseError: true,
            unblockCode: options.unblockCode
          };

          // `originalLoginEmail` is specified when the account's primary email has changed.
          // This param lets the auth-server known that it should check that this email
          // is the current primary for the account.
          if (options.originalLoginEmail) {
            signinOptions.originalLoginEmail = options.originalLoginEmail;
          }

          if (options.verificationMethod) {
            signinOptions.verificationMethod = options.verificationMethod;
          }

          if (! sessionToken) {
            // We need to do a completely fresh login.
            return this._fxaClient.signIn(email, password, relier, signinOptions);
          } else {
            // We have an existing sessionToken, try to re-authenticate it.
            return this._fxaClient.sessionReauth(sessionToken, email, password, relier, signinOptions)
              .catch((err) => {
                // The session was invalid, do a fresh login.
                if (! AuthErrors.is(err, 'INVALID_TOKEN')) {
                  throw err;
                }
                this.discardSessionToken();
                return this._fxaClient.signIn(email, password, relier, signinOptions);
              });
          }
        } else if (sessionToken) {
          // We have a cached Sync session so just check that it hasn't expired.
          // The result includes the latest verified state
          return this._fxaClient.recoveryEmailStatus(sessionToken);
        } else {
          throw AuthErrors.toError('UNEXPECTED_ERROR');
        }
      }).then((updatedSessionData) => {
        // If a different email case or primary email was used to login,
        // the session won't have correct email. Update the session to use the one
        // originally used for login.
        if (options.originalLoginEmail && email.toLowerCase() !== options.originalLoginEmail.toLowerCase()) {
          updatedSessionData.email = options.originalLoginEmail;
        }

        this.set(updatedSessionData);

        this._notifier.trigger('set-uid', this.get('uid'));

        return updatedSessionData;
      }).catch((err) => {
        // The `INCORRECT_EMAIL_CASE` can be returned if a user is attempting to login with a different
        // email case than what the account was created with or if they changed their primary email address.
        // In both scenarios, the content-server needs to know the original account email to hash
        // the user's password with.
        if (AuthErrors.is(err, 'INCORRECT_EMAIL_CASE')) {

          // Save the original email that was used for login so that the auth-server
          // can verify that this is the accounts primary email address.
          options.originalLoginEmail = email;

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
     * Request to verify current session.
     *
     * @returns {Promise} - resolves when complete
     */
    requestVerifySession () {
      return this._fxaClient.sessionVerifyResend(
        this.get('sessionToken')
      );
    },

    /**
     * Verify the account using the verification code
     *
     * @param {String} code - the verification code
     * @param {Object} [options]
     * @param {Object} [options.service] - the service issuing signup request
     * @param {String} [options.serverVerificationStatus] - the status of server verification
     * @returns {Promise} - resolves when complete
     */
    verifySignUp (code, options = {}) {
      const marketingOptIn = this.get('needsOptedInToMarketingEmail');
      return Promise.resolve()
        .then(() => {
          if (options.serverVerificationStatus !== 'verified') {
            // if server verification was not present or not successful
            // then attempt client verification

            if (marketingOptIn) {
              this.unset('needsOptedInToMarketingEmail');
              options.marketingOptIn = true;
            }

            return this._fxaClient.verifyCode(
              this.get('uid'),
              code,
              options
            );
          }
        })
        .then(() => {
          this.set('verified', true);

          if (marketingOptIn) {
            this._notifier.trigger('flow.initialize');
            this._notifier.trigger('flow.event', {
              event: 'newsletter.subscribed'
            });
          }
        });
    },

    /**
     * Verify the account using the token code
     *
     * @param {String} code - the token code
     * @returns {Promise} - resolves when complete
     */
    verifyTokenCode (code) {
      return this._fxaClient.verifyTokenCode(
        this.get('sessionToken'),
        this.get('uid'),
        code
      );
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
     * Sign out the current session.
     *
     * @returns {Promise} - resolves when complete
     */
    signOut () {
      this._notifier.trigger('clear-uid');
      return this._fxaClient.sessionDestroy(this.get('sessionToken'));
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
      ).then(() => {
        this._notifier.trigger('clear-uid');
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
      ).then(this.set.bind(this));
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
        .catch((err) => {
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
            item.isOAuthApp = true;
          });

          return oAuthApps;
        });
    },

    /**
     * Fetch the account's sessions + devices, populate into the collection
     *
     * @returns {Promise} resolves when the action completes
     */
    fetchSessions () {
      return this._fxaClient.sessions(this.get('sessionToken'))
        .then((sessions) => {
          sessions.map((item) => {
            if (item.isDevice) {
              item.clientType = Constants.CLIENT_TYPE_DEVICE;
              // override the item id as deviceId for consistency
              // if you ever need the tokenId just add it here with a different name
              item.id = item.deviceId;
              item.name = item.deviceName;
              item.type = item.deviceType;
            } else {
              item.clientType = Constants.CLIENT_TYPE_WEB_SESSION;
              item.isWebSession = true;
            }

            item.genericOS = UserAgent.toGenericOSName(item.os);
          });

          return sessions;
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
     * Destroy another session.
     *
     * @param {Object} session to destroy.
     * @returns {Promise}
     */
    destroySession (session) {
      var tokenId = session.get('id');
      var sessionToken = this.get('sessionToken');

      return this._fxaClient.sessionDestroy(sessionToken, {
        customSessionToken: tokenId
      }).then(() => {
        session.destroy();
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
        .catch((err) => {
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
        return Promise.resolve(null);
      }

      return this._fxaClient.accountKeys(
        this.get('keyFetchToken'), this.get('unwrapBKey'));
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
     * @param {Object} [options={}]
     *   @param {String[]} [options.features] Features to enable for
     *     the request, e.g., `signinCodes`
     * @returns {Promise}
     */
    sendSms (phoneNumber, messageId, options = {}) {
      return this._fxaClient.sendSms(
        this.get('sessionToken'),
        phoneNumber,
        messageId,
        {
          features: options.features || [],
          metricsContext: this._metrics.getFlowEventMetadata()
        }
      );
    },

    /**
     * Check whether SMS is enabled for the current account.
     *
     * @param {Object} [options={}] options
     *   @param {Boolean} [options.country]  country code to force for testing.
     * @returns {Promise} resolves to an object with:
     *   * {Boolean} ok - true if user can send an SMS
     *   * {String} country - user's country
     */
    smsStatus (options) {
      const sessionToken = this.get('sessionToken');
      if (! sessionToken) {
        return Promise.resolve({ ok: false });
      }

      return this._fxaClient.smsStatus(sessionToken, options);
    },

    /**
     * Get emails associated with user.
     *
     * @returns {Promise}
     */
    recoveryEmails () {
      return this._fxaClient.recoveryEmails(
        this.get('sessionToken')
      );
    },

    /**
     * Associates a new email to a user's account.
     *
     * @param {String} email
     *
     * @returns {Promise}
     */
    recoveryEmailCreate (email) {
      return this._fxaClient.recoveryEmailCreate(
        this.get('sessionToken'),
        email
      );
    },

    /**
     * Deletes email from user's account.
     *
     * @param {String} email
     *
     * @returns {Promise}
     */
    recoveryEmailDestroy (email) {
      return this._fxaClient.recoveryEmailDestroy(
        this.get('sessionToken'),
        email
      );
    },

    /**
     * Resend the verification code associated with the passed email address
     *
     * @param {String} email
     *
     * @returns {Promise}
     */
    resendEmailCode (email) {
      return this._fxaClient.resendEmailCode(
        this.get('sessionToken'),
        email
      );
    },

    /**
     * Get emails associated with user.
     *
     * @returns {Promise}
     */
    getEmails () {
      return this._fxaClient.getEmails(
        this.get('sessionToken')
      );
    },

    /**
     * Associates a new email to a users account.
     *
     * @param {String} email
     *
     * @returns {Promise}
     */
    createEmail (email) {
      return this._fxaClient.createEmail(
        this.get('sessionToken'),
        email
      );
    },

    /**
     * Deletes an email from a users account.
     *
     * @param {String} email
     *
     * @returns {Promise}
     */
    deleteEmail (email) {
      return this._fxaClient.deleteEmail(
        this.get('sessionToken'),
        email
      );
    },

    /**
     * Sets the primary email address of the user.
     *
     * @param {String} email
     *
     * @returns {Promise}
     */
    setPrimaryEmail (email) {
      return this._fxaClient.recoveryEmailSetPrimaryEmail(
        this.get('sessionToken'),
        email
      );
    },

    /**
     * Creates a new TOTP token for a user.
     *
     * @returns {Promise}
     */
    createTotpToken () {
      return this._fxaClient.createTotpToken(
        this.get('sessionToken'),
        {
          metricsContext: this._metrics.getFlowEventMetadata()
        }
      );
    },

    /**
     * Deletes the current TOTP token for a user.
     *
     * @returns {Promise}
     */
    deleteTotpToken () {
      return this._fxaClient.deleteTotpToken(
        this.get('sessionToken')
      );
    },

    /**
     * Verifies a TOTP code. If code is verified, token will be marked as verified.
     *
     * @param {String} code
     *
     * @returns {Promise}
     */
    verifyTotpCode (code) {
      return this._fxaClient.verifyTotpCode(
        this.get('sessionToken'),
        code,
        {
          metricsContext: this._metrics.getFlowEventMetadata(),
        }
      );
    },

    /**
     * Check to see if the current user has a verified TOTP token.
     *
     * @returns {Promise}
     */
    checkTotpTokenExists () {
      return this._fxaClient.checkTotpTokenExists(
        this.get('sessionToken')
      );
    }

  }, {
    ALLOWED_KEYS: ALLOWED_KEYS,
    PERMISSIONS_TO_KEYS: PERMISSIONS_TO_KEYS
  });

  [
    'getProfile',
    'getAvatar',
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
          .catch((err) => {
            if (ProfileErrors.is(err, 'INVALID_TOKEN')) {
              this.discardSessionToken();
            } else if (ProfileErrors.is(err, 'UNAUTHORIZED')) {
              // If no oauth token existed, or it has gone stale,
              // get a new one and retry.
              return this._fetchProfileOAuthToken()
                .then(() => {
                  const accessToken = this.get('accessToken');
                  return profileClient[method].call(profileClient, accessToken, ...args);
                })
                .catch((err) => {
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
