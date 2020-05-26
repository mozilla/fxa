/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe,it */

var IdP = require('browserid-local-verify/testing').IdP,
  Client = require('browserid-local-verify/testing').Client,
  Verifier = require('./lib/verifier.js'),
  should = require('should'),
  shouldReturnSecurityHeaders = require('./lib/should-return-security-headers.js'),
  request = require('request');

describe('audience tests', function () {
  var verifier = new Verifier();
  var idp = new IdP();
  var client;

  it('test servers should start', function (done) {
    idp.start(function (e) {
      verifier.start(function (e1) {
        client = new Client({
          idp: idp,
          // note, using an email not rooted at the idp.  trustIssuer is the only
          // way this can work
          email: 'user@example.com',
        });
        done(e || e1);
      });
    });
  });

  var assertion;

  it('test assertion should be created', function (done) {
    client.assertion({ audience: 'http://example.com' }, function (err, ass) {
      assertion = ass;
      done(err);
    });
  });

  function submitWithTrustedIssuers(ti, cb) {
    request(
      {
        method: 'post',
        url: verifier.url(),
        json: true,
        body: {
          assertion: assertion,
          audience: 'http://example.com',
          trustedIssuers: ti,
        },
      },
      cb
    );
  }

  it('should verify when trusted issuers is specified', function (done) {
    submitWithTrustedIssuers([idp.domain()], function (err, r) {
      should.not.exist(err);
      'okay'.should.equal(r.body.status);
      shouldReturnSecurityHeaders(r);
      done();
    });
  });

  it('should fail when trusted issuers is not specified', function (done) {
    submitWithTrustedIssuers(undefined, function (err, r) {
      should.not.exist(err);
      'failure'.should.equal(r.body.status);
      shouldReturnSecurityHeaders(r);
      done();
    });
  });

  it('should fail when trusted issuers is not an array', function (done) {
    submitWithTrustedIssuers(idp.domain(), function (err, r) {
      should.not.exist(err);
      'failure'.should.equal(r.body.status);
      'trusted issuers must be an array'.should.equal(r.body.reason);
      shouldReturnSecurityHeaders(r);
      done();
    });
  });

  it('should fail when trusted issuers contains non-strings', function (done) {
    submitWithTrustedIssuers([idp.domain(), ['example.com']], function (
      err,
      r
    ) {
      should.not.exist(err);
      'failure'.should.equal(r.body.status);
      'trusted issuers must be an array of strings'.should.equal(r.body.reason);
      shouldReturnSecurityHeaders(r);
      done();
    });
  });

  it('test servers should stop', function (done) {
    idp.stop(function (e) {
      verifier.stop(function (e1) {
        done(e || e1);
      });
    });
  });
});
