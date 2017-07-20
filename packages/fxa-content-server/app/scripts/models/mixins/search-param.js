/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A mixin that allows models to get/import search parameters.
 * Requires the object to have this.window.location.search
 */

define(function (require, exports, module) {
  'use strict';

  const SearchParamMixin = require('lib/search-param-mixin');
  const Transform = require('lib/transform');

  module.exports = {
    dependsOn: [ SearchParamMixin ],

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
    importSearchParamsUsingSchema (schema, Errors) {
      var params = this.getSearchParams(Object.keys(schema));
      var result = Transform.transformUsingSchema(params, schema, Errors);
      this.set(result);
    }
  };
});
