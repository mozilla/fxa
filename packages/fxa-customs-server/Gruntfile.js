/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-copyright')
  grunt.loadNpmTasks('grunt-contrib-jshint')

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copyright: {
      app: {
        options: {
          pattern: 'This Source Code Form is subject to the terms of the Mozilla Public'
        },
        src: [
          '*.js',
          '{bans/,bin/,scripts/,test/}*'
        ]
      },
      tests: {
        options: {
          pattern: 'Any copyright is dedicated to the Public Domain.'
        },
        src: [
          'test/{remote,local}/*.js'
        ]
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      app: [
        '{,bans/,bin/,scripts/,test/}*.js'
      ]
    }
  })

  grunt.registerTask('default', ['lint', 'copyright'])
  grunt.registerTask('lint', ['jshint'])
}
