/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An OAuth Relier - holds OAuth information.
 */

import _ from 'underscore';
import Constants from '../../lib/constants';
import OAuthErrors from '../../lib/oauth-errors';
import OAuthPrompt from '../../lib/oauth-prompt';
import Relier from './relier';
import Transform from '../../lib/transform';
import Vat from '../../lib/vat';

const t = (msg) => msg;

/*eslint-disable camelcase*/
const CLIENT_INFO_SCHEMA = {
  id: Vat.hex().required().renameTo('clientId'),
  image_uri: Vat.url().allow('').renameTo('imageUri'),
  name: Vat.string().required().min(1).renameTo('serviceName'),

  // This can be a single uri or comma separated list
  redirect_uri: Vat.redirectUri().renameTo('redirectUri'),
  trusted: Vat.boolean().required(),
};

const SIGNIN_SIGNUP_QUERY_PARAM_SCHEMA = {
  access_type: Vat.accessType().renameTo('accessType'),
  acr_values: Vat.string().renameTo('acrValues'),
  action: Vat.action(),
  client_id: Vat.clientId().required().renameTo('clientId'),
  code_challenge: Vat.codeChallenge().renameTo('codeChallenge'),
  code_challenge_method: Vat.codeChallengeMethod().renameTo(
    'codeChallengeMethod'
  ),
  keys_jwk: Vat.keysJwk().renameTo('keysJwk'),
  id_token_hint: Vat.idToken().renameTo('idTokenHint'),
  login_hint: Vat.email().renameTo('loginHint'),
  max_age: Vat.number().min(0).renameTo('maxAge'),
  prompt: Vat.prompt(),
  redirect_uri: Vat.url()
    .allow(Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI)
    .renameTo('redirectUri'),
  redirectTo: Vat.url(),
  return_on_error: Vat.boolean().renameTo('returnOnError'),
  scope: Vat.string().required().min(1),
  state: Vat.string(),
};

const VERIFICATION_INFO_SCHEMA = {
  access_type: Vat.accessType().renameTo('accessType'),
  acr_values: Vat.string().renameTo('acrValues'),
  action: Vat.string().min(1),
  client_id: Vat.clientId().required().renameTo('clientId'),
  code_challenge: Vat.codeChallenge().renameTo('codeChallenge'),
  code_challenge_method: Vat.codeChallengeMethod().renameTo(
    'codeChallengeMethod'
  ),
  prompt: Vat.prompt(),
  redirect_uri: Vat.url().renameTo('redirectUri'),
  // scopes are optional when verifying, user could be verifying in a 2nd browser
  scope: Vat.string().min(1),
  // `service` for OAuth verification is a clientId
  service: Vat.clientId(),
  state: Vat.string().min(1),
};

/*eslint-enable camelcase*/

