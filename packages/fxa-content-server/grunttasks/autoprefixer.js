/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('autoprefixer', {
    options: {
      browsers: ['> 1%', 'last 5 versions', 'ff >= 16', 'Explorer >= 8']
    },
    dist: {
      files: [{
        expand: true,
        cwd: '<%= yeoman.app %>/styles/',
        src: '{,*/}*.css',
        dest: '<%= yeoman.app %>/styles/'
      }]
    }
  });
};
