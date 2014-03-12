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
    server_templates: {
      files: [{
        // server side rendered templates. Copied so requirejs can
        // replace the require script tag and embedded js/css
        // links can be updated to use minified versions.
        expand: true,
        dot: true,
        cwd: '<%= yeoman.page_template_src %>',
        dest: '<%= yeoman.page_template_dist %>',
        src: [
          '*.html'
        ]
      }]
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
            'images/{,*/}*.{webp,gif}',
            'styles/fonts/{,*/}*.*',
            // only modernizr is left unbundled in main.js. It should be
            // the only thing copied over.
            'bower_components/modernizr/modernizr.js',
            'i18n/{,*/}{,*/}*.*',
            'sync/*.html'
          ]
        }
      ]
    },
    styles: {
      expand: true,
      dot: true,
      cwd: '<%= yeoman.app %>/styles',
      dest: '<%= yeoman.tmp %>/styles/',
      src: '{,*/}*.css'
    }
  });
};
