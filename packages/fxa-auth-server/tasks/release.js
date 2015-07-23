/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//
// A task to stamp a new version.
//
//
// * version is updated in package.json
// * changelog is generated.
// * git tag with version name is created.
// * git commit with updated package.json created.
//
// NOTE: This task will not push this commit for you.
//


module.exports = function (grunt) {
  'use strict';

  grunt.config('changelog', {
    dest: 'CHANGELOG.md'
  });

  grunt.renameTask('release', 'version');

  grunt.registerTask('version', [
    'bump-only:minor',
    'changelog',
    'bump-commit'
  ]);

  grunt.registerTask('version:patch', [
    'bump-only:patch',
    'changelog',
    'bump-commit'
  ]);
};
