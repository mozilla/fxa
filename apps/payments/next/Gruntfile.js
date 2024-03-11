/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  const srcPaths = [
    '.license.header',
    'app/**/*.ftl',
    '../../../libs/payments/ui/src/lib/**/*.ftl'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // make a copy of the local branding terms available for local development
    // before they are extracted to the l10n repo
    // this file will not be included in the string extraction process, so should not lead to duplication
    copy: {
      'branding-ftl': {
        nonull: true,
        src: '../../../libs/shared/l10n/src/lib/branding.ftl',
        dest: 'public/locales/en/branding.ftl',
      },
    },
    concat: {
      ftl: {
        src: srcPaths,
        dest: 'public/locales/en/payments.ftl',
      },
    },
    watch: {
      ftl: {
        files: srcPaths,
        tasks: ['merge-ftl'],
        options: {
          interrupt: true,
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('merge-ftl', ['copy:branding-ftl', 'concat:ftl']);
  grunt.registerTask('watch-ftl', ['watch:ftl']);
};

