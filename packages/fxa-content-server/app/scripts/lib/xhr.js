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

  const $ = require('jquery');
  const _ = require('underscore');

  const DEFAULT_DATA_TYPE = 'json';

  // Converts a jQuery promise to our internal promise type.
  // This ensures methods like `.fail` work as expected.
  //
  // for more background, read
  // https://github.com/kriskowal/q/wiki/Coming-from-jQuery
  function convertJQueryPromise(jqPromise) {
    return new Promise((resolve, reject) => {
      jqPromise.then(
        data => resolve(data),
        jqXHR => reject(jqXHR)
      );
    });
  }

  module.exports = {
    /**
     * Low level ajax functionality, does not set a default data type.
     *
     * @param {Object} options
     * @return {Promise}
     */
    ajax (options) {
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

      return convertJQueryPromise($.ajax(options));
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
     * @return {Promise}
     */
    oauthAjax (options) {
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
     * @param {String} url
     * @param {Object} data
     * @param {Function} success
     * @param {String} dataType
     * @return {Promise}
     */
    get (url, data, success, dataType) {
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
     * @param {String} url
     * @param {Object} data
     * @param {Function} success
     * @param {String} dataType
     * @return {Promise}
     */
    post (url, data, success, dataType) {
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
     * @param {String} url
     * @param {Object} data
     * @param {Function} success
     * @return {Promise}
     */
    getJSON (url, data, success) {
      return convertJQueryPromise($.getJSON(url, data, success));
    }
  };
});


