/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const i18n = require('i18n-abide');

module.exports = function (grunt) {
  // convert localized TOS/PP agreements from markdown to html partials.

  function rename(destPath, destFile) {
    // Normalize the filenames to use the locale name.
    // add the extension here, instead of using grunt-remarkable's
    // extension generator, to get locale names in uppercase

    const lang = i18n.localeFrom(destFile.split('/')[0]);
    return path.join(destPath, lang + '.html');
  }

  grunt.config('remarkable', {
    options: {
      breaks: true,
      html: true,
      linkify: false,
      xhtmlOut: true,
    },
    // eslint-disable-next-line camelcase
    tos_pp: {
      files: [
        {
          cwd: '<%= yeoman.pp_md_src %>',
          dest: '<%= yeoman.pp_html_dest %>',
          expand: true,
          ext: '',
          src: ['**/firefox_privacy_notice.md'],
          rename: rename,
        },
        {
          cwd: '<%= yeoman.tos_md_src %>',
          dest: '<%= yeoman.tos_html_dest %>',
          expand: true,
          ext: '',
          src: ['**/firefox_cloud_services_tos.md'],
          rename: rename,
        },
      ],
    },
  });
};
