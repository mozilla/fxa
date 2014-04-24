/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('modernizr', {
    dist: {
      devFile: '<%= yeoman.app %>/bower_components/modernizr/modernizr.js',
      outputFile: '<%= yeoman.dist %>/bower_components/modernizr/modernizr.js',
      files: {
        src: [
          '<%= yeoman.dist %>/scripts/**/*.js',
          '<%= yeoman.dist %>/styles/**/**.css',
          '!<%= yeoman.dist %>/scripts/vendor/*'
        ]
      },
      extra: {
        shiv: true,
        printshiv: false,
        load: false,
        mq: false,
        cssclasses: true
      },
      // Based on default settings on http://modernizr.com/download/
      extensibility: {
        addtest: false,
        prefixed: false,
        teststyles: true,
        testprops: false,
        testallprops: false,
        hasevents: false,
        prefixes: true,
        domprefixes: false
      },
      tests: ['touch'],
      uglify: true,
      parseFiles: true
    }
  });
};
