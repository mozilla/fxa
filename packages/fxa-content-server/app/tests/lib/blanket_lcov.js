/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Based on node_modules/blanket/src/reporters/lcov_reporter.js
 */

//lcov_reporter
(function() {
  'use strict';
  //takes the option: toHTML {boolean}

  var appendHtml = function(filename, data) {
    var str = '';
    str += 'SF:app/' + filename + '\n';

    data.source.forEach(function(line, num) {
      // increase the line number, as JS arrays are zero-based
      num++;

      if (data[num] !== undefined) {
        str += 'DA:' + num + ',' + data[num] + '\n';
      }
    });

    str += 'end_of_record\n';
    window._$blanket_LCOV = (window._$blanket_LCOV || '') + str; //eslint-disable-line camelcase
  };

  /* global blanket */
  blanket.customReporter = function(coverageData, options) {
    var toHTML = true;
    if (
      typeof options !== 'undefined' &&
      typeof options.toHTML !== 'undefined'
    ) {
      toHTML = options.toHTML;
    }
    for (var filename in coverageData.files) {
      var data = coverageData.files[filename];
      appendHtml(filename, data, toHTML);
    }
  };
})();
