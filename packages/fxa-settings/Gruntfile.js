/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      ftl: {
        src: ['.license.header', 'src/**/*.ftl'],
        dest: 'public/locales/en/settings.ftl',
      },

      // We need this for tests because we pull the latest from `fxa-content-server-l10n`
      // and place those in our `public` directory at `postinstall` time, and sometimes we have
      // FTL updates on our side that haven't landed yet on the l10n side. We want to test
      // against _our_ latest, and not necessarily the l10n repo's latest.
      'ftl-test': {
        src: ['.license.header', 'src/**/*.ftl'],
        dest: 'test/settings.ftl',
      },
    },
    watch: {
      ftl: {
        files: ['src/**/*.ftl'],
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
