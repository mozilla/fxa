/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
function normalizeUrl(url) {
  // Strip any trailing slashes.
  url = url.replace(/\/+$/, '');
  return url;
}

function stripV1Suffix(url) {
  // Strip the /v1 suffix, if present.
  url = url.replace(/\/+v1$/, '');
  return url;
}

module.exports = function (config) {
  const route = {};
  route.method = 'get';
  route.path = '/.well-known/fxa-client-configuration';

  const fxaClientConfig = {
    /*eslint-disable camelcase */
    // The content-server can accept fxaccount_url URL with or without
    // a /v1 suffix, but Firefox client code expects it without.
    auth_server_base_url: stripV1Suffix(
      normalizeUrl(config.get('fxaccount_url'))
    ),
    oauth_server_base_url: normalizeUrl(config.get('oauth_url')),
    pairing_server_base_uri: normalizeUrl(
      config.get('pairing.server_base_uri')
    ),
    profile_server_base_url: normalizeUrl(config.get('profile_url')),
    sync_tokenserver_base_url: normalizeUrl(config.get('sync_tokenserver_url')),
    // For dev purposes, hard-code the stage AET pipeline keys.
    // This value taken from https://bugzilla.mozilla.org/show_bug.cgi?id=1636102#c7
    ecosystem_anon_id_keys: [
      {
        crv: 'P-256',
        kid: 'LlU4keOmhTuq9fCNnpIldYGT9vT9dIDwnu_SBtTgeEQ',
        kty: 'EC',
        x: 'i3FM3OFSCZEoqu-jtelXwKt6AL4ODQ75NUdHbcLWQSo',
        y: 'nW-S3QiHDo-9hwfBhKnGKarkt_PVqVyIPUytjutTunY',
      },
    ],
  };

  // This response will very rarely change, so enable caching by default.
  // It defaults to one day, and can be disabled by setting max_age to zero.
  let maxAge = config.get('fxa_client_configuration.max_age');
  if (maxAge) {
    maxAge = Math.floor(maxAge / 1000); // the config value is in milliseconds
  } else if (maxAge !== 0) {
    maxAge = 60 * 60 * 24;
  }

  let cacheControlHeader = '';
  if (maxAge) {
    cacheControlHeader = 'public, max-age=' + maxAge;
  }

  route.process = function (req, res) {
    if (cacheControlHeader) {
      res.header('Cache-Control', cacheControlHeader);
    }

    // charset must be set on json responses.
    res.charset = 'utf-8';

    res.json(fxaClientConfig);
  };

  return route;
};
