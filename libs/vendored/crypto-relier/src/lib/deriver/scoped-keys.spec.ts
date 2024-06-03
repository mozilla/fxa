/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { subtle } from 'crypto';

import { ScopedKeys } from './scoped-keys';

describe('ScopedKeys', function () {
  const scopedKeys = new ScopedKeys();
  const sampleKb =
    'bc3851e9e610f631df94d7883d5defd5e5f55ab520bd5a9ae33dae26575c6b1a';
  const identifier = 'https://identity.mozilla.com/apps/notes';
  const keyRotationTimestamp = 1494446722583; // GMT Wednesday, May 10, 2017 8:05:22.583 PM
  const keyRotationSecret =
    '0000000000000000000000000000000000000000000000000000000000000000';
  const uid = 'aeaa1725c7a24ff983c6295725d5fc9b';

  it('should have HKDF work', async () => {
    const key = await scopedKeys.deriveScopedKey({
      inputKey: sampleKb,
      keyRotationSecret: keyRotationSecret,
      keyRotationTimestamp: keyRotationTimestamp,
      identifier: identifier,
      uid: uid,
    });

    const importSpec = {
      name: 'AES-CTR',
    };

    expect(key.kty).toBe('oct');
    expect(key.k).toBe('b9SaftekqPfXDOEeZx8714ktkcG9mBbNnKIyoUmhShE');
    expect(key.kid).toBe('1494446723-sXWpWP2sQkP-KsjIPGm1gg');
    expect(key.scope).toBe(identifier);
    const rawKey = await subtle.importKey('jwk', key, importSpec, false, [
      'encrypt',
    ]);
    expect(rawKey.type).toBe('secret');
    expect(rawKey.usages[0]).toBe('encrypt');
    expect(rawKey.extractable).toBe(false);
  });

  it('should match the output of test vectors generated via python script', async () => {
    const key = await scopedKeys.deriveScopedKey({
      inputKey:
        '8b2e1303e21eee06a945683b8d495b9bf079ca30baa37eb8392d9ffa4767be45',
      keyRotationSecret:
        '517d478cb4f994aa69930416648a416fdaa1762c5abf401a2acf11a0f185e98d',
      keyRotationTimestamp: 1510726317000,
      identifier: 'app_key:https%3A//example.com',
      uid: uid,
    });

    expect(key.kty).toBe('oct');
    expect(key.k).toBe('Kkbk1_Q0oCcTmggeDH6880bQrxin2RLu5D00NcJazdQ');
    expect(key.kid).toBe('1510726317-Voc-Eb9IpoTINuo9ll7bjA');
  });

  it('should correctly derive legacy sync key to known test vectors', async () => {
    const key = await scopedKeys.deriveScopedKey({
      inputKey:
        'eaf9570b7219a4187d3d6bf3cec2770c2e0719b7cc0dfbb38243d6f1881675e9',
      keyRotationSecret:
        '0000000000000000000000000000000000000000000000000000000000000000',
      keyRotationTimestamp: 1510726317123,
      identifier: 'https://identity.mozilla.com/apps/oldsync',
      uid: uid,
    });

    expect(key.kty).toBe('oct');
    expect(key.k).toBe(
      'DW_ll5GwX6SJ5GPqJVAuMUP2t6kDqhUulc2cbt26xbTcaKGQl-9l29FHAQ7kUiJETma4s9fIpEHrt909zgFang'
    );
    expect(key.kid).toBe('1510726317123-IqQv4onc7VcVE1kTQkyyOw');
  });

  it('should correctly derive Thunderbird sync key to known test vectors', async () => {
    const key = await scopedKeys.deriveScopedKey({
      inputKey:
        'eaf9570b7219a4187d3d6bf3cec2770c2e0719b7cc0dfbb38243d6f1881675e9',
      keyRotationSecret:
        '0000000000000000000000000000000000000000000000000000000000000000',
      keyRotationTimestamp: 1715043913541,
      identifier: 'https://identity.thunderbird.net/apps/sync',
      uid: uid,
    });

    expect(key.kty).toBe('oct');
    expect(key.k).toBe(
      'DW_ll5GwX6SJ5GPqJVAuMUP2t6kDqhUulc2cbt26xbTcaKGQl-9l29FHAQ7kUiJETma4s9fIpEHrt909zgFang'
    );
    expect(key.kid).toBe('1715043913541-IqQv4onc7VcVE1kTQkyyOw');
  });

  it('validates that inputKey is provided', async () => {
    await expect(
      scopedKeys.deriveScopedKey({
        keyRotationSecret: keyRotationSecret,
        keyRotationTimestamp: keyRotationTimestamp,
        identifier: identifier,
        uid: uid,
      } as any)
    ).rejects.toHaveProperty(
      'message',
      'inputKey must be a 64-character hex string'
    );
  });

  it('validates that inputKey is a hex string', async () => {
    await expect(
      scopedKeys.deriveScopedKey({
        inputKey: 'k' + sampleKb.slice(1),
        keyRotationSecret: keyRotationSecret,
        keyRotationTimestamp: keyRotationTimestamp,
        identifier: identifier,
        uid: uid,
      })
    ).rejects.toHaveProperty(
      'message',
      'inputKey must be a 64-character hex string'
    );
  });

  it('validates that inputKey has the required length', async () => {
    try {
      await scopedKeys.deriveScopedKey({
        inputKey: sampleKb.slice(0, 16),
        keyRotationSecret: keyRotationSecret,
        keyRotationTimestamp: keyRotationTimestamp,
        identifier: identifier,
        uid: uid,
      });
    } catch (err) {
      expect(err.message).toBe('inputKey must be a 64-character hex string');
    }
  });

  it('validates that keyRotationSecret is provided', async () => {
    try {
      await scopedKeys.deriveScopedKey({
        inputKey: sampleKb,
        keyRotationTimestamp: keyRotationTimestamp,
        identifier: identifier,
        uid: uid,
      } as any);
    } catch (err) {
      expect(err.message).toBe(
        'keyRotationSecret must be a 64-character hex string'
      );
    }
  });

  it('validates that keyRotationSecret is a hex string', async () => {
    try {
      await scopedKeys.deriveScopedKey({
        inputKey: sampleKb,
        keyRotationSecret: 'Q' + keyRotationSecret.slice(1),
        keyRotationTimestamp: keyRotationTimestamp,
        identifier: identifier,
        uid: uid,
      });
    } catch (err) {
      expect(err.message).toBe(
        'keyRotationSecret must be a 64-character hex string'
      );
    }
  });

  it('validates that keyRotationSecret has the required length', async () => {
    try {
      await scopedKeys.deriveScopedKey({
        inputKey: sampleKb,
        keyRotationSecret: keyRotationSecret.slice(0, 16),
        keyRotationTimestamp: keyRotationTimestamp,
        identifier: identifier,
        uid: uid,
      });
    } catch (err) {
      expect(err.message).toBe(
        'keyRotationSecret must be a 64-character hex string'
      );
    }
  });

  it('validates that keyRotationTimestamp is provided', async () => {
    await expect(
      scopedKeys.deriveScopedKey({
        inputKey: sampleKb,
        keyRotationSecret: keyRotationSecret,
        identifier: identifier,
        uid: uid,
      } as any)
    ).rejects.toHaveProperty(
      'message',
      'keyRotationTimestamp must be a 13-digit integer'
    );
  });

  it('validates that keyRotationTimestamp is a number', async () => {
    await expect(
      scopedKeys.deriveScopedKey({
        inputKey: sampleKb,
        keyRotationSecret: keyRotationSecret,
        keyRotationTimestamp: '1111111111111',
        identifier: identifier,
        uid: uid,
      } as any)
    ).rejects.toHaveProperty(
      'message',
      'keyRotationTimestamp must be a 13-digit integer'
    );
  });

  it('validates that keyRotationTimestamp is an integer', async () => {
    await expect(
      scopedKeys.deriveScopedKey({
        inputKey: sampleKb,
        keyRotationSecret: keyRotationSecret,
        keyRotationTimestamp: 1234567890.23,
        identifier: identifier,
        uid: uid,
      })
    ).rejects.toHaveProperty(
      'message',
      'keyRotationTimestamp must be a 13-digit integer'
    );
  });

  it('validates that keyRotationTimestamp has correct number of digits', async () => {
    await expect(
      scopedKeys.deriveScopedKey({
        inputKey: sampleKb,
        keyRotationSecret: keyRotationSecret,
        keyRotationTimestamp: 100,
        identifier: identifier,
        uid: uid,
      })
    ).rejects.toHaveProperty(
      'message',
      'keyRotationTimestamp must be a 13-digit integer'
    );
  });

  it('validates that identifier is provided', () => {
    expect.assertions(1);
    return scopedKeys
      .deriveScopedKey({
        inputKey: sampleKb,
        keyRotationSecret: keyRotationSecret,
        keyRotationTimestamp: keyRotationTimestamp,
        uid: uid,
      } as any)
      .catch((err) => {
        expect(err.message).toBe('identifier must be a string of length >= 10');
      });
  });

  it('validates that identifier is a string', () => {
    expect.assertions(1);
    return scopedKeys
      .deriveScopedKey({
        inputKey: sampleKb,
        keyRotationSecret: keyRotationSecret,
        keyRotationTimestamp: keyRotationTimestamp,
        identifier: true,
        uid: uid,
      } as any)
      .catch((err) => {
        expect(err.message).toBe('identifier must be a string of length >= 10');
      });
  });

  it('validates that identifier is of non-trivial length', () => {
    expect.assertions(1);
    return scopedKeys
      .deriveScopedKey({
        inputKey: sampleKb,
        keyRotationSecret: keyRotationSecret,
        keyRotationTimestamp: keyRotationTimestamp,
        identifier: 'https://x',
        uid: uid,
      })
      .catch((err) => {
        expect(err.message).toBe('identifier must be a string of length >= 10');
      });
  });

  it('validates that uid is provided', () => {
    expect.assertions(1);
    return scopedKeys
      .deriveScopedKey({
        inputKey: sampleKb,
        keyRotationSecret: keyRotationSecret,
        keyRotationTimestamp: keyRotationTimestamp,
        identifier: identifier,
      } as any)
      .catch((err) => {
        expect(err.message).toBe('uid must be a 32-character hex string');
      });
  });

  it('validates that uid is a hex string', () => {
    expect.assertions(1);
    return scopedKeys
      .deriveScopedKey({
        inputKey: sampleKb,
        keyRotationSecret: keyRotationSecret,
        keyRotationTimestamp: keyRotationTimestamp,
        identifier: identifier,
        uid: '!' + uid.slice(1),
      })
      .catch((err) => {
        expect(err.message).toBe('uid must be a 32-character hex string');
      });
  });

  it('validates that uid has the correct length', () => {
    expect.assertions(1);
    return scopedKeys
      .deriveScopedKey({
        inputKey: sampleKb,
        keyRotationSecret: keyRotationSecret,
        keyRotationTimestamp: keyRotationTimestamp,
        identifier: identifier,
        uid: uid.slice(0, 16),
      })
      .catch((err) => {
        expect(err.message).toBe('uid must be a 32-character hex string');
      });
  });

  describe('_deriveHKDF', () => {
    it('vector 1', async () => {
      const inputKey = Buffer.from(
        '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b',
        'hex'
      );
      const keyRotationSecret = Buffer.from(
        '000102030405060708090a0b0c',
        'hex'
      );
      const context = Buffer.from('f0f1f2f3f4f5f6f7f8f9', 'hex');
      const key = await scopedKeys._deriveHKDF(
        keyRotationSecret,
        inputKey,
        context,
        42
      );
      expect(key.toString('hex')).toBe(
        '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865'
      );
    });

    it('vector 2', async () => {
      const inputKey = Buffer.from(
        '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b',
        'hex'
      );
      const keyRotationSecret = Buffer.from('');
      const context = Buffer.from('');
      const key = await scopedKeys._deriveHKDF(
        keyRotationSecret,
        inputKey,
        context,
        42
      );
      expect(key.toString('hex')).toBe(
        '8da4e775a563c18f715f802a063c5a31b8a11f5c5ee1879ec3454e5f3c738d2d9d201395faa4b61a96c8'
      );
    });

    it('vector 3', async () => {
      const inputKey = Buffer.from(
        '4a9cbe5ae7190a7bb7cc54d5d84f5e4ba743904f8a764933b72f10260067375a',
        'hex'
      );
      const keyRotationSecret = Buffer.from('');
      const context = Buffer.from('identity.mozilla.com/picl/v1/keyFetchToken');
      const key = await scopedKeys._deriveHKDF(
        keyRotationSecret,
        inputKey,
        context,
        3 * 32
      );
      expect(key.toString('hex')).toBe(
        'f4df04ffb79db35e94e4881719a6f145f9206e8efea17fc9f02a5ce09cbfac1e829a935f34111d75e0d16b7aa178e2766759eedb6f623c0babd2abcfea82bc12af75f6aa543a8ba7e0a029f87c785c4af0ad03889f7437f735b5256a88fc73fd'
      );
    });

    it('vector 4', async () => {
      const inputKey = Buffer.from(
        'ba0a107dab60f3b065ff7a642d14fe824fbd71bc5c99087e9e172a1abd1634f1',
        'hex'
      );
      const keyRotationSecret = Buffer.from('');
      const context = Buffer.from('identity.mozilla.com/picl/v1/account/keys');
      const key = await scopedKeys._deriveHKDF(
        keyRotationSecret,
        inputKey,
        context,
        3 * 32
      );
      expect(key.toString('hex')).toBe(
        '17ab463653a94c9a6419b48781930edefe500395e3b4e7879a2be1599975702285de16c3218a126404668bf9b7acfb6ce2b7e03c8889047ba48b8b854c6d8beb3ae100e145ca6d69cb519a872a83af788771954455716143bc08225ea8644d85'
      );
    });

    it('vector 5', async () => {
      const inputKey = Buffer.from(
        'bc3851e9e610f631df94d7883d5defd5e5f55ab520bd5a9ae33dae26575c6b1a',
        'hex'
      );
      const keyRotationSecret = Buffer.from(
        '0000000000000000000000000000000000000000000000000000000000000000',
        'hex'
      );
      const context = Buffer.from('https://identity.mozilla.com/apps/notes');
      const key = await scopedKeys._deriveHKDF(
        keyRotationSecret,
        inputKey,
        context,
        32
      );
      expect(key.toString('hex')).toBe(
        '989131d32cd665c26a57cf9ece14d0e5cf015834e9d2916d683a3bb486ceb06f'
      );
    });

    it('vector 6', async () => {
      const inputKey = Buffer.from(
        'bc3851e9e610f631df94d7883d5defd5e5f55ab520bd5a9ae33dae26575c6b1a',
        'hex'
      );
      const keyRotationSecret = Buffer.from('');
      const context = Buffer.from('https://identity.mozilla.com/apps/notes');
      const key = await scopedKeys._deriveHKDF(
        keyRotationSecret,
        inputKey,
        context,
        32
      );
      expect(key.toString('hex')).toBe(
        '989131d32cd665c26a57cf9ece14d0e5cf015834e9d2916d683a3bb486ceb06f'
      );
    });
  });
});
