/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe,it,require */

var
IdP = require('browserid-local-verify/testing').IdP,
Client = require('browserid-local-verify/testing').Client,
Verifier = require('./lib/verifier.js'),
should = require('should'),
request = require('request');

describe('basic verifier test', function() {
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

  it('should verify an assertion', function(done) {
    var client = new Client({ idp: idp });

    client.assertion({ audience: 'http://example.com' }, function(err, assertion) {
      should.not.exist(err);
      request({
        method: 'post',
        url: verifier.url(),
        json: true,
        body: {
          assertion: assertion,
          audience: "http://example.com"
        }
      }, function(err, r) {
        should.not.exist(err);
        (r.body.email).should.equal(client.email());
        (r.body.issuer).should.equal(idp.domain());
        (r.body.status).should.equal('okay');
        (r.body.audience).should.equal('http://example.com');
        (r.statusCode).should.equal(200);
        done();
      });
    });
  });

  it('should return 405 for GET requests', function(done) {
    request({
      method: 'get',
      url: verifier.url()
    }, function(err, r) {
      should.not.exist(err);
      (r.statusCode).should.equal(405);
      done();
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
