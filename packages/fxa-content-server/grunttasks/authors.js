/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  /**
   *  This small task generates the AUTHORS file using the git shortlog
   */

  var exec = require('child_process').exec;
  var createAuthors = 'git shortlog -s < /dev/tty | cut -c8- | sort -f > AUTHORS';

  grunt.registerTask('authors', 'Update AUTHORS file based on git contributions', function () {
    exec(createAuthors);
  });
};
