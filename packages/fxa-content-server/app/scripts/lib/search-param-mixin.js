/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A mixin that allows objects to get/import search parameters.
 * Requires the object to have this.window.location.search
 */

define(function (require, exports, module) {
  'use strict';

  const Url = require('./url');

  module.exports = {
    /**
     * Get a value from the URL search parameter
     *
     * @param {String} paramName - name of the search parameter to get
     * @returns {String}
     */
    getSearchParam (paramName) {
      return Url.searchParam(paramName, this.window.location.search);
    },

    /**
     * Get values from the URL search parameters.
     *
     * @param {String[]} paramNames - name of the search parameters
     * to get
     * @returns {Object}
     */
    getSearchParams (paramNames) {
      return Url.searchParams(this.window.location.search, paramNames);
    }
  };
});
