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

describe('unverified email', function() {
  var fallback = new IdP();
  var verifier = new Verifier();
  var client;

  it('test idps should start up', function(done) {
    fallback.start(function(e1) {
      verifier.setFallback(fallback);
      verifier.start(function(e2) {
        done(e1 || e2);
      });
    });
  });

  it('(v1) assertion with unverified email address should fail to verify', function(done) {
    client = new Client({
      idp: fallback,
      principal: { 'unverified-email': 'bob@example.com' },
    });
    // clear email
    client.email(null);
    client.assertion({ audience: 'http://example.com' }, function(
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
          },
        },
        function(err, r) {
          should.not.exist(err);
          r.statusCode.should.equal(200);
          r.body.status.should.equal('failure');
          r.body.reason.should.startWith('untrusted assertion');
          shouldReturnSecurityHeaders(r);
          done();
        }
      );
    });
  });

  it('(v1) assertion with unverified email address and forceIssuer should verify', function(done) {
    client = new Client({
      idp: fallback,
      principal: { 'unverified-email': 'bob@example.com' },
    });
    client.assertion({ audience: 'http://example.com' }, function(
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
            experimental_forceIssuer: fallback.domain(),
          },
        },
        function(err, r) {
          should.not.exist(err);
          r.statusCode.should.equal(200);
          r.body.status.should.equal('okay');
          r.body.idpClaims.should.be.type('object');
          r.body.idpClaims['unverified-email'].should.equal('bob@example.com');
          r.body.should.not.have.property('unverified-email');
          shouldReturnSecurityHeaders(r);
          done();
        }
      );
    });
  });

  it('(v1) allowUnverified causes extraction of unverified email addresses', function(done) {
    client = new Client({
      idp: fallback,
      principal: { 'unverified-email': 'bob@example.com' },
    });

    client.assertion({ audience: 'http://example.com' }, function(
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
            experimental_allowUnverified: true,
          },
        },
        function(err, r) {
          should.not.exist(err);
          r.statusCode.should.equal(200);
          r.body.status.should.equal('okay');
          r.body.idpClaims.should.be.type('object');
          r.body.idpClaims['unverified-email'].should.equal('bob@example.com');
          r.body.should.have.property('unverified-email');
          shouldReturnSecurityHeaders(r);
          done();
        }
      );
    });
  });

  it('test idp should shut down', function(done) {
    fallback.stop(function(e1) {
      verifier.stop(function(e2) {
        done(e1 || e2);
      });
    });
  });
});
