#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('useminPrepare', {
    options: {
      dest: '<%= yeoman.dist %>'
    },
    html: '<%= yeoman.app %>/index.html'
  });

  grunt.config('usemin', {
    options: {
      assetsDirs: ['<%= yeoman.dist %>']
    },
    html: ['<%= yeoman.dist %>/{,*/}*.html'],
    css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
  });
};
