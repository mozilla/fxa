/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A task to stamp a new version.
//
// * version is updated in package.json
// * CHANGELOG.md updated with changes since last version
// * git tag with version name is created.
// * git commit with updated package.json and CHANGELOG.md created.

module.exports = function(grunt) {
  grunt.registerTask('version', [
    'bump-only:minor',
    'conventionalChangelog',
    'bump-commit',
  ]);

  grunt.registerTask('version:patch', [
    'bump-only:patch',
    'conventionalChangelog',
    'bump-commit',
  ]);
};
