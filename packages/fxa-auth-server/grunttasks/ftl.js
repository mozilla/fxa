/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = function (grunt) {
  grunt.config('concat', {
    ftl: {
      src: ['lib/l10n/auth.ftl', 'lib/**/senders/emails/**/en.ftl'],
      dest: 'public/locales/en/auth.ftl',
    },
    'ftl-test': {
      src: [
        'test/local/senders/emails/auth.ftl',
        'test/local/senders/emails/**/en.ftl',
      ],
      dest: 'test/temp/public/locales/en/auth.ftl',
    },
  });

  grunt.config('watch', {
    ftl: {
      files: ['lib/l10n/auth.ftl', 'lib/**/en.ftl'],
      tasks: ['merge-ftl'],
      options: {
        interrupt: true,
      },
    },
  });

  grunt.registerTask('merge-ftl', ['concat:ftl']);
  grunt.registerTask('merge-ftl:test', ['concat:ftl-test']);
  grunt.registerTask('watch-ftl', ['watch:ftl']);
};
