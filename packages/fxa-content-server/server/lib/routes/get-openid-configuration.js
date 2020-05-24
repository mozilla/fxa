/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const config = require('../configuration');

const authorizationEndpoint = config.get('public_url') + '/authorization';
const introspectionEndpoint = config.get('oauth_url') + '/v1/introspect';
const issuer = config.get('public_url');
const jwksEndpoint = config.get('oauth_url') + '/v1/jwks';
const revocationEndpoint = config.get('oauth_url') + '/v1/destroy';
const tokenEndpoint = config.get('oauth_url') + '/v1/token';
const userInfoEndpoint = config.get('profile_url') + '/v1/profile';

const openidConfig = {
  /*eslint-disable camelcase */
  authorization_endpoint: authorizationEndpoint,
  introspection_endpoint: introspectionEndpoint,
  issuer: issuer,
  jwks_uri: jwksEndpoint,
  revocation_endpoint: revocationEndpoint,
  token_endpoint: tokenEndpoint,
  userinfo_endpoint: userInfoEndpoint,
};

const c = config.get('openid_configuration');
// eslint-disable-next-line no-unused-vars
for (const key in c) {
  openidConfig[key] = c[key];
}

module.exports = function (config) {
  return {
    cors: {
      methods: 'GET',
      origin: '*',
      preflightContinue: false,
    },
    method: 'get',
    path: '/.well-known/openid-configuration',
    process: function (req, res) {
      // taken from https://accounts.google.com/.well-known/openid-configuration
      res.header('Cache-Control', 'public, max-age=3600');

      // charset must be set on json responses.
      res.charset = 'utf-8';

      res.json(openidConfig);
    },
  };
};
