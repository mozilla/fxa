/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var crosstab = require('crosstab');

  function deepStub(target, source) {
    for (var key in source) {
      if (typeof source[key] === 'function') {
        target[key] = function () {};
      }

      if (typeof source[key] === 'object') {
        target[key] = {};
        deepStub(target[key], source[key]);
      }
    }

    return target;
  }


  module.exports = function () {
    // create a complete new copy of the tree
    // every time a mock is created so that we
    // can stub functions out and forget about
    // restoring them between tests.
    var CrossTabMock = {};
    deepStub(CrossTabMock, crosstab);

    return CrossTabMock;
  };
});
