/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe,it */

require('should');

var Verifier = require('./lib/verifier.js'),
  shouldReturnSecurityHeaders = require('./lib/should-return-security-headers.js'),
  request = require('request');

describe('health check', function () {
  var verifier = new Verifier();

  it('test server should start', function (done) {
    verifier.start(done);
  });

  it('health check should return OK', function (done) {
    request(
      {
        url: verifier.baseurl() + '/status',
      },
      function (err, r) {
        r.statusCode.should.equal(200);
        r.body.should.equal('OK');
        shouldReturnSecurityHeaders(r);
        done(err);
      }
    );
  });

  it('__heartbeat__ should return success', function (done) {
    request(
      {
        url: verifier.baseurl() + '/__heartbeat__',
      },
      function (err, r) {
        r.statusCode.should.equal(200);
        r.body.should.equal('{}');
        shouldReturnSecurityHeaders(r);
        done(err);
      }
    );
  });

  it('__lbheartbeat__ should return success', function (done) {
    request(
      {
        url: verifier.baseurl() + '/__lbheartbeat__',
      },
      function (err, r) {
        r.statusCode.should.equal(200);
        r.body.should.equal('{}');
        shouldReturnSecurityHeaders(r);
        done(err);
      }
    );
  });

  it('__version__ should return version info', function (done) {
    request(
      {
        url: verifier.baseurl() + '/__version__',
      },
      function (err, r) {
        r.statusCode.should.equal(200);
        var obj = JSON.parse(r.body);
        obj.version.should.match(/^[0-9.]+$/);
        obj.commit.should.match(/^[a-z0-9]{40}$/);
        obj.source.should.be.a.String();
        shouldReturnSecurityHeaders(r);
        done(err);
      }
    );
  });

  it('__version__ should return version info (cached)', function (done) {
    request(
      {
        url: verifier.baseurl() + '/__version__',
      },
      function (err, r) {
        r.statusCode.should.equal(200);
        var obj = JSON.parse(r.body);
        obj.version.should.match(/^[0-9.]+$/);
        obj.commit.should.match(/^[a-z0-9]{40}$/);
        obj.source.should.be.a.String();
        shouldReturnSecurityHeaders(r);
        done(err);
      }
    );
  });

  it('test server should stop', function (done) {
    verifier.stop(done);
  });
});
