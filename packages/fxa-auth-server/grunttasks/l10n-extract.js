#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const path = require('path');
const extract = require('jsxgettext-recursive-next');

const pkgroot = path.dirname(__dirname);

module.exports = function (grunt) {
  grunt.config('copy', {
    strings: {
      files: [
        {
          expand: true,
          flatten: true,
          cwd: path.join(
            pkgroot,
            'fxa-content-server-l10n',
            'locale',
            'templates',
            'LC_MESSAGES'
          ),
          dest: pkgroot,
          src: ['server.pot'],
        },
      ],
    },
  });

  grunt.registerTask(
    'l10n-extract',
    'Extract strings from templates for localization.',
    function () {
      const done = this.async();

      const walker = extract({
        'input-dir': path.join(pkgroot, 'lib/senders/templates'),
        outputDir: pkgroot,
        output: 'server.pot',
        joinExisting: true,
        keyword: ['t'],
        parsers: {
          '.txt': 'handlebars',
          '.html': 'handlebars',
        },
      });

      walker.on('end', () => {
        const jsWalker = extract({
          'input-dir': path.join(pkgroot, 'lib/senders'),
          outputDir: pkgroot,
          output: 'server.pot',
          joinExisting: true,
          keyword: ['gettext'],
          parsers: {
            '.js': 'javascript',
          },
          parserOptions: '{"ecmaVersion":"2018"}',
        });

        jsWalker.on('end', () => {
          done();
        });
      });
    }
  );

  // load local Grunt tasks

  grunt.registerTask('lint', 'Alias for eslint tasks', ['eslint']);

  grunt.registerTask('default', ['copy:strings', 'l10n-extract']);
};
