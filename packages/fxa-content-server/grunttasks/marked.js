/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const i18n = require('i18n-abide');

module.exports = function (grunt) {
  'use strict';

  // convert localized TOS/PP agreements from markdown to html partials.

  function rename(destPath, destFile) {
    // Normalize the filenames to use the locale name.
    var lang = destFile.replace('.md', '');
    return path.join(destPath, i18n.localeFrom(lang) + '.html');
  }

  grunt.config('marked', {
    options: {
      breaks: true,
      gfm: true,
      sanitize: false
    },
    tos_pp: {
      files: [
        {
          expand: true,
          cwd: '<%= yeoman.pp_md_src %>',
          src: ['**/*.md'],
          dest: '<%= yeoman.pp_html_dest %>',
          rename: rename
        },
        {
          expand: true,
          cwd: '<%= yeoman.tos_md_src %>',
          src: ['**/*.md'],
          dest: '<%= yeoman.tos_html_dest %>',
          rename: rename
        }
      ]
    }
  });
};
