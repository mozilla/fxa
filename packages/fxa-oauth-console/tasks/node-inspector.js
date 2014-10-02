/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('node-inspector', {
    dev: {
      options: {
        // TODO: use live dev port.
        'debug-port': 20137,
        'web-port': 20139,
        'save-live-edit': true,
        'no-preload': true,
        'stack-trace-limit': 4,
        'hidden': ['node_modules']
      }
    }
  });
};
