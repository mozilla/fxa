/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// meta grunt task to run other linters.

module.exports = function(grunt) {
  var SUBTASKS = ['eslint', 'word', 'jsonlint:app', 'sasslint'];

  grunt.registerTask('lint', 'lint all the things', SUBTASKS);
  grunt.registerTask(
    'quicklint',
    'lint the modified files',
    SUBTASKS.map(function(task) {
      return 'newer:' + task;
    })
  );
};
