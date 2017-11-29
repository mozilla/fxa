/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A client to talk to the basket marketing email server
 */

define(function (require, exports, module) {
  'use strict';

  const Constants = require('./constants');
  const MarketingEmailErrors = require('./marketing-email-errors');
  const Url = require('./url');
  const xhr = require('./xhr');

  const ALLOWED_SOURCE_URL_QUERY_PARAMS = [
    'client_id',
    'service',
    'utm_campaign',
    'utm_content',
    'utm_medium',
    'utm_source',
    'utm_term'
  ];

  function MarketingEmailClient(options = {}) {
    this._baseUrl = options.baseUrl;
    this._preferencesUrl = options.preferencesUrl;
    this._window = options.window || window;
    this._xhr = options.xhr || xhr;
    this._xhrTimeout = options.timeout || Constants.DEFAULT_XHR_TIMEOUT_MS;
  }

  MarketingEmailClient.prototype = {
    _request (method, endpoint, accessToken, data) {
      const url = this._baseUrl + endpoint;
      return this._xhr.oauthAjax({
        accessToken: accessToken,
        data: data,
        timeout: this._xhrTimeout,
        type: method,
        url: url
      })
      .catch(function (xhr) {
        throw MarketingEmailErrors.normalizeXHRError(xhr);
      });
    },

    fetch (accessToken) {
      return this._request('get', '/lookup-user', accessToken)
        .then((response) => {
          // TODO
          // I would prefer to place this into the MarketingEmailPrefs model
          // but doing so required passing around the preferencesUrl to lots of
          // irrelevant classes.
          if (response.token) {
            response.preferencesUrl = this._preferencesUrl + response.token;
          }

          return response;
        });
    },

    optIn (accessToken, newsletterId) {
      const cleanedSourceUrl =
        Url.cleanSearchString(this._window.location.href, ALLOWED_SOURCE_URL_QUERY_PARAMS);
      return this._request('post', '/subscribe', accessToken, {
        newsletters: newsletterId,
        source_url: cleanedSourceUrl //eslint-disable-line camelcase
      });
    }
  };

  module.exports = MarketingEmailClient;
});

