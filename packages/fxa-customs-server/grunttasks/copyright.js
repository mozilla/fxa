/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('copyright', {
    app: {
      options: {
        pattern:
          'This Source Code Form is subject to the terms of the Mozilla Public',
      },
      src: ['{,config/}*.js', '{,bans/,bin/,grunttasks/,scripts/,test/}*.js'],
    },
    tests: {
      options: {
        pattern: 'Any copyright is dedicated to the Public Domain.',
      },
      src: ['test/{remote,local}/*.js'],
    },
  });
};
