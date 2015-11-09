/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Wrap able so that it can be used in RequireJS and can
 * be mocked in for unit tests.
 *
 * If able is enabled in production, it will be accessible
 * via window.able. If able is disabled in production, choose
 * will always return `undefined` and `report` will return an empty array.
 */

define(function (require, exports, module) {
  'use strict';


  function AbleWrapper() {
    // nothing to do here.
  }

  AbleWrapper.prototype = {
    choose: function () {
      var able = window.able;
      if (able) {
        return able.choose.apply(able, arguments);
      }
    },
    report: function () {
      var able = window.able;
      if (able) {
        return able.report.apply(able, arguments);
      }
      return [];
    }
  };

  module.exports = AbleWrapper;
});
