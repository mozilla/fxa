#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';


  grunt.task.registerTask(
    'preprocess-config',
    'preprocess client side configuration',
    function(target) {
      // Correct configuration will be loaded based
      // on process.env.CONFIG_FILES when the selectconfig task is run. If
      // selectconfig is not run, local.json will be used by default.
      var config = require('../server/lib/configuration');
      var context = {
        fxaccount_url: config.get('fxaccount_url')
      };

      grunt.config('preprocess', {
        js: {
          src: '<%= yeoman.app %>/scripts/preprocess/constants.js',
          dest: '<%= yeoman.app %>/scripts/processed/constants.js',
          options: {
            context: context
          },
        }
      });

      grunt.task.run(['preprocess']);
  });



};
