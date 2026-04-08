/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';

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
      const signSpy = sinon.spy(function (
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

      sinon.assert.calledOnce(signSpy);
      sinon.assert.calledWith(signSpy, { foo: 'bar' }, 'zoom', {
        algorithm: 'HS256',
        expiresIn: 60,
        audience: 'biz',
        issuer: 'buz',
      });
    });
  });

  describe('verifyJWT', () => {
    describe('signed with the current key', () => {
      it('returns the claims', async () => {
        const verifySpy = sinon.spy(function (
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

        sinon.assert.calledOnce(verifySpy);
        sinon.assert.calledWith(verifySpy, 'j.w.t', 'current', {
          algorithms: ['HS256'],
          audience: 'foo',
          issuer: 'bar',
        });
      });
    });

    describe('signed with an old key', () => {
      it('returns the claims', async () => {
        const verifySpy = sinon.spy(function (
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

        expect(verifySpy.calledTwice).toBe(true);

        let args = verifySpy.args[0];
        expect(args[0]).toBe('j.w.t');
        expect(args[1]).toBe('current');
        expect(args[2]).toEqual({
          algorithms: ['HS256'],
          audience: 'foo',
          issuer: 'bar',
        });

        args = verifySpy.args[1];
        expect(args[0]).toBe('j.w.t');
        expect(args[1]).toBe('old');
        expect(args[2]).toEqual({
          algorithms: ['HS256'],
          audience: 'foo',
          issuer: 'bar',
        });
      });
    });

    describe('no key found', () => {
      it('throws an `Invalid jwt` error', async () => {
        const verifySpy = sinon.spy(function (
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
        const verifySpy = sinon.spy(function (
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
