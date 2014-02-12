/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('jscs', {
    src: [
      '**/*.js',
      '!<%= yeoman.app %>/bower_components/**',
      '!<%= yeoman.app %>/scripts/vendor/**',
      '!<%= yeoman.dist %>/**',
      '!<%= yeoman.server %>/**',
      '!node_modules/**'
    ],
    options: {
      config: '.jscs.json'
    }
  });
};
