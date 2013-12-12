#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('htmlmin', {
    dist: {
      options: {
        /*
        removeCommentsFromCDATA: true,
        // https://github.com/yeoman/grunt-usemin/issues/44
        // collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true
        */
      },
      files: [{
        expand: true,
        cwd: '<%= yeoman.app %>',
        src: '*.html',
        dest: '<%= yeoman.dist %>'
      }]
    }
  });
};
