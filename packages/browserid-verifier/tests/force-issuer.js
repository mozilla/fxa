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

describe('force issuer', function () {
  var idp = new IdP();
  var fallback = new IdP();
  var client;
  var verifier = new Verifier();

  it('test idps should start up', function (done) {
    idp.start(function (e) {
      fallback.start(function (e1) {
        verifier.setFallback(idp);
        verifier.start(function (e2) {
          done(e || e1 || e2);
        });
      });
    });
  });

  it('assertion by fallback when primary support is present should fail', function (done) {
    // user has an email from idp, but fallback will be used for certificate
    client = new Client({
      idp: fallback,
      email: 'user@' + idp.domain(),
    });

    client.assertion({ audience: 'http://example.com' }, function (
      err,
      assertion
    ) {
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
          r.statusCode.should.equal(200);
          r.body.status.should.equal('failure');
          r.body.reason.should.startWith('untrusted issuer');
          shouldReturnSecurityHeaders(r);
          done();
        }
      );
    });
  });

  it('(v1) forceIssuer should over-ride authority discovery', function (done) {
    // user has an email from idp, but fallback will be used for certificate
    client = new Client({
      idp: fallback,
      email: 'user@' + idp.domain(),
    });

    client.assertion({ audience: 'http://example.com' }, function (
      err,
      assertion
    ) {
      request(
        {
          method: 'post',
          url: verifier.v1url(),
          json: true,
          body: {
            assertion: assertion,
            audience: 'http://example.com',
            experimental_forceIssuer: fallback.domain(),
          },
        },
        function (err, r) {
          should.not.exist(err);
          r.statusCode.should.equal(200);
          r.body.status.should.equal('okay');
          shouldReturnSecurityHeaders(r);
          done();
        }
      );
    });
  });

  it('(v2) trustedIssuers should over-ride authority discovery', function (done) {
    // user has an email from idp, but fallback will be used for certificate
    client = new Client({
      idp: fallback,
      email: 'user@' + idp.domain(),
    });

    client.assertion({ audience: 'http://example.com' }, function (
      err,
      assertion
    ) {
      request(
        {
          method: 'post',
          url: verifier.url(),
          json: true,
          body: {
            assertion: assertion,
            audience: 'http://example.com',
            trustedIssuers: [fallback.domain()],
          },
        },
        function (err, r) {
          should.not.exist(err);
          r.statusCode.should.equal(200);
          r.body.status.should.equal('okay');
          shouldReturnSecurityHeaders(r);
          done();
        }
      );
    });
  });

  it('test idp should shut down', function (done) {
    idp.stop(function (e) {
      fallback.stop(function (e1) {
        verifier.stop(function (e2) {
          done(e || e1 || e2);
        });
      });
    });
  });
});
