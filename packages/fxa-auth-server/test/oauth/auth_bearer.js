/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const mocks = require('../lib/mocks');
const proxyquire = require('proxyquire');
const AppError = require('../../lib/oauth/error');
const P = require('../../lib/promise');
const sinon = require('sinon');
const ScopeSet = require('fxa-shared/oauth/scopes');

const modulePath = '../../lib/oauth/auth_bearer';
const mockRequest = {
  headers: {
    authorization:
      'Bearer 0000000000000000000000000000000000000000000000000000000000000000',
  },
};

var dependencies = mocks.require([{ path: './token' }], modulePath, __dirname);

describe('authBearer', function () {
  var sandbox, authBearer;

  beforeEach(function () {
    sandbox = sinon.createSandbox();

    sandbox.stub(dependencies['./token'], 'verify').callsFake(function () {
      return P.resolve({
        scope: ScopeSet.fromArray(['bar:foo', 'clients:write']),
        user: 'bar',
      });
    });

    authBearer = proxyquire(modulePath, dependencies);
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('exports auth configuration', function () {
    assert.equal(authBearer.AUTH_SCHEME, 'authBearer');
    assert.equal(authBearer.AUTH_STRATEGY, 'authBearer');
    assert.equal(authBearer.SCOPE_CLIENT_WRITE, 'clients:write');
    assert.ok(authBearer.strategy);
  });

  describe('authenticate', function () {
    it('provides credentials if token is valid', function (done) {
      // mock hapi/lib/reply.js
      var mockReply = function (err) {
        throw err;
      };

      mockReply.authenticated = function (result) {
        assert.equal(result.credentials.user, 'bar');
        done();
      };

      authBearer.strategy().authenticate(mockRequest, mockReply);
    });

    it('errors if no Bearer in request', function () {
      return authBearer
        .strategy()
        .authenticate({
          headers: {},
        })
        .then(assert.fail, (err) => {
          assert.equal(err.output.payload.detail, 'Bearer token not provided');
        });
    });

    it('errors if invalid token', function () {
      sandbox.restore();
      sandbox = sinon.createSandbox();

      sandbox.stub(dependencies['./token'], 'verify').callsFake(function () {
        return P.reject(AppError.invalidToken());
      });

      authBearer = proxyquire(modulePath, dependencies);
      return authBearer
        .strategy()
        .authenticate(mockRequest)
        .then(assert.fail, (err) => {
          assert.equal(err.output.payload.detail, 'Bearer token invalid');
        });
    });

    it('errors if illegal token', function () {
      authBearer = proxyquire(modulePath, dependencies);
      authBearer
        .strategy()
        .authenticate({
          headers: {
            authorization: 'Bearer foo',
          },
        })
        .then(assert.fail, (err) => {
          assert.equal(err.output.payload.detail, 'Illegal Bearer token');
        });
    });
  });
});
