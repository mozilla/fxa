/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  /**
   *  This small task adjusts the 'sources' property of the main.js.map sourcemap.
   *  It changes the sources from '.tmp/scripts/main.js' to 'main.js', which makes
   *  the sourcemap accessible by the browser
   */

  var fs = require('fs');
  var MAP_PATH = 'dist/scripts/main.js.map';

  grunt.registerTask('sourcemap-source', 'Adjusts the sourcemap source file to match the hosted path.', function () {

    var existingMap = JSON.parse(fs.readFileSync(MAP_PATH));
    existingMap.sources = ['main.js'];

    fs.writeFileSync(MAP_PATH, JSON.stringify(existingMap));
  });
};
