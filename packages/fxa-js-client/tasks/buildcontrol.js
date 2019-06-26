/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  'use strict';

  grunt.config('buildcontrol', {
    options: {
      commit: true,
      push: true,
      remote: 'git@github.com:mozilla/fxa-js-client.git',
    },
    release: {
      options: {
        branch: 'release',
        dir: 'build',
        tag: '<%= pkg.version %>',
      },
    },
    docs: {
      options: {
        branch: 'gh-pages',
        dir: 'docs',
        tag: 'docs-<%= pkg.version %>',
      },
    },
  });
};
