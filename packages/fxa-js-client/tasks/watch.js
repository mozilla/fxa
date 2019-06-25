/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  'use strict';

  grunt.config('watch', {
    dev: {
      options: {
        atBegin: true,
      },
      files: ['Gruntfile.js', 'client/**/*.js', 'tests/**/*.js'],
      tasks: ['build', 'intern:node'],
    },
    debug: {
      options: {
        atBegin: true,
      },
      files: ['Gruntfile.js', 'client/**/*.js', 'tests/**/*.js'],
      tasks: ['webpack:app', 'intern:node'],
    },
  });
};
