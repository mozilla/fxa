/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'p-promise',
  'views/sign_in',
  'lib/constants',
  'lib/session',
  'lib/url',
  'lib/oauth-client',
  'lib/assertion',
  'lib/oauth-errors',
  'lib/config-loader'
],
function (_, p, SignInView, Constants, Session, Url, OAuthClient, Assertion, oAuthErrors, ConfigLoader) {
  var View = SignInView.extend({
    className: 'sign-in oauth-sign-in',

    initialize: function (options) {
      SignInView.prototype.initialize.call(this, options);

      this._configLoader = new ConfigLoader();
      this._oAuthClient = new OAuthClient();

      var search = this.window.location.search;
      this._oAuthClientID = Url.searchParam('client_id', search);
      this._oAuthScope = Url.searchParam('scope', search);
      this._oAuthState = Url.searchParam('state', search);
      this._oAuthRedirectUri = Url.searchParam('redirect_uri', search);

      this.service = this._oAuthClientID;
    },

    beforeRender: function() {
      var self = this;
      return this._oAuthClient.getClientInfo(this._oAuthClientID)
      .then(function(clientInfo) {
        self.serviceName = clientInfo.name;
      })
      .fail(function(xhr) {
        self.displayError(xhr.responseJSON, oAuthErrors);
      });
    },

    onSignInSuccess: function() {
      var self = this;
      return this._configLoader.fetch().then(function(config) {
        return Assertion.generate(config.oauthUrl);
      })
      .then(function(assertion) {
        /* jshint camelcase: false */
        return self._oAuthClient.getCode({
          assertion: assertion,
          client_id: self._oAuthClientID,
          scope: self._oAuthScope,
          state: self._oAuthState,
          redirect_uri: self._oAuthRedirectUri
        });
      })
      .then(function(result) {
        // Redirect to the returned URL
        self.window.location.href = result.redirect;
      })
      .fail(function(xhr) {
        self.displayError(xhr.responseJSON, oAuthErrors);
      });
    }
  });

  return View;
});
