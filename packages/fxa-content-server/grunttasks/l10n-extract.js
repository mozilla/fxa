/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// grunt task to extract strings.

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const extract = require('jsxgettext-recursive');

// where to place the pot files.
const messagesOutputPath = path.join(__dirname, '..', 'locale', 'templates', 'LC_MESSAGES');

module.exports = function (grunt) {
  'use strict';

  grunt.registerTask('l10n-extract', function () {
    var done = this.async();

    if (! fs.existsSync(messagesOutputPath)) {
      mkdirp.sync(messagesOutputPath);
    }

    var clientWalker = extract({
      'input-dir': path.join(__dirname, '..', 'app', 'scripts'),
      'output-dir': messagesOutputPath,
      'output': 'content-server.pot',
      'join-existing': false,
      'keyword': 't',
      parsers: {
        '.js': 'javascript',
        '.mustache': 'handlebars'
      }
    });

    clientWalker.on('end', function() {
      var authWalker = extract({
        'input-dir': path.join(__dirname, '..', 'node_modules', 'fxa-auth-server', 'templates'),
        'output-dir': messagesOutputPath,
        'output': 'auth-server.pot',
        'join-existing': false,
        parsers: {
          '.txt': 'handlebars',
          '.html': 'handlebars'
        }
      });

      authWalker.on('end', function() {
        done();
      });
    });

  });
};

