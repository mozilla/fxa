/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config('word', {
    unsafeExplicitIV: {
      options: {
        banList: ['unsafeExplicitIV'],
      },
      src: [
        'app/scripts/**/*.js',
        '!app/scripts/lib/crypto/a256gcm.js',
        '!app/scripts/lib/crypto/recovery-keys.js',
      ],
    },
    'en-US': {
      options: {
        banList: ['en-us', 'en-US', 'en_us', 'en_US'],
      },
      src: ['app/scripts/**/*.js'],
    },
  });
};
