/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Wrap `publicPEM` in a jest fn delegating to the real implementation by
// default; one test below overrides it via `mockImplementationOnce`.
jest.mock('./keys', () => {
  const real = jest.requireActual('./keys');
  return {
    ...real,
    publicPEM: jest.fn((kid: string) => real.publicPEM(kid)),
  };
});

import jsonwebtoken from 'jsonwebtoken';
import * as JWT from './jwt';
import * as keys from './keys';

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

      expect(decoded.header.typ).toBe('custom jwt');
      expect(decoded.payload.jti).toBe('foo');
    });

    describe('verify', () => {
      it('fails if JWT is invalid', async () => {
        await expect(JWT.verify('invalid token')).rejects.toThrow(
          'jwt malformed'
        );
      });

      it('fails if kid is invalid', async () => {
        keys.publicPEM.mockImplementationOnce(() => {
          throw new Error('PEM not found');
        });

        const jwt = await JWT.sign({ foo: 'bar' });

        await expect(JWT.verify(jwt)).rejects.toThrow(
          'error in secret or public key callback: Invalid kid'
        );
      });

      it('fails if signature does not match', async () => {
        const jwt = await JWT.sign({ foo: 'bar' });
        await expect(JWT.verify(jwt + '1')).rejects.toThrow(
          'invalid signature'
        );
      });

      it('fails if algorithm does not match', async () => {
        const jwt = await JWT.sign({ foo: 'bar' });
        await expect(
          JWT.verify(jwt, { algorithms: ['HS256'] })
        ).rejects.toThrow('invalid algorithm');
      });

      it('fails if expired', async () => {
        const jwt = await JWT.sign({
          exp: Math.floor((Date.now() - 2000) / 1000),
          foo: 'bar',
        });
        await expect(JWT.verify(jwt)).rejects.toThrow('jwt expired');
      });

      it('passes if expired and ignoreExpiration option is true', async () => {
        const jwt = await JWT.sign({
          exp: Math.floor((Date.now() - 2000) / 1000),
          foo: 'bar',
        });

        const verifiedPayload = await JWT.verify(jwt, {
          ignoreExpiration: true,
        });
        expect(verifiedPayload.foo).toBe('bar');
      });

      it('fails if invalid issuer', async () => {
        const jwt = await JWT.sign({ iss: 'another issuer', foo: 'bar' });
        await expect(
          JWT.verify(jwt, { issuer: 'custom issuer' })
        ).rejects.toThrow('jwt issuer invalid. expected: custom issuer');
      });

      it('fails if header `typ` is not expected', async () => {
        const jwt = await JWT.sign({ foo: 'bar' }, { header: { typ: 'JWT' } });
        await expect(JWT.verify(jwt, { typ: 'custom JWT' })).rejects.toThrow(
          'error in secret or public key callback: Invalid typ'
        );
      });

      it('succeeds if valid', async () => {
        const jwt = await JWT.sign(
          { foo: 'bar' },
          { header: { typ: 'custom JWT' } }
        );
        const verifiedPayload = await JWT.verify(jwt, { typ: 'custom JWT' });
        expect(verifiedPayload.foo).toBe('bar');
      });

      it('succeeds if valid and typ matches according to comparison rules', async () => {
        const jwt = await JWT.sign(
          { foo: 'bar' },
          { header: { typ: 'cUstOm-JwT' } }
        );
        const verifiedPayload = await JWT.verify(jwt, {
          typ: 'application/custom-jwt',
        });
        expect(verifiedPayload.foo).toBe('bar');
      });
    });
  });
});
