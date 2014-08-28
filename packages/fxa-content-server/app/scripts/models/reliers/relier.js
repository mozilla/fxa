/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A relier is a model that holds information about the RP.
 */

'use strict';

define([
  'backbone',
  'lib/promise',
  'lib/url'
], function (Backbone, p, Url) {

  var Relier = Backbone.Model.extend({
    defaults: {
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
    fetch: function (options) {
      var self = this;
      return p()
          .then(function () {
            self._setFromSearchParam('preVerifyToken');
          });
    },

    _setFromSearchParam: function (paramName, modelName) {
      modelName = modelName || paramName;

      var value = Url.searchParam(paramName, this._window.location.search);
      if (typeof value !== 'undefined') {
        this.set(modelName, value);
      }
    }
  });

  return Relier;
});
