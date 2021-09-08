/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = function (grunt) {
  grunt.config('concat', {
    ftl: {
      src: ['.license.header', 'lib/**/en-US.ftl'],
      dest: 'public/locales/en-US/auth.ftl',
    },
  });

  grunt.config('watch', {
    ftl: {
      files: 'lib/**/en-US.ftl',
      tasks: ['merge-ftl'],
      options: {
        interrupt: true,
      },
    },
  });

  grunt.registerTask('merge-ftl', ['concat:ftl']);
  grunt.registerTask('watch-ftl', ['watch:ftl']);
};
