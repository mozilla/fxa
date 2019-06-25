/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fxaChangelog = require('fxa-conventional-changelog')();

module.exports = function(grunt) {
  grunt.config('conventionalChangelog', {
    options: {
      changelogOpts: {},
      parserOpts: fxaChangelog.parserOpts,
      writerOpts: fxaChangelog.writerOpts,
    },
    release: {
      src: 'CHANGELOG.md',
    },
  });
};
