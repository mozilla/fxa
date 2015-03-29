/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An OAuth Relier - holds OAuth information.
 */

'use strict';

define([
  'underscore',
  'models/reliers/relier',
  'lib/resume-token',
  'lib/promise',
  'lib/oauth-errors',
  'lib/relier-keys',
  'lib/url'
], function (_, Relier, ResumeToken, p, OAuthErrors, RelierKeys, Url) {
  var RELIER_FIELDS_IN_RESUME_TOKEN = ['state'];

  var OAuthRelier = Relier.extend({
    defaults: _.extend({}, Relier.prototype.defaults, {
      // standard oauth parameters.
      state: null,
      clientId: null,
      // redirectUri is used by the oauth flow
      redirectUri: null,
      scope: null,
      // redirectTo is for future use by the oauth flow. redirectTo
      // would have redirectUri as its base.
      redirectTo: null,
      // whether to fetch and derive relier-specific keys
      keys: false
    }),

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

    getResumeToken: function () {
      var resumeObj = {};

      _.each(RELIER_FIELDS_IN_RESUME_TOKEN, function (itemName) {
        if (this.has(itemName)) {
          resumeObj[itemName] = this.get(itemName);
        }
      }, this);

      return ResumeToken.stringify(resumeObj);
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
          //jshint camelcase: false
          client_id: self.getSearchParam('service')
        };
      }

      self.set({
        state: resumeObj.state,
        //jshint camelcase: false
        clientId: resumeObj.client_id,
        redirectUri: resumeObj.redirect_uri,
        scope: resumeObj.scope
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
      self.importSearchParam('redirectTo');
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
          //jshint camelcase: false
          // server version always takes precedent over the search parameter
          self.set('redirectUri', serviceInfo.redirect_uri);
          self.set('origin', Url.getOrigin(serviceInfo.redirect_uri));
        }, function (err) {
          // the server returns an invalid request signature for an
          // invalid/unknown client_id
          if (OAuthErrors.is(err, 'INVALID_REQUEST_SIGNATURE')) {
            err = OAuthErrors.toError('UNKNOWN_CLIENT');
            // used for logging the error on the server.
            //jshint camelcase: false
            err.client_id = clientId;
          }
          throw err;
        });
    }
  });

  return OAuthRelier;
});