var OAuthRelier = Relier.extend({
  defaults: _.extend({}, Relier.prototype.defaults, {
    accessType: null,
    acrValues: null,
    clientId: null,
    context: Constants.OAUTH_CONTEXT,
    name: 'oauth',
    keysJwk: null,
    // permissions are individual scopes
    permissions: null,
    // whether the permissions prompt will be shown to trusted reliers
    prompt: null,
    // redirectTo is for future use by the oauth flow. redirectTo
    // would have redirectUri as its base.
    redirectTo: null,
    // redirectUri is used by the oauth flow
    redirectUri: null,
    // a rollup of all the permissions
    scope: null,
    // standard oauth parameters.
    state: null,
    // Max age since last auth
    maxAge: null,
  }),

  initialize(attributes, options = {}) {
    Relier.prototype.initialize.call(this, attributes, options);

    this._config = options.config;
    this._oAuthClient = options.oAuthClient;
    this._session = options.session;
    this._wantsScopeThatHasKeys = false;
  },

  fetch() {
    return Relier.prototype.fetch
      .call(this)
      .then(() => {
        if (this._isSuccessFlow()) {
          this._setupSuccessFlow();
        } else if (this._isVerificationFlow()) {
          this._setupVerificationFlow();
        } else {
          this._setupSignInSignUpFlow();
        }

        if (!this.has('service')) {
          this.set('service', this.get('clientId'));
        }

        return this._setupOAuthRPInfo();
      })
      .then(() => {
        if (this.has('scope')) {
          // normalization depends on `trusted` field set in
          // setupOAuthRPInfo.
          this._normalizeScopesAndPermissions();
        }
      })
      .then(() => {
        this._validateKeyScopeRequest();
      });
  },

  _normalizeScopesAndPermissions() {
    var permissions = this.scopeStrToArray(this.get('scope'));
    if (this.isTrusted()) {
      // We have to normalize `profile` into is expanded sub-scopes
      // in order to show the consent screen.
      if (this.wantsConsent()) {
        permissions = replaceItemInArray(
          permissions,
          Constants.OAUTH_TRUSTED_PROFILE_SCOPE,
          Constants.OAUTH_TRUSTED_PROFILE_SCOPE_EXPANSION
        );
      }
    } else {
      permissions = sanitizeUntrustedPermissions(permissions);
    }

    if (!permissions.length) {
      throw OAuthErrors.toInvalidParameterError('scope');
    }

    this.set('scope', permissions.join(' '));
    this.set('permissions', permissions);

    // As a special case for UX purposes, any client requesting access to
    // the user's sync data must have a display name of "Firefox Sync".
    if (permissions.includes(Constants.OAUTH_OLDSYNC_SCOPE)) {
      this.set('serviceName', t(Constants.RELIER_SYNC_SERVICE_NAME));
    }
  },

  isOAuth() {
    return true;
  },

  isSync() {
    return (
      this.get('serviceName') === Constants.RELIER_SYNC_SERVICE_NAME &&
      !this.isOAuthNativeRelay()
    );
  },

  isOAuthNativeRelay() {
    return this.get('service') === 'relay';
  },

  _isVerificationFlow() {
    return !!this.getSearchParam('code');
  },

  _isSuccessFlow() {
    return /oauth\/success/.test(this.window.location.pathname);
  },

  _setupVerificationFlow() {
    var resumeObj = this._session.oauth;
    if (!resumeObj) {
      // The user is verifying in a second browser. `service` is
      // available in the link. Use it to populate the `service`
      // and `clientId` fields which will allow the user to
      // redirect back to the RP but not sign in.
      resumeObj = {
        client_id: this.getSearchParam('service'), //eslint-disable-line camelcase
        service: this.getSearchParam('service'),
      };
    } else if (typeof resumeObj === 'string') {
      resumeObj = JSON.parse(resumeObj);
    }

    var result = Transform.transformUsingSchema(
      resumeObj,
      VERIFICATION_INFO_SCHEMA,
      OAuthErrors
    );

    this.set(result);
  },

  _setupSignInSignUpFlow() {
    // params listed in:
    // https://mozilla.github.io/ecosystem-platform/api#tag/OAuth-Server-API-Overview
    this.importSearchParamsUsingSchema(
      SIGNIN_SIGNUP_QUERY_PARAM_SCHEMA,
      OAuthErrors
    );

    if (!this.get('email') && this.get('loginHint')) {
      this.set('email', this.get('loginHint'));
    }

    // OAuth reliers (at the moment, only oauth desktop) are only allowed to
    // specify 'sync' or 'relay' as the service.
    if (
      this.getSearchParam('service') &&
      this.getSearchParam('service') !== 'sync' &&
      this.getSearchParam('service') !== 'relay'
    ) {
      throw OAuthErrors.toInvalidParameterError('service');
    }
  },

  _setupSuccessFlow() {
    const pathname = this.window.location.pathname.split('/');
    const clientId = pathname[pathname.length - 1];
    if (!clientId) {
      throw OAuthErrors.toError('INVALID_PARAMETER');
    }

    this.set('clientId', clientId);
  },

  _setupOAuthRPInfo() {
    const clientId = this.get('clientId');

    return this._oAuthClient.getClientInfo(clientId).then(
      (serviceInfo) => {
        const result = Transform.transformUsingSchema(
          serviceInfo,
          CLIENT_INFO_SCHEMA,
          OAuthErrors
        );

        /**
         * If redirect_uri was specified in the query we must validate it
         * Ref: https://tools.ietf.org/html/rfc6749#section-3.1.2
         *
         * Verification (email) flows do not have a redirect uri, nothing to validate
         */
        if (!isCorrectRedirect(this.get('redirectUri'), result)) {
          // if provided redirect uri doesn't match with any client redirectUri then throw
          throw OAuthErrors.toError('INCORRECT_REDIRECT');
        }

        this.set(result);
      },
      function (err) {
        // the server returns an invalid request parameter for an
        // invalid/unknown client_id
        if (
          OAuthErrors.is(err, 'INVALID_PARAMETER') &&
          err.validation &&
          err.validation.keys &&
          err.validation.keys[0] === 'client_id'
        ) {
          err = OAuthErrors.toError('UNKNOWN_CLIENT');
          // used for logging the error on the server.
          err.client_id = clientId; //eslint-disable-line camelcase
        }
        throw err;
      }
    );

    function isCorrectRedirect(queryRedirectUri, client) {
      // If RP doesn't specify redirectUri, we default to the first redirectUri
      // for the client
      const redirectUris = client.redirectUri.split(',');
      if (!queryRedirectUri) {
        client.redirectUri = redirectUris[0];
        return true;
      }

      const hasRedirectUri = redirectUris.some((uri) => {
        if (queryRedirectUri === uri) {
          return true;
        }
      });
      if (hasRedirectUri) {
        client.redirectUri = queryRedirectUri;
        return true;
      }

      // Pairing has a special redirectUri that deep links into the specific
      // mobile app
      if (
        queryRedirectUri === Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI
      ) {
        return true;
      }

      return false;
    }
  },

  isTrusted() {
    return this.get('trusted');
  },

  /**
   * Return `true` if the relier sets `prompt=consent`
   *
   * @returns {Boolean} `true` if relier asks for consent, false otw.
   */
  wantsConsent() {
    return this.get('prompt') === OAuthPrompt.CONSENT;
  },

  /**
   * Return `true` if the relier sets `prompt=login` or `maxAge=0`. Per OIDC spec,
   * specifying `maxAge=0` should act like `prompt=login`, however the RP needs to
   * verify the `auth_at` value in the id token to confirm that a re-authentication
   * occurred.
   *
   * @returns {Boolean}
   */
  wantsLogin() {
    return this.get('prompt') === OAuthPrompt.LOGIN || this.get('maxAge') === 0;
  },

  /**
   * Return `true` if the relier specified two step authentication
   * in its acrValues.
   *
   * @returns {Boolean} `true` if relier asks for two step authentication, false otw.
   */
  wantsTwoStepAuthentication() {
    const acrValues = this.get('acrValues');
    if (!acrValues) {
      return false;
    }
    const tokens = acrValues.split(' ');
    return tokens.includes(Constants.TWO_STEP_AUTHENTICATION_ACR);
  },

  /**
   * Check if the relier wants access to the account encryption keys.
   *
   * @returns {Boolean}
   */
  wantsKeys() {
    return !!(
      this._config &&
      this._config.scopedKeysEnabled &&
      this.has('keysJwk') &&
      this._wantsScopeThatHasKeys
    );
  },

  /**
   * Perform additional validation for scopes that have encryption keys.
   *
   * If the relier is requesting keys, we check their redirect URI against
   * against an explicit allowlist and throw an error if it doesn't match.
   *
   * This provides an extra line of defence against us sending the keys
   * somewhere unintended as a result of e.g. a config error or a
   * badly-behaved server.
   *
   * @returns {boolean}
   * @private
   */
  _validateKeyScopeRequest() {
    if (!this.has('keysJwk')) {
      return false;
    }

    // If they're not requesting any scopes, we're not going to given them any keys.
    if (!this.get('scope')) {
      return false;
    }

    const validation = this._config.scopedKeysValidation || {};

    this.scopeStrToArray(this.get('scope')).forEach((scope) => {
      // eslint-disable-next-line no-prototype-builtins
      if (validation.hasOwnProperty(scope)) {
        if (validation[scope].redirectUris.includes(this.get('redirectUri'))) {
          this._wantsScopeThatHasKeys = true;
        } else {
          // Requesting keys, but trying to deliver them to an unexpected uri? Nope.
          throw new Error('Invalid redirect parameter');
        }
      }
    });

    return this._wantsScopeThatHasKeys;
  },

  /**
   * Ensure the prompt=none can be used.
   *
   * @param {Account} account
   * @throws {OAuthError} if prompt=none cannot be used.
   * @returns {Promise<none>} rejects with an error if prompt=none cannot be used.
   */
  validatePromptNoneRequest(account) {
    const requestedEmail = this.get('email');
    return Promise.resolve()
      .then(() => {
        if (!this._config.isPromptNoneEnabled) {
          throw OAuthErrors.toError('PROMPT_NONE_NOT_ENABLED');
        }

        // If the RP uses email, check they are allowed to use prompt=none.
        // This check is not necessary if the RP uses id_token_hint.
        // See the discussion issue: https://github.com/mozilla/fxa/issues/4963
        if (requestedEmail && !this._config.isPromptNoneEnabledForClient) {
          throw OAuthErrors.toError('PROMPT_NONE_NOT_ENABLED_FOR_CLIENT');
        }

        if (this.wantsKeys()) {
          throw OAuthErrors.toError('PROMPT_NONE_WITH_KEYS');
        }

        if (account.isDefault() || !account.get('sessionToken')) {
          throw OAuthErrors.toError('PROMPT_NONE_NOT_SIGNED_IN');
        }

        // If `id_token_hint` is present, ignore `login_hint` / `email`.
        const idTokenHint = this.get('idTokenHint');
        if (idTokenHint) {
          const clientId = this.get('clientId');
          return account
            .verifyIdToken(
              idTokenHint,
              clientId,
              Constants.ID_TOKEN_HINT_GRACE_PERIOD
            )
            .catch((err) => {
              throw OAuthErrors.toError('PROMPT_NONE_INVALID_ID_TOKEN_HINT');
            })
            .then((claims) => {
              if (claims.sub !== account.get('uid')) {
                throw OAuthErrors.toError(
                  'PROMPT_NONE_DIFFERENT_USER_SIGNED_IN'
                );
              }
            });
        }

        if (requestedEmail && requestedEmail !== account.get('email')) {
          throw OAuthErrors.toError('PROMPT_NONE_DIFFERENT_USER_SIGNED_IN');
        }

        return Promise.resolve();
      })
      .then(() => {
        // account has all the right bits associated with it,
        // now let's check to see whether the account and session
        // are verified. If session is no good, the promise will
        // reject with an INVALID_TOKEN error.
        return account.sessionVerificationStatus().then(({ verified }) => {
          if (!verified) {
            throw OAuthErrors.toError('PROMPT_NONE_UNVERIFIED');
          }
        });
      });
  },

  /**
   * Check whether additional permissions are requested from
   * the given account
   *
   * @param {Object} account
   * @returns {Boolean} `true` if additional permissions
   *   are needed, false otw.
   */
  accountNeedsPermissions(account) {
    if (this.isTrusted() && !this.wantsConsent()) {
      return false;
    }

    // only check permissions for which the account has a value.
    var applicableProfilePermissions = account.getPermissionsWithValues(
      this.get('permissions')
    );

    return !account.hasSeenPermissions(
      this.get('clientId'),
      applicableProfilePermissions
    );
  },
  /**
   * Converts a whitespace OR a + separated list of scopes into an Array
   * @param {String} scopes
   * @returns {Array}
   */
  scopeStrToArray: function scopeStrToArray(scopes) {
    if (!_.isString(scopes)) {
      return [];
    }

    const trimmedScopes = scopes.trim();
    if (trimmedScopes.length) {
      // matches any whitespace character OR matches the character '+' literally
      return _.uniq(scopes.split(/\s+|\++/g));
    } else {
      return [];
    }
  },
});

function replaceItemInArray(array, itemToReplace, replaceWith) {
  var without = _.without(array, itemToReplace);
  if (without.length !== array.length) {
    return _.union(without, replaceWith);
  }
  return array;
}

function sanitizeUntrustedPermissions(permissions) {
  return _.intersection(
    permissions,
    Constants.OAUTH_UNTRUSTED_ALLOWED_PERMISSIONS
  );
}

export default OAuthRelier;
