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
    defaults: _.extend({
      context: null,
      entrypoint: null
    }, Relier.prototype.defaults),

    initialize: function (options) {
      options = options || {};

      Relier.prototype.initialize.call(this, options);

      this._translator = options.translator || this._window.translator;
    },

    fetch: function () {
      var self = this;
      return Relier.prototype.fetch.call(self)
          .then(function () {
            self.importSearchParam('context');
            self.importSearchParam('entrypoint');
            return self._setServiceName();
          });
    },

    isFxDesktop: function () {
      return true;
    },

    _setServiceName: function () {
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
