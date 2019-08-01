/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  var fs = require('fs');
  var exec = require('child_process').exec;

  grunt.registerTask('sjcl', 'Build the SJCL library', function() {
    var done = this.async();
    var configSJCL =
      './configure --without-random --without-ocb2 --without-gcm --without-ccm && make';
    var src = 'core_closure.js';
    var dist = 'sjcl.js';

    process.chdir('node_modules/sjcl/');

    exec(configSJCL, function(error, stdout, stderr) {
      grunt.log.write(stdout);
      if (stderr) {
        grunt.log.warn(stderr);
      }

      var sjclBower = fs.readFileSync(src);
      fs.writeFileSync(dist, sjclBower);

      process.chdir('../..');
      done();
    });
  });
};
