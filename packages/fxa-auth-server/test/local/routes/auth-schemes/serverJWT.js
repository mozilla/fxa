/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const error = require('../../../../lib/error');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('lib/routes/auth-schemes/serverJWT', () => {
  describe('not a JWT', () => {
    it('returns an invalidToken error', async () => {
      const verifyMock = sinon.spy(() =>
        Promise.reject(new Error('should not be called'))
      );

      const scheme = proxyquire(
        '../../../../lib/routes/auth-schemes/serverJWT',
        {
          '../../serverJWT': {
            verifyJWT: verifyMock,
          },
        }
      )('audience', 'issuer', ['current'], error)();

      try {
        await scheme.authenticate(
          {
            headers: {
              authorization: 'not-a-jwt',
            },
          },
          {
            authenticated: (arg) => arg,
          }
        );
        assert.fail('this should have thrown');
      } catch (err) {
        assert.equal(
          err.message,
          'Invalid authentication token in request signature'
        );
      }

      assert.isFalse(verifyMock.called);
    });
  });

  describe('invalid JWT', () => {
    it('returns an invalidToken error', async () => {
      const verifyMock = sinon.spy(() => Promise.reject(new Error('invalid')));

      const scheme = proxyquire(
        '../../../../lib/routes/auth-schemes/serverJWT',
        {
          '../../serverJWT': {
            verifyJWT: verifyMock,
          },
        }
      )('audience', 'issuer', ['current'], error)();

      try {
        await scheme.authenticate(
          {
            headers: {
              authorization: 'OAuthJWT j.w.t',
            },
          },
          {
            authenticated: (arg) => arg,
          }
        );
        assert.fail('this should have thrown');
      } catch (err) {
        assert.equal(
          err.message,
          'Invalid authentication token in request signature'
        );
      }
      assert.isTrue(
        verifyMock.calledOnceWith('j.w.t', 'audience', 'issuer', ['current'])
      );
    });
  });

  describe('valid JWT', () => {
    it('calls authenticated with the expected param', async () => {
      const verifyMock = sinon.spy(() => {
        return Promise.resolve({
          client_id: 'foo',
          scope: 'scope1 scope2',
          sub: 'bar',
        });
      });

      const scheme = proxyquire(
        '../../../../lib/routes/auth-schemes/serverJWT',
        {
          '../../serverJWT': {
            verifyJWT: verifyMock,
          },
        }
      )('audience', 'issuer', ['current'], error)();

      const result = await scheme.authenticate(
        {
          headers: {
            authorization: 'OAuthJWT j.w.t',
          },
        },
        {
          authenticated: (arg) => arg,
        }
      );

      assert.deepEqual(result, {
        credentials: {
          client_id: 'foo',
          scope: ['scope1', 'scope2'],
          user: 'bar',
        },
      });
      assert.isTrue(
        verifyMock.calledOnceWith('j.w.t', 'audience', 'issuer', ['current'])
      );
    });
  });
});
