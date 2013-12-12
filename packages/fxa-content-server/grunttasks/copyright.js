#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('copyright', {
    app: {
      options: {
        pattern: /This Source Code Form is subject to the terms of the Mozilla Public/
      },
      src: [
        '**/*.js',
        '!<%= yeoman.app %>/bower_components/**',
        '!node_modules/**'
      ]
    }
  });

  grunt.registerMultiTask('copyright', 'Checking for copyrights in files', function () {
    var pattern = this.options().pattern;
    var files = this.filesSrc.filter(function (file) {
      var txt;
      if (!grunt.file.isFile(file)) {
        return;
      }
      txt = grunt.file.read(file, 'utf8');
      return !txt.match(pattern);
    });

    if (files.length) {
      grunt.log.subhead('The following files don\'t match the specified pattern:\n> %s\n', pattern);
      files.forEach(function (file) {
        grunt.log.writeln('- ' + file);
      });
      return false;
    }
  });
};
