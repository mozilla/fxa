#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path')
const extract = require('jsxgettext-recursive')

const pkgroot = path.dirname(__dirname)

module.exports = function (grunt) {
  'use strict'

  grunt.config('copy', {
    strings: {
      files: [{
        expand: true,
        flatten: true,
        cwd: path.join(pkgroot, 'node_modules', 'fxa-content-server-l10n', 'locale', 'templates', 'LC_MESSAGES'),
        dest: pkgroot,
        src: [
          'server.pot'
        ]
      }]
    }
  })

  grunt.registerTask('l10n-extract', 'Extract strings from templates for localization.', function () {
    var done = this.async()

    var walker = extract({
      'input-dir': path.join(pkgroot, 'lib/senders/templates'),
      'output-dir': pkgroot,
      'output': 'server.pot',
      'join-existing': true,
      'keyword': ['t'],
      parsers: {
        '.txt': 'handlebars',
        '.html': 'handlebars'
      }
    })

    walker.on('end', function () {
      var jsWalker = extract({
        'input-dir': path.join(pkgroot, 'lib/senders'),
        'output-dir': pkgroot,
        'output': 'server.pot',
        'join-existing': true,
        'keyword': ['gettext'],
        parsers: {
          '.js': 'javascript'
        }
      })

      jsWalker.on('end', function () {
        done()
      })
    })
  })

  // load local Grunt tasks

  grunt.registerTask('lint', 'Alias for eslint tasks', ['eslint'])
  grunt.registerTask('templates', 'Alias for the template task', ['nunjucks'])

  grunt.registerTask('default', [ 'templates', 'copy:strings', 'l10n-extract' ])

}
