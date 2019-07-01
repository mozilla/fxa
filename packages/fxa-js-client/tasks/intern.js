/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  'use strict';

  grunt.config('intern', {
    node: {
      options: {
        config: 'tests/intern',
        reporters: ['console'],
        suites: ['tests/all'],
      },
    },
    native_node: {
      options: {
        config: 'tests/intern_native_node',
        reporters: ['console'],
        suites: ['tests/all'],
      },
    },
    // local browser
    browser: {
      options: {
        runType: 'runner',
        config: 'tests/intern_browser',
        suites: ['tests/all'],
      },
    },
    sauce: {
      options: {
        runType: 'runner',
        config: 'tests/intern_sauce',
        suites: ['tests/all'],
        sauceUsername: 'fxa-client',
        sauceAccessKey: '863203af-38fd-4f1d-9332-adc8f60f157b',
      },
    },
  });
};
