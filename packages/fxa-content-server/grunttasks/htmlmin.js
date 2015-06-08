/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('htmlmin', {
    dist: {
      options: {
        removeCommentsFromCDATA: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeComments: true,
        ignoreCustomComments: [
          // ignore IE conditional comments, strip all others.
          /\[if/
        ],
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      },
      files: [{
        expand: true,
        cwd: '<%= yeoman.page_template_dist %>',
        src: '**/*.html',
        dest: '<%= yeoman.page_template_dist %>'
      }]
    }
  });
};
