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
            self._setupSigninSignupFlow();
          }

          if (! self.has('service')) {
            self.set('service', self.get('clientId'));
          }

          return self._setupOAuthRPInfo();
        })
        .then(function () {
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
        // replace `profile` with the expanded permissions for trusted reliers
        permissions = replaceItemInArray(
          permissions,
          Constants.OAUTH_TRUSTED_PROFILE_SCOPE,
          Constants.OAUTH_TRUSTED_PROFILE_SCOPE_EXPANSION
        );
      } else {
        permissions = sanitizeUntrustedPermissions(permissions);
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

      self.set({
        accessType: resumeObj.access_type,
        clientId: resumeObj.client_id,
        keys: resumeObj.keys,
        redirectUri: resumeObj.redirect_uri,
        scope: resumeObj.scope,
        state: resumeObj.state
      });

      if (! self.has('clientId')) {
        var err = OAuthErrors.toError('MISSING_PARAMETER');
        err.param = 'client_id';
        throw err;
      }
    },

    _setupSigninSignupFlow: function () {
      var self = this;

      // params listed in:
      // https://github.com/mozilla/fxa-oauth-server/blob/master/docs/api.md#post-v1authorization
      self.importSearchParam('access_type', 'accessType');
      self._importRequiredSearchParam('client_id', 'clientId');
      self.importBooleanSearchParam('keys');
      self.importSearchParam('prompt');
      self._validatePrompt();
      self.importSearchParam('redirectTo');
      self.importSearchParam('redirect_uri', 'redirectUri');
      self._importRequiredSearchParam('scope', 'scope');
      self.importSearchParam('state');
      self.importSearchParam('verification_redirect', 'verificationRedirect');
    },

    _validatePrompt: function () {
      var prompt = this.get('prompt');
      if (! Validate.isPromptValid(prompt)) {
        var err = OAuthErrors.toError('INVALID_REQUEST_PARAMETER', prompt);
        err.param = 'prompt';
        throw err;
      }
    },

    _importRequiredSearchParam: function (sourceName, destName) {
      var self = this;
      self.importSearchParam(sourceName, destName);
      if (! self.has(destName)) {
        var err = OAuthErrors.toError('MISSING_PARAMETER');
        err.param = sourceName;
        throw err;
      }
    },

    _setupOAuthRPInfo: function () {
      var self = this;
      var clientId = self.get('clientId');

      return self._oAuthClient.getClientInfo(clientId)
        .then(function (serviceInfo) {
          self.set('serviceName', serviceInfo.name);
          // server version always takes precedent over the search parameter
          self.set('redirectUri', serviceInfo.redirect_uri);
          self.set('termsUri', serviceInfo.terms_uri);
          self.set('privacyUri', serviceInfo.privacy_uri);
          self.set('trusted', serviceInfo.trusted);
          self.set('origin', Url.getOrigin(serviceInfo.redirect_uri));
        }, function (err) {
          // the server returns an invalid request parameter for an
          // invalid/unknown client_id
          if (OAuthErrors.is(err, 'INVALID_REQUEST_PARAMETER') &&
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
    return typeof scopes === 'string' ? _.uniq(scopes.split(/\s+/g)) : scopes;
  }

  function sanitizeUntrustedPermissions(permissions) {
    return _.intersection(permissions, Constants.OAUTH_UNTRUSTED_ALLOWED_PERMISSIONS);
  }

  module.exports = OAuthRelier;
});
