/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = function (grunt) {
  grunt.registerTask('webpack', 'Run webpack build', function () {
    var done = this.async();
    var child = grunt.util.spawn(
      {
        cmd: 'webpack',
      },
      done
    );

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });
};
