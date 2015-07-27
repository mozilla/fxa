/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('copy', {
    strings: {
      files: [{
        expand: true,
        cwd: '<%= yeoman.strings_src %>',
        dest: '<%= yeoman.strings_dist %>',
        src: [
          '**/*.po'
        ]
      }, {
        // Copy strings from sv_SE to sv
        expand: true,
        cwd: '<%= yeoman.strings_src %>/sv_SE',
        dest: '<%= yeoman.strings_dist %>/sv',
        src: [
          '**/*.po'
        ]
      }, {
        // Copy strings from hi_IN to hi
        expand: true,
        cwd: '<%= yeoman.strings_src %>/hi_IN',
        dest: '<%= yeoman.strings_dist %>/hi',
        src: [
          '**/*.po'
        ]
      }]
    },
    tos_pp: { //eslint-disable-line camelcase
      // The legal repo use es-ES but we (in accordance with Verbatim) use es,
      // so copy es-ES templates to es
      files: [
        {
          expand: true,
          cwd: '<%= yeoman.tos_html_dest %>',
          dest: '<%= yeoman.tos_html_dest %>',
          src: 'es_ES.html',
          rename: function (dest) {
            return dest + '/es.html';
          }
        },
        {
          expand: true,
          cwd: '<%= yeoman.pp_html_dest %>',
          dest: '<%= yeoman.pp_html_dest %>',
          src: 'es_ES.html',
          rename: function (dest) {
            return dest + '/es.html';
          }
        }
      ]
    },
    error_pages: { //eslint-disable-line camelcase
      files: [
        {
          expand: true,
          dot: true,
          flatten: true,
          cwd: '<%= yeoman.page_template_dist %>',
          dest: '<%= yeoman.app %>',
          src: 'en/{500,502,503}.html'
        }
      ]
    },
    dist: {
      files: [
        {
          // static resources.
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'images/{,*/}*.{webp,gif,svg,jpg,jpeg,png}',
            'styles/fonts/{,*/}*.*',
            'fonts/**/*.{woff,eot,ttf,svg,ofl}',
            'i18n/{,*/}{,*/}*.*'
          ]
        },
        {
          // jquery ui
          expand: true,
          cwd: '<%= yeoman.app %>/bower_components/jquery-ui',
          src: ['**/*.js'],
          dest: '<%= yeoman.dist %>/bower_components/jquery-ui'
        },
        {
          // head scripts
          expand: true,
          cwd: '<%= yeoman.tmp %>/concat/scripts',
          src: ['**/*.js'],
          dest: '<%= yeoman.dist %>/scripts'
        }
      ]
    },
    styles: {
      expand: true,
      dot: true,
      cwd: '<%= yeoman.app %>/styles',
      dest: '<%= yeoman.tmp %>/styles/',
      src: '{,*/}*.css'
    },
    // copy normalize.css to .tmp during build, this library is required by grunt-usemin to be in .tmp
    normalize: {
      src: 'app/bower_components/normalize-css/normalize.css',
      dest: '<%= yeoman.tmp %>/bower_components/normalize-css/normalize.css'
    },
    build: {
      files: [
        {
          expand: true,
          cwd: '<%= yeoman.tmp %>/scripts',
          src: ['**/*.js'],
          dest: '<%= yeoman.dist %>/scripts'
        }
      ]
    }
  });
};
