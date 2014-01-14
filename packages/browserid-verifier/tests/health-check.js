/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe,it,require */

var
Verifier = require('./lib/verifier.js'),
should = require('should'),
request = require('request');

describe('health check', function() {
  var verifier = new Verifier();

  it('test server should start', function(done) {
    verifier.start(done);
  });

  it('health check should return OK', function(done) {
    request({
      url: verifier.baseurl() + '/status',
    }, function(err, r) {
      (r.statusCode).should.equal(200);
      (r.body).should.equal('OK');
      done(err);
    });
  });

  it('test server should stop', function(done) {
    verifier.stop(done);
  });
});
