/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var minOptions = {
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
};

module.exports = function (grunt) {
  grunt.config('htmlmin', {
    templates: {
      options: minOptions,
      files: [{
        expand: true,
        cwd: '<%= yeoman.page_template_dist %>',
        src: '**/*.html',
        dest: '<%= yeoman.page_template_dist %>'
      }]
    },
    appFiles: {
      options: minOptions,
      files: [{
        expand: true,
        cwd: '<%= yeoman.app %>',
        src: '*.html',
        dest: '<%= yeoman.dist %>'
      }]
    }
  });
};
