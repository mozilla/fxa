#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('modernizr', {
    devFile: '<%= yeoman.app %>/bower_components/modernizr/modernizr.js',
    outputFile: '<%= yeoman.dist %>/bower_components/modernizr/modernizr.js',
    files: [
      '<%= yeoman.dist %>/scripts/{,*/}*.js',
      '<%= yeoman.dist %>/styles/{,*/}*.css',
      '!<%= yeoman.dist %>/scripts/vendor/*'
    ],
    uglify: true
  });
};
