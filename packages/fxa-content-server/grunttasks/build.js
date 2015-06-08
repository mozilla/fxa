/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.registerTask('build', [
    // Clean files and folders from any previous build
    'clean',

    // Select 'dist' configuration files for the running environment.
    'selectconfig:dist',

    // l10n-generate-pages needs to be run before useminPrepare to seed
    // the list of resources to minimize. Generated pages are placed into
    // `server/templates/pages/dist` where they will be post-processed
    // with requirejs and usemin
    'l10n-generate-pages',

    // use error pages from en as the static error pages
    'copy:error_pages',

    // prepares the configuration to transform specific blocks
    // in the scrutinized file into a single line, targeting an optimized version of the files.
    'useminPrepare',

    // Runs r.js optimizer on the application files
    'requirejs',

    // Adds requirejs to the generated r.js bundle
    'concat:requirejs',

    // general 'css' tasks:
    //    'sass', - compile SASS,
    //    'autoprefixer' - auto prefix CSS for many browsers,
    //    'connect_fonts' - generate CSS files for connect-fonts compatible font packs.
    'css',

    // 'copy:styles',
    //  'connect_fonts_copy', - copy the generated connect fonts
    //  'imagemin', - optimize image files
    'concurrent:dist',

    // concatenate files as part of the useminPrepare task
    'concat',

    // compress CSS files
    'cssmin',

    // copy all static resources from 'app' to 'dist'
    'copy:dist',

    'uglify',

    // static file asset revisioning through content hashing
    'rev',

    // replaces the blocks by the file they reference,
    // and replaces all references to assets by their revisioned version if it is found on the disk
    'usemin',
    // copy the non-minified scripts file for sourcemap purposes
    'copy:build',
    // update the sourcemap path to match the hosted files
    'sourcemap-source',

    'htmlmin',
  ]);
};
