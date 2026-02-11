/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import OAuthErrors from './oauth-errors';
import xhr from './xhr';

const DESTROY_TOKEN = '/v1/destroy';
const GET_CLIENT = '/v1/client/';

function normalizeErrors(xhr) {
  throw OAuthErrors.normalizeXHRError(xhr);
}

function OAuthClient(options) {
  options = options || {};

  this._oAuthUrl = options.oAuthUrl;
  this._xhr = options.xhr || xhr;
}

OAuthClient.prototype = {
  _request(method, endpoint, params) {
    return this._xhr[method](this._oAuthUrl + endpoint, params || null).catch(
      normalizeErrors
    );
  },

  getClientInfo: function getClientInfo(id) {
    return this._request('get', GET_CLIENT + id);
  },

  destroyToken: function destroyToken(token) {
    var params = {
      token: token,
    };

    return this._request('post', DESTROY_TOKEN, params);
  },
};

export default OAuthClient;
