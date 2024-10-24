/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { jweEncrypt, jweDecrypt, hkdf } from './crypto';
import { hexstring } from './types';
import { hexToUint8, uint8ToHex } from './utils';

export type DecryptedRecoveryKeyData = {
  kA: string;
  kB: string;
};
export async function randomKey() {
  // The key is displayed in base32 'Crockford' so the length should be
  // divisible by (5 bits per character) and (8 bits per byte).
  // 20 bytes == 160 bits == 32 base32 characters
  const recoveryKey = await crypto.getRandomValues(new Uint8Array(20));
  // Flip bits to set first char to base32 'A' as a version identifier.
  // Why 'A'? https://github.com/mozilla/fxa-content-server/pull/6323#discussion_r201211711
  recoveryKey[0] = 0x50 | (0x07 & recoveryKey[0]);
  return recoveryKey;
}

async function getRecoveryKeyId(
  recoveryKey: Uint8Array,
  salt: Uint8Array,
  encoder: TextEncoder
) {
  return uint8ToHex(
    await hkdf(
      recoveryKey,
      salt,
      encoder.encode('fxa recovery fingerprint'),
      16
    )
  );
}

export async function getRecoveryKeyIdByUid(
  recoveryKey: Uint8Array,
  uid: hexstring
) {
  const encoder = new TextEncoder();
  const salt = hexToUint8(uid);
  return getRecoveryKeyId(recoveryKey, salt, encoder);
}

export async function generateRecoveryKey(
  uid: hexstring,
  keys: { kA?: hexstring; kB?: hexstring },
  forTestingOnly?: {
    testRecoveryKey: Uint8Array;
    testIV: Uint8Array;
  }
) {
  const recoveryKey = forTestingOnly?.testRecoveryKey || (await randomKey());
  const encoder = new TextEncoder();
  const salt = hexToUint8(uid);

  const encryptionKey = await hkdf(
    recoveryKey,
    salt,
    encoder.encode('fxa recovery encrypt key'),
    32
  );

  const recoveryKeyId = await getRecoveryKeyId(recoveryKey, salt, encoder);

  const recoveryData = await jweEncrypt(
    encryptionKey,
    recoveryKeyId,
    encoder.encode(JSON.stringify(keys)),
    forTestingOnly ? { testIV: forTestingOnly.testIV } : undefined
  );

  return {
    recoveryKey,
    recoveryKeyId,
    recoveryData,
  };
}

/**
 * Decrypts a user's recoveryKeyData. This data contains the user's encryption
 * keys (kA, kB) used in OnePW protocol.
 *
 * @param recoveryKey
 * @param recoveryKeyId
 * @param recoveryData encrypted user recovery data
 */
export async function decryptRecoveryKeyData(
  recoveryKey: Uint8Array,
  recoveryData: string,
  uid: hexstring
): Promise<DecryptedRecoveryKeyData> {
  const encoder = new TextEncoder();
  const salt = hexToUint8(uid);

  const encryptionKey = await hkdf(
    recoveryKey,
    salt,
    encoder.encode('fxa recovery encrypt key'),
    32
  );
  return JSON.parse(await jweDecrypt(encryptionKey, recoveryData));
}
