/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('nodemon', {
    dev: {
      script: 'bin/server.js',
      callback: function (nodemon) {
        nodemon.on('log', function(event) {
          console.log(event.colour);
        });
        // opens browser on initial server start
        nodemon.on('start', function () {
          // Delay before server listens on port
          setTimeout(function () {
            // TODO: Set dev PORTS from config.
            require('opn')('http://127.0.0.1:20038/debug?port=20037');
            require('opn')('http://127.0.0.1:10037');
          }, 1000);
        });
      }
    }
  });
};