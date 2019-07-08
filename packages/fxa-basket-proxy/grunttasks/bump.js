/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// takes care of bumping the version number in package.json

module.exports = function(grunt) {
  grunt.config('bump', {
    options: {
      files: ['package.json', 'npm-shrinkwrap.json'],
      bumpVersion: true,
      commit: true,
      commitMessage: 'Release v%VERSION%',
      commitFiles: [
        'package.json',
        'npm-shrinkwrap.json',
        'CHANGELOG.md',
        'AUTHORS',
      ],
      createTag: true,
      tagName: 'v%VERSION%',
      tagMessage: 'Version %VERSION%',
      push: false,
      pushTo: 'origin',
      gitDescribeOptions: '--tags --always --abrev=1 --dirty=-d',
    },
  });
};
