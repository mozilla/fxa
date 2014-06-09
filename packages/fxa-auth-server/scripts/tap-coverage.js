#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

if (!process.env.NO_COVERAGE) {
  var ass = require('ass').enable( {
    // exclude files in /test/ from code coverage
    exclude: [ '/test' ]
  })
}

var path = require('path'),
  spawn = require('child_process').spawn,
  fs = require('fs')

var p = spawn(path.join(path.dirname(__dirname), 'node_modules', '.bin', 'tap'),
              process.argv.slice(2), { stdio: 'inherit' })

p.on('close', function(code) {
  if (!process.env.NO_COVERAGE) {
    ass.report('json', function(err, r) {
      console.log("code coverage:", r.percent + "%")
      console.log("generating coverage.html...")
      var start = new Date()
      ass.report('html', function(err, html) {
        fs.writeFileSync(path.join(path.dirname(__dirname), 'coverage.html'),
                         html)
        console.log("- complete in " +
                             ((new Date() - start) / 1000.0).toFixed(1) + "s")
        process.exit(code)
      })
    })
  } else {
    process.exit(code)
  }
})
