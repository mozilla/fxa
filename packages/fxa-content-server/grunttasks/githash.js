/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {

  // set up `githash.main.hash` for use in banner in the uglify task
  grunt.config('githash', {
    main: {
      options: {
      }
    }
  });
};

