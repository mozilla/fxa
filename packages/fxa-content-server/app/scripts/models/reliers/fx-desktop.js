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
  'backbone',
  'underscore',
  'models/reliers/relier'
], function (Backbone, _, Relier) {

  var FxDesktopRelier = Relier.extend({
    defaults: _.extend({
      context: null,
      entrypoint: null
    }, Relier.prototype.defaults),

    fetch: function () {
      var self = this;
      return Relier.prototype.fetch.call(self)
          .then(function () {
            self.importSearchParam('context');
            self.importSearchParam('entrypoint');
          });
    }
  });

  return FxDesktopRelier;
});
