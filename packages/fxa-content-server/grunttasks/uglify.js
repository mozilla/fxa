/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// grunt task to uglify all the js.

module.exports = function (grunt) {
  'use strict';

  /**
   * Uglify all of the scripts in the dist directory
   */
  grunt.config('uglify', {
    dist: {
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
