/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs'),
  path = require('path'),
should = require('should');

function mergeCovData(data) {
  if (!global) global = {};
  if (!global._$jscoverage) global._$jscoverage = {};
  data.forEach(function(fdata) {
    if (!global._$jscoverage[fdata.file]) {
      global._$jscoverage[fdata.file] = {};
    }
    var tgt = global._$jscoverage[fdata.file];
    if (!tgt.source) {
      tgt.source = fdata.source;
    }
    for (var i = 0; i < tgt.source.length; i++) {
      if (typeof fdata.hits[i] === 'number') {
        tgt[i] = (tgt[i] || 0) + fdata.hits[i];
      } else {
        tgt[i] = undefined;
      }
    }
  });
}

/* global describe,it */

describe('code coverage', function() {
  it ('env var to coverage data should be set', function(done) {
    should.exist(process.env.REPORT_COVERAGE_DIR);
    done();
  });

  it ('jscoverage global data should be hydrated from files', function(done) {
    fs.readdir(process.env.REPORT_COVERAGE_DIR, function(err, files) {
      files.filter(function(file) { return /\.json$/.test(file); }).forEach(function(f) {
        var data = JSON.parse(fs.readFileSync(path.join(process.env.REPORT_COVERAGE_DIR, f)));
        mergeCovData(data);
      });
      done();
    });
  });
});
