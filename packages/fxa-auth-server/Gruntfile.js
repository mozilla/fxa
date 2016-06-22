#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict'

  require('load-grunt-tasks')(grunt)

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  })

  grunt.loadTasks('grunttasks')

  grunt.registerTask('lint', 'Alias for eslint tasks', ['eslint'])
  grunt.registerTask('default', [ 'templates', 'copy:strings', 'l10n-extract' ])
}
