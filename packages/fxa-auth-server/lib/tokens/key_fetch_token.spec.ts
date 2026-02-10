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
  it('should re-create from tokenData', async () => {
    const token: KeyFetchTokenLike = await KeyFetchToken.create(ACCOUNT);
    const token2: KeyFetchTokenLike = await KeyFetchToken.fromHex(token.data, ACCOUNT);
    expect(token.data).toEqual(token2.data);
    expect(token.id).toEqual(token2.id);
    expect(token.authKey).toEqual(token2.authKey);
    expect(token.bundleKey).toEqual(token2.bundleKey);
    expect(token.uid).toEqual(token2.uid);
    expect(token.kA).toEqual(token2.kA);
    expect(token.wrapKb).toEqual(token2.wrapKb);
    expect(token.emailVerified).toBe(token2.emailVerified);
  });

  it('should re-create from id', async () => {
    const token: KeyFetchTokenLike = await KeyFetchToken.create(ACCOUNT);
    const token2: KeyFetchTokenLike = await KeyFetchToken.fromId(token.id, token);
    expect(token2.id).toBe(token.id);
    expect(token2.authKey).toBe(token.authKey);
  });

  it('should bundle / unbundle of keys', async () => {
    const kA = crypto.randomBytes(32).toString('hex');
    const wrapKb = crypto.randomBytes(32).toString('hex');
    const token: KeyFetchTokenLike = await KeyFetchToken.create(ACCOUNT);
    const bundle = await token.bundleKeys(kA, wrapKb);
    const unbundled = await token.unbundleKeys(bundle);
    expect(unbundled.kA).toEqual(kA);
    expect(unbundled.wrapKb).toEqual(wrapKb);
  });

  it('should only bundle / unbundle of keys with correct token', async () => {
    const kA = crypto.randomBytes(32).toString('hex');
    const wrapKb = crypto.randomBytes(32).toString('hex');
    const token1: KeyFetchTokenLike = await KeyFetchToken.create(ACCOUNT);
    const token2: KeyFetchTokenLike = await KeyFetchToken.create(ACCOUNT);
    const bundle = await token1.bundleKeys(kA, wrapKb);
    try {
      await token2.unbundleKeys(bundle);
      throw new Error('was able to unbundle using wrong token');
    } catch (err) {
      expect((err as { errno: number }).errno).toBe(109);
    }
  });

  it('should have key derivations that are test-vector compliant', async () => {
    const tokenData =
      '808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f';
    const token: KeyFetchTokenLike = await KeyFetchToken.fromHex(tokenData, ACCOUNT);
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

    const kA = Buffer.from(
      '202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f',
      'hex'
    );
    const wrapKb = Buffer.from(
      '404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f',
      'hex'
    );
    const bundle = await token.bundleKeys(kA, wrapKb);
    expect(bundle).toBe(
      'ee5c58845c7c9412b11bbd20920c2fddd83c33c9cd2c2de2' +
        'd66b222613364636c2c0f8cfbb7c630472c0bd88451342c6' +
        'c05b14ce342c5ad46ad89e84464c993c3927d30230157d08' +
        '17a077eef4b20d976f7a97363faf3f064c003ada7d01aa70'
    );
  });
});
