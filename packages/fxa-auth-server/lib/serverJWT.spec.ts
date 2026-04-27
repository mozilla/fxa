/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mockSign = jest.fn();
const mockVerify = jest.fn();

jest.mock('jsonwebtoken', () => ({
  sign: mockSign,
  verify: mockVerify,
}));

import * as serverJWT from './serverJWT';

const noop = () => {};

describe('lib/serverJWT', () => {
  beforeEach(() => {
    mockSign.mockReset().mockImplementation(noop);
    mockVerify.mockReset().mockImplementation(noop);
  });

  describe('signJWT', () => {
    it('signs the JWT', async () => {
      mockSign.mockImplementation(function (
        _claims: any,
        _key: any,
        _opts: any,
        callback: any
      ) {
        callback(null, 'j.w.t');
      });

      const jwt = await serverJWT.signJWT({ foo: 'bar' }, 'biz', 'buz', 'zoom');
      expect(jwt).toBe('j.w.t');

      expect(mockSign).toHaveBeenCalledTimes(1);
      expect(mockSign).toHaveBeenNthCalledWith(
        1,
        { foo: 'bar' },
        'zoom',
        {
          algorithm: 'HS256',
          expiresIn: 60,
          audience: 'biz',
          issuer: 'buz',
        },
        expect.any(Function)
      );
    });
  });

  describe('verifyJWT', () => {
    describe('signed with the current key', () => {
      it('returns the claims', async () => {
        mockVerify.mockImplementation(function (
          _jwt: any,
          _key: any,
          _opts: any,
          callback: any
        ) {
          callback(null, { sub: 'foo' });
        });

        const claims = await serverJWT.verifyJWT('j.w.t', 'foo', 'bar', [
          'current',
          'old',
        ]);

        expect(claims).toEqual({ sub: 'foo' });

        expect(mockVerify).toHaveBeenCalledTimes(1);
        expect(mockVerify).toHaveBeenNthCalledWith(
          1,
          'j.w.t',
          'current',
          {
            algorithms: ['HS256'],
            audience: 'foo',
            issuer: 'bar',
          },
          expect.any(Function)
        );
      });
    });

    describe('signed with an old key', () => {
      it('returns the claims', async () => {
        mockVerify.mockImplementation(function (
          _jwt: any,
          key: any,
          _opts: any,
          callback: any
        ) {
          if (key === 'current') {
            callback(new Error('invalid signature'));
          } else {
            callback(null, { sub: 'foo' });
          }
        });

        const claims = await serverJWT.verifyJWT('j.w.t', 'foo', 'bar', [
          'current',
          'old',
        ]);

        expect(claims).toEqual({ sub: 'foo' });

        expect(mockVerify).toHaveBeenCalledTimes(2);

        expect(mockVerify).toHaveBeenNthCalledWith(
          1,
          'j.w.t',
          'current',
          {
            algorithms: ['HS256'],
            audience: 'foo',
            issuer: 'bar',
          },
          expect.any(Function)
        );

        expect(mockVerify).toHaveBeenNthCalledWith(
          2,
          'j.w.t',
          'old',
          {
            algorithms: ['HS256'],
            audience: 'foo',
            issuer: 'bar',
          },
          expect.any(Function)
        );
      });
    });

    describe('no key found', () => {
      it('throws an `Invalid jwt` error', async () => {
        mockVerify.mockImplementation(function (
          _jwt: any,
          _key: any,
          _opts: any,
          callback: any
        ) {
          callback(new Error('invalid signature'));
        });

        await expect(
          serverJWT.verifyJWT('j.w.t', 'foo', 'bar', ['current', 'old'])
        ).rejects.toThrow('Invalid jwt');
      });
    });

    describe('invalid JWT', () => {
      it('re-throw the verification error', async () => {
        mockVerify.mockImplementation(function (
          _jwt: any,
          _key: any,
          _opts: any,
          callback: any
        ) {
          callback(new Error('invalid sub'));
        });

        await expect(
          serverJWT.verifyJWT('j.w.t', 'foo', 'bar', ['current', 'old'])
        ).rejects.toThrow('invalid sub');
      });
    });
  });
});
