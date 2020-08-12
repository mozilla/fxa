/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This model abstracts interaction between the user's account
// and the profile server and also handles (de)serialization.

import _ from 'underscore';
import AuthErrors from '../lib/auth-errors';
import Backbone from 'backbone';
import Cocktail from 'cocktail';
import Constants from '../lib/constants';
import OAuthToken from './oauth-token';
import ProfileErrors from '../lib/profile-errors';
import ProfileImage from './profile-image';
import ResumeTokenMixin from './mixins/resume-token';
import SignInReasons from '../lib/sign-in-reasons';
import VerificationMethods from '../lib/verification-methods';
import vat from '../lib/vat';
import { emailsMatch } from 'fxa-shared/email/helpers';
import VerificationReasons from '../lib/verification-reasons';
import aet from '../lib/crypto/account-ecosystem-telemetry';

// Account attributes that can be persisted
const PERSISTENT = {
  accountResetToken: undefined,
  displayName: undefined,
  email: undefined,
  ecosystemAnonId: undefined,
  grantedPermissions: undefined,
  hadProfileImageSetBefore: undefined,
  lastLogin: undefined,
  // This property is set when a user has changed their primary email address and
  // attempts to login. Similar to logging in with a different email capitalization
  // the auth-server will return the proper email to reattempt the login. When reattempting
  // to login, this needs to be passed back to the auth-server.
  originalLoginEmail: undefined,
  // password field intentionally omitted to avoid unintentional leaks
  permissions: undefined,
  profileImageId: undefined,
  profileImageUrl: undefined,
  profileImageUrlDefault: undefined,
  recoveryKeyId: undefined,
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
  verified: undefined,
  alertText: undefined,
};

const DEFAULTS = _.extend(
  {
    accessToken: undefined,
    declinedSyncEngines: undefined,
    ecosystemAnonId: undefined,
    hasBounced: undefined,
    keyFetchToken: undefined,
    newsletters: undefined,
    offeredSyncEngines: undefined,
    // `needsOptedInToMarketingEmail` is kept around to load from old ResumeTokens.
    // This can be removed in post train-169+
    needsOptedInToMarketingEmail: undefined,
    // password field intentionally omitted to avoid unintentional leaks
    unwrapBKey: undefined,
    verificationMethod: undefined,
    verificationReason: undefined,
    totpVerified: undefined,
  },
  PERSISTENT
);

const ALLOWED_KEYS = Object.keys(DEFAULTS);
const ALLOWED_PERSISTENT_KEYS = Object.keys(PERSISTENT);

const CONTENT_SERVER_OAUTH_SCOPE = 'profile profile:write clients:write';

const PERMISSIONS_TO_KEYS = {
  'profile:avatar': 'profileImageUrl',
  'profile:display_name': 'displayName',
  'profile:email': 'email',
  'profile:uid': 'uid',
};

