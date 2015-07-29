/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An OAuth Relier - holds OAuth information.
 */

define([
  'underscore',
  'models/reliers/relier',
  'lib/oauth-errors',
  'lib/relier-keys',
  'lib/url',
  'lib/constants'
], function (_, Relier, OAuthErrors, RelierKeys, Url, Constants) {
  'use strict';

  var RELIER_FIELDS_IN_RESUME_TOKEN = ['state', 'verificationRedirect'];
  // We only grant permissions that our UI currently prompts for. Others
  // will be stripped.
  var PERMISSION_WHITE_LIST = ['profile:uid', 'profile:email'];

  var OAuthRelier = Relier.extend({
    defaults: _.extend({}, Relier.prototype.defaults, {
      // standard oauth parameters.
      state: null,
      clientId: null,
      // redirectUri is used by the oauth flow
      redirectUri: null,
      scope: null,
      accessType: null,
      // redirectTo is for future use by the oauth flow. redirectTo
      // would have redirectUri as its base.
      redirectTo: null,
      // whether to fetch and derive relier-specific keys
      keys: false,
      // verification redirect to the rp, useful during email verification signup flow
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
          return self._setupOAuthRPInfo()
            .then(function () {
              var permissions;
              // Sanitize permissions for untrusted reliers
              if (! self.isTrusted() && self.has('scope')) {
                permissions = stripNonWhiteListedPermissions(scopeStrToArray(self.get('scope')));
                self.set('scope', permissions.join(' '));
                self.set('permissions', permissions);
              }
            });
        });
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
          service: self.getSearchParam('service'),
          client_id: self.getSearchParam('service') //eslint-disable-line camelcase
        };
      }

      self.set({
        state: resumeObj.state,
        keys: resumeObj.keys,
        clientId: resumeObj.client_id,
        redirectUri: resumeObj.redirect_uri,
        scope: resumeObj.scope,
        accessType: resumeObj.access_type
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
      self._importRequiredSearchParam('client_id', 'clientId');
      self._importRequiredSearchParam('scope', 'scope');
      self.importSearchParam('state');
      self.importSearchParam('redirect_uri', 'redirectUri');
      self.importSearchParam('access_type', 'accessType');
      self.importSearchParam('redirectTo');
      self.importSearchParam('verification_redirect', 'verificationRedirect');
      self.importBooleanSearchParam('keys');
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

    accountNeedsPermissions: function (account) {
      if (this.isTrusted()) {
        return false;
      }

      return ! account.hasGrantedPermissions(this.get('clientId'), this.get('permissions'));
    }
  });

  function scopeStrToArray(scopes) {
    return typeof scopes === 'string' ? _.uniq(scopes.split(/\s+/g)) : scopes;
  }

  function stripNonWhiteListedPermissions(permissions) {
    return permissions.filter(function (permission) {
      return PERMISSION_WHITE_LIST.indexOf(permission) !== -1;
    });
  }

  return OAuthRelier;
});
