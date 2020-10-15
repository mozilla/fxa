import { jweEncrypt, hkdf } from './crypto';
import { hexToUint8, uint8ToHex } from './utils';

async function randomKey() {
  // The key is displayed in base32 'Crockford' so the length should be
  // divisible by (5 bits per character) and (8 bits per byte).
  // 20 bytes == 160 bits == 32 base32 characters
  const recoveryKey = await crypto.getRandomValues(new Uint8Array(20));
  // Flip bits to set first char to base32 'A' as a version identifier.
  // Why 'A'? https://github.com/mozilla/fxa-content-server/pull/6323#discussion_r201211711
  recoveryKey[0] = 0x50 | (0x07 & recoveryKey[0]);
  return recoveryKey;
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
  const recoveryKeyId = uint8ToHex(
    await hkdf(
      recoveryKey,
      salt,
      encoder.encode('fxa recovery fingerprint'),
      16
    )
  );

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
