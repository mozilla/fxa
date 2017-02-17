#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict'

  grunt.config('nunjucks', {
    options: {
      tags: {
        blockStart: '<%',
        blockEnd: '%>',
        variableStart: '<$',
        variableEnd: '$>',
        commentStart: '<#',
        commentEnd: '#>'
      },
      data: {}
    },
    render: {
      files: [
        {
          expand: true,
          cwd: 'partials/',
          src: '*.html',
          dest: 'templates/',
          ext: '.html'
        }
      ]
    }
  })

  grunt.registerTask('templates', 'Alias for the template task', ['nunjucks'])
}
