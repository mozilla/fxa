/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

module.exports = function (grunt) {
  grunt.config('jshint', {
    options: {
      jshintrc: '.jshintrc',
      reporter: require('jshint-stylish')
    },
    grunt: [
      'Gruntfile.js',
      'grunttasks/*.js'
    ],
    app: {
      options: {
        jshintrc: '<%= yeoman.app %>/.jshintrc'
      },
      src: [
        '<%= yeoman.app %>/**/*.js',
        '!<%= yeoman.app %>/bower_components/**',
        '!<%= yeoman.app %>/scripts/vendor/**'
      ]
    },
    tests: [
      '<%= yeoman.tests %>/**/*.js'
    ],
    server: [
      '<%= yeoman.server %>/**/*.js',
    ]
  });
};
