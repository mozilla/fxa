/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// grunt task convert translated .po files to .json

var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');

// where to place the json files.
var jsonOutputPath = path.join(__dirname, '..', 'app', 'i18n');

module.exports = function(grunt) {
  // po2json is configured in po2json.js
  grunt.registerTask(
    'l10n-create-json',
    'Create localized string bundles for the client.',
    function() {
      if (!fs.existsSync(jsonOutputPath)) {
        mkdirp.sync(jsonOutputPath);
      }

      grunt.task.run(['copy:strings', 'po2json']);
    }
  );
};
