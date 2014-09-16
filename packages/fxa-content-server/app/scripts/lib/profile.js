/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery',
  'underscore',
  'lib/promise',
  'lib/oauth-client',
  'lib/assertion',
  'lib/auth-errors',
  'lib/profile-client'
],
function ($, _, p, OAuthClient, Assertion, AuthErrors, ProfileClient) {

  function Profile(options) {
    if (! options) {
      options = {};
    }
    this.config = options.config || {};

    this._assertion = options.assertion || new Assertion();

    this._oauthClient = options.oauthClient || new OAuthClient({
      oauthUrl: this.config.oauthUrl
    });

    if (options.profileClient) {
      this._client = options.profileClient;
    }
  }

  Profile.prototype._getClientAsync = function () {
    /* jshint camelcase: false */

    if (this._client) {
      return p(this._client);
    }

    var self = this;
    var config = this.config;

    var params = {
      client_id: config.oauthClientId,
      scope: 'profile:write'
    };

    return this._assertion.generate(config.oauthUrl)
      .then(function(assertion) {
        params.assertion = assertion;
        return self._oauthClient.getToken(params);
      })
      .then(function(result) {
        self._client = new ProfileClient({
          token: result.access_token,
          profileUrl: config.profileUrl
        });
        return self._client;
      });
  };

  [
    'getProfile',
    'getAvatar',
    'getAvatars',
    'deleteAvatar',
    'uploadAvatar',
    'getRemoteImage'
  ]
  .forEach(function (method) {
    Profile.prototype[method] = function () {
      var args = arguments;
      return this._getClientAsync()
        .then(function (client) {
          return client[method].apply(client, args);
        });
    };
  });


  // Send a URL for a third party hosted avatar
  Profile.prototype.postAvatar = function (url) {
    return this._getClientAsync()
      .then(function (client) {
        return client.postAvatar(url, true);
      });
  };

  Profile.Errors = ProfileClient.Errors;

  return Profile;
});

