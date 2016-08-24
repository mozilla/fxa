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
    /**
     *
     * @param {Object} params
     * @param {String} params.assertion
     * @param {String} params.client_id
     * @param {String} params.redirect_uri
     * @param {String} params.scope
     * @param {String} params.state
     * @returns {Promise}
     */
    getCode: function getCode(params) {
      return this._request('post', GET_CODE, params);
    },

    getClientInfo: function getClientInfo(id) {
      return this._request('get', GET_CLIENT + id);
    },

    // params = { assertion, client_id, scope }
    /**
     *
     * @param {Object} params
     * @param {String} params.assertion
     * @param {String} params.client_id
     * @param {String} params.scope
     * @param {String} [params.ttl]
     * @returns {Promise}
     */
    getToken: function (params = {}) {
      // set authorization TTL to 5 minutes.
      // Docs: github.com/mozilla/fxa-oauth-server/blob/master/docs/api.md#post-v1authorization
      // Issue: #3982
      params.ttl = params.ttl || '300';
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

