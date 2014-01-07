module.exports = function (grunt) {
  var fs = require('fs');
  var exec = require('child_process').exec;

  grunt.registerTask('sjcl', 'Build the SJCL library', function () {
    var done = this.async();
    var configSJCL = './configure --without-random --without-ocb2 --without-gcm --without-ccm && make';
    var src = 'core_closure.js';
    var dist = 'sjcl.js';

    process.chdir('components/sjcl/');

    exec(configSJCL,
      function (error, stdout, stderr) {
        grunt.log.write(stdout);
        if (stderr) {
          grunt.log.warn(stderr);
        }

        var sjclBower = fs.readFileSync(src);
        var sjclAmd = 'define([], function () {' + sjclBower + '  return sjcl; });';
        fs.writeFileSync(dist, sjclAmd);

        process.chdir('../..');
        done();
      });
  });
};
