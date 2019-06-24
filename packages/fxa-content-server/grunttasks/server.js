/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.registerTask(
    'server',
    'Start the server after performing necessary build.',
    function(target) {
      if (target === 'dist') {
        return grunt.task.run(['build', 'serverproc:dist']);
      }

      grunt.task.run([
        'clean:app',
        'selectconfig:app',
        'l10n-create-json',
        'l10n-generate-tos-pp:app',
        'serverproc:app',
      ]);
    }
  );
};
