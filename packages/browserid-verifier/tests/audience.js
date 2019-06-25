/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe,it,require */

var IdP = require('browserid-local-verify/testing').IdP,
  Client = require('browserid-local-verify/testing').Client,
  Verifier = require('./lib/verifier.js'),
  should = require('should'),
  shouldReturnSecurityHeaders = require('./lib/should-return-security-headers.js'),
  request = require('request');

describe('audience tests', function() {
  var verifier = new Verifier();
  var idp = new IdP();
  var client;

  it('test servers should start', function(done) {
    idp.start(function(e) {
      verifier.start(function(e1) {
        client = new Client({ idp: idp });
        done(e || e1);
      });
    });
  });

  var assertion;

  it('test assertion should be created', function(done) {
    client.assertion({ audience: 'http://example.com' }, function(err, ass) {
      assertion = ass;
      done(err);
    });
  });

  function submitWithAudience(audience, cb) {
    request(
      {
        method: 'post',
        url: verifier.url(),
        json: true,
        body: {
          assertion: assertion,
          audience: audience,
        },
      },
      cb
    );
  }

  it('should verify with complete audience', function(done) {
    submitWithAudience('http://example.com', function(err, r) {
      should.not.exist(err);
      'okay'.should.equal(r.body.status);
      shouldReturnSecurityHeaders(r);
      done();
    });
  });

  it('should fail to verify with different domain as audience', function(done) {
    submitWithAudience('incorrect.com', function(err, r) {
      should.not.exist(err);
      r.body.status.should.equal('failure');
      r.body.reason.should.equal('audience mismatch: domain mismatch');
      shouldReturnSecurityHeaders(r);
      done(err);
    });
  });

  it('should fail to verify with different port', function(done) {
    submitWithAudience('http://example.com:8080', function(err, r) {
      should.not.exist(err);
      r.body.status.should.equal('failure');
      r.body.reason.should.equal('audience mismatch: port mismatch');
      shouldReturnSecurityHeaders(r);
      done(err);
    });
  });

  it('should fail to verify with incorrect scheme', function(done) {
    submitWithAudience('https://example.com', function(err, r) {
      should.not.exist(err);
      r.body.status.should.equal('failure');
      r.body.reason.should.equal('audience mismatch: scheme mismatch');
      shouldReturnSecurityHeaders(r);
      done(err);
    });
  });

  it('should fail to verify if audience is missing', function(done) {
    submitWithAudience(undefined, function(err, r) {
      should.not.exist(err);
      r.body.status.should.equal('failure');
      r.body.reason.should.equal('missing audience parameter');
      shouldReturnSecurityHeaders(r);
      done(err);
    });
  });

  it('test servers should stop', function(done) {
    idp.stop(function(e) {
      verifier.stop(function(e1) {
        done(e || e1);
      });
    });
  });
});
