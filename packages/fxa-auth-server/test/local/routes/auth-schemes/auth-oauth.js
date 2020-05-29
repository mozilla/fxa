/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const AppError = require('../../../../lib/error');
const OauthAppError = require('../../../../lib/oauth/error');
const P = require('../../../../lib/promise');
const ScopeSet = require('fxa-shared').oauth.scopes;

const authOauthPath = '../../../../lib/routes/auth-schemes/auth-oauth';
const mockRequest = {
  headers: {
    authorization:
      'Bearer 0000000000000000000000000000000000000000000000000000000000000000',
  },
};
const mockTokenInfo = {
  user: 'testuser',
  scope: ScopeSet.fromArray(['bar:foo', 'clients:write']),
};

describe('lib/routes/auth-schemes/auth-oauth', () => {
  let authOauth;
  const tokenStub = {};

  before(() => {
    authOauth = proxyquire(authOauthPath, { '../../oauth/token': tokenStub });
  });

  it('exports auth configuration', () => {
    assert.equal(authOauth.AUTH_SCHEME, 'fxa-oauth');
    assert.ok(authOauth.strategy);
  });

  describe('authenticate', () => {
    describe('when a Bearer token is not provided', () => {
      it('throws an AppError of type unauthorized', () => {
        return authOauth
          .strategy()
          .authenticate({
            headers: {},
          })
          .then(assert.fail, (err) => {
            assert.isTrue(err instanceof AppError);
            assert.equal(err.output.statusCode, 401);
            assert.equal(err.output.payload.code, 401);
            assert.equal(err.output.payload.errno, 110);
            assert.equal(err.output.payload.error, 'Unauthorized');
            assert.equal(err.output.payload.message, 'Unauthorized for route');
            assert.equal(
              err.output.payload.detail,
              'Bearer token not provided'
            );
          });
      });
    });

    describe('when the Bearer token is invalid', () => {
      before(() => {
        tokenStub.verify = (token) => {
          return P.reject(OauthAppError.invalidToken());
        };
      });

      it('throws an AppError of type unauthorized', () => {
        return authOauth
          .strategy()
          .authenticate(mockRequest)
          .then(assert.fail, (err) => {
            assert.isTrue(err instanceof AppError);
            assert.equal(err.output.statusCode, 401);
            assert.equal(err.output.payload.code, 401);
            assert.equal(err.output.payload.errno, 110);
            assert.equal(err.output.payload.error, 'Unauthorized');
            assert.equal(err.output.payload.message, 'Unauthorized for route');
            assert.equal(err.output.payload.detail, 'Bearer token invalid');
          });
      });
    });

    describe('when a valid Bearer token is provided', () => {
      let mockReply;
      before(() => {
        mockReply = function (err) {
          throw err;
        };

        tokenStub.verify = (token) => {
          return P.resolve(mockTokenInfo);
        };
      });

      it('returns successfully with the credentials from the verified token', (done) => {
        mockReply.authenticated = function (result) {
          assert.equal(result.credentials.user, 'testuser');
          done();
        };
        authOauth.strategy().authenticate(mockRequest, mockReply);
      });
    });
  });
});
