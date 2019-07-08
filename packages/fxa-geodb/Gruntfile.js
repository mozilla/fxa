/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  'use strict';

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg,
    pkgReadOnly: pkg,
  });
  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);
  // load local Grunt tasks
  grunt.loadTasks('tasks');
};
