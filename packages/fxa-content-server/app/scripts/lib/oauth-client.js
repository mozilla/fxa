/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'lib/xhr',
  'lib/promise',
  'lib/session',
  'lib/config-loader',
  'lib/oauth-errors'
],
function (xhr, p, Session, ConfigLoader, OAuthErrors) {
  var GET_CLIENT = '/v1/client/';
  var GET_CODE = '/v1/authorization';

  function OAuthClient(options) {
    if (options && options.oAuthUrl) {
      this._oAuthUrl = options.oAuthUrl;
    }
  }

  OAuthClient.prototype = {
    // params = { assertion, client_id, redirect_uri, scope, state }
    getCode: function getCode(params) {
      return xhr.post(this._oAuthUrl + GET_CODE, params)
          .then(null, function (xhr) {
            var err = OAuthErrors.normalizeXHRError(xhr);
            throw err;
          });
    },

    getClientInfo: function getClientInfo(id) {
      return xhr.get(this._oAuthUrl + GET_CLIENT + id)
          .then(null, function (xhr) {
            var err = OAuthErrors.normalizeXHRError(xhr);
            throw err;
          });
    },

    // params = { assertion, client_id, scope }
    getToken: function (params) {
      /* jshint camelcase: false */

      // Use the special 'token' response type
      params.response_type = 'token';
      return this.getCode(params);
    }
  };

  return OAuthClient;
});

