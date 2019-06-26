/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global require, module */

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    mainJsFiles:
      '{,lib/**/,scripts/**/,test/**/,tasks/**/,bin/**/,app/**/}*.js',
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('lint', ['copyright', 'eslint']);
};
