/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('eslint', {
    app: {
      options: { eslintrc: '<%= yeoman.app %>/.eslintrc' },
      src: [
        '<%= yeoman.app %>/**/*.js',
        '!<%= yeoman.app %>/bower_components/**',
        '!<%= yeoman.app %>/scripts/vendor/**'
      ]
    },
    grunt: [
      'Gruntfile.js',
      'grunttasks/*.js'
    ],
    options: { eslintrc: '.eslintrc' },
    scripts: ['scripts/*.js'],
    server: ['<%= yeoman.server %>/**/*.js'],
    tests: ['<%= yeoman.tests %>/**/*.js']
  });
};
