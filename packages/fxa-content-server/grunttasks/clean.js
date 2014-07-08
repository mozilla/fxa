/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('clean', {
    tos_pp: {
      files: [{
        dot: true,
        src: [
          '<%= yeoman.pp_html_dest %>',
          '<%= yeoman.tos_html_dest %>'
        ]
      }]
    },
    dist: {
      files: [{
        dot: true,
        src: [
          '<%= yeoman.tmp %>',
          '<%= yeoman.dist %>/*',
          '!<%= yeoman.dist %>/.git*',
          '<%= yeoman.page_template_dist %>/*'
        ]
      }]
    },
    app: {
      files: [{
        dot: true,
        src: [
          '<%= yeoman.tmp %>/*',
          // css files are regenerated on every server run.
          '<%= yeoman.app %>/styles/**/*.css',
          '!<%= yeoman.app %>/styles/fontello.css',
          // fonts are copied over every server run.
          '<%= yeoman.app %>/fonts/default',
          '<%= yeoman.app %>/fonts/latin'
        ]
      }]
    }
  });
};
