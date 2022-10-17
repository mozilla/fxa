/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe,it,before,after */

var Verifier = require('./lib/verifier.js'),
  should = require('should'),
  shouldReturnSecurityHeaders = require('./lib/should-return-security-headers.js'),
  request = require('request');

describe('missing assertion test', function () {
  var verifier = new Verifier();

  before(async () => {
    await new Promise((resolve) => verifier.start(resolve));
  });

  after(async () => {
    await new Promise((resolve) => verifier.stop(resolve));
  });

  it('should fail to verify when assertion is missing', function (done) {
    request(
      {
        method: 'post',
        url: verifier.url(),
        json: true,
        body: {
          audience: 'http://example.com',
        },
      },
      function (err, r) {
        should.not.exist(err);
        r.statusCode.should.equal(400);
        r.body.status.should.equal('failure');
        r.body.reason.should.equal('missing assertion parameter');
        shouldReturnSecurityHeaders(r);
        done();
      }
    );
  });
});
