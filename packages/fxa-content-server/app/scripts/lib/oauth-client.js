/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var OAuthErrors = require('lib/oauth-errors');
  var xhr = require('lib/xhr');

  var GET_CLIENT = '/v1/client/';
  var GET_CODE = '/v1/authorization';
  var DESTROY_TOKEN = '/v1/destroy';

  function OAuthClient(options) {
    options = options || {};

    this._oAuthUrl = options.oAuthUrl;
    this._xhr = options.xhr || xhr;
  }

  OAuthClient.prototype = {
    _request: function (method, endpoint, params) {
      return this._xhr[method](this._oAuthUrl + endpoint, params || null)
        .fail(function (xhr) {
          var err = OAuthErrors.normalizeXHRError(xhr);
          throw err;
        });
    },

    // params = { assertion, client_id, redirect_uri, scope, state,
    // access_type }
    getCode: function getCode(params) {
      return this._request('post', GET_CODE, params);
    },

    getClientInfo: function getClientInfo(id) {
      return this._request('get', GET_CLIENT + id);
    },

    // params = { assertion, client_id, scope }
    getToken: function (params) {
      // Use the special 'token' response type
      params.response_type = 'token'; //eslint-disable-line camelcase
      return this.getCode(params);
    },

    destroyToken: function destroyToken(token) {
      var params = {
        token: token
      };

      return this._request('post', DESTROY_TOKEN, params);
    }
  };

  module.exports = OAuthClient;
});

