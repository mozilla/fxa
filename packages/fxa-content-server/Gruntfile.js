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
  require('load-grunt-tasks')(grunt, {scope: 'dependencies'});

  grunt.initConfig({
  });

  grunt.loadTasks('grunttasks');

  grunt.registerTask('selectconfig', function(target) {
    if (! target) {
      target = 'app';
    }

    // Config files specified in CONFIG_FILES env variable override everything
    // else. awsbox instances use this variable to specify ephemeral
    // configuration like public_url.
    if (! process.env.CONFIG_FILES) {
      process.env.CONFIG_FILES = TARGET_TO_CONFIG[target];
    }

    console.log('Using configuration files', process.env.CONFIG_FILES);
  });

  grunt.registerTask('serverproc', function () {
    runServer(this.async());
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'serverproc:dist']);
    }

    grunt.task.run([
      'clean:server',
      'selectconfig:app',
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
  ]);

  grunt.registerTask('build', [
    'lint',
    'clean:dist',
    'useminPrepare',
    'selectconfig:dist',
    'requirejs',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'cssmin',
    'copy:dist',
    // modernizer must come after copy or else the custom
    // modernizr is overwritten with the dev version.
    'modernizr',
    // uglify overwrites the files in the dist directory.
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'lint',
    'test',
    'build',
    'copyright'
  ]);
};
