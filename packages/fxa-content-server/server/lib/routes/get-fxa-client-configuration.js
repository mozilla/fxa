/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function normalizeUrl(url) {
  // Strip any trailing slashes.
  url = url.replace(/\/+$/, '');
  return url;
}

module.exports = function (config) {
  var route = {};
  route.method = 'get';
  route.path = '/.well-known/fxa-client-configuration';

  var fxaClientConfig = {
    /*eslint-disable camelcase */
    auth_server_base_url: normalizeUrl(config.get('fxaccount_url')),
    oauth_server_base_url: normalizeUrl(config.get('oauth_url')),
    profile_server_base_url: normalizeUrl(config.get('profile_url')),
    sync_tokenserver_base_url: normalizeUrl(config.get('sync_tokenserver_url'))
  };

  // This response will very rarely change, so enable caching by default.
  // It defaults to one day, and can be disabled by setting max_age to zero.
  var maxAge = config.get('fxa_client_configuration.max_age');
  if (maxAge) {
    maxAge = Math.floor(maxAge / 1000);  // the config value is in milliseconds
  }  else if (maxAge !== 0) {
    maxAge = 60 * 60 * 24;
  }

  var cacheControlHeader = '';
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
