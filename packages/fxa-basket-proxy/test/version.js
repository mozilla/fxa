/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var assert = require('assert');
var request = require('supertest');

var app = require('../lib/app')();

describe('the route /', function() {
  it('should return version information', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        assert.deepEqual(Object.keys(res.body), [
          'version',
          'commit',
          'source',
        ]);
      })
      .end(done);
  });
});

describe('the route /__version__', function() {
  it('should return version information', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        assert.deepEqual(Object.keys(res.body), [
          'version',
          'commit',
          'source',
        ]);
      })
      .end(done);
  });
});
