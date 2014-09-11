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
  'lib/session',
  'lib/oauth-client'
], function (_, Relier, Session, OAuthClient) {

  var OAuthRelier = Relier.extend({
    defaults: _.extend({
      // standard oauth parameters.
      state: null,
      clientId: null,
      // redirectUri is used by the oauth flow
      redirectUri: null,
      scope: null,
      // redirectTo is for future use by the oauth flow. redirectTo
      // would have redirectUri as its base.
      redirectTo: null
    }, Relier.prototype.defaults),

    initialize: function (options) {
      options = options || {};

      Relier.prototype.initialize.call(this, options);

      this._oAuthClient = options.oAuthClient || new OAuthClient();
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

            return self._setServiceName();
          });
    },

    _isVerificationFlow: function () {
      return !! this.getSearchParam('code');
    },

    _setupVerificationFlow: function () {
      var self = this;

      var resumeObj = Session.oauth;
      if (! resumeObj) {
        return;
      }

      self.set({
        state: resumeObj.state,
        //jshint camelcase: false
        clientId: resumeObj.client_id,
        redirectUri: resumeObj.redirect_uri,
        scope: resumeObj.scope
      });
    },

    _setupSigninSignupFlow: function () {
      var self = this;

      // params listed in:
      // https://github.com/mozilla/fxa-oauth-server/blob/master/docs/api.md#post-v1authorization
      self.importSearchParam('state');
      self.importSearchParam('client_id', 'clientId');
      self.importSearchParam('redirect_uri', 'redirectUri');
      self.importSearchParam('scope');

      self.importSearchParam('redirectTo');
    },

    isOAuth: function () {
      return true;
    },

    _setServiceName: function () {
      var self = this;
      var clientId = self.get('clientId');

      if (clientId) {
        return this._oAuthClient.getClientInfo(clientId)
          .then(function(clientInfo) {
            self.set('serviceName', clientInfo.name);
            //jshint camelcase: false
            // server version always takes precedent over the search parameter
            self.set('redirectUri', clientInfo.redirect_uri);
          });
      }
    }
  });

  return OAuthRelier;
});


