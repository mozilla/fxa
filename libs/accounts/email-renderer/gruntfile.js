/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
  });

  grunt.config('copy', {
    'branding-ftl': {
      nonull: true,
      src: '../../../libs/shared/l10n/src/lib/branding.ftl',
      dest: 'public/locales/en/branding.ftl',
    },
  });

  grunt.config('concat', {
    'emails-ftl': {
      src: [
        'src/**/en.ftl'
      ],
      dest: 'public/locales/en/emails.ftl'
    }
  });

  grunt.config('watch', {
    ftl: {
      files: [
        'src/**/en.ftl'
      ],
      tasks: ['l10n-merge'],
      options: {
        interrupt: true,
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('l10n-watch', ['watch:ftl']);
  grunt.registerTask('l10n-merge', ['copy:branding-ftl', 'concat:emails-ftl']);
 }
