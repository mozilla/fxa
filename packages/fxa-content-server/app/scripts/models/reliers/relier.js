/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A relier is a model that holds information about the RP.
 */

'use strict';

define([
  'models/reliers/base',
  'lib/promise',
  'lib/url',
  'lib/constants'
], function (BaseRelier, p, Url, Constants) {

  var Relier = BaseRelier.extend({
    defaults: {
      service: null,
      preVerifyToken: null
    },

    initialize: function (options) {
      options = options || {};

      this._window = options.window || window;
    },

    /**
     * Fetch hydrates the model. Returns a promise to allow
     * for an asynchronous load. Sub-classes that override
     * fetch should still call Relier's version before completing.
     *
     * e.g.
     *
     * fetch: function () {
     *   return Relier.prototype.fetch.call(this)
     *       .then(function () {
     *         // do overriding behavior here.
     *       });
     * }
     */
    fetch: function () {
      var self = this;
      return p()
          .then(function () {
            self.importSearchParam('service');
            self.importSearchParam('preVerifyToken');
          });
    },

    /**
     * Get a value from the URL search parameter
     *
     * @param {String} paramName - name of the search parameter to get
     */
    getSearchParam: function (paramName) {
      return Url.searchParam(paramName, this._window.location.search);
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
     * Check if the relier is Sync for Firefox Desktop
     */
    isSync: function () {
      return this.get('service') === Constants.FX_DESKTOP_SYNC;
    }
  });

  return Relier;
});
