/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An OAuth Relier - holds OAuth information.
 */

import _ from 'underscore';
import Constants from '../../lib/constants';
import OAuthErrors from '../../lib/oauth-errors';
import Relier from './relier';
import Transform from '../../lib/transform';
import Vat from '../../lib/vat';

/*eslint-disable camelcase*/
var CLIENT_INFO_SCHEMA = {
  id: Vat.hex().required().renameTo('clientId'),
  image_uri: Vat.url().allow('').renameTo('imageUri'),
  name: Vat.string().required().min(1).renameTo('serviceName'),
  redirect_uri: Vat.url().required().renameTo('redirectUri'),
  trusted: Vat.boolean().required()
};

var SIGNIN_SIGNUP_QUERY_PARAM_SCHEMA = {
  access_type: Vat.accessType().renameTo('accessType'),
  acr_values: Vat.string().renameTo('acrValues'),
  action: Vat.action(),
  client_id: Vat.clientId().required().renameTo('clientId'),
  code_challenge: Vat.codeChallenge().renameTo('codeChallenge'),
  code_challenge_method: Vat.codeChallengeMethod().renameTo('codeChallengeMethod'),
  keys_jwk: Vat.keysJwk().renameTo('keysJwk'),
  login_hint: Vat.email().renameTo('loginHint'),
  prompt: Vat.prompt(),
  redirect_uri: Vat.url().allow(Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI).renameTo('redirectUri'),
  redirectTo: Vat.url(),
  scope: Vat.string().required().min(1),
  state: Vat.string()
};

var VERIFICATION_INFO_SCHEMA = {
  access_type: Vat.accessType().renameTo('accessType'),
  acr_values: Vat.string().renameTo('acrValues'),
  action: Vat.string().min(1),
  client_id: Vat.clientId().required().renameTo('clientId'),
  code_challenge: Vat.codeChallenge().renameTo('codeChallenge'),
  code_challenge_method: Vat.codeChallengeMethod().renameTo('codeChallengeMethod'),
  prompt: Vat.prompt(),
  redirect_uri: Vat.url().renameTo('redirectUri'),
  // scopes are optional when verifying, user could be verifying in a 2nd browser
  scope: Vat.string().min(1),
  // `service` for OAuth verification is a clientId
  service: Vat.clientId(),
  state: Vat.string().min(1)
};

  /*eslint-enable camelcase*/

