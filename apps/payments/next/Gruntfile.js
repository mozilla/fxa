/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  const srcPaths = [
    '.license.header',
    'app/**/*.ftl',
    '../../../libs/payments/ui/src/lib/**/*.ftl',
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
        dest: 'public/locales/en/payments-next.ftl',
      },
      ftlLegacy: {
        src: srcPaths,
        dest: 'public/locales/en/payments.ftl',
      },
    },
    http: {
      // Call the Payments Next route to restart and reinitialize the Nest App.
      nestapp: {
        options: {
          url: 'http://localhost:3035/api/dev/nestapp/restart',
        },
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
      nestapp: {
        files: [
          '../../../libs/payments/**/*.ts',
          '../../../libs/shared/**/*.ts',
          '../../../libs/google/**/*.ts',
        ],
        tasks: ['http:nestapp'],
        options: {
          interrupt: true,
        },
      },
    },
    // Allows for multiple watchers tasks to be run concurrently.
    concurrent: {
      options: {
        logConcurrentOutput: true,
      },
      dev: {
        tasks: ['watch:nestapp', 'watch:ftl'],
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-http');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('merge-ftl', ['copy:branding-ftl', 'concat:ftl', 'concat:ftlLegacy']);
  grunt.registerTask('watchers', ['concurrent:dev']);
};
