/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.registerTask('build', [
    'lint',
    'clean:dist',
    'useminPrepare',
    'selectconfig:dist',
    'l10n-create-json',
    'l10n-generate-tos-pp:dist',
    // server templates are needed for requirejs to replace the require script
    'copy:server_templates',
    'requirejs',
    'css',
    'concurrent:dist',
    'concat',
    'cssmin',
    'static-pages',
    'copy:dist',
    // uglify overwrites the files in the dist directory.
    'uglify',
    'rev',
    'usemin'
  ]);
};
