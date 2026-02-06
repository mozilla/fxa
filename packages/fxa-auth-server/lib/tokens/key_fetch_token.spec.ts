/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export {};

const crypto = require('crypto');
const log = { trace() {}, error() {} };

const tokens = require('./index')(log);
const KeyFetchToken = tokens.KeyFetchToken;

const ACCOUNT = {
  uid: 'xxx',
  kA: Buffer.from(
    '0000000000000000000000000000000000000000000000000000000000000000',
    'hex'
  ).toString('hex'),
  wrapKb: Buffer.from(
    '0000000000000000000000000000000000000000000000000000000000000000',
    'hex'
  ).toString('hex'),
  emailVerified: true,
};

interface KeyFetchTokenLike {
  data: string;
  id: string;
  authKey: string;
  bundleKey: string;
  uid: string;
  kA: string;
  wrapKb: string;
  emailVerified: boolean;
  bundleKeys(kA: string | Buffer, wrapKb: string | Buffer): Promise<string>;
  unbundleKeys(bundle: string): Promise<{ kA: string; wrapKb: string }>;
}

describe('KeyFetchToken', () => {
  it('should re-create from tokenData', () => {
    let token: KeyFetchTokenLike | null = null;
    return KeyFetchToken.create(ACCOUNT)
      .then((x: KeyFetchTokenLike) => {
        token = x;
      })
      .then(() => {
        return KeyFetchToken.fromHex(token!.data, ACCOUNT);
      })
      .then((token2: KeyFetchTokenLike) => {
        expect(token!.data).toEqual(token2.data);
        expect(token!.id).toEqual(token2.id);
        expect(token!.authKey).toEqual(token2.authKey);
        expect(token!.bundleKey).toEqual(token2.bundleKey);
        expect(token!.uid).toEqual(token2.uid);
        expect(token!.kA).toEqual(token2.kA);
        expect(token!.wrapKb).toEqual(token2.wrapKb);
        expect(token!.emailVerified).toBe(token2.emailVerified);
      });
  });

  it('should re-create from id', () => {
    let token: KeyFetchTokenLike | null = null;
    return KeyFetchToken.create(ACCOUNT)
      .then((x: KeyFetchTokenLike) => {
        token = x;
        return KeyFetchToken.fromId(token.id, token);
      })
      .then((x: KeyFetchTokenLike) => {
        expect(x.id).toBe(token!.id);
        expect(x.authKey).toBe(token!.authKey);
      });
  });

  it('should bundle / unbundle of keys', () => {
    let token: KeyFetchTokenLike | null = null;
    const kA = crypto.randomBytes(32).toString('hex');
    const wrapKb = crypto.randomBytes(32).toString('hex');
    return KeyFetchToken.create(ACCOUNT)
      .then((x: KeyFetchTokenLike) => {
        token = x;
        return x.bundleKeys(kA, wrapKb);
      })
      .then((b: string) => {
        return token!.unbundleKeys(b);
      })
      .then((ub: { kA: string; wrapKb: string }) => {
        expect(ub.kA).toEqual(kA);
        expect(ub.wrapKb).toEqual(wrapKb);
      });
  });

  it('should only bundle / unbundle of keys with correct token', () => {
    let token1: KeyFetchTokenLike | null = null;
    let token2: KeyFetchTokenLike | null = null;
    const kA = crypto.randomBytes(32).toString('hex');
    const wrapKb = crypto.randomBytes(32).toString('hex');
    return KeyFetchToken.create(ACCOUNT)
      .then((x: KeyFetchTokenLike) => {
        token1 = x;
        return KeyFetchToken.create(ACCOUNT);
      })
      .then((x: KeyFetchTokenLike) => {
        token2 = x;
        return token1!.bundleKeys(kA, wrapKb);
      })
      .then((b: string) => {
        return token2!.unbundleKeys(b);
      })
      .then(
        () => {
          throw new Error('was able to unbundle using wrong token');
        },
        (err: { errno: number }) => {
          expect(err.errno).toBe(109);
        }
      );
  });

  it('should have key derivations that are test-vector compliant', () => {
    let token: KeyFetchTokenLike | null = null;
    const tokenData =
      '808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f';
    return KeyFetchToken.fromHex(tokenData, ACCOUNT)
      .then((x: KeyFetchTokenLike) => {
        token = x;
        expect(token.data).toBe(tokenData);
        expect(token.id).toBe(
          '3d0a7c02a15a62a2882f76e39b6494b500c022a8816e048625a495718998ba60'
        );
        expect(token.authKey).toBe(
          '87b8937f61d38d0e29cd2d5600b3f4da0aa48ac41de36a0efe84bb4a9872ceb7'
        );
        expect(token.bundleKey).toBe(
          '14f338a9e8c6324d9e102d4e6ee83b209796d5c74bb734a410e729e014a4a546'
        );
      })
      .then(() => {
        const kA = Buffer.from(
          '202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f',
          'hex'
        );
        const wrapKb = Buffer.from(
          '404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f',
          'hex'
        );
        return token!.bundleKeys(kA, wrapKb);
      })
      .then((bundle: string) => {
        expect(bundle).toBe(
          'ee5c58845c7c9412b11bbd20920c2fddd83c33c9cd2c2de2' +
            'd66b222613364636c2c0f8cfbb7c630472c0bd88451342c6' +
            'c05b14ce342c5ad46ad89e84464c993c3927d30230157d08' +
            '17a077eef4b20d976f7a97363faf3f064c003ada7d01aa70'
        );
      });
  });
});
