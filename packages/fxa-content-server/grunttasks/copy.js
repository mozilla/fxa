/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('copy', {
    build: {
      files: [{
        cwd: '<%= yeoman.tmp %>/scripts',
        dest: '<%= yeoman.dist %>/scripts',
        expand: true,
        src: ['**/*.js']
      }]
    },
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
            'styles/fonts/{,*/}*.*',
            'fonts/**/*.{woff,woff2,eot,ttf,svg,ofl}',
            'i18n/{,*/}{,*/}*.*'
          ]
        },
        {
          cwd: '<%= yeoman.app %>/bower_components/jquery-ui',
          dest: '<%= yeoman.dist %>/bower_components/jquery-ui',
          // jquery ui
          expand: true,
          src: ['**/*.js']
        },
        {
          cwd: '<%= yeoman.app %>/bower_components/fxa-password-strength-checker/build/',
          dest: '<%= yeoman.dist %>/bower_components/fxa-password-strength-checker/build/',
          // password strength checker
          expand: true,
          src: ['*.js']
        },
        {
          cwd: '<%= yeoman.app %>/bower_components/fxa-checkbox/',
          dest: '<%= yeoman.dist %>/bower_components/fxa-checkbox/',
          // fxa-checkbox
          expand: true,
          src: ['*.js']
        },
        {
          cwd: '<%= yeoman.tmp %>/concat/scripts',
          dest: '<%= yeoman.dist %>/scripts',
          // head scripts
          expand: true,
          src: ['**/*.js']
        }
      ]
    },
    error_pages: { //eslint-disable-line camelcase
      files: [{
        cwd: '<%= yeoman.page_template_dist %>',
        dest: '<%= yeoman.dist %>',
        dot: true,
        expand: true,
        flatten: true,
        src: 'en/{500,502,503}.html'
      }]
    },
    head: {
      files: [{
        cwd: '<%= yeoman.tmp %>/concat/scripts',
        dest: '<%= yeoman.dist %>/scripts',
        expand: true,
        src: ['**/*.js']
      }]
    },
    // copy normalize.css to .tmp during build, this library is required by grunt-usemin to be in .tmp
    normalize: {
      dest: '<%= yeoman.tmp %>/bower_components/normalize-css/normalize.css',
      src: 'app/bower_components/normalize-css/normalize.css'
    },
    // Files necessary for requirejs to build
    requirejs: {
      files: [
        {
          cwd: '<%= yeoman.app %>/bower_components',
          dest: '<%= yeoman.es5 %>/bower_components',
          expand: true,
          src: ['**/*.js']
        },
        {
          cwd: '<%= yeoman.app %>/scripts',
          dest: '<%= yeoman.es5 %>/scripts',
          expand: true,
          src: ['templates/**/*.mustache', 'head/**/*.js', 'vendor/**/*.js']
        }
      ]
    },
    strings: {
      files: [
        {
          cwd: '<%= yeoman.strings_src %>',
          dest: '<%= yeoman.strings_dist %>',
          expand: true,
          src: ['**/*.po']
        }
      ]
    },
    styles: {
      cwd: '<%= yeoman.app %>/styles',
      dest: '<%= yeoman.tmp %>/styles/',
      dot: true,
      expand: true,
      src: '{,*/}*.css'
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
    }
  });
};
