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

describe('content-type tests', function () {
  var verifier = new Verifier();
  var idp = new IdP();
  var client;

  it('test servers should start', function (done) {
    idp.start(function (e) {
      verifier.start(function (e1) {
        client = new Client({ idp: idp });
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

  it('(v2 api) should fail to verify when content-type is unsupported', function (done) {
    request(
      {
        method: 'post',
        url: verifier.url(),
        headers: {
          'Content-Type': 'text/plain',
        },
      },
      function (err, r) {
        should.not.exist(err);
        r.statusCode.should.equal(415);
        (function () {
          r.body = JSON.parse(r.body);
        }.should.not.throw());
        r.body.status.should.equal('failure');
        r.body.reason.should.startWith('Unsupported Content-Type: text/plain');
        shouldReturnSecurityHeaders(r);
        done();
      }
    );
  });

  it('(v2 api) should fail to verify when content-type is not specified', function (done) {
    request(
      {
        method: 'post',
        url: verifier.url(),
        headers: {},
      },
      function (err, r) {
        should.not.exist(err);
        r.statusCode.should.equal(415);
        (function () {
          r.body = JSON.parse(r.body);
        }.should.not.throw());
        r.body.status.should.equal('failure');
        r.body.reason.should.startWith('Unsupported Content-Type: none');
        shouldReturnSecurityHeaders(r);
        done();
      }
    );
  });

  it('(v1 api) should fail to verify when content-type is unsupported', function (done) {
    request(
      {
        method: 'post',
        url: verifier.v1url(),
        headers: {
          'Content-Type': 'text/plain',
        },
      },
      function (err, r) {
        should.not.exist(err);
        r.statusCode.should.equal(415);
        (function () {
          r.body = JSON.parse(r.body);
        }.should.not.throw());
        r.body.status.should.equal('failure');
        r.body.reason.should.startWith('Unsupported Content-Type: text/plain');
        shouldReturnSecurityHeaders(r);
        done();
      }
    );
  });

  it('(v1 api) should fail to verify when content-type is not specified', function (done) {
    request(
      {
        method: 'post',
        url: verifier.v1url(),
        headers: {},
      },
      function (err, r) {
        should.not.exist(err);
        r.statusCode.should.equal(415);
        (function () {
          r.body = JSON.parse(r.body);
        }.should.not.throw());
        r.body.status.should.equal('failure');
        r.body.reason.should.startWith('Unsupported Content-Type: none');
        shouldReturnSecurityHeaders(r);
        done();
      }
    );
  });

  it("(v2 api) shouldn't get confused when extended content-types are used", function (done) {
    request(
      {
        method: 'post',
        url: verifier.url(),
        headers: {
          'Content-Type': 'application/json; charset: utf-8',
        },
        body: JSON.stringify({
          assertion: assertion,
        }),
      },
      function (err, r) {
        should.not.exist(err);
        r.statusCode.should.equal(400);
        (function () {
          r.body = JSON.parse(r.body);
        }.should.not.throw());
        r.body.status.should.equal('failure');
        shouldReturnSecurityHeaders(r);
        done();
      }
    );
  });

  it("(v1 api) shouldn't get confused when extended content-types are used", function (done) {
    request(
      {
        method: 'post',
        url: verifier.v1url(),
        headers: {
          'Content-Type': 'application/json; charset: utf-8',
        },
        body: JSON.stringify({
          assertion: assertion,
        }),
      },
      function (err, r) {
        should.not.exist(err);
        r.statusCode.should.equal(400);
        (function () {
          r.body = JSON.parse(r.body);
        }.should.not.throw());
        r.body.status.should.equal('failure');
        shouldReturnSecurityHeaders(r);
        done();
      }
    );
  });

  it("(v2 api) shouldn't support x-www-form-urlencoded", function (done) {
    request(
      {
        method: 'post',
        url: verifier.url(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: require('querystring').stringify({
          assertion: assertion,
        }),
      },
      function (err, r) {
        should.not.exist(err);
        r.statusCode.should.equal(415);
        (function () {
          r.body = JSON.parse(r.body);
        }.should.not.throw());
        r.body.status.should.equal('failure');
        r.body.reason.should.startWith('Unsupported Content-Type');
        shouldReturnSecurityHeaders(r);
        done();
      }
    );
  });

  it('(v1 api) should support x-www-form-urlencoded', function (done) {
    request(
      {
        method: 'post',
        url: verifier.v1url(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: require('querystring').stringify({
          assertion: assertion,
        }),
      },
      function (err, r) {
        should.not.exist(err);
        r.statusCode.should.equal(400);
        (function () {
          r.body = JSON.parse(r.body);
        }.should.not.throw());
        r.body.status.should.equal('failure');
        r.body.reason.should.startWith('missing audience');
        shouldReturnSecurityHeaders(r);
        done();
      }
    );
  });

  it('test servers should stop', function (done) {
    verifier.stop(done);
  });
});
