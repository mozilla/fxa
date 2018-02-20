/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe,it,require */

const EXPECT_COVERAGE = process.env.CIRCLECI ? 92 : 95;
const COVERAGE_FILE = process.env.CIRCLECI ? '/dev/null' : 'coverage.html';

if (!process.env.NO_COVERAGE) {
  var should = require('should');
  var ass = require('ass');
  var fs = require('fs');

  describe('code coverage', function() {
    it('tests should exceed ' + EXPECT_COVERAGE + '% coverage', function(done) {
      ass.report('json', function(err, r) {
        should.not.exist(err);
        (r.percent).should.be.aboveOrEqual(EXPECT_COVERAGE);
        done();
      });
    });

    it(COVERAGE_FILE + ' should be written', function(done) {
      ass.report('html', function(err, html) {
        should.not.exist(err);
        fs.writeFileSync(COVERAGE_FILE, html);
        done();
      });
    });
  });
}
