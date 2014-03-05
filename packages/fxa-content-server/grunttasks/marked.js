/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  // convert localized TOS/PP agreements from markdown to html partials.

  grunt.config('marked', {
    options: {
      sanitize: false,
      gfm: true
    },
    tos_pp: {
      files: [
        {
          expand: true,
          cwd: '<%= yeoman.pp_md_src %>',
          src: ['**/*.md'],
          dest: '<%= yeoman.pp_html_dest %>',
          ext: '.html'
        },
        {
          expand: true,
          cwd: '<%= yeoman.tos_md_src %>',
          src: ['**/*.md'],
          dest: '<%= yeoman.tos_html_dest %>',
          ext: '.html'
        }
      ]
    }
  });
};
