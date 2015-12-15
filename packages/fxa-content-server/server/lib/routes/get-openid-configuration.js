/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var config = require('../configuration');

var authorizationEndpoint = config.get('oauth_url') + '/v1/authorization';
var issuer = config.get('public_url');
var jwksEndpoint = config.get('oauth_url') + '/v1/jwks';
var tokenEndpoint = config.get('oauth_url') + '/v1/token';
var userInfoEndpoint = config.get('profile_url') + '/v1/profile';

var openidConfig = {
  /*eslint-disable camelcase */
  authorization_endpoint: authorizationEndpoint,
  issuer: issuer,
  jwks_uri: jwksEndpoint,
  token_endpoint: tokenEndpoint,
  userinfo_endpoint: userInfoEndpoint,
};

var c = config.get('openid_configuration');
for (var key in c) {
  openidConfig[key] = c[key];
}

module.exports = function (config) {
  var route = {};
  route.method = 'get';
  route.path = '/.well-known/openid-configuration';

  route.process = function (req, res) {

    // taken from https://accounts.google.com/.well-known/openid-configuration
    res.header('Cache-Control', 'public, max-age=3600');

    // charset must be set on json responses.
    res.charset = 'utf-8';

    res.json(openidConfig);
  };

  return route;
};
