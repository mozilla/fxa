/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  var runServer = require('../scripts/run_locally');

  grunt.registerTask(
    'serverproc',
    'Start the server. ** Use `grunt server:<target>` instead **.',
    function () {
      runServer(this.async());
    }
  );
};