const Account = Backbone.Model.extend(
  {
    defaults: DEFAULTS,

    initialize(accountData, options = {}) {
      this._oAuthClientId = options.oAuthClientId;
      this._oAuthClient = options.oAuthClient;
      this._profileClient = options.profileClient;
      this._fxaClient = options.fxaClient;
      this._metrics = options.metrics;
      this._notifier = options.notifier;
      this._sentryMetrics = options.sentryMetrics;
      this._subscriptionsConfig = options.subscriptionsConfig;
      this._ecosystemAnonIdPublicKeys = options.ecosystemAnonIdPublicKeys;

      // upgrade old `grantedPermissions` to the new `permissions`.
      this._upgradeGrantedPermissions();

      if (!this.get('sessionToken') && this.get('sessionTokenContext')) {
        // We got into a bad place where some users did not have sessionTokens
        // but had sessionTokenContext and were unable to sign in using the
        // email-first flow. If the user is in this state, forcibly remove
        // the sessionTokenContext and accessToken so that they can sign in.
        // See #999
        this.discardSessionToken();
      }

      this.on('change:sessionToken', () => {
        // belts and suspenders measure to ensure calls to this.unset('sessionToken')
        // also remove the accessToken and sessionTokenContext. See #999
        if (!this.has('sessionToken')) {
          this.discardSessionToken();
        }
      });

      this._boundOnChange = this.onChange.bind(this);
      this.on('change', this._boundOnChange);

      const email = this.get('email');
      if (email && this._notifier) {
        this._notifier.trigger('set-email-domain', this.get('email'));
      }
    },

    resumeTokenFields: ['email', 'newsletters'],

    resumeTokenSchema: {
      email: vat.email(),
      newsletters: vat.newslettersArray(),
    },

    // Hydrate the account
    fetch() {
      if (!this.get('sessionToken') || this.get('verified')) {
        return Promise.resolve();
      }

      // upgrade the credentials with verified state
      return this.sessionStatus().catch((err) => {
        // Ignore UNAUTHORIZED errors; we'll just fetch again when needed
        // Otherwise report the error
        if (!AuthErrors.is(err, 'UNAUTHORIZED') && this._sentryMetrics) {
          this._sentryMetrics.captureException(
            new Error(_.isEmpty(err) ? 'Something went wrong!' : err)
          );
        }
      });
    },

    discardSessionToken() {
      // If a sessionToken is invalid, the profile image should
      // be considered invalid. This causes the default profile
      // image to be displayed.
      this.unset('profileImageId');
      this.unset('profileImageUrl');
      this.unset('accessToken');
      this.unset('sessionTokenContext');
      this.unset('sessionToken');
    },

    _fetchProfileOAuthToken() {
      return this.createOAuthToken(this._oAuthClientId, {
        scope: CONTENT_SERVER_OAUTH_SCOPE,
        // set authorization TTL to 5 minutes.
        // Docs: https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/oauth/api.md#post-v1authorization
        // Issue: https://github.com/mozilla/fxa-content-server/issues/3982
        ttl: 300,
      }).then((accessToken) => {
        this.set('accessToken', accessToken.get('token'));
      });
    },

    profileClient() {
      return this.fetch()
        .then(() => {
          // If the account is not verified fail before attempting to fetch a token
          if (!this.get('verified')) {
            throw AuthErrors.toError('UNVERIFIED_ACCOUNT');
          } else if (this._needsAccessToken()) {
            return this._fetchProfileOAuthToken();
          }
        })
        .then(() => this._profileClient);
    },

    isFromSync() {
      return (
        this.get('sessionTokenContext') ===
        Constants.SESSION_TOKEN_USED_FOR_SYNC
      );
    },

    // returns true if all attributes within ALLOWED_KEYS are defaults
    isDefault() {
      return !_.find(ALLOWED_KEYS, (key) => {
        return this.get(key) !== DEFAULTS[key];
      });
    },

    // If we're verified and don't have an accessToken, we should
    // go ahead and get one.
    _needsAccessToken() {
      return this.get('verified') && !this.get('accessToken');
    },

    /**
     * Create an OAuth token for `clientId`
     *
     * @param {string} clientId
     * @param {Object} [options={}]
     *   @param {String} [options.access_type=online] if `access_type=offline`, a refresh token
     *     will be issued when trading the code for an access token.
     *   @param {String} [options.scope] requested scopes
     *   @param {Number} [options.ttl] time to live, in seconds
     * @returns {Promise<OAuthToken>}
     */
    createOAuthToken(clientId, options = {}) {
      const sessionToken = this.get('sessionToken');
      if (!sessionToken) {
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
      }

      return this._fxaClient
        .createOAuthToken(sessionToken, clientId, options)
        .then((result) => {
          return new OAuthToken({
            oAuthClient: this._oAuthClient,
            token: result.access_token,
          });
        });
    },

    /**
     * Create an OAuth code
     * @param {String} clientId
     * @param {String} state
     * @param {Object} [options={}]
     *   @param {String} [options.access_type=online] if `access_type=offline`, a refresh token
     *     will be issued when trading the code for an access token.
     *   @param {String} [options.acr_values] allowed ACR values
     *   @param {String} [options.keys_jwe] Encrypted bundle of scoped key data to return to the RP
     *   @param {String} [options.redirect_uri] registered redirect URI to return to
     *   @param {String} [options.response_type=code] response type
     *   @param {String} [options.scope] requested scopes
     *   @param {String} [options.code_challenge_method] PKCE code challenge method
     *   @param {String} [options.code_challenge] PKCE code challenge
     * @returns {Promise} A promise that will be fulfilled with:
     *   - `redirect` - redirect URI
     *   - `code` - authorization code
     *   - `state` - state token
     */
    createOAuthCode(clientId, state, options) {
      const sessionToken = this.get('sessionToken');
      if (!sessionToken) {
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
      }

      return this._fxaClient.createOAuthCode(
        sessionToken,
        clientId,
        state,
        options
      );
    },

    /**
     * Get scoped key data for the RP associated with `client_id`
     *
     * @param {String} clientId
     * @param {String} scope
     * @returns {Promise} A promise that will be fulfilled with:
     *   - `identifier`
     *   - `keyRotationSecret`
     *   - `keyRotationTimestamp`
     */
    getOAuthScopedKeyData(clientId, scope) {
      const sessionToken = this.get('sessionToken');
      if (!sessionToken) {
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
      }

      return this._fxaClient.getOAuthScopedKeyData(
        sessionToken,
        clientId,
        scope
      );
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
    sessionStatus() {
      return Promise.resolve()
        .then(() => {
          const sessionToken = this.get('sessionToken');
          if (!sessionToken) {
            throw AuthErrors.toError('INVALID_TOKEN');
          }

          return this._fxaClient.recoveryEmailStatus(sessionToken);
        })
        .then(
          (resp) => {
            // The session info may have changed since when it was last stored.
            // Store the server's view of the world. This will update the model
            // with the canonicalized email.

            if (this.get('verificationReason')) {
              resp.verificationReason = this.get('verificationReason');
            }

            this.set(resp);
            return resp;
          },
          (err) => {
            if (AuthErrors.is(err, 'INVALID_TOKEN')) {
              // sessionToken is no longer valid, kill it.
              this.discardSessionToken();
            }

            throw err;
          }
        );
    },

    /**
     * Fetches the account profile from the GET /account/profile on the auth server
     *
     * @returns {Promise} resolves with the account's current session
     * information if session is valid. Rejects with an INVALID_TOKEN error
     * if session is invalid.
     *
     * Account information:
     * {
     *   email,
     *   locale,
     *   authenticationMethods,
     *   authenticatorAssuranceLevel,
     *   profileChangedAt,
     *   ecosystemAnonId,
     * }
     */
    accountProfile() {
      return Promise.resolve().then(() => {
        const sessionToken = this.get('sessionToken');
        if (!sessionToken) {
          throw AuthErrors.toError('INVALID_TOKEN');
        }

        return this._fxaClient.accountProfile(sessionToken);
      });
    },

    /**
     * Attempt to generate and set the ecosystem anon. At a high level
     * this function attempts to generate the id in the following manner:
     *
     * 1. Use kB if it is specified
     * 2. Attempt to use user's password to fetch keys
     * 3. Attempt to fetch keys if valid authentication token exists to do so
     *
     * Note that on a password reset we will need to do a reauth since
     * the browser will attempt to use the keyFetchToken.
     *
     * @param {Object} [options={}]
     *   @param {String} [options.kB] Optional The user's kB, if specified takes priority.
     *   @param {String} [options.password] Optional The user's password
     * @returns {Promise}
     */
    async generateEcosystemAnonId(options = {}) {
      try {
        let ecosystemAnonId;

        if (!this._ecosystemAnonIdPublicKeys.length) {
          return;
        }

        const randomIndex = Math.floor(
          Math.random() * this._ecosystemAnonIdPublicKeys.length
        );
        const randomKey = this._ecosystemAnonIdPublicKeys[randomIndex];

        if (options.kB) {
          ecosystemAnonId = await aet.generateEcosystemAnonID(
            this.get('uid'),
            options.kB,
            randomKey
          );
        } else if (
          options.password &&
          (await this.sessionVerificationStatus()).sessionVerified
        ) {
          const res = await this._fxaClient.sessionReauth(
            this.get('sessionToken'),
            this.get('email'),
            options.password,
            {
              wantsKeys: () => true,
              has: () => false,
              isSync: () => false,
            },
            {
              keys: true,
              reason: VerificationReasons.ECOSYSTEM_ANON_ID,
            }
          );

          if (res.keyFetchToken && res.unwrapBKey) {
            const keys = await this._fxaClient.accountKeys(
              res.keyFetchToken,
              res.unwrapBKey
            );
            ecosystemAnonId = await aet.generateEcosystemAnonID(
              this.get('uid'),
              keys.kB,
              randomKey
            );
          }
        } else if (this.canFetchKeys()) {
          const keys = await this.accountKeys();
          ecosystemAnonId = await aet.generateEcosystemAnonID(
            this.get('uid'),
            keys.kB,
            randomKey
          );
        }

        if (ecosystemAnonId) {
          this.set('ecosystemAnonId', ecosystemAnonId);
          await this._fxaClient.updateEcosystemAnonId(
            this.get('sessionToken'),
            ecosystemAnonId
          );
        }
      } catch (err) {
        this.unset('ecosystemAnonId');

        const reportException = () => {
          if (this._sentryMetrics) {
            this._sentryMetrics.captureException(err);
          }
        };

        // If we get 412 Precondition Failed it means we
        // tried to update, but another client beat us to
        // it. Fetch the new anon ID and use it instead.
        if (AuthErrors.is(err, 'ECOSYSTEM_ANON_ID_UPDATE_CONFLICT')) {
          try {
            const { ecosystemAnonId } = await this.accountProfile();
            if (ecosystemAnonId) {
              this.set('ecosystemAnonId', ecosystemAnonId);
            }
          } catch (err) {
            reportException(err);
          }
        } else {
          reportException(err);
        }
      }
    },

    /**
     * Fetches account details from GET /account, for use by the settings views.
     * Caches its own result, because it's not intended for that endpoint to be
     * called repeatedly like some of the polling methods are. If you're really,
     * really sure you need to, pass the `force` option to force a clean request.
     *
     * @param {Object} [options]
     *   @param {Boolean} [options.force=false] - Ignore any cached results
     *
     * @returns {Promise} - Resolves to the result of `GET /account`, as defined in
     *                      `packages/fxa-auth-server/lib/routes/account.js`.
     */
    settingsData(options = {}) {
      return Promise.resolve().then(() => {
        if (this._settingsData && !options.force) {
          return this._settingsData;
        }

        const sessionToken = this.get('sessionToken');
        if (!sessionToken) {
          throw AuthErrors.toError('INVALID_TOKEN');
        }

        return this._fxaClient
          .account(sessionToken)
          .then((result) => (this._settingsData = result));
      });
    },

    /**
     * This function simply returns the session status of the user. It differs
     * from `sessionStatus` function above because it is not used to determine
     * which view to take a user after the login. This function also does not
     * have the restriction to be backwards compatible to legacy clients, nor
     * does it update the account with the server provided information.
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
    sessionVerificationStatus() {
      return Promise.resolve()
        .then(() => {
          const sessionToken = this.get('sessionToken');
          if (!sessionToken) {
            throw AuthErrors.toError('INVALID_TOKEN');
          }

          return this._fxaClient.sessionVerificationStatus(sessionToken);
        })
        .then(null, (err) => {
          if (AuthErrors.is(err, 'INVALID_TOKEN')) {
            // sessionToken is no longer valid, kill it.
            this.discardSessionToken();
          }

          throw err;
        });
    },

    isSignedIn() {
      return this._fxaClient.isSignedIn(this.get('sessionToken'));
    },

    toJSON() {
      /*
       * toJSON is explicitly disabled because it fetches all attributes
       * on the model, making accidental data exposure easier than it
       * should be. Use the [pick](http:*underscorejs.org/#pick) method
       * instead, which requires a list of attributes to get.
       *
       * e.g.:
       * const accountData = account.pick('email', 'uid');
       */
      throw new Error('toJSON is explicitly disabled, use `.pick` instead');
    },

    toPersistentJSON() {
      return this.pick(ALLOWED_PERSISTENT_KEYS);
    },

    /**
     * Fetches the user's security events from the GET /securityEvents on the auth server
     *
     * @returns {Promise} resolves with security events
     */
    securityEvents() {
      return Promise.resolve().then(() => {
        const sessionToken = this.get('sessionToken');
        if (!sessionToken) {
          throw AuthErrors.toError('INVALID_TOKEN');
        }

        return this._fxaClient.securityEvents(sessionToken);
      });
    },

    /**
     * Delete user's security events from the DELETE /securityEvents on the auth server
     *
     * @returns {Promise} resolves with empty response if succeeded
     */
    deleteSecurityEvents() {
      return Promise.resolve().then(() => {
        const sessionToken = this.get('sessionToken');
        if (!sessionToken) {
          throw AuthErrors.toError('INVALID_TOKEN');
        }

        return this._fxaClient.deleteSecurityEvents(sessionToken);
      });
    },

    setProfileImage(profileImage) {
      this.set({
        profileImageId: profileImage.get('id'),
        profileImageUrl: profileImage.get('url'),
        profileImageUrlDefault: profileImage.get('default'),
      });

      if (this.get('profileImageUrl')) {
        // This is a heuristic to let us know if the user has, at some point,
        // had a custom profile image.
        this.set('hadProfileImageSetBefore', true);
      }
    },

    onChange() {
      // if any data is set outside of the `fetchProfile` function,
      // clear the cache and force a reload of the profile the next time.
      delete this._profileFetchPromise;
    },

    _profileFetchPromise: null,
    fetchProfile() {
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

      this._profileFetchPromise = this.getProfile().then((result) => {
        const profileImage = new ProfileImage({
          default: result.avatarDefault,
          url: result.avatar,
        });

        this.setProfileImage(profileImage);
        this.set('displayName', result.displayName);
        this.set('ecosystemAnonId', result.ecosystemAnonId);

        this.on('change', this._boundOnChange);
      });

      return this._profileFetchPromise;
    },

    fetchCurrentProfileImage() {
      let profileImage = new ProfileImage();

      return this.getAvatar()
        .then((result) => {
          profileImage = new ProfileImage({
            default: result.avatarDefault,
            id: result.id,
            url: result.avatar,
          });
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
    signIn(password, relier, options = {}) {
      const email = this.get('email');
      return Promise.resolve()
        .then(() => {
          const sessionToken = this.get('sessionToken');
          if (password) {
            const signinOptions = {
              metricsContext: this._metrics.getFlowEventMetadata(),
              reason: options.reason || SignInReasons.SIGN_IN,
              resume: options.resume,
              // if the email case is incorrect, handle it locally so the model
              // can be updated with the correct case.
              skipCaseError: true,
              unblockCode: options.unblockCode,
              verificationMethod: VerificationMethods.EMAIL_OTP,
            };

            // `originalLoginEmail` is specified when the account's primary email has changed.
            // This param lets the auth-server known that it should check that this email
            // is the current primary for the account.
            const originalLoginEmail = this.get('originalLoginEmail');
            if (originalLoginEmail) {
              signinOptions.originalLoginEmail = originalLoginEmail;
            }

            if (!sessionToken) {
              // We need to do a completely fresh login.
              return this._fxaClient.signIn(
                email,
                password,
                relier,
                signinOptions
              );
            } else {
              // We have an existing sessionToken, try to re-authenticate it.
              return this._fxaClient
                .sessionReauth(
                  sessionToken,
                  email,
                  password,
                  relier,
                  signinOptions
                )
                .catch((err) => {
                  // The session was invalid, do a fresh login.
                  if (!AuthErrors.is(err, 'INVALID_TOKEN')) {
                    throw err;
                  }
                  this.discardSessionToken();
                  return this._fxaClient.signIn(
                    email,
                    password,
                    relier,
                    signinOptions
                  );
                });
            }
          } else if (sessionToken) {
            // We have a cached Sync session so just check that it hasn't expired.
            // The result includes the latest verified state
            return this._fxaClient.recoveryEmailStatus(sessionToken);
          } else {
            throw AuthErrors.toError('UNEXPECTED_ERROR');
          }
        })
        .then((updatedSessionData) => {
          // If a different email case or primary email was used to login,
          // the session won't have correct email. Update the session to use the one
          // originally used for login.
          if (
            options.originalLoginEmail &&
            !emailsMatch(email, options.originalLoginEmail)
          ) {
            updatedSessionData.email = options.originalLoginEmail;
          }

          this.set(updatedSessionData);

          this._notifier.trigger('set-uid', this.get('uid'));

          return updatedSessionData;
        })
        .catch((err) => {
          // The `INCORRECT_EMAIL_CASE` can be returned if a user is attempting to login with a different
          // email case than what the account was created with or if they changed their primary email address.
          // In both scenarios, the content-server needs to know the original account email to hash
          // the user's password with.
          if (AuthErrors.is(err, 'INCORRECT_EMAIL_CASE')) {
            // Save the original email that was used for login. This value will be
            // sent to the auth-server so that it can correctly look the account.
            this.set('originalLoginEmail', email);

            // The email returned in the `INCORRECT_EMAIL_CASE` is either the canonical email
            // address or if the primary email has changed, it is the email the account was first
            // created with.
            this.set('email', err.email);
            return this.signIn(password, relier, options);
          } else if (
            AuthErrors.is(err, 'THROTTLED') ||
            AuthErrors.is(err, 'REQUEST_BLOCKED')
          ) {
            // On a throttled or block login request, the account model's email could be storing
            // a canonical email address or email the account was created with. If this is the case
            // set the account model's email to the email first used for the login request.
            const originalLoginEmail = this.get('originalLoginEmail');
            if (originalLoginEmail) {
              this.set('email', originalLoginEmail);
            }
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
    signUp(password, relier, options = {}) {
      return this._fxaClient
        .signUp(this.get('email'), password, relier, {
          metricsContext: this._metrics.getFlowEventMetadata(),
          resume: options.resume,
          verificationMethod: options.verificationMethod,
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
    retrySignUp(relier, options = {}) {
      return this._fxaClient.signUpResend(relier, this.get('sessionToken'), {
        resume: options.resume,
      });
    },

    /**
     * Request to verify current session.
     *
     * @param {Object} [options]
     * @param {String} [options.redirectTo] redirectTo url
     * @returns {Promise} - resolves when complete
     */
    requestVerifySession(options = {}) {
      return this._fxaClient.sessionVerifyResend(this.get('sessionToken'), {
        redirectTo: options.redirectTo,
      });
    },

    /**
     * Verify the account using the verification code
     *
     * @param {String} code - the verification code
     * @param {Object} [options]
     * @param {Object} [options.service] - the service issuing signup request
     * @returns {Promise} - resolves when complete
     */
    verifySignUp(code, options = {}) {
      const newsletters = this.get('newsletters');
      if (newsletters && newsletters.length) {
        this.unset('newsletters');
        options.newsletters = newsletters;
      }

      return this._fxaClient
        .verifyCode(this.get('uid'), code, options)
        .then(() => {
          if (newsletters) {
            this._notifier.trigger('flow.initialize');
            this._notifier.trigger('flow.event', {
              event: 'newsletter.subscribed',
            });
          }
        });
    },

    /**
     * Verify the session and account using the verification code.
     *
     * @param {String} code - the verification code
     * @param {Object} [options]
     * @param {Object} [options.service] - the service issuing signup request
     * @returns {Promise} - resolves when complete
     */
    verifySessionCode(code, options = {}) {
      const newsletters = this.get('newsletters');
      if (newsletters && newsletters.length) {
        this.unset('newsletters');
        options.newsletters = newsletters;
      }

      return this._fxaClient.sessionVerifyCode(
        this.get('sessionToken'),
        code,
        options
      );
    },

    /**
     * Resend the session and account verification code.
     *
     * @returns {Promise} - resolves when complete
     */
    verifySessionResendCode() {
      return this._fxaClient.sessionResendVerifyCode(this.get('sessionToken'));
    },

    /**
     * Check whether the account's email is registered.
     *
     * @returns {Promise} resolves to `true` if email is registered,
     * `false` otw.
     */
    checkEmailExists() {
      return this._fxaClient.checkAccountExistsByEmail(this.get('email'));
    },

    /**
     * Check whether the account's UID is registered.
     *
     * @returns {Promise} resolves to `true` if the uid is registered,
     * `false` otw.
     */
    checkUidExists() {
      return this._fxaClient.checkAccountExists(this.get('uid'));
    },

    /**
     * Sign out the current session.
     *
     * @returns {Promise} - resolves when complete
     */
    signOut() {
      this._notifier.trigger('clear-uid');
      return this._fxaClient.sessionDestroy(this.get('sessionToken'));
    },

    /**
     * Destroy the account, remove it from the server
     *
     * @param {String} password - The user's password
     * @returns {Promise} - resolves when complete
     */
    destroy(password) {
      return this._fxaClient
        .deleteAccount(this.get('email'), password, this.get('sessionToken'))
        .then(() => {
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
    _upgradeGrantedPermissions() {
      if (this.has('grantedPermissions')) {
        const grantedPermissions = this.get('grantedPermissions');

        // eslint-disable-next-line no-unused-vars
        for (const clientId in grantedPermissions) {
          const clientPermissions = {};
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
    getClientPermissions(clientId) {
      const permissions = this.get('permissions') || {};
      return permissions[clientId] || {};
    },

    /**
     * Get the value of a single permission
     *
     * @param {String} clientId
     * @param {String} permissionName
     * @returns {Boolean}
     */
    getClientPermission(clientId, permissionName) {
      const clientPermissions = this.getClientPermissions(clientId);
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
    setClientPermissions(clientId, clientPermissions) {
      const allPermissions = this.get('permissions') || {};
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
    hasSeenPermissions(clientId, permissions) {
      const seenPermissions = Object.keys(this.getClientPermissions(clientId));
      // without's signature is `array, *values)`,
      // *values cannot be an array, so convert to a form without can use.
      const args = [permissions].concat(seenPermissions);
      const notSeen = _.without.apply(_, args);
      return notSeen.length === 0;
    },

    /**
     * Return a list of permissions that have
     * corresponding account values.
     *
     * @param {String[]} permissionNames
     * @returns {String[]}
     */
    getPermissionsWithValues(permissionNames) {
      return permissionNames
        .map((permissionName) => {
          const accountKey = PERMISSIONS_TO_KEYS[permissionName];

          // filter out permissions we do not know about
          if (!accountKey) {
            return null;
          }

          // filter out permissions for which the account does not have a value
          if (!this.has(accountKey)) {
            return null;
          }

          return permissionName;
        })
        .filter((permissionName) => permissionName !== null);
    },

    /**
     * Change the user's password
     *
     * @param {String} oldPassword
     * @param {String} newPassword
     * @param {Object} relier
     * @returns {Promise}
     */
    changePassword(oldPassword, newPassword, relier) {
      // Try to sign the user in before checking whether the
      // passwords are the same. If the user typed the incorrect old
      // password, they should know that first.
      const fxaClient = this._fxaClient;
      const email = this.get('email');

      return fxaClient
        .checkPassword(email, oldPassword, this.get('sessionToken'))
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
        .then(this.set.bind(this))
        .then(async () => {
          await this.generateEcosystemAnonId({});
        });
    },

    /**
     * Override set to only allow fields listed in ALLOWED_FIELDS
     *
     * @method set
     */
    set: _.wrap(Backbone.Model.prototype.set, function (
      func,
      attribute,
      value,
      options
    ) {
      let attributes;
      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(attribute)) {
        attributes = attribute;
      } else {
        attributes = {};
        attributes[attribute] = value;
      }

      // eslint-disable-next-line no-unused-vars
      for (const key in attributes) {
        if (!_.contains(ALLOWED_KEYS, key)) {
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
     * @param {String} emailToHashWith - use this email to hash password with.
     * @returns {Promise} - resolves when complete
     */
    completePasswordReset(password, token, code, relier, emailToHashWith) {
      return this._fxaClient
        .completePasswordReset(
          this.get('email'),
          password,
          token,
          code,
          relier,
          {
            emailToHashWith,
            metricsContext: this._metrics.getFlowEventMetadata(),
          }
        )
        .then(this.set.bind(this))
        .then(async () => {
          await this.generateEcosystemAnonId({ password });
        });
    },

    /**
     * Fetch the account's list of attached clients.
     *
     * @returns {Promise} - resolves with a list of `AttachedClient` attribute sets when complete.
     */
    fetchAttachedClients() {
      return this._fxaClient.attachedClients(this.get('sessionToken'));
    },

    /**
     * Fetch the list of subscription plans on SubHub.
     *
     * @returns {Promise} - resolves with a list of subscription plans.
     */
    fetchSubscriptionPlans() {
      return this._fetchShortLivedSubscriptionsOAuthToken().then(
        (accessToken) => {
          return this._fxaClient.getSubscriptionPlans(accessToken.get('token'));
        }
      );
    },

    /**
     * Check to see if the account has any subscriptions.
     *
     * @returns {Promise} resolves to an array of zero or more subscriptions.
     */
    getSubscriptions() {
      return this.settingsData().then((settingsData) =>
        Array.isArray(settingsData.subscriptions)
          ? settingsData.subscriptions
          : []
      );
    },

    /**
     * Check to see if the account has any subscriptions.
     *
     * @returns {Promise} resolves to a bool.
     */
    hasSubscriptions() {
      return this.getSubscriptions().then(
        (subscriptions) => subscriptions.length > 0
      );
    },

    /**
     * Fetch the account's list of active subscriptions.
     *
     * @returns {Promise} - resolves with a list of subscription objects.
     */
    fetchActiveSubscriptions() {
      return this._fetchShortLivedSubscriptionsOAuthToken().then(
        (accessToken) => {
          return this._fxaClient.getActiveSubscriptions(
            accessToken.get('token')
          );
        }
      );
    },

    /**
     * Create a support ticket on Zendesk.
     *
     * @param {Object} [supportTicket={}]
     *   @param {String} [supportTicket.plan]
     *   @param {String} [supportTicket.topic]
     *   @param {String} [supportTicket.subject] Optional subject
     *   @param {String} [supportTicket.message]
     * @returns {Promise} - resolves with:
     *   - `success`
     *   - `ticket` OR `error`
     */
    createSupportTicket(supportTicket) {
      return this._fetchShortLivedSubscriptionsOAuthToken().then(
        (accessToken) => {
          return this._fxaClient.createSupportTicket(
            accessToken.get('token'),
            supportTicket
          );
        }
      );
    },

    /**
     * Update a user newsletters subscription.
     *
     * @param {String[]} [newsletters]
     * @returns {Promise} - resolves with empty response
     */
    updateNewsletters(newsletters) {
      return this._fxaClient.updateNewsletters(
        this.get('sessionToken'),
        newsletters
      );
    },

    /**
     * Fetch the account's device list.
     *
     * @returns {Promise} - resolves with an array of devices
     */
    fetchDeviceList() {
      return this._fxaClient.deviceList(this.get('sessionToken'));
    },

    /**
     * Fetch an access token with subscription management scopes and a lifetime
     * of 30 seconds.
     *
     * @returns {Promise<OAuthToken>}
     */
    _fetchShortLivedSubscriptionsOAuthToken() {
      return this.createOAuthToken(
        this._subscriptionsConfig.managementClientId,
        {
          scope: this._subscriptionsConfig.managementScopes,
          ttl: 30,
        }
      );
    },

    /**
     * Disconnect a client from the account
     *
     * @param {Object} client - AttachedClient model to remove
     * @returns {Promise} - resolves when complete
     */
    destroyAttachedClient(client) {
      const ids = client.pick(
        'deviceId',
        'sessionTokenId',
        'clientId',
        'refreshTokenId'
      );
      const sessionToken = this.get('sessionToken');

      return this._fxaClient
        .attachedClientDestroy(sessionToken, ids)
        .then(() => {
          // This notifies the containing collection that the client was destroyed.
          client.destroy();
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
    resetPassword(relier, options = {}) {
      return this._fxaClient.passwordReset(this.get('email'), relier, {
        metricsContext: this._metrics.getFlowEventMetadata(),
        resume: options.resume,
      });
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
    retryResetPassword(passwordForgotToken, relier, options = {}) {
      return this._fxaClient.passwordResetResend(
        this.get('email'),
        passwordForgotToken,
        relier,
        {
          metricsContext: this._metrics.getFlowEventMetadata(),
          resume: options.resume,
        }
      );
    },

    /**
     * Returns `true` if `keyFetchToken` and `unwrapBKey` are set.
     * @returns {boolean}
     */
    canFetchKeys() {
      return this.has('keyFetchToken') && this.has('unwrapBKey');
    },

    /**
     * Fetch keys for the account. Requires account to have
     * `keyFetchToken` and `unwrapBKey`
     *
     * @returns {Promise} that resolves with the account keys, if they
     *   can be generated, resolves with null otherwise.
     */
    accountKeys() {
      if (!this.canFetchKeys()) {
        return Promise.resolve(null);
      }

      return this._fxaClient.accountKeys(
        this.get('keyFetchToken'),
        this.get('unwrapBKey')
      );
    },
    /**
     * Check whether password reset is complete for the given token
     *
     * @param {String} token
     * @returns {Promise} resolves to a boolean, true if password reset has
     * been completed for the given token, false otw.
     */
    isPasswordResetComplete(token) {
      return this._fxaClient.isPasswordResetComplete(token);
    },

    /**
     * Send an unblock email.
     *
     * @returns {Promise} resolves when complete
     */
    sendUnblockEmail() {
      return this._fxaClient.sendUnblockEmail(this.get('email'), {
        metricsContext: this._metrics.getFlowEventMetadata(),
      });
    },

    /**
     * Reject a login unblock code.
     *
     * @param {String} unblockCode
     * @returns {Promise} resolves when complete
     */
    rejectUnblockCode(unblockCode) {
      return this._fxaClient.rejectUnblockCode(this.get('uid'), unblockCode);
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
    sendSms(phoneNumber, messageId, options = {}) {
      return this._fxaClient.sendSms(
        this.get('sessionToken'),
        phoneNumber,
        messageId,
        {
          features: options.features || [],
          metricsContext: this._metrics.getFlowEventMetadata(),
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
    smsStatus(options) {
      const sessionToken = this.get('sessionToken');
      if (!sessionToken) {
        return Promise.resolve({ ok: false });
      }

      return this._fxaClient.smsStatus(sessionToken, options);
    },

    /**
     * Get emails associated with user.
     *
     * @returns {Promise}
     */
    recoveryEmails() {
      return this._fxaClient.recoveryEmails(this.get('sessionToken'));
    },

    /**
     * Associates a new email to a user's account.
     *
     * @param {String} email
     * @param {Object} [options={}] options
     *   @param {Boolean} [options.verificationMethod]  method to verify the recovery email with, ex. email-otp (for codes)
     * @returns {Promise}
     */
    recoveryEmailCreate(email, options = {}) {
      return this._fxaClient.recoveryEmailCreate(
        this.get('sessionToken'),
        email,
        options
      );
    },

    /**
     * Deletes email from user's account.
     *
     * @param {String} email
     *
     * @returns {Promise}
     */
    recoveryEmailDestroy(email) {
      return this._fxaClient.recoveryEmailDestroy(
        this.get('sessionToken'),
        email
      );
    },

    /**
     * Verify a secondary email via a code.
     *
     * @param {String} email
     * @param {Number} code
     *
     * @returns {Promise}
     */
    recoveryEmailSecondaryVerifyCode(email, code) {
      return this._fxaClient.recoveryEmailSecondaryVerifyCode(
        this.get('sessionToken'),
        email,
        code
      );
    },

    /**
     * Resend secondary email verification code.
     *
     * @param {String} email
     *
     * @returns {Promise}
     */
    recoveryEmailSecondaryResendCode(email) {
      return this._fxaClient.recoveryEmailSecondaryResendCode(
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
    resendEmailCode(email) {
      return this._fxaClient.resendEmailCode(this.get('sessionToken'), email);
    },

    /**
     * Get emails associated with user.
     *
     * @returns {Promise}
     */
    getEmails() {
      return this._fxaClient.getEmails(this.get('sessionToken'));
    },

    /**
     * Associates a new email to a users account.
     *
     * @param {String} email
     *
     * @returns {Promise}
     */
    createEmail(email) {
      return this._fxaClient.createEmail(this.get('sessionToken'), email);
    },

    /**
     * Deletes an email from a users account.
     *
     * @param {String} email
     *
     * @returns {Promise}
     */
    deleteEmail(email) {
      return this._fxaClient.deleteEmail(this.get('sessionToken'), email);
    },

    /**
     * Sets the primary email address of the user.
     *
     * @param {String} email
     *
     * @returns {Promise}
     */
    setPrimaryEmail(email) {
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
    createTotpToken() {
      return this._fxaClient.createTotpToken(this.get('sessionToken'), {
        metricsContext: this._metrics.getFlowEventMetadata(),
      });
    },

    /**
     * Deletes the current TOTP token for a user.
     *
     * @returns {Promise}
     */
    deleteTotpToken() {
      this.set('totpVerified', false);
      return this._fxaClient.deleteTotpToken(this.get('sessionToken'));
    },

    /**
     * Verifies a TOTP code. If code is verified, token will be marked as verified.
     *
     * @param {String} code
     * @param {String} service
     * @returns {Promise}
     */
    verifyTotpCode(code, service) {
      const options = {
        metricsContext: this._metrics.getFlowEventMetadata(),
        service: service,
      };
      return this._fxaClient
        .verifyTotpCode(this.get('sessionToken'), code, options)
        .then((result) => {
          if (result.success) {
            this.set('totpVerified', true);
          }
          return result;
        });
    },

    /**
     * Check to see if the current user has a verified TOTP token.
     *
     * @returns {Promise}
     */
    checkTotpTokenExists() {
      return this._fxaClient.checkTotpTokenExists(this.get('sessionToken'));
    },

    /**
     * Consume a recovery code.
     *
     * @param {String} code

     * @returns {Promise}
     */
    consumeRecoveryCode(code) {
      return this._fxaClient.consumeRecoveryCode(
        this.get('sessionToken'),
        code,
        {
          metricsContext: this._metrics.getFlowEventMetadata(),
        }
      );
    },

    /**
     * Replaces all current recovery codes.
     *
     * @returns {Promise}
     */
    replaceRecoveryCodes() {
      return this._fxaClient.replaceRecoveryCodes(this.get('sessionToken'));
    },

    /**
     * Creates a new recovery key bundle for the current user.
     *
     * @param {String} password The current password for the user
     * @param {String} enable Enable to recovery key
     * @returns {Promise}
     */
    createRecoveryBundle(password, enabled) {
      return this._fxaClient.createRecoveryBundle(
        this.get('email'),
        password,
        this.get('sessionToken'),
        this.get('uid'),
        enabled
      );
    },

    /**
     * Deletes the recovery key associated with this user.
     *
     * @returns {Promise} resolves when complete.
     */
    deleteRecoveryKey() {
      return this._fxaClient.deleteRecoveryKey(this.get('sessionToken'));
    },

    /**
     * Verify the recovery key associated with this user.
     *
     * @returns {Promise} resolves when complete.
     */
    verifyRecoveryKey(recoveryKeyId) {
      return this._fxaClient.verifyRecoveryKey(
        this.get('sessionToken'),
        recoveryKeyId
      );
    },

    /**
     * This checks to see if a recovery key exists for a user.
     *
     * @returns {Promise} resolves with response when complete.
     *
     * Response: {
     *   exists: <boolean>
     * }
     */
    checkRecoveryKeyExists() {
      return this._fxaClient.recoveryKeyExists(this.get('sessionToken'));
    },

    /**
     * This checks to see if a recovery key exists for a given
     * email.
     *
     * Response: {
     *   exists: <boolean>
     * }
     * @returns {Promise} resolves with response when complete.
     */
    checkRecoveryKeyExistsByEmail() {
      return this._fxaClient.recoveryKeyExists(undefined, this.get('email'));
    },

    /**
     * Verify password forgot token to retrieve `accountResetToken`.
     *
     * @param {String} code
     * @param {String} token
     * @param {Object} [options={}] Options
     *   @param {String} [options.accountResetWithRecoveryKey] - perform account reset with recovery key
     * @returns {Promise} resolves with response when complete.
     */
    passwordForgotVerifyCode(code, token, options) {
      return this._fxaClient.passwordForgotVerifyCode(code, token, options);
    },

    /**
     * Get this user's recovery bundle, which contains their `kB`.
     *
     * @param {String} uid - Uid of user
     * @param  {String} recoveryKey - Recovery key for user
     * @returns {Promise} resolves with response when complete.
     */
    getRecoveryBundle(uid, recoveryKey) {
      return this._fxaClient.getRecoveryBundle(
        this.get('accountResetToken'),
        uid,
        recoveryKey
      );
    },

    /**
     * Reset an account using an account recovery key.
     *
     * @param {String} accountResetToken
     * @param {String} password - new password
     * @param {String} recoveryKeyId - recoveryKeyId that maps to recovery key
     * @param {String} kB - original kB
     * @param {Object} relier - relier being signed in to.
     * @param {String} emailToHashWith - has password with this email address
     * @returns {Promise} resolves with response when complete.
     */
    resetPasswordWithRecoveryKey(
      accountResetToken,
      password,
      recoveryKeyId,
      kB,
      relier,
      emailToHashWith
    ) {
      return this._fxaClient
        .resetPasswordWithRecoveryKey(
          accountResetToken,
          this.get('email'),
          password,
          recoveryKeyId,
          kB,
          relier,
          {
            emailToHashWith,
            metricsContext: this._metrics.getFlowEventMetadata(),
          }
        )
        .then(this.set.bind(this))
        .then(async () => {
          await this.generateEcosystemAnonId({ kB });
        });
    },

    /**
     * Verify the OIDC ID Token associated with an account.
     *
     * @param {String} idToken - the ID Token
     * @param {String} clientId - the client ID, used to verify the 'aud' claim
     * @param {Number} expiryGracePeriod - number of **seconds** past the
     * token expiration ('exp' claim value) for which the token will be treated
     * as valid.
     * @returns {Promise} resolves with response when complete.
     */
    verifyIdToken(idToken, clientId, expiryGracePeriod) {
      return this._fxaClient.verifyIdToken(
        idToken,
        clientId,
        expiryGracePeriod
      );
    },

    /**
     * Creates a signin code for a user. This code can be exchanged
     * for a users email address.
     *
     * @returns {Promise} resolves with response when complete.
     */
    createSigninCode() {
      return this._fxaClient.createSigninCode(this.get('sessionToken'));
    },

    /**
     * Queues up a reminder to CAD to be delivered at a later time.
     *
     * @returns {Promise} resolves with response when complete.
     */
    createCadReminder() {
      return this._fxaClient.createCadReminder(this.get('sessionToken'));
    },
  },
  {
    ALLOWED_KEYS: ALLOWED_KEYS,
    PERMISSIONS_TO_KEYS: PERMISSIONS_TO_KEYS,
  }
);

[
  'getProfile',
  'getAvatar',
  'deleteAvatar',
  'uploadAvatar',
  'postDisplayName',
].forEach(function (method) {
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
              return profileClient[method].call(
                profileClient,
                accessToken,
                ...args
              );
            })
            .catch((err) => {
              if (ProfileErrors.is(err, 'UNAUTHORIZED')) {
                // If fetching a new profile token failed, or using
                // the new profile token failed, consider the sessionToken
                // invalid, forcing the user to sign in again. See #999
                this.discardSessionToken();
              }
              throw err;
            });
        }
        throw err;
      });
  };
});

Cocktail.mixin(Account, ResumeTokenMixin);

export default Account;
