/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global describe,it*/

const assert = require('insist');
const mocks = require('./lib/mocks');
const proxyquire = require('proxyquire');
const AppError = require('../lib/error');
const P = require('../lib/promise');
const sinon = require('sinon');
const ScopeSet = require('fxa-shared').oauth.scopes;

const modulePath = '../lib/auth_bearer';
const mockRequest = {
  headers: {
    authorization: 'Bearer 0000000000000000000000000000000000000000000000000000000000000000'
  }
};

var dependencies = mocks.require([
  { path: '../../../lib/token' }
], modulePath, __dirname);

describe('authBearer', function() {
  var sandbox, authBearer;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    sandbox.stub(dependencies['../../../lib/token'], 'verify', function() {
      return P.resolve({
        scope: ScopeSet.fromArray(['bar:foo', 'clients:write']),
        user: 'bar'
      });
    });

    authBearer = proxyquire(modulePath, dependencies);
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('exports auth configuration', function() {
    assert.equal(authBearer.AUTH_SCHEME, 'authBearer');
    assert.equal(authBearer.AUTH_STRATEGY, 'authBearer');
    assert.equal(authBearer.SCOPE_CLIENT_WRITE, 'clients:write');
    assert.ok(authBearer.strategy);
  });

  describe('authenticate', function() {
    it('provides credentials if token is valid', function(done) {
      // mock hapi/lib/reply.js
      var mockReply = function (err) {
        throw err;
      };

      mockReply.continue = function (result) {
        assert.equal(result.credentials.user, 'bar');
        done();
      };

      authBearer.strategy().authenticate(mockRequest, mockReply);
    });

    it('errors if no Bearer in request', function(done) {
      authBearer.strategy().authenticate({
        headers: {}
      }, function (err, result) {
        assert.equal(result, null);
        assert.equal(err.output.payload.detail, 'Bearer token not provided');
        done();
      });
    });

    it('errors if invalid token', function(done) {
      sandbox.restore();
      sandbox = sinon.sandbox.create();

      sandbox.stub(dependencies['../../../lib/token'], 'verify', function() {
        return P.reject(AppError.invalidToken());
      });

      authBearer = proxyquire(modulePath, dependencies);
      authBearer.strategy().authenticate(mockRequest, function (err, result) {
        assert.equal(err.output.payload.detail, 'Bearer token invalid');
        assert.equal(result, null);
        done();
      });
    });

    it('errors if illegal token', function(done) {
      authBearer = proxyquire(modulePath, dependencies);
      authBearer.strategy().authenticate({
        headers: {
          authorization: 'Bearer foo'
        }
      }, function (err, result) {
        assert.equal(err.output.payload.detail, 'Illegal Bearer token');
        assert.equal(result, null);
        done();
      });
    });

  });
});
