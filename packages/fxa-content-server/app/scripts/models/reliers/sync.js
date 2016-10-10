/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The Sync for Sync relier. In addition to the fields available on
 * `Relier`, provides the following:
 *
 * - context
 * - migration
 */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('lib/auth-errors');
  const _ = require('underscore');
  const Relier = require('models/reliers/relier');
  const ServiceNameTranslator = require('lib/service-name');
  const Vat = require('lib/vat');

  /*eslint-disable camelcase*/
  var QUERY_PARAMETER_SCHEMA = {
    // context is not available when verifying.
    context: Vat.string().min(1),
    customizeSync: Vat.boolean()
  };
  /*eslint-enable camelcase*/

  var SyncRelier = Relier.extend({
    defaults: _.extend({}, Relier.prototype.defaults, {
      customizeSync: false
    }),

    initialize: function (attributes, options = {}) {
      this._translator = options.translator;

      Relier.prototype.initialize.call(this, attributes, options);
    },

    fetch: function () {
      var self = this;
      return Relier.prototype.fetch.call(self)
        .then(function () {
          self.importSearchParamsUsingSchema(QUERY_PARAMETER_SCHEMA, AuthErrors);

          self._setupServiceName();
        });
    },

    isSync: function () {
      return true;
    },

    /**
     * Desktop clients will always want keys so they can sync.
     *
     * @returns {Boolean}
     */
    wantsKeys: function () {
      return true;
    },

    _setupServiceName: function () {
      var service = this.get('service');
      if (service) {
        var serviceNameTranslator = new ServiceNameTranslator(this._translator);
        var serviceName = serviceNameTranslator.get(service);
        this.set('serviceName', serviceName);
      }
    },

    /**
     * Check if the relier wants to force the customize sync checkbox on
     *
     * @returns {Boolean}
     */
    isCustomizeSyncChecked: function () {
      return !! this.get('customizeSync');
    }
  });

  module.exports = SyncRelier;
});
