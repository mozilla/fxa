/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('jshint', {
    config: {
      options: {jshintrc: '.jshintrc'},
      src: ['Gruntfile.js', 'tasks/*.js', 'config/**/*.js', 'node/**/*.js']
    },
    app: {
      options: {jshintrc: 'client/.jshintrc'},
      src: ['client/*.js', 'client/lib/**/*']
    }
  });
};
