/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.registerTask('build', [
    // Clean everything
    'clean',
    'selectconfig:dist',
    // l10n-generate-pages needs to be run before useminPrepare to seed
    // the list of resources to minimize. Generated pages are placed into
    // `server/templates/pages/dist` where they will be post-processed
    // with requirejs and usemin
    'l10n-generate-pages',
    // use error pages from en_US as the static error pages
    'copy:error_pages',
    'useminPrepare',
    'l10n-create-json',
    'l10n-generate-tos-pp:dist',
    'requirejs',
    'css',
    'concurrent:dist',
    'concat',
    'cssmin',
    'copy:dist',
    // uglify overwrites the files in the dist directory.
    'uglify',
    'rev',
    'usemin'
  ]);
};
