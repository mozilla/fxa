/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  createNewFxaKeyPair,
  createRandomFxaMessage,
  signFxaMessage,
  validateFxaSignature,
} from './util';

describe('Message Signing', () => {
  /** Note, same method that auth-server uses. */
  const { privateKey, publicKey } = createNewFxaKeyPair();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Creates message', async () => {
    const message = createRandomFxaMessage();
    expect(message).toBeDefined();
    expect(message.length).toBeGreaterThan(0);
  });

  it('signs message', () => {
    const message = createRandomFxaMessage();
    const signature = signFxaMessage(privateKey, message);
    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(0);
  });

  it('validates signature', () => {
    const message = createRandomFxaMessage();
    const signature = signFxaMessage(privateKey, message);
    expect(validateFxaSignature(publicKey, signature, message)).toBeTruthy();
    expect(validateFxaSignature(publicKey, signature, '00')).toBeFalsy();
    expect(validateFxaSignature(publicKey, '00', message)).toBeFalsy();
    expect(validateFxaSignature(publicKey, '00', '00')).toBeFalsy();
  });
});
