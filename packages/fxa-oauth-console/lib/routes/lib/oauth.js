/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global require, module */

var request = require('request');

var config = require('../../config');
var fxaOAuthConfig = config.get('fxaOAuth');

/**
 * Query to qtring helper
 * @param {Object} obj
 * @returns {string}
 */
function toQueryString(obj) {
  var fields = Object.keys(obj).map(function(key) {
    return key + '=' + obj[key];
  });

  return '?' + fields.join('&');
}

/**
 * Constructs an FxA OAuth redirect url
 *
 * @param {String} action
 * @param {String} nonce
 * @param {String} scopes
 * @returns {string} Returns a string to redirect to.
 */
function redirectUrl(action, nonce, scopes) {
  var oauthParams = {
    client_id: fxaOAuthConfig.client_id,
    redirect_uri: fxaOAuthConfig.redirect_uri,
    state: nonce,
    scope: scopes || fxaOAuthConfig.scopes,
    action: action,
  };

  return (
    fxaOAuthConfig.oauth_uri + '/authorization' + toQueryString(oauthParams)
  );
}

/**
 * Request the bearer token from the OAuth server
 * @param {String}code
 * @param {Function} cb
 */
function requestToken(code, cb) {
  request.post(
    {
      uri: fxaOAuthConfig.oauth_uri + '/token',
      json: {
        code: code,
        client_id: fxaOAuthConfig.client_id,
        client_secret: fxaOAuthConfig.client_secret,
      },
    },
    cb
  );
}

module.exports = {
  redirectUrl: redirectUrl,
  requestToken: requestToken,
};
