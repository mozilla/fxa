/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('copy', {
    dist: {
      files: [
        {
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          dot: true,
          // static resources.
          expand: true,
          src: ['*.{ico,png,txt}', '.htaccess'],
        },
      ],
    },
    settings: {
      expand: true,
      cwd: '<%= yeoman.app %>/../../fxa-settings/build',
      dest: '<%= yeoman.dist %>/settings/',
      src: '**/*',
    },
  });
};
