#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Generated on 2013-12-04 using generator-backbone-amd 0.0.4

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {
  // load all grunt tasks based on environment
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    require('load-grunt-tasks')(grunt, { scope: 'dependencies' });
  } else {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);
  }

  // setup logging
  require('./lib/logging');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
  });

  grunt.loadTasks('grunttasks');
};
