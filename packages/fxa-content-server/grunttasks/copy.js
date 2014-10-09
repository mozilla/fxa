/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('copy', {
    strings: {
      files: [{
        expand: true,
        cwd: '<%= yeoman.strings_src %>',
        dest: '<%= yeoman.strings_dist %>',
        src: [
          '**/*.po'
        ]
      }]
    },
    error_pages: {
      files: [
        {
          expand: true,
          dot: true,
          flatten: true,
          cwd: '<%= yeoman.page_template_dist %>',
          dest: '<%= yeoman.app %>',
          src: 'en_US/{500,503}.html'
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
