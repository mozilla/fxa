/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('copy', {
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
            'bower_components/{,*/}{,*/}*.*',
            'i18n/{,*/}{,*/}*.*',
            'sync/*.html'
          ]
        }, {
          // server side rendered templates. Copied so embedded js/css
          // links can be updated to use minified versions.
          expand: true,
          dot: true,
          cwd: '<%= yeoman.page_template_src %>',
          dest: '<%= yeoman.page_template_dist %>',
          src: [
            '*.html'
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
