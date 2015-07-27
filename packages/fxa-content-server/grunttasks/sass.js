/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('sass', {
    styles: {
      files: {
        '<%= yeoman.app %>/styles/main.css': '<%= yeoman.app %>/styles/main.scss',
        '<%= yeoman.app %>/styles/sync.css': '<%= yeoman.app %>/styles/sync.scss',
        '<%= yeoman.app %>/styles/system-font-main.css': '<%= yeoman.app %>/styles/system-font-main.scss'
      }
    }
  });
};
