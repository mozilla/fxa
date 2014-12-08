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
            self._importCustomizeSync();
          });
    },

    _importCustomizeSync: function () {
      var self = this;
      // set paramName to squeeze a few bytes out of the minified file.
      var paramName = 'customizeSync';
      self.importSearchParam(paramName);
      if (self.get(paramName) === 'true') {
        self.set(paramName, true);
      } else {
        self.unset(paramName);
      }
    },

    /**
     * Check if the relier is Sync for Firefox Desktop
     */
    isSync: function () {
      return this.get('service') === Constants.FX_DESKTOP_SYNC;
    },

    /**
     * Check if the relier wants to force the customize sync checkbox on
     */
    isCustomizeSyncChecked: function () {
      return !!(this.isSync() && this.get('customizeSync'));
    }
  });

  _.extend(Relier.prototype, SearchParamMixin);

  return Relier;
});
