/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A utility for pre-loading images

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var p = require('lib/promise');

  /**
   * Returns true if given "uri" has HTTP or HTTPS scheme
   *
   * @param {String} src
   * @returns {boolean}
   */
  function load (src) {
    var defer = p.defer();

    var img = new Image();
    img.onerror = defer.reject;
    img.onload = _.partial(defer.resolve, img);
    img.src = src;

    return defer.promise;
  }

  module.exports = {
    load: load
  };
});

