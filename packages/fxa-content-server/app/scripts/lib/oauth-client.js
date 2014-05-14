/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery',
  'p-promise',
  'lib/session',
  'lib/config-loader'
],
function ($, P, Session, ConfigLoader) {
  var oauthUrl;

  var GET_CLIENT = '/v1/client/';
  var GET_CODE = '/v1/authorization';

  function OAuthClient(options) {
    if (!(this instanceof OAuthClient)) {
      return new OAuthClient(options);
    }
    if (options && options.oauthUrl) {
      oauthUrl = options.oauthUrl;
    }
  }

  OAuthClient.prototype = {
    _getOauthUrl: function _getOauthUrl() {
      var configLoader = new ConfigLoader();
      var promise;

      if (oauthUrl) {
        promise = P(oauthUrl);
      } else if (Session.config && Session.config.oauthUrl) {
        oauthUrl = Session.config.oauthUrl;
        promise = P(oauthUrl);
      } else {
        promise = configLoader.fetch()
          .then(function (data) {
            oauthUrl = data.oauthUrl;
            return oauthUrl;
          });
      }

      return promise;
    },

    // params = { assertion, client_id, redirect_uri, scope, state }
    getCode: function getCode(params) {
      return this._getOauthUrl().then(function (url) {
        return $.post(url + GET_CODE, params);
      });
    },

    getClientInfo: function getClientInfo(id) {
      return this._getOauthUrl().then(function (url) {
        return $.get(url + GET_CLIENT + id);
      });
    }

  };

  return OAuthClient;
});

