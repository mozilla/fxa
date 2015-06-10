/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

// grunt task to extract strings.

var path = require('path');

module.exports = function (grunt) {
  grunt.registerTask('l10n-merge', 'Merge extracted strings with .PO files.', function () {
    var done = this.async();
    grunt.util.spawn({
      cmd: path.resolve(__dirname, '..', 'scripts', 'merge_po.sh'),
      args: [path.resolve(__dirname, '..', 'locale')]
    }, done);
  });
};

