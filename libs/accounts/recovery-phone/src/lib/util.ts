/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  createSign,
  createVerify,
  generateKeyPairSync,
  randomBytes,
} from 'crypto';

const algorithm = 'RSA-SHA256';

/**
 * Convenience method to create a public/private key pair.
 * @returns
 */
export function createNewFxaKeyPair() {
  return generateKeyPairSync('rsa' as any, {
    modulusLength: 256 * 8,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });
}

/**
 * Creates a random body, for signing.
 */
export function createRandomFxaMessage() {
  return randomBytes(128).toString('hex');
}

/**
 * Signs message using the private key.
 * @param message
 * @param privateKey
 * @param twilioApiSecret
 * @returns A signature for the message
 */
export function signFxaMessage(privateKey: string, message: string) {
  const sign = createSign(algorithm);
  sign.update(message);
  sign.end();
  return sign.sign(privateKey, 'base64');
}

/**
 * Given a message, a public key, and a signature, determines if the signature is
 * in fact valid. ie The signature was generated with our private key.
 * @param message
 * @param publicKey
 * @param signature
 * @returns
 */
export function validateFxaSignature(
  publicKey: string,
  signature: string,
  message: string
) {
  const verify = createVerify(algorithm);
  verify.update(message);
  verify.end();
  return verify.verify(publicKey, signature, 'base64');
}
