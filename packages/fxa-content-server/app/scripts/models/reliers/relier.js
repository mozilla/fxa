/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A relier is a model that holds information about the RP.
 */

'use strict';

define([
  'underscore',
  'models/reliers/base',
  'models/mixins/search-param',
  'lib/promise',
  'lib/constants'
], function (_, BaseRelier, SearchParamMixin, p, Constants) {

  var Relier = BaseRelier.extend({
    defaults: {
      service: null,
      preVerifyToken: null
    },

    initialize: function (options) {
      options = options || {};

      this.window = options.window || window;
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
            self.importSearchParam('email');
          });
    },

    /**
     * Check if the relier is Sync for Firefox Desktop
     */
    isSync: function () {
      return this.get('service') === Constants.FX_DESKTOP_SYNC;
    }
  });

  _.extend(Relier.prototype, SearchParamMixin);

  return Relier;
});
