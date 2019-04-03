/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// takes care of bumping the version number in package.json

module.exports = function (grunt) {
  grunt.config('bump', {
    options: {
      bumpVersion: true,
      commit: true,
      commitFiles: [
        'package.json',
        'CHANGELOG.md',
        'AUTHORS'
      ],
      commitMessage: 'Release v%VERSION%',
      createTag: true,
      files: ['package.json'],
      gitDescribeOptions: '--tags --always --abrev=1 --dirty=-d',
      push: false,
      pushTo: 'origin',
      tagMessage: 'Version %VERSION%',
      tagName: 'v%VERSION%'
    }
  });
};

