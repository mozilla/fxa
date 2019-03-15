/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A client to talk to the basket marketing email server
 */

'use strict';

const { assign } = require('underscore');
const { DEFAULT_XHR_TIMEOUT_MS } = require('./constants');
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

class MarketingEmailClient {
  constructor (options = {}) {
    this._baseUrl = options.baseUrl;
    this._preferencesUrl = options.preferencesUrl;
    this._window = options.window || window;
    this._xhr = options.xhr || xhr;
    this._xhrTimeout = options.timeout || DEFAULT_XHR_TIMEOUT_MS;
  }

  _request (config) {
    const url = this._baseUrl + config.url;

    return this._xhr.oauthAjax(assign({}, config, {
      timeout: this._xhrTimeout,
      url,
    })).catch(function (xhr) {
      throw MarketingEmailErrors.normalizeXHRError(xhr);
    });
  }

  fetch (accessToken, email) {
    return this._request({
      accessToken,
      type: 'get',
      url: `/lookup-user?email=${encodeURIComponent(email)}`,
    }).then((response) => {
      // TODO
      // I would prefer to place this into the MarketingEmailPrefs model
      // but doing so required passing around the preferencesUrl to lots of
      // irrelevant classes.
      if ('token' in response) {
        response.preferencesUrl = this._preferencesUrl + response.token;
      }

      return response;
    });
  }

  optIn (accessToken, newsletterId) {
    const cleanedSourceUrl =
      Url.cleanSearchString(this._window.location.href, ALLOWED_SOURCE_URL_QUERY_PARAMS);

    return this._request({
      accessToken,
      // Basket expectes form-urlencoded data rather than JSON, see #6076
      contentType: 'application/x-www-form-urlencoded',
      data: {
        newsletters: newsletterId,
        source_url: cleanedSourceUrl //eslint-disable-line camelcase
      },
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      type: 'post',
      url: '/subscribe/',
    });
  }
}

module.exports = MarketingEmailClient;

