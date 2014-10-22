/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global require, module */

var config = require('../../config');
var fxaOAuthConfig = config.get('fxaOAuth');


// construct a redirect URL
function toQueryString(obj) {
  var fields = Object.keys(obj).map(function (key) {
    return key + '=' + obj[key];
  });

  return '?' + fields.join('&');
}


function redirectUrl(action, nonce, email, preVerifyToken) {
  var oauthParams = {
    client_id: fxaOAuthConfig.client_id,
    redirect_uri: fxaOAuthConfig.redirect_uri,
    state: nonce,
    scope: fxaOAuthConfig.scopes,
    action: action
  };

  if (email) {
    oauthParams.email = email;
  }

  if (preVerifyToken) {
    oauthParams.preVerifyToken = preVerifyToken;
  }

  return fxaOAuthConfig.oauth_uri + '/authorization' + toQueryString(oauthParams);
}

module.exports = {
  redirectUrl: redirectUrl
};
