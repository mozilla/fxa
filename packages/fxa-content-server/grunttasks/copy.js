/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config('copy', {
    dist: {
      files: [
        {
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          dot: true,
          // static resources.
          expand: true,
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'images/{,*/}*.{webp,gif,svg,jpg,jpeg,png}',
            'fonts/**/*.{woff,woff2,eot,ttf,svg}',
            'i18n/{,*/}{,*/}*.*',
          ],
        },
      ],
    },
    error_pages: {
      //eslint-disable-line camelcase
      files: [
        {
          cwd: '<%= yeoman.page_template_dist %>',
          dest: '<%= yeoman.dist %>',
          dot: true,
          expand: true,
          flatten: true,
          src: 'en/{500,502,503}.html',
        },
        {
          cwd: '<%= yeoman.page_template_dist %>',
          dest: '<%= yeoman.dist %>',
          dot: true,
          expand: true,
          flatten: true,
          rename: (dest, src) =>
            `${dest}/${src.replace('.html', '.mozillaonline.html')}`,
          src: 'zh_CN_x_mococn/{500,502,503}.html',
        },
      ],
    },
    mozillaonline: {
      files: [
        {
          cwd: '<%= yeoman.page_template_dist %>',
          dest: '<%= yeoman.page_template_dist %>',
          expand: true,
          rename: (dest, src) => `${dest}/${src.replace('/', '_x_mococn/')}`,
          src: ['{en,zh_CN}/*'],
        },
      ],
      options: {
        process: content => {
          return content.replace(
            'https://www.mozilla.org/about/?utm_source=firefox-accounts&amp;utm_medium=Referral',
            'https://www.firefox.com.cn/?utm_source=firefox-accounts&amp;utm_medium=Referral'
          );
        },
      },
    },
    strings: {
      files: [
        {
          cwd: '<%= yeoman.strings_src %>',
          dest: '<%= yeoman.strings_dist %>',
          expand: true,
          src: ['**/*.po'],
        },
      ],
    },
    styles: {
      cwd: '<%= yeoman.app %>/styles',
      dest: '<%= yeoman.tmp %>/styles/',
      dot: true,
      expand: true,
      src: '{,*/}*.css',
    },
    tos_pp: {
      //eslint-disable-line camelcase
      // The legal repo use es-ES but we (in accordance with Verbatim) use es,
      // so copy es-ES templates to es
      files: [
        {
          expand: true,
          cwd: '<%= yeoman.tos_html_dest %>',
          dest: '<%= yeoman.tos_html_dest %>',
          src: 'es_ES.html',
          rename: function(dest) {
            return dest + '/es.html';
          },
        },
        {
          expand: true,
          cwd: '<%= yeoman.pp_html_dest %>',
          dest: '<%= yeoman.pp_html_dest %>',
          src: 'es_ES.html',
          rename: function(dest) {
            return dest + '/es.html';
          },
        },
      ],
    },
  });
};
