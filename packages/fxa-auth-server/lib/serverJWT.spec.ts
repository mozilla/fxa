/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const noop = () => {};

function loadWithMock(overrides: any) {
  const mock = { sign: noop, verify: noop, ...overrides };
  jest.resetModules();
  jest.doMock('jsonwebtoken', () => mock);
  return require('./serverJWT');
}

describe('lib/serverJWT', () => {
  describe('signJWT', () => {
    it('signs the JWT', async () => {
      const signSpy = jest.fn(function (
        _claims: any,
        _key: any,
        _opts: any,
        callback: any
      ) {
        callback(null, 'j.w.t');
      });

      const serverJWT = loadWithMock({ sign: signSpy });

      const jwt = await serverJWT.signJWT({ foo: 'bar' }, 'biz', 'buz', 'zoom');
      expect(jwt).toBe('j.w.t');

      expect(signSpy).toHaveBeenCalledTimes(1);
      expect(signSpy).toHaveBeenNthCalledWith(
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
        const verifySpy = jest.fn(function (
          _jwt: any,
          _key: any,
          _opts: any,
          callback: any
        ) {
          callback(null, { sub: 'foo' });
        });

        const serverJWT = loadWithMock({ verify: verifySpy });

        const claims = await serverJWT.verifyJWT('j.w.t', 'foo', 'bar', [
          'current',
          'old',
        ]);

        expect(claims).toEqual({ sub: 'foo' });

        expect(verifySpy).toHaveBeenCalledTimes(1);
        expect(verifySpy).toHaveBeenNthCalledWith(
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
        const verifySpy = jest.fn(function (
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

        const serverJWT = loadWithMock({ verify: verifySpy });

        const claims = await serverJWT.verifyJWT('j.w.t', 'foo', 'bar', [
          'current',
          'old',
        ]);

        expect(claims).toEqual({ sub: 'foo' });

        expect(verifySpy).toHaveBeenCalledTimes(2);

        expect(verifySpy).toHaveBeenNthCalledWith(
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

        expect(verifySpy).toHaveBeenNthCalledWith(
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
        const verifySpy = jest.fn(function (
          _jwt: any,
          _key: any,
          _opts: any,
          callback: any
        ) {
          callback(new Error('invalid signature'));
        });

        const serverJWT = loadWithMock({ verify: verifySpy });

        await expect(
          serverJWT.verifyJWT('j.w.t', 'foo', 'bar', ['current', 'old'])
        ).rejects.toThrow('Invalid jwt');
      });
    });

    describe('invalid JWT', () => {
      it('re-throw the verification error', async () => {
        const verifySpy = jest.fn(function (
          _jwt: any,
          _key: any,
          _opts: any,
          callback: any
        ) {
          callback(new Error('invalid sub'));
        });

        const serverJWT = loadWithMock({ verify: verifySpy });

        await expect(
          serverJWT.verifyJWT('j.w.t', 'foo', 'bar', ['current', 'old'])
        ).rejects.toThrow('invalid sub');
      });
    });
  });
});
