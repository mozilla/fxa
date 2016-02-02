/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A mixin that allows models to get/import search parameters
 */

define(function (require, exports, module) {
  'use strict';

  var Url = require('lib/url');

  module.exports = {
    /**
     * Get a value from the URL search parameter
     *
     * @param {String} paramName - name of the search parameter to get
     */
    getSearchParam: function (paramName) {
      return Url.searchParam(paramName, this.window.location.search);
    },

    /**
     * Set a value based on a value in window.location.search. Only updates
     * model if parameter exists in window.location.search.
     *
     * @param {String} paramName - name of the search parameter
     * @param {String} [modelName] - name to set in model. If not specified,
     *      use the same value as `paramName`
     */
    importSearchParam: function (paramName, modelName) {
      modelName = modelName || paramName;

      var value = this.getSearchParam(paramName);
      if (typeof value !== 'undefined') {
        this.set(modelName, value);
      }
    },

    /**
     * Import a boolean search parameter. Search parameter must be `true`
     * nor `false` or model item will not be set.
     *
     * @param {String} paramName - name of the search parameter
     * @param {String} [modelName] - name to set in model. If not specified,
     *      use the same value as `paramName`
     * @param {Errors} Errors - corresponding Errors object
     * @throws {error}
     */
    importBooleanSearchParam: function (paramName, modelName, Errors) {
      modelName = modelName || paramName;
      var self = this;

      var textValue = self.getSearchParam(paramName);
      if (typeof textValue !== 'undefined') {
        if (textValue === 'true') {
          self.set(modelName, true);
        } else if (textValue === 'false') {
          self.set(modelName, false);
        } else {
          var err = Errors.toError('INVALID_PARAMETER');
          err.param = paramName;
          throw err;
        }
      }
    },

    /**
     * Set a value based on a value in window.location.search. Throws error
     * if paramName param is not in window.location.search.
     *
     * Throws Error mapped to `MISSING_PARAMETER` in Errors object.
     *
     * @param {string} paramName - name of the search parameter
     * @param {string} modelName - name to set in model
     * @param {Errors} Errors - corresponding Errors object
     * @throws {error}
     */
    importRequiredSearchParam: function (paramName, modelName, Errors) {
      var self = this;
      self.importSearchParam(paramName, modelName);
      if (! self.has(modelName || paramName)) {
        var err = Errors.toError('MISSING_PARAMETER');
        err.param = paramName;
        throw err;
      }
    }
  };
});
