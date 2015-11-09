/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Look up friendly service names by their 'slug'

define(function (require, exports, module) {
  'use strict';


  function t(str) {
    return str;
  }

  var serviceNames = {
    sync: t('Firefox Sync')
  };

  function ServiceName (translator) {
    this.translator = translator;
  }

  ServiceName.prototype.get = function (service) {
    return this.translator.get(serviceNames[service] || '');
  };

  module.exports = ServiceName;
});
