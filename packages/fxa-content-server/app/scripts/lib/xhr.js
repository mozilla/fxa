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

'use strict';

define([
  'jquery',
  'lib/promise'
], function ($, p) {
  var DEFAULT_DATA_TYPE = 'json';

  return {
    /**
     * Low level ajax functionality, does not set a default data type.
     *
     * @return {promise}
     */
    ajax: function (options) {
      return p.jQueryXHR($.ajax(options));
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

      return p.jQueryXHR($.get(url, data, success, dataType));
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

      return p.jQueryXHR($.post(url, data, success, dataType));
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


