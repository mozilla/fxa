#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const path = require('path');
const extract = require('jsxgettext-recursive');

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'
module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.initConfig({
    copy: {
      strings: {
        files: [{
          expand: true,
          flatten: true,
          cwd: path.join(__dirname, 'node_modules', 'fxa-content-server-l10n', 'locale', 'templates', 'LC_MESSAGES'),
          dest: __dirname,
          src: [
            'server.pot'
          ]
        }]
      }
    }
  });

  grunt.registerTask('l10n-extract', 'Extract strings from templates for localization.', function () {
    var done = this.async();

    var walker = extract({
      'input-dir': path.join(__dirname, 'templates'),
      'output-dir': __dirname,
      'output': 'server.pot',
      'join-existing': true,
      'keyword': 't',
      parsers: {
        '.txt': 'handlebars',
        '.html': 'handlebars'
      }
    });

    walker.on('end', function () {
      done();
    });
  });

  grunt.registerTask('default', [ 'copy:strings', 'l10n-extract' ]);

};
