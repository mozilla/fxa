/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// grunt task to extract strings.
module.exports = function(grunt) {
  grunt.registerTask(
    'l10n-generate-tos-pp',
    'Generate translated TOS/PP agreement partial templates',
    function() {
      grunt.task.run([
        'clean:tos_pp',
        'replace:tos_pp',
        'remarkable:tos_pp',
        'copy:tos_pp',
      ]);
    }
  );
};
