#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A tiny wrapper around lib/server.js that supports collecting and merging
// code-coverage data when tests are constructed in such a way that the verifier
// server is started once per test

// serialize code coverage stats
function jsonify(jscoverage) {
  var a = [];
  Object.keys(jscoverage).forEach(function(file) {
    var o = {
      file: file,
      source: jscoverage[file].source,
      hits: [ ]
    }
    for (var i = 0; i < o.source.length; i++) {
      o.hits.push(jscoverage[file][i]);
    }
    a.push(o);
  });
  return JSON.stringify(a, null, "  ");
}

if (!process.env.REPORT_COVERAGE_DIR) {
  // when we're not collecting coverage data, the server is run directly
  require('./lib/server.js');
} else {
  // collecting coverage data will cause on-the-fly instrumentation and
  // serialization of coverage stats at process exit to the temporary
  // directory specified in the environment
  var blanket = require('blanket')({ pattern: 'browserid-verifier/lib' });
  var path = require('path'),
      util = require('util'),
      fs   = require('fs');

  process.on('exit', function() {
    var json = jsonify(global._$jscoverage);
    // now write synchronously (we're at exit, after al)
    fs.writeFileSync(path.join(process.env.REPORT_COVERAGE_DIR,
                               util.format("%d.json", process.pid)),
                     json);
  });

  require('./lib/server.js');
}
