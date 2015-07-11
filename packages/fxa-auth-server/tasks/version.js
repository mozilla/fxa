/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//
// A task to stamp a new version.
//
// Before running this task you should update CHANGELOG with the
// changes for this release. Protip: you only need to make changes
// to CHANGELOG; this task will add and commit for you.
//
// * version is updated in package.json
// * git tag with version name is created.
// * git commit with updated package.json created.
//
// NOTE: This task will not push this commit for you.
//

module.exports = function (grunt) {
  'use strict';

  grunt.registerTask('version', [
    'bump-only:minor',
    'bump-commit'
  ]);

  grunt.registerTask('version:patch', [
    'bump-only:patch',
    'bump-commit'
  ]);
};
