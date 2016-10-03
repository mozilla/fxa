/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A mixin that allows models to get/import search parameters
 */

define(function (require, exports, module) {
  'use strict';

  var Transform = require('lib/transform');
  var Url = require('lib/url');

  module.exports = {
    /**
     * Get a value from the URL search parameter
     *
     * @param {String} paramName - name of the search parameter to get
     * @returns {String}
     */
    getSearchParam: function (paramName) {
      return Url.searchParam(paramName, this.window.location.search);
    },

    /**
     * Get values from the URL search parameters.
     *
     * @param {String[]} paramNames - name of the search parameters
     * to get
     * @returns {Object}
     */
    getSearchParams: function (paramNames) {
      return Url.searchParams(this.window.location.search, paramNames);
    },

    /**
     * Import search parameters defined in the schema. Parameters are
     * transformed and validated based on the rules defined in the `schema`.
     *
     * @param {Object} schema - schema used to define data to import
     * and validate against
     * @param {Object} Errors - errors object used to generate errors
     * @throws
     * If a required field is missing from the data, a
     * `MISSING_ERROR` error is generated, with the error's
     * `param` field set to the missing field's name.
     *
     * If a field does not pass validation, an
     * `INVALID_PARAMETER` error is generated, with the error's
     * `param` field set to the invalid field's name.
     */
    importSearchParamsUsingSchema: function (schema, Errors) {
      var params = this.getSearchParams(Object.keys(schema));
      var result = Transform.transformUsingSchema(params, schema, Errors);
      this.set(result);
    }
  };
});
