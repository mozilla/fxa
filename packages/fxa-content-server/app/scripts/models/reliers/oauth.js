/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An OAuth Relier - holds OAuth information.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Constants = require('lib/constants');
  var OAuthErrors = require('lib/oauth-errors');
  var Relier = require('models/reliers/relier');
  var RelierKeys = require('lib/relier-keys');
  var Url = require('lib/url');
  var Validate = require('lib/validate');

  var RELIER_FIELDS_IN_RESUME_TOKEN = ['state', 'verificationRedirect'];

  var OAuthRelier = Relier.extend({
    defaults: _.extend({}, Relier.prototype.defaults, {
      accessType: null,
      clientId: null,
      // whether to fetch and derive relier-specific keys
      keys: false,
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
      // verification redirect to the rp, useful during email
      // verification signup flow
      verificationRedirect: Constants.VERIFICATION_REDIRECT_NO
    }),

    resumeTokenFields: _.union(
      RELIER_FIELDS_IN_RESUME_TOKEN,
      Relier.prototype.resumeTokenFields
    ),

    initialize: function (options) {
      options = options || {};

      Relier.prototype.initialize.call(this, options);

      this._session = options.session;
      this._oAuthClient = options.oAuthClient;
    },

    fetch: function () {
      var self = this;
      return Relier.prototype.fetch.call(this)
        .then(function () {
          if (self._isVerificationFlow()) {
            self._setupVerificationFlow();
          } else {
            self._setupSignInSignUpFlow();
          }

          if (! self.has('service')) {
            self.set('service', self.get('clientId'));
          }

          return self._setupOAuthRPInfo();
        })
        .then(function () {
          if (! self.get('clientId')) {
            throw toMissingParameterError('client_id');
          } else if (! self.get('redirectUri')) {
            // Guard against a possible empty redirect_uri
            // sent by the server. redirect_uri is not required
            // by the OAuth server, but if it's missing, we redirect
            // to ourselves. See issue #3452
            throw toMissingParameterError('redirect_uri');
          }

          if (self.has('scope')) {
            // normalization depends on `trusted` field set in
            // setupOAuthRPInfo.
            self._normalizeScopesAndPermissions();
          }
        });
    },

    _normalizeScopesAndPermissions: function () {
      var permissions = scopeStrToArray(this.get('scope'));
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
        throw toInvalidParameterError('scope');
      }

      this.set('scope', permissions.join(' '));
      this.set('permissions', permissions);
    },

    isOAuth: function () {
      return true;
    },

    /**
     * OAuth reliers can opt in to fetch relier-specific keys.
     */
    wantsKeys: function () {
      if (this.get('keys')) {
        return true;
      }
      return Relier.prototype.wantsKeys.call(this);
    },

    deriveRelierKeys: function (keys, uid) {
      return RelierKeys.deriveRelierKeys(keys, uid, this.get('clientId'));
    },

    _isVerificationFlow: function () {
      return !! this.getSearchParam('code');
    },

    _setupVerificationFlow: function () {
      var self = this;

      var resumeObj = self._session.oauth;
      if (! resumeObj) {
        // The user is verifying in a second browser. `service` is
        // available in the link. Use it to populate the `service`
        // and `clientId` fields which will allow the user to
        // redirect back to the RP but not sign in.
        resumeObj = {
          client_id: self.getSearchParam('service'), //eslint-disable-line camelcase
          service: self.getSearchParam('service')
        };
      }

      this._validateOAuthValues(resumeObj);

      self.set({
        accessType: resumeObj.access_type,
        clientId: resumeObj.client_id,
        keys: resumeObj.keys,
        redirectUri: resumeObj.redirect_uri,
        scope: resumeObj.scope,
        state: resumeObj.state
      });
    },

    _setupSignInSignUpFlow: function () {
      var self = this;
      /*eslint-disable camelcase*/
      var oauthOptions = {
        access_type: self.getSearchParam('access_type'),
        client_id: self.getSearchParam('client_id'),
        prompt: self.getSearchParam('prompt'),
        redirectTo: self.getSearchParam('redirectTo'),
        redirect_uri: self.getSearchParam('redirect_uri'),
        verification_redirect: self.getSearchParam('verification_redirect'),
      };
      /*eslint-enable camelcase*/

      this._validateOAuthValues(oauthOptions);

      // params listed in:
      // https://github.com/mozilla/fxa-oauth-server/blob/master/docs/api.md#post-v1authorization
      self.importSearchParam('access_type', 'accessType');
      self.importRequiredSearchParam('client_id', 'clientId', OAuthErrors);
      self.importBooleanSearchParam('keys', 'keys', OAuthErrors);
      self.importSearchParam('prompt');
      self.importSearchParam('redirectTo');
      self.importSearchParam('redirect_uri', 'redirectUri');
      self.importRequiredSearchParam('scope', 'scope', OAuthErrors);
      self.importSearchParam('state');
      self.importSearchParam('verification_redirect', 'verificationRedirect');
    },

    _validateOAuthValues: function (options) {
      var accessType = options.access_type;
      var clientId = options.client_id;
      var prompt = options.prompt;
      var redirectUri = options.redirect_uri;
      var redirectTo = options.redirectTo;
      var termsUri = options.terms_uri;
      var privacyUri = options.privacy_uri;
      var verificationRedirect = options.verification_redirect;

      if (isDefined(accessType) && ! Validate.isAccessTypeValid(accessType)) {
        throw toInvalidParameterError('access_type');
      }

      if (isDefined(clientId) && ! Validate.isHexValid(clientId)) {
        throw toInvalidParameterError('client_id');
      }

      // privacyUri is allowed to be ``
      if (privacyUri && ! Validate.isUriValid(privacyUri)) {
        throw toInvalidParameterError('privacy_uri');
      }

      if (isDefined(prompt) && ! Validate.isPromptValid(prompt)) {
        throw toInvalidParameterError('prompt');
      }

      if (isDefined(redirectTo) && ! Validate.isUriValid(redirectTo)) {
        throw toInvalidParameterError('redirectTo');
      }

      if (isDefined(redirectUri) && ! Validate.isUriValid(redirectUri)) {
        throw toInvalidParameterError('redirect_uri');
      }

      // termsUri is allowed to be ``
      if (termsUri && ! Validate.isUriValid(termsUri)) {
        throw toInvalidParameterError('terms_uri');
      }

      if (isDefined(verificationRedirect) &&
          ! Validate.isVerificationRedirectValid(verificationRedirect)) {
        throw toInvalidParameterError('verification_redirect');
      }
    },

    _setupOAuthRPInfo: function () {
      var self = this;
      var clientId = self.get('clientId');

      return self._oAuthClient.getClientInfo(clientId)
        .then(function (serviceInfo) {
          self.set('serviceName', serviceInfo.name);

          self._validateOAuthValues(serviceInfo);

          // server version always takes precedent over the search parameter
          self.set('redirectUri', serviceInfo.redirect_uri);
          self.set('termsUri', serviceInfo.terms_uri);
          self.set('privacyUri', serviceInfo.privacy_uri);
          self.set('trusted', serviceInfo.trusted);
          self.set('origin', Url.getOrigin(serviceInfo.redirect_uri));
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
    },

    isTrusted: function () {
      return this.get('trusted');
    },

    /**
     * Return `true` if the relier sets `prompt=consent`
     *
     * @returns {boolean} `true` if relier asks for consent, false otw.
     */
    wantsConsent: function () {
      return this.get('prompt') === Constants.OAUTH_PROMPT_CONSENT;
    },

    /**
     * Check whether additional permissions are requested from
     * the given account
     *
     * @param {object} account
     * @returns {boolean} `true` if additional permissions
     *   are needed, false otw.
     */
    accountNeedsPermissions: function (account) {
      if (this.isTrusted() && ! this.wantsConsent()) {
        return false;
      }

      // only check permissions for which the account has a value.
      var applicableProfilePermissions =
        account.getPermissionsWithValues(this.get('permissions'));

      return ! account.hasSeenPermissions(
          this.get('clientId'), applicableProfilePermissions);
    }
  });

  function replaceItemInArray(array, itemToReplace, replaceWith) {
    var without = _.without(array, itemToReplace);
    if (without.length !== array.length) {
      return _.union(without, replaceWith);
    }
    return array;
  }

  function scopeStrToArray(scopes) {
    if (! _.isString) {
      return [];
    }

    var trimmedScopes = scopes.trim();
    if (trimmedScopes.length) {
      return _.uniq(scopes.split(/\s+/g));
    } else {
      return [];
    }
  }

  function sanitizeUntrustedPermissions(permissions) {
    return _.intersection(permissions, Constants.OAUTH_UNTRUSTED_ALLOWED_PERMISSIONS);
  }

  function toInvalidParameterError(param) {
    return toOAuthParameterError('INVALID_PARAMETER', param);
  }

  function toMissingParameterError(param) {
    return toOAuthParameterError('MISSING_PARAMETER', param);
  }

  function toOAuthParameterError(type, param) {
    var err = OAuthErrors.toError(type);
    err.param = param;
    return err;
  }

  function isDefined(value) {
    return ! _.isUndefined(value);
  }

  module.exports = OAuthRelier;
});
