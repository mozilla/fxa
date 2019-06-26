/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  'use strict';

  grunt.config('eslint', {
    options: {
      eslintrc: '.eslintrc',
    },
    files: [
      'index.js',
      '{grunttasks,bin,lib,lib/db,scripts,test}/*.js',
      'db-server/index.js',
      'db-server/{lib,test,test/backend,test/local}/*.js',
      'test/{backend,local,mem,scripts}/*.js',
    ],
  });

  // Let's make a sneaky alias for ESLint and call it `jshint`.
  grunt.registerTask('jshint', ['eslint']);
};
