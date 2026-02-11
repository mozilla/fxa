/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('lib/serverJWT', () => {
  describe('signJWT', () => {
    it('signs the JWT', async () => {
      const jsonwebtokenMock = {
        sign: sinon.spy(function (claims, key, opts, callback) {
          callback(null, 'j.w.t');
        }),
      };

      const serverJWT = proxyquire('../../lib/serverJWT', {
        jsonwebtoken: jsonwebtokenMock,
      });

      const jwt = await serverJWT.signJWT({ foo: 'bar' }, 'biz', 'buz', 'zoom');
      assert.equal(jwt, 'j.w.t');

      assert.isTrue(
        jsonwebtokenMock.sign.calledOnceWith({ foo: 'bar' }, 'zoom', {
          algorithm: 'HS256',
          expiresIn: 60,
          audience: 'biz',
          issuer: 'buz',
        })
      );
    });
  });

  describe('verifyJWT', () => {
    describe('signed with the current key', () => {
      it('returns the claims', async () => {
        const jsonwebtokenMock = {
          verify: sinon.spy(function (jwt, key, opts, callback) {
            callback(null, { sub: 'foo' });
          }),
        };

        const serverJWT = proxyquire('../../lib/serverJWT', {
          jsonwebtoken: jsonwebtokenMock,
        });

        const claims = await serverJWT.verifyJWT('j.w.t', 'foo', 'bar', [
          'current',
          'old',
        ]);

        assert.deepEqual(claims, { sub: 'foo' });

        assert.isTrue(
          jsonwebtokenMock.verify.calledOnceWith('j.w.t', 'current', {
            algorithms: ['HS256'],
            audience: 'foo',
            issuer: 'bar',
          })
        );
      });
    });

    describe('signed with an old key', () => {
      it('returns the claims', async () => {
        const jsonwebtokenMock = {
          verify: sinon.spy(function (jwt, key, opts, callback) {
            if (key === 'current') {
              callback(new Error('invalid signature'));
            } else {
              callback(null, { sub: 'foo' });
            }
          }),
        };

        const serverJWT = proxyquire('../../lib/serverJWT', {
          jsonwebtoken: jsonwebtokenMock,
        });

        const claims = await serverJWT.verifyJWT('j.w.t', 'foo', 'bar', [
          'current',
          'old',
        ]);

        assert.deepEqual(claims, { sub: 'foo' });

        assert.isTrue(jsonwebtokenMock.verify.calledTwice);

        let args = jsonwebtokenMock.verify.args[0];
        assert.equal(args[0], 'j.w.t');
        assert.equal(args[1], 'current');
        assert.deepEqual(args[2], {
          algorithms: ['HS256'],
          audience: 'foo',
          issuer: 'bar',
        });

        args = jsonwebtokenMock.verify.args[1];
        assert.equal(args[0], 'j.w.t');
        assert.equal(args[1], 'old');
        assert.deepEqual(args[2], {
          algorithms: ['HS256'],
          audience: 'foo',
          issuer: 'bar',
        });
      });
    });

    describe('no key found', () => {
      it('throws an `Invalid jwt` error', async () => {
        const jsonwebtokenMock = {
          verify: sinon.spy(function (jwt, key, opts, callback) {
            callback(new Error('invalid signature'));
          }),
        };

        const serverJWT = proxyquire('../../lib/serverJWT', {
          jsonwebtoken: jsonwebtokenMock,
        });

        try {
          await serverJWT.verifyJWT('j.w.t', 'foo', 'bar', ['current', 'old']);
          assert.fail('should have thrown');
        } catch (err) {
          assert.equal(err.message, 'Invalid jwt');
        }
      });
    });

    describe('invalid JWT', () => {
      it('re-throw the verification error', async () => {
        const jsonwebtokenMock = {
          verify: sinon.spy(function (jwt, key, opts, callback) {
            callback(new Error('invalid sub'));
          }),
        };

        const serverJWT = proxyquire('../../lib/serverJWT', {
          jsonwebtoken: jsonwebtokenMock,
        });

        try {
          await serverJWT.verifyJWT('j.w.t', 'foo', 'bar', ['current', 'old']);
          assert.fail('should have thrown');
        } catch (err) {
          assert.equal(err.message, 'invalid sub');
        }
      });
    });
  });
});
