/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe,it,before,after */

var IdP = require('browserid-local-verify/testing').IdP,
  Client = require('browserid-local-verify/testing').Client,
  Verifier = require('./lib/verifier.js'),
  should = require('should'),
  shouldReturnSecurityHeaders = require('./lib/should-return-security-headers.js'),
  request = require('request');

describe('audience tests', function () {
  var verifier = new Verifier({ testServiceFailure: true });
  var idp = new IdP();
  var client;

  before(async () => {
    await new Promise((resolve) => idp.start(resolve));
    await new Promise((resolve) => verifier.start(resolve));
    client = new Client({ idp: idp });
  });

  after(async () => {
    await new Promise((resolve) => verifier.stop(resolve));
    await new Promise((resolve) => idp.stop(resolve));
  });

  var assertion;

  it('test assertion should be created', function (done) {
    client.assertion({ audience: 'http://example.com' }, function (err, ass) {
      assertion = ass;
      done(err);
    });
  });

  it('(v1 api) should return a 503 on service failure', function (done) {
    request(
      {
        method: 'post',
        url: verifier.v1url(),
        json: true,
        body: {
          assertion: assertion,
          audience: 'http://example.com',
        },
      },
      function (err, r) {
        should.not.exist(err);
        (503).should.equal(r.statusCode);
        'failure'.should.equal(r.body.status);
        shouldReturnSecurityHeaders(r);
        done();
      }
    );
  });

  it('(v2 api) should return a 503 on service failure', function (done) {
    request(
      {
        method: 'post',
        url: verifier.url(),
        json: true,
        body: {
          assertion: assertion,
          audience: 'http://example.com',
        },
      },
      function (err, r) {
        should.not.exist(err);
        (503).should.equal(r.statusCode);
        'failure'.should.equal(r.body.status);
        shouldReturnSecurityHeaders(r);
        done();
      }
    );
  });
});
