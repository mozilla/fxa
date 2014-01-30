/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// grunt task convert translated .po files to .json

/**
 * This script takes care of compiling locale specific json files.
 *
 * Process used:
 * 1) checkout or update browserid locale repo under ~root/locale directory
 * 2) compile .po files into .json files located at
 *        ~root/resources/static/i18n
 */

const mkdirp         = require('mkdirp');
const fs             = require('fs');
const path           = require('path');

const existsSync = fs.existsSync || path.existsSync;

// where to place the json files.
const jsonOutputPath = path.join(__dirname, '..', 'app', 'i18n');


module.exports = function (grunt) {
  'use strict';

  // po2json is configured in po2json.js
  grunt.registerTask('l10n-create-json', function () {
    if (! existsSync(jsonOutputPath)) {
      mkdirp.sync(jsonOutputPath);
    }

    grunt.task.run([
      'l10n-fetch-strings',
      'po2json'
    ]);
  });
};