var OAuthRelier = Relier.extend({
  defaults: _.extend({}, Relier.prototype.defaults, {
    accessType: null,
    acrValues: null,
    clientId: null,
    context: Constants.OAUTH_CONTEXT,
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
    state: null
  }),

  initialize (attributes, options = {}) {
    Relier.prototype.initialize.call(this, attributes, options);

    this._config = options.config;
    this._oAuthClient = options.oAuthClient;
    this._session = options.session;
  },

  fetch () {
    return Relier.prototype.fetch.call(this)
      .then(() => {
        if (this._isSuccessFlow()) {
          this._setupSuccessFlow();
        } else if (this._isVerificationFlow()) {
          this._setupVerificationFlow();
        } else {
          this._setupSignInSignUpFlow();
        }

        if (! this.has('service')) {
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

  _normalizeScopesAndPermissions () {
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

    if (! permissions.length) {
      throw OAuthErrors.toInvalidParameterError('scope');
    }

    this.set('scope', permissions.join(' '));
    this.set('permissions', permissions);
  },

  isOAuth () {
    return true;
  },

  _isVerificationFlow () {
    return !! this.getSearchParam('code');
  },

  _isSuccessFlow () {
    return /oauth\/success/.test(this.window.location.pathname);
  },

  _setupVerificationFlow () {
    var resumeObj = this._session.oauth;
    if (! resumeObj) {
      // The user is verifying in a second browser. `service` is
      // available in the link. Use it to populate the `service`
      // and `clientId` fields which will allow the user to
      // redirect back to the RP but not sign in.
      resumeObj = {
        client_id: this.getSearchParam('service'), //eslint-disable-line camelcase
        service: this.getSearchParam('service')
      };
    }

    var result = Transform.transformUsingSchema(
      resumeObj, VERIFICATION_INFO_SCHEMA, OAuthErrors);

    this.set(result);
  },

  _setupSignInSignUpFlow () {
    // params listed in:
    // https://github.com/mozilla/fxa-oauth-server/blob/master/docs/api.md#post-v1authorization
    this.importSearchParamsUsingSchema(
      SIGNIN_SIGNUP_QUERY_PARAM_SCHEMA, OAuthErrors);

    if (! this.get('email') && this.get('loginHint')) {
      this.set('email', this.get('loginHint'));
    }

    // OAuth reliers are not allowed to specify a service. `service`
    // is used in the verification flow, it'll be set to the `client_id`.
    if (this.getSearchParam('service')) {
      throw OAuthErrors.toInvalidParameterError('service');
    }
  },

  _setupSuccessFlow () {
    const pathname = this.window.location.pathname.split('/');
    const clientId = pathname[pathname.length - 1];
    if (! clientId) {
      throw OAuthErrors.toError('INVALID_PARAMETER');
    }

    this.set('clientId', clientId);
  },

  _setupOAuthRPInfo () {
    const clientId = this.get('clientId');

    return this._oAuthClient.getClientInfo(clientId)
      .then((serviceInfo) => {
        const result = Transform.transformUsingSchema(
          serviceInfo, CLIENT_INFO_SCHEMA, OAuthErrors);

          /**
           * If redirect_uri was specified in the query we must validate it
           * Ref: https://tools.ietf.org/html/rfc6749#section-3.1.2
           *
           * Verification (email) flows do not have a redirect uri, nothing to validate
           */
        if (! isCorrectRedirect(this.get('redirectUri'), result.redirectUri)) {
          // if provided redirect uri doesn't match with client info then throw
          throw OAuthErrors.toError('INCORRECT_REDIRECT');
        }

        this.set(result);
      }, function (err) {
        // the server returns an invalid request parameter for an
        // invalid/unknown client_id
        if (OAuthErrors.is(err, 'INVALID_PARAMETER') &&
              err.validation &&
              err.validation.keys &&
              err.validation.keys[0] === 'client_id') {
          err = OAuthErrors.toError('UNKNOWN_CLIENT');
          // used for logging the error on the server.
          err.client_id = clientId; //eslint-disable-line camelcase
        }
        throw err;
      });

    function isCorrectRedirect (queryRedirectUri, resultRedirectUri) {
      if (! queryRedirectUri) {
        return true;
      } else if (queryRedirectUri === resultRedirectUri) {
        return true;
      } else if (queryRedirectUri === Constants.DEVICE_PAIRING_AUTHORITY_REDIRECT_URI) {
        return true;
      }

      return false;
    }
  },

  isTrusted () {
    return this.get('trusted');
  },

  /**
     * Return `true` if the relier sets `prompt=consent`
     *
     * @returns {Boolean} `true` if relier asks for consent, false otw.
     */
  wantsConsent () {
    return this.get('prompt') === Constants.OAUTH_PROMPT_CONSENT;
  },

  /**
   * Return `true` if the relier specified two step authentication
   * in its acrValues.
   *
   * @returns {Boolean} `true` if relier asks for two step authentication, false otw.
   */
  wantsTwoStepAuthentication () {
    const acrValues = this.get('acrValues');
    if (! acrValues) {
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
  wantsKeys () {
    return !! (this._config && this._config.scopedKeysEnabled && this.has('keysJwk'));
  },


  /**
     * Perform additional validation for scopes that have encryption keys.
     *
     * If the relier is requesting keys, we check their redirect URI against
     * against an explicit allowlist and throw an error if there's anything
     * even slightly unexpected about the request.
     *
     * This provides an extra line of defence against us sending the keys
     * somewhere unintended as a result of e.g. a config error or a
     * badly-behaved server.
     *
     * @returns {boolean}
     * @private
     */
  _validateKeyScopeRequest () {
    if (! this.has('keysJwk')) {
      return false;
    }

    const validation = this._config.scopedKeysValidation || {};
    let foundRedirectScopeMatch = false;

    // Requesting keys, but not specifying a scope?  That's unexpected.
    if (! this.get('scope')) {
      throw new Error('Invalid scope parameter');
    }

    this.scopeStrToArray(this.get('scope')).forEach((scope) => {
      if (validation.hasOwnProperty(scope)) {
        if (validation[scope].redirectUris.includes(this.get('redirectUri'))) {
          foundRedirectScopeMatch = true;
        } else {
          // Requesting keys, but trying to deliver them to an unexpected uri? Nope.
          throw new Error('Invalid redirect parameter');
        }
      }
    });

    // Requesting keys, but no key-bearing scopes? That's unexpected.
    if (! foundRedirectScopeMatch) {
      throw new Error('No key-bearing scopes requested');
    }

    return true;
  },

  /**
     * Check whether additional permissions are requested from
     * the given account
     *
     * @param {Object} account
     * @returns {Boolean} `true` if additional permissions
     *   are needed, false otw.
     */
  accountNeedsPermissions (account) {
    if (this.isTrusted() && ! this.wantsConsent()) {
      return false;
    }

    // only check permissions for which the account has a value.
    var applicableProfilePermissions =
        account.getPermissionsWithValues(this.get('permissions'));

    return ! account.hasSeenPermissions(
      this.get('clientId'), applicableProfilePermissions);
  },
  /**
   * Converts a whitespace OR a + separated list of scopes into an Array
   * @param {String} scopes
   * @returns {Array}
   */
  scopeStrToArray: function scopeStrToArray(scopes) {
    if (! _.isString(scopes)) {
      return [];
    }

    const trimmedScopes = scopes.trim();
    if (trimmedScopes.length) {
      // matches any whitespace character OR matches the character '+' literally
      return _.uniq(scopes.split(/\s+|\++/g));
    } else {
      return [];
    }
  }
});

function replaceItemInArray(array, itemToReplace, replaceWith) {
  var without = _.without(array, itemToReplace);
  if (without.length !== array.length) {
    return _.union(without, replaceWith);
  }
  return array;
}

function sanitizeUntrustedPermissions(permissions) {
  return _.intersection(permissions, Constants.OAUTH_UNTRUSTED_ALLOWED_PERMISSIONS);
}

export default OAuthRelier;
