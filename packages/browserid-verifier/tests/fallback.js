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

describe('fallback configuration test', function() {
  var idp = new IdP();
  var verifier = new Verifier();

  it('test servers should start', function(done) {
    idp.start(function(e) {
      verifier.setFallback(idp);
      verifier.start(function(e1) {
        done(e || e1);
      });
    });
  });

  it('should verify an assertion vouched by the configured fallback', function(done) {
    var client = new Client({
      idp: idp,
      email: 'lloyd@nonidp.example.com',
    });

    client.assertion(
      {
        audience: 'http://rp.example.com',
      },
      function(err, assertion) {
        should.not.exist(err);
        request(
          {
            method: 'post',
            url: verifier.url(),
            json: true,
            body: {
              assertion: assertion,
              audience: 'http://rp.example.com',
            },
          },
          function(err, r) {
            should.not.exist(err);
            r.body.status.should.equal('okay');
            r.body.email.should.equal(client.email());
            r.body.issuer.should.equal(idp.domain());
            r.body.audience.should.equal('http://rp.example.com');
            r.statusCode.should.equal(200);
            shouldReturnSecurityHeaders(r);
            done();
          }
        );
      }
    );
  });

  it('verifier should restart with cleared fallback', function(done) {
    verifier.setFallback(null);
    verifier.stop(function(e) {
      verifier.start(function(e1) {
        done(e || e1);
      });
    });
  });

  it('should fail to verify an assertion when fallback is not configured', function(done) {
    var client = new Client({
      idp: idp,
      email: 'lloyd@nonidp.example.com',
    });

    client.assertion(
      {
        audience: 'http://rp.example.com',
      },
      function(err, assertion) {
        should.not.exist(err);
        request(
          {
            method: 'post',
            url: verifier.url(),
            json: true,
            body: {
              assertion: assertion,
              audience: 'http://rp.example.com',
            },
          },
          function(err, r) {
            should.not.exist(err);
            r.statusCode.should.equal(200);
            r.body.status.should.equal('failure');
            // XXX: better error message
            r.body.reason.should.startWith('untrusted issuer');
            shouldReturnSecurityHeaders(r);
            done();
          }
        );
      }
    );
  });

  it('test servers should stop', function(done) {
    idp.stop(function(e) {
      verifier.stop(function(e1) {
        done(e || e1);
      });
    });
  });
});
