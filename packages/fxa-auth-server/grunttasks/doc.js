/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict'

  grunt.registerMultiTask('doc', function () {
    const done = this.async()
    const doc = require('../scripts/write-api-docs')

    doc({
      path: this.files[0].dest
    })
      .then(done, done)
  })

  grunt.config('doc', {
    api: {
      // have a src and dest set allows grunt-newer to work
      src: [
        'lib/error.js',
        'lib/routes'
      ],
      dest: 'docs/api.md'
    }
  })
}
