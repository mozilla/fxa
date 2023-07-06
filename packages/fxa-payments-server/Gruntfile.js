/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  const srcPaths = [
    // 'src/branding.ftl' is temporary
    // and will be replaced with '../fxa-shared/lib/l10n/branding.ftl'
    // in a later ticket - will require coordination with l10n to resolve
    // conflicting IDs for identical terms.
    'src/branding.ftl',
    // Adding shared branding file to allow for gradual adoption of shared
    // branding terms. There are currently no conflicting IDs between the
    // two branding.ftl files.
    '../fxa-shared/l10n/branding.ftl',
    'src/**/*.ftl',
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      ftl: {
        src: srcPaths,
        dest: 'public/locales/en/payments.ftl',
      },

      // We need this for tests because we pull the latest from `fxa-content-server-l10n`
      // and place those in our `public` directory at `postinstall` time, and sometimes we have
      // FTL updates on our side that haven't landed yet on the l10n side. We want to test
      // against _our_ latest, and not necessarily the l10n repo's latest.
      'ftl-test': {
        src: srcPaths,
        dest: 'test/payments.ftl',
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

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('merge-ftl', ['concat:ftl']);
  grunt.registerTask('merge-ftl:test', ['concat:ftl-test']);
  grunt.registerTask('watch-ftl', ['watch:ftl']);
};
