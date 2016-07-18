/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('babel', {
    options: {
      presets: ['babel-preset-es2015-nostrict'],
      sourceMap: false
    },
    scripts: {
      files: [{
        cwd: '<%= yeoman.app %>/scripts',
        dest: '<%= yeoman.es5 %>/scripts',
        expand: true,
        src: [
          'lib/**/*.js',
          'models/**/*.js',
          'views/**/*.js',
          'main.js',
          'require_config.js'
        ]
      }]
    }
  });
};

