/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The FxDesktop for Sync relier. In addition to the fields available on
 * `Relier`, provides the following:
 *
 * - context
 * - entrypoint
 */

'use strict';

define([
  'underscore',
  'models/reliers/relier',
  'lib/service-name'
], function (_, Relier, ServiceNameTranslator) {

  var FxDesktopRelier = Relier.extend({
    defaults: _.extend({}, Relier.prototype.defaults, {
      context: null,
      entrypoint: null,
      isMigration: null
    }),

    initialize: function (options) {
      options = options || {};

      this._translator = options.translator;

      Relier.prototype.initialize.call(this, options);
    },

    fetch: function () {
      var self = this;
      return Relier.prototype.fetch.call(self)
          .then(function () {
            self.importSearchParam('context');
            self.importSearchParam('entrypoint');
            self.importSearchParam('isMigration');
            if (self.get('isMigration') === 'true') {
              self.set('isMigration', true);
            }
            return self._setupServiceName();
          });
    },

    isFxDesktop: function () {
      return true;
    },

    _setupServiceName: function () {
      var service = this.get('service');
      if (service) {
        var serviceNameTranslator = new ServiceNameTranslator(this._translator);
        var serviceName = serviceNameTranslator.get(service);
        this.set('serviceName', serviceName);
      }
    }
  });

  return FxDesktopRelier;
});
