/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// monkey patch p to be able to convert jQuery XHR promises to our promises.
define(function (require, exports, module) {
  'use strict';

  var p = require('p-promise');

  // for more background, read
  // https://github.com/kriskowal/q/wiki/Coming-from-jQuery

  p.jQueryXHR = function (jQueryDeferred) {
    var defer = p.defer();

    jQueryDeferred.then(function (data/*,textStatus, jqXHR*/) {
      defer.resolve(data);
    }, function (jqXHR/*, textStatus, errorThrown*/) {
      defer.reject(jqXHR);
    });

    return defer.promise;
  };

  module.exports = p;
});


