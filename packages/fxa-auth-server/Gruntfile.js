/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    copyright: {
      files: [
        "**/*.js",
        "!node_modules/**",
        "!client/emscrypt.js"
      ],
      options: {
        pattern: "This Source Code Form is subject to the terms of the Mozilla Public"
      }
    },
    jshint: {
      files: [
        "**/*.js",
        "**/*.json",
        "!node_modules/**",
        "!client/emscrypt.js",
        "!web/**"
      ],
      options: {
        jshintrc: ".jshintrc"
      }
    }
  });

  grunt.registerMultiTask('copyright', 'Copyright all the things!', function () {
    var pattern = this.options().pattern;
    var files = this.filesSrc.map(function (file) {
      return {
        "name": file,
        "txt": grunt.file.read(file, "utf8")
      };
    }).filter(function (file) {
      return !file.txt.match(pattern);
    });

    if (files.length) {
      grunt.log.subhead("The following files are missing copyright headers:");
      files.forEach(function (file) {
        grunt.log.warn(file.name);
      });
      return false;
    }
  });

  grunt.registerTask('default', ['copyright']);
  grunt.registerTask('qa', ['copyright', 'jshint']);
};
