/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import hkdf from 'lib/crypto/hkdf';

// test vectors a1-a3 from RFC5869 - https://tools.ietf.org/html/rfc5869#appendix-A.1
/* eslint-disable max-len, sorting/sort-object-props */
const TEST_VECTORS = {
  a1: {
    ikm: Buffer.from('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b', 'hex'),
    info: Buffer.from('f0f1f2f3f4f5f6f7f8f9', 'hex'),
    length: 42,
    output:
      '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865',
    salt: Buffer.from('000102030405060708090a0b0c', 'hex'),
  },
  a2: {
    ikm: Buffer.from(
      '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f',
      'hex'
    ),
    info: Buffer.from(
      'b0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff',
      'hex'
    ),
    length: 82,
    output:
      'b11e398dc80327a1c8e7f78c596a49344f012eda2d4efad8a050cc4c19afa97c59045a99cac7827271cb41c65e590e09da3275600c2f09b8367793a9aca3db71cc30c58179ec3e87c14c01d5c1f3434f1d87',
    salt: Buffer.from(
      '606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeaf',
      'hex'
    ),
  },
  a3: {
    ikm: Buffer.from('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b', 'hex'),
    info: Buffer.from('', 'hex'),
    length: 42,
    output:
      '8da4e775a563c18f715f802a063c5a31b8a11f5c5ee1879ec3454e5f3c738d2d9d201395faa4b61a96c8',
    salt: Buffer.from('', 'hex'),
  },
  'a3a - no salt': {
    ikm: Buffer.from('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b', 'hex'),
    info: Buffer.from('', 'hex'),
    length: 42,
    output:
      '8da4e775a563c18f715f802a063c5a31b8a11f5c5ee1879ec3454e5f3c738d2d9d201395faa4b61a96c8',
  },
  'a3b - no info': {
    ikm: Buffer.from('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b', 'hex'),
    length: 42,
    output:
      '8da4e775a563c18f715f802a063c5a31b8a11f5c5ee1879ec3454e5f3c738d2d9d201395faa4b61a96c8',
    salt: Buffer.from('', 'hex'),
  },
  'a3c - no salt or info': {
    ikm: Buffer.from('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b', 'hex'),
    length: 42,
    output:
      '8da4e775a563c18f715f802a063c5a31b8a11f5c5ee1879ec3454e5f3c738d2d9d201395faa4b61a96c8',
  },
};
/* eslint-enable max-len, sorting/sort-object-props */

describe('lib/crypto/hkdf', () => {
  it('throws if no ikmBuffer', () => {
    const { info, length, salt } = TEST_VECTORS.a1;

    return hkdf(undefined, salt, info, length).then(assert.fail, err => {
      assert.equal(err.message, 'ikmBuffer is required');
    });
  });

  [
    'a1',
    'a2',
    'a3',
    'a3a - no salt',
    'a3b - no info',
    'a3c - no salt or info',
  ].forEach(vectorName => {
    it(`success ${vectorName}`, () => {
      const { ikm, info, length, output, salt } = TEST_VECTORS[vectorName];

      return hkdf(ikm, salt, info, length).then(result => {
        assert.equal(result.length, length);
        assert.equal(result.toString('hex'), output);
      });
    });
  });
});
