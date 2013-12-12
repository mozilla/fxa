#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Generated on 2013-12-04 using generator-backbone-amd 0.0.4
'use strict';

var path = require('path');
var runServer = require('./scripts/run_locally');

var CONFIG_ROOT = path.join(__dirname, 'server', 'config');
var TARGET_TO_CONFIG = {
  app: path.join(CONFIG_ROOT, 'local.json'),
  test: path.join(CONFIG_ROOT, 'local.json'),
  aws: path.join(CONFIG_ROOT, 'awsbox.json'),
  dist: path.join(CONFIG_ROOT, 'production.json')
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'
module.exports = function (grunt) {

  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
  });

  grunt.loadTasks('grunttasks');

  grunt.registerTask('serverproc', function (target) {
    if (!target) {
      target = 'app';
    }
    process.env.CONFIG_FILES = TARGET_TO_CONFIG[target];

    runServer(this.async());
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'serverproc:dist']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'autoprefixer',
      'serverproc:app'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'serverproc:test'
    // XXX Mocha is removed from here, we should do something else that's
    // awesome instead.
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'requirejs',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'cssmin',
    'uglify',
    'modernizr',
    'copy:dist',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build',
    'copyright'
  ]);
};
