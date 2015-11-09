/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A thin wrapper around jQuery's ajax functionality with two modifications:
 *
 * 1. All functions return a Promises/A+ compliant promise
 * 2. The default dataType for `get` and `post` is `application/json` to fix
 *    jQuery/Firefox < 21 not decoding CORS request headers unless the
 *    dataType is set. `ajax` is a low level function and does not set
 *    a default data type. See issue #1786.
 */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var _ = require('underscore');
  var p = require('lib/promise');

  var DEFAULT_DATA_TYPE = 'json';

  module.exports = {
    /**
     * Low level ajax functionality, does not set a default data type.
     *
     * @return {promise}
     */
    ajax: function (options) {
      if (options.dataType === 'json') {
        options.contentType = 'application/json';

        // processData is set to false for blob payloads, e.g. images;
        // they shouldn't be stringified.
        if (options.data && options.processData !== false) {
          options.data = JSON.stringify(options.data);
        }

        if (! options.accepts) {
          options.accepts = {};
        }
        options.accepts.json = 'application/json';
      }

      return p.jQueryXHR($.ajax(options));
    },

    /**
     * Low level ajax functionality for OAuth. Sets the `Authorization` header
     * from `options.accessToken`
     *
     * @method oauthAjax
     *
     * @param {Object} options
     *   @param {String} options.url - url to request
     *   @param {String} options.type - method used to request - `post`, `get`
     *   @param {String} options.accessToken - OAuth access token used to
     *   access resource.
     *   @param {Object} [options.headers] - headers to send.
     *   @param {Object} [options.data] - data to send
     * @return {promise}
     */
    oauthAjax: function (options) {
      var request = {
        // make sure to set the dataType for Firefox <21. See issue #1930
        dataType: 'json',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + options.accessToken
        },
        timeout: options.timeout,
        type: options.type,
        url: options.url
      };

      if (options.headers) {
        _.extend(request.headers, options.headers);
      }

      var data = options.data;
      if (data) {
        request.data = data;
      }

      if (typeof Blob !== 'undefined' && data instanceof Blob) {
        request.processData = false;
      }

      return this.ajax(request);
    },

    /**
     * GET request
     *
     * Sets a default dataType of 'json'
     * @return {promise}
     */
    get: function (url, data, success, dataType) {
      if (! dataType) {
        dataType = DEFAULT_DATA_TYPE;
      }

      return this.ajax({
        data: data,
        dataType: dataType,
        method: 'GET',
        success: success,
        url: url
      });
    },

    /**
     * POST request
     *
     * Sets a default dataType of 'json'
     * @return {promise}
     */
    post: function (url, data, success, dataType) {
      if (! dataType) {
        dataType = DEFAULT_DATA_TYPE;
      }

      return this.ajax({
        data: data,
        dataType: dataType,
        method: 'POST',
        success: success,
        url: url
      });
    },

    /**
     * GET JSON request
     *
     * @return {promise}
     */
    getJSON: function (url, data, success) {
      return p.jQueryXHR($.getJSON(url, data, success));
    }
  };
});


