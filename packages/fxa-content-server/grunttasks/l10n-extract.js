/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// grunt task to extract strings.

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var extract = require('jsxgettext-recursive');

// where to place the pot files.
var messagesOutputPath = path.join(__dirname, '..', 'locale', 'templates', 'LC_MESSAGES');

module.exports = function (grunt) {
  grunt.registerTask('l10n-extract', 'Extract strings from templates for localization.', function () {
    var done = this.async();

    if (! fs.existsSync(messagesOutputPath)) {
      mkdirp.sync(messagesOutputPath);
    }

    var clientWalker = extract({
      'input-dir': path.join(__dirname, '..', 'app', 'scripts'),
      'join-existing': false,
      'keyword': 't',
      'output': 'client.pot',
      'output-dir': messagesOutputPath,
      parsers: {
        '.js': 'javascript',
        '.mustache': 'handlebars'
      }
    });

    clientWalker.on('end', function () {
      var authWalker = extract({
        exclude: /pages\/dist/,
        'input-dir': path.join(__dirname, '..', 'server'),
        'join-existing': true,
        'keyword': 't',
        'output': 'server.pot',
        'output-dir': messagesOutputPath,
        parsers: {
          '.html': 'handlebars',
          '.js': 'javascript',
          '.txt': 'handlebars'
        }
      });

      authWalker.on('end', function () {
        done();
      });
    });
  });
};

