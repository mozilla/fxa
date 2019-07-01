/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  'use strict';

  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    // .js files for ESLint, etc.
    mainJsFiles: '{,lib/**/,scripts/**/,test/**/,tasks/**/,bin/**/}*.js',
  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['lint', 'copyright']);
};
