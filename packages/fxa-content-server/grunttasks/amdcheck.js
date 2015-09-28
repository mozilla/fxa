/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('amdcheck', {
    app: {
      files: [{
        expand: true,
        src: [
          'app/{scripts,tests}/**/*.js',
          'app/!scripts/vendor/**',
          'tests/functional/**/*.js'
        ]
      }],
      options: {
        removeUnusedDependencies: false,
        strict: true
      }
    }
  });
};
