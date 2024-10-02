/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  const srcPaths = ['.license.header', 'src/**/*.ftl'];
  const testPaths = [
    '../../libs/shared/l10n/src/lib/branding.ftl',
    '../fxa-react/components/**/*.ftl',
    'src/**/*.ftl',
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // make a copy of the local branding terms available for local development
    // before they are extracted to the l10n repo
    // this file will not be included in the string extraction process, so should not lead to duplication
    copy: {
      'branding-ftl': {
        nonull: true,
        src: '../../libs/shared/l10n/src/lib/branding.ftl',
        dest: 'public/locales/en/branding.ftl',
      },
    },
    concat: {
      ftl: {
        src: srcPaths,
        dest: 'public/locales/en/settings.ftl',
      },

      // We need this for tests because we pull the latest from `fxa-content-server-l10n`
      // and place those in our `public` directory at `postinstall` time, and sometimes we have
      // FTL updates on our side that haven't landed yet on the l10n side. We want to test
      // against _our_ latest, and not necessarily the l10n repo's latest.
      'ftl-test': {
        src: testPaths,
        dest: 'test/settings.ftl',
      },
    },
    hash: {
      options: {
        mapping: 'public/static/static-asset-manifest.json', // The file where the hashed file names will be stored
        srcBasePath: 'public/', // the base Path you want to remove from the `key` string in the mapping file
        destBasePath: 'public/static',
      },
      locales: {
        expand: true,
        cwd: 'public/locales',
        src: '**/*.ftl',
        dest: 'public/static/locales/',
        rename: function (dest, src) {
          const lang = src.split('/')[0];
          return `${dest}/${lang}`;
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
    },
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-hash');

  grunt.registerTask('merge-ftl', ['copy:branding-ftl', 'concat:ftl']);
  grunt.registerTask('merge-ftl:test', ['concat:ftl-test']);
  grunt.registerTask('watch-ftl', ['watch:ftl']);

  grunt.registerTask('hash-static', ['hash']);
};
