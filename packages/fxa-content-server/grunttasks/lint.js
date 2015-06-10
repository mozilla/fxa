/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

// meta grunt task to run other linters.

module.exports = function (grunt) {
  grunt.registerTask('lint', 'lint all the things', [
    'jshint',
    'jsonlint:app',
    'jscs',
    'amdcheck'
  ]);
};
