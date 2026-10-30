/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.registerTask('build', [
    // Clean files and folders from any previous build
    'clean',

    // Select 'dist' configuration files for the running environment.
    'selectconfig:dist',

    // copy all static resources from 'app' to 'dist'
    'copy:dist',

    // Remove whitespace from the HTML
    'htmlmin',

    // copy fxa-settings. note this has already been webpacked. we don't need
    // run it through webpack again.
    'copy:settings',
  ]);
};
