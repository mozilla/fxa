/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  const TEMP_DIR = '.tmp';

  grunt.config('yeoman', {
    app: 'app',
    dist: 'dist',
    es5: '.es5',
    server: 'server',
    tests: 'tests',
    tmp: TEMP_DIR,
  });
};
