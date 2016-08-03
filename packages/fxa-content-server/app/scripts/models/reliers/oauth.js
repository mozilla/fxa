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
  var Transform = require('lib/transform');
  var Validate = require('lib/validate');
  var Vat = require('lib/vat');

  var RELIER_FIELDS_IN_RESUME_TOKEN = ['verificationRedirect'];

  /*eslint-disable camelcase*/
  var CLIENT_INFO_SCHEMA = {
    id: Vat.hex().required().renameTo('clientId'),
    image_uri: Vat.url().allow('').renameTo('imageUri'),
    name: Vat.string().required().min(1).renameTo('serviceName'),
    redirect_uri: Vat.uri().required().renameTo('redirectUri'),
    trusted: Vat.boolean().required()
  };

  var SIGNIN_SIGNUP_QUERY_PARAM_SCHEMA = {
    access_type: Vat.string().test(Validate.isAccessTypeValid).renameTo('accessType'),
    client_id: Vat.hex().required().renameTo('clientId'),
    keys: Vat.boolean(),
    prompt: Vat.string().test(Validate.isPromptValid),
    redirectTo: Vat.uri(),
    redirect_uri: Vat.uri().renameTo('redirectUri'),
    scope: Vat.string().required().min(1),
    service: Vat.string(),
    state: Vat.string(),
    verification_redirect: Vat.string().test(Validate.isVerificationRedirectValid).renameTo('verificationRedirect')
  };

  var VERIFICATION_INFO_SCHEMA = {
    access_type: Vat.string().test(Validate.isAccessTypeValid).renameTo('accessType'),
    action: Vat.string().min(1),
    client_id: Vat.hex().required().renameTo('clientId'),
    keys: Vat.boolean(),
    prompt: Vat.string().test(Validate.isPromptValid),
    redirect_uri: Vat.uri().renameTo('redirectUri'),
    // scopes are optional when verifying, user could be verifying in a 2nd browser
    scope: Vat.string().min(1),
    service: Vat.string().min(1),
    state: Vat.string().min(1)
  };
  /*eslint-enable camelcase*/


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
        throw OAuthErrors.toInvalidParameterError('scope');
      }

      this.set('scope', permissions.join(' '));
      this.set('permissions', permissions);
    },

    isOAuth: function () {
      return true;
    },

    /**
     * OAuth reliers can opt in to fetch relier-specific keys.
     *
     * @returns {Boolean}
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

      var result = Transform.transformUsingSchema(
        resumeObj, VERIFICATION_INFO_SCHEMA, OAuthErrors);

      self.set(result);
    },

    _setupSignInSignUpFlow: function () {
      // params listed in:
      // https://github.com/mozilla/fxa-oauth-server/blob/master/docs/api.md#post-v1authorization
      this.importSearchParamsUsingSchema(
          SIGNIN_SIGNUP_QUERY_PARAM_SCHEMA, OAuthErrors);
    },

    _setupOAuthRPInfo: function () {
      var self = this;
      var clientId = self.get('clientId');

      return self._oAuthClient.getClientInfo(clientId)
        .then(function (serviceInfo) {
          var result = Transform.transformUsingSchema(
            serviceInfo, CLIENT_INFO_SCHEMA, OAuthErrors);
          self.set(result);
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

  module.exports = OAuthRelier;
});
