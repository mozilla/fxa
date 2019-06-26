/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  /**
   *  This small task adjusts the 'sources' property of the main.js.map sourcemap.
   *  It changes the sources from '.tmp/scripts/main.js' to 'main.js', which makes
   *  the sourcemap accessible by the browser
   */

  var fs = require('fs');

  grunt.registerTask(
    'sourcemap-source',
    'Adjusts the sourcemap source file to match the hosted path.',
    function() {
      var MAP_PATH_MAIN = 'dist/scripts/main.js.map';
      var existingMap = JSON.parse(fs.readFileSync(MAP_PATH_MAIN));
      existingMap.sources = ['main.js'];
      fs.writeFileSync(MAP_PATH_MAIN, JSON.stringify(existingMap));

      var MAP_PATH_HEAD = 'dist/scripts/head.js.map';
      var existingMapHead = JSON.parse(fs.readFileSync(MAP_PATH_HEAD));
      existingMapHead.sources = ['head.js'];
      fs.writeFileSync(MAP_PATH_HEAD, JSON.stringify(existingMapHead));
    }
  );
};
