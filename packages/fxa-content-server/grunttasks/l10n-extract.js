/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// grunt task to extract strings.

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var extract = require('jsxgettext-recursive-next');
var execSync = require('child_process').execSync;

// where to place the pot files.
var messagesOutputPath = path.join(
  __dirname,
  '..',
  'locale',
  'templates',
  'LC_MESSAGES'
);
var babelCmd =
  'npx babel --plugins=@babel/plugin-syntax-dynamic-import,dynamic-import-webpack,@babel/plugin-proposal-class-properties --presets @babel/env app/scripts --out-dir .es5';
var templateCmd = 'cp -r app/scripts/templates .es5/templates/';

module.exports = function(grunt) {
  grunt.registerTask(
    'jsxextract',
    'Do not call directly, see l10n-extract.',
    function() {
      var done = this.async();

      if (!fs.existsSync(messagesOutputPath)) {
        mkdirp.sync(messagesOutputPath);
      }
      // jsxgettext does not support ES2015, only ES5. Run babel to convert
      // then run the extractor on the ES5 files.
      try {
        execSync(babelCmd);
      } catch (e) {
        throw e;
      }

      try {
        // babel only converts a subset of files, copy all other files
        // where there may be strings to extract.
        execSync(templateCmd);
      } catch (e) {
        throw e;
      }

      var clientWalker = extract({
        'input-dir': path.join(__dirname, '..', '.es5'),
        joinExisting: true,
        keyword: ['t', 'unsafeTranslate'],
        output: 'client.pot',
        outputDir: messagesOutputPath,
        parsers: {
          '.js': 'javascript',
          '.mustache': 'handlebars',
        },
      });

      clientWalker.on('end', function() {
        var authWalker = extract({
          exclude: /pages\/dist/,
          'input-dir': path.join(__dirname, '..', 'server'),
          joinExisting: true,
          keyword: ['t', 'unsafeTranslate'],
          output: 'server.pot',
          outputDir: messagesOutputPath,
          parsers: {
            '.html': 'handlebars',
            '.js': 'javascript',
            '.txt': 'handlebars',
          },
        });

        authWalker.on('end', function() {
          done();
        });
      });
    }
  );

  grunt.registerTask(
    'l10n-extract',
    'Extract strings from templates for localization.',
    ['clean', 'jsxextract']
  );
};
