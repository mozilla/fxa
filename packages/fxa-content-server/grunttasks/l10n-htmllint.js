/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path');

// Four steps are performed to lint the files:
//  1. Clean the directories
//  2. Generate the JSON files from the PO files
//  3. The JSON files are then written out to temporary HTML files
//  4. The HTML files are linted

module.exports = function (grunt) {
  grunt.registerTask('l10n-htmllint', 'Lint l10n files', [
    // grunt addition for htmllint
    'clean',
    'selectconfig:dist',
    'l10n-generate-pages',
    'l10n-json-to-html',
    'htmllint:l10n',
  ]);

  grunt.registerMultiTask(
    'l10n-json-to-html',
    'Convert l10n JSON files to HTML',
    function () {
      this.files.forEach(function (file) {
        var content = '';
        var src = file.src[0];
        var pathname = src.split('/');
        var locale = grunt.file.readJSON(src);
        for (var val in locale) {
          var value = locale[val];
          if (typeof value !== 'object' && value !== '' && isNaN(value)) {
            content += value.toString() + '\n\n';
          }
        }
        if (content !== '') {
          var tmpDir = grunt.config.get('yeoman.tmp');
          grunt.file.write(
            path.join(
              tmpDir,
              pathname[1],
              pathname[2],
              pathname[3].replace('json', 'html')
            ),
            content
          );
        }
      });
      grunt.log.ok(this.files.length + ' file(s) converted from JSON to HTML');
    }
  );

  grunt.config('l10n-json-to-html', {
    dist: {
      files: [
        {
          expand: true,
          src: ['<%= yeoman.app %>/i18n/*/*.json'],
        },
      ],
    },
  });
};
