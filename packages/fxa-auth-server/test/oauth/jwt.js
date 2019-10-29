/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const jsonwebtoken = require('jsonwebtoken');
const JWT = require('../../lib/oauth/jwt');

describe('lib/jwt', () => {
  describe('sign', () => {
    it('signs the claims, passes on options', async () => {
      const jwt = await JWT.sign(
        {
          jti: 'foo',
        },
        {
          header: {
            typ: 'custom jwt',
          },
        }
      );

      const decoded = jsonwebtoken.decode(jwt, { json: true, complete: true });

      assert.strictEqual(decoded.header.typ, 'custom jwt');
      assert.strictEqual(decoded.payload.jti, 'foo');
    });

    describe('verify', () => {
      it('fails if JWT is invalid', async () => {
        try {
          await JWT.verify('invalid token');
          assert.fail();
        } catch (err) {
          assert.equal(err.message, 'jwt malformed');
        }
      });

      it('fails if kid is invalid', async () => {
        const JWT = proxyquire('../../lib/oauth/jwt', {
          './keys': {
            publicPEM() {
              throw new Error('PEM not found');
            },
          },
        });

        const jwt = await JWT.sign({
          foo: 'bar',
        });

        try {
          await JWT.verify(jwt);
          assert.fail();
        } catch (err) {
          assert.equal(
            err.message,
            'error in secret or public key callback: Invalid kid'
          );
        }
      });

      it('fails if signature does not match', async () => {
        const jwt = await JWT.sign({
          foo: 'bar',
        });

        try {
          await JWT.verify(jwt + '1');
          assert.fail();
        } catch (err) {
          assert.equal(err.message, 'invalid signature');
        }
      });

      it('fails if algorithm does not match', async () => {
        const jwt = await JWT.sign({
          foo: 'bar',
        });

        try {
          await JWT.verify(jwt, { algorithms: ['HS256'] });
          assert.fail();
        } catch (err) {
          assert.equal(err.message, 'invalid algorithm');
        }
      });

      it('fails if expired', async () => {
        const jwt = await JWT.sign({
          exp: Math.floor((Date.now() - 2000) / 1000),
          foo: 'bar',
        });

        try {
          await JWT.verify(jwt);
          assert.fail();
        } catch (err) {
          assert.equal(err.message, 'jwt expired');
        }
      });

      it('fails if invalid issuer', async () => {
        const jwt = await JWT.sign({
          iss: 'another issuer',
          foo: 'bar',
        });

        try {
          await JWT.verify(jwt, { issuer: 'custom issuer' });
          assert.fail();
        } catch (err) {
          assert.equal(
            err.message,
            'jwt issuer invalid. expected: custom issuer'
          );
        }
      });

      it('fails if header `typ` is not expected', async () => {
        const jwt = await JWT.sign(
          {
            foo: 'bar',
          },
          {
            header: {
              typ: 'JWT',
            },
          }
        );

        try {
          await JWT.verify(jwt, { typ: 'custom JWT' });
          assert.fail();
        } catch (err) {
          assert.equal(
            err.message,
            'error in secret or public key callback: Invalid typ'
          );
        }
      });

      it('succeeds if valid', async () => {
        const jwt = await JWT.sign(
          {
            foo: 'bar',
          },
          {
            header: {
              typ: 'custom JWT',
            },
          }
        );

        const verifiedPayload = await JWT.verify(jwt, {
          typ: 'custom JWT',
        });
        assert.strictEqual(verifiedPayload.foo, 'bar');
      });
    });
  });
});
