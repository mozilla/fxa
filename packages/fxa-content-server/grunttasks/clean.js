/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config('clean', {
    app: {
      files: [
        {
          dot: true,
          src: [
            '<%= yeoman.tmp %>/*',
            // css files are regenerated on every server run.
            '<%= yeoman.app %>/styles/**/*.css',
            '!<%= yeoman.app %>/styles/fontello.css',
          ],
        },
      ],
    },
    dist: {
      files: [
        {
          dot: true,
          src: [
            '<%= yeoman.tmp %>',
            '<%= yeoman.es5 %>/*',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*',
            '<%= yeoman.page_template_dist %>/*',
          ],
        },
      ],
    },
    tos_pp: {
      //eslint-disable-line camelcase
      files: [
        {
          dot: true,
          src: ['<%= yeoman.pp_html_dest %>', '<%= yeoman.tos_html_dest %>'],
        },
      ],
    },
  });
};
