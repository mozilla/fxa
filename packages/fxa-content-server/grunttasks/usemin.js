/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('useminPrepare', {
    client_rendered: {
      dest: '<%= yeoman.dist %>',
      src: [
        '<%= yeoman.app %>/{,*/}*.html',
        '!<%= yeoman.app %>/tests/{,*/}*.html'
      ],
      type: 'html'
    },
    server_rendered: {
      options: {
        // root must be specified or else useminPrepare uses the template
        // directory as the root from where to search for assets.
        root: '<%= yeoman.app %>',
        type: 'html'
      },
      dest: '<%= yeoman.dist %>',
      src: [
        // Use the already generated locale specific pages as the source.
        '<%= yeoman.page_template_dist %>/{,*/}*.html',
        '!<%= yeoman.page_template_dist %>/{,*/}mocha.html'
      ]
    }
  });

  grunt.config('usemin', {
    options: {
      assetsDirs: ['<%= yeoman.dist %>']
    },
    html: [
      '<%= yeoman.dist %>/{,*/}*.html',
      '<%= yeoman.page_template_dist %>/{,*/}*.html',
      '!<%= yeoman.page_template_dist %>/{,*/}mocha.html'
    ],
    css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
  });
};
