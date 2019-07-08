/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var minOptions = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  ignoreCustomComments: [
    // ignore IE conditional comments, strip all others.
    /\[if/,
  ],
  removeAttributeQuotes: true,
  removeComments: true,
  removeCommentsFromCDATA: true,
  removeEmptyAttributes: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
};

module.exports = function(grunt) {
  grunt.config('htmlmin', {
    appFiles: {
      files: [
        {
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          expand: true,
          src: '*.html',
        },
      ],
      options: minOptions,
    },
    templates: {
      files: [
        {
          cwd: '<%= yeoman.page_template_dist %>',
          dest: '<%= yeoman.page_template_dist %>',
          expand: true,
          src: '**/*.html',
        },
      ],
      options: minOptions,
    },
  });
};
