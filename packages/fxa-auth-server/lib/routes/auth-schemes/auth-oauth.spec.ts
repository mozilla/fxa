/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Migrated from test/local/routes/auth-schemes/auth-oauth.js (Mocha → Jest).
 * Replaced proxyquire with jest.mock for the single mocked dependency.
 */

const mockTokenModule: any = { verify: jest.fn() };
jest.mock('../../oauth/token', () => mockTokenModule);

import { AppError, OauthError as OauthAppError } from '@fxa/accounts/errors';

const ScopeSet = require('fxa-shared').oauth.scopes;
const authOauth = require('./auth-oauth');

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
  it('exports auth configuration', () => {
    expect(authOauth.AUTH_SCHEME).toBe('fxa-oauth');
    expect(authOauth.strategy).toBeTruthy();
  });

  describe('authenticate', () => {
    describe('when a Bearer token is not provided', () => {
      it('throws an AppError of type unauthorized', async () => {
        try {
          await authOauth.strategy().authenticate({ headers: {} });
          throw new Error('Should have thrown');
        } catch (err: any) {
          expect(err).toBeInstanceOf(AppError);
          expect(err.output.statusCode).toBe(401);
          expect(err.output.payload.code).toBe(401);
          expect(err.output.payload.errno).toBe(110);
          expect(err.output.payload.error).toBe('Unauthorized');
          expect(err.output.payload.message).toBe('Unauthorized for route');
          expect(err.output.payload.detail).toBe('Bearer token not provided');
        }
      });
    });

    describe('when the Bearer token is invalid', () => {
      beforeAll(() => {
        mockTokenModule.verify = () => {
          return Promise.reject(OauthAppError.invalidToken());
        };
      });

      it('throws an AppError of type unauthorized', async () => {
        try {
          await authOauth.strategy().authenticate(mockRequest);
          throw new Error('Should have thrown');
        } catch (err: any) {
          expect(err).toBeInstanceOf(AppError);
          expect(err.output.statusCode).toBe(401);
          expect(err.output.payload.code).toBe(401);
          expect(err.output.payload.errno).toBe(110);
          expect(err.output.payload.error).toBe('Unauthorized');
          expect(err.output.payload.message).toBe('Unauthorized for route');
          expect(err.output.payload.detail).toBe('Bearer token invalid');
        }
      });
    });

    describe('when a valid Bearer token is provided', () => {
      let mockReply: any;

      beforeAll(() => {
        mockReply = function (err: any) {
          throw err;
        };

        mockTokenModule.verify = () => {
          return Promise.resolve(mockTokenInfo);
        };
      });

      it('returns successfully with the credentials from the verified token', async () => {
        const result = await new Promise<any>((resolve) => {
          mockReply.authenticated = function (result: any) {
            resolve(result);
          };
          authOauth.strategy().authenticate(mockRequest, mockReply);
        });
        expect(result.credentials.user).toBe('testuser');
      });
    });
  });
});
