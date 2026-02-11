/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  var path = require('path');

  var CONFIG_ROOT = path.join(__dirname, '..', 'server', 'config');
  var TARGET_TO_CONFIG = {
    app: path.join(CONFIG_ROOT, 'local.json'),
    dist: path.join(CONFIG_ROOT, 'production.json'),
    test: path.join(CONFIG_ROOT, 'local.json'),
  };

  grunt.registerTask(
    'selectconfig',
    'Select configuration files for the running environment.',
    function (target) {
      if (!target) {
        target = 'app';
      }

      // Config files specified in CONFIG_FILES env variable override everything
      // else.
      if (!process.env.CONFIG_FILES) {
        process.env.CONFIG_FILES = TARGET_TO_CONFIG[target];
      }

      console.log('Using configuration files', process.env.CONFIG_FILES);

      // `server` is a shortcut to the server configuration
      var serverConfig = require('../server/lib/configuration').getProperties();
      grunt.config.set('server', serverConfig);
    }
  );
};
