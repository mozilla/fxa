/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export {};

const log = { trace() {} };
const timestamp = Date.now();

const PasswordForgotToken = require('./index')(log).PasswordForgotToken;

const ACCOUNT = {
  uid: 'xxx',
  email: Buffer.from('test@example.com').toString('hex'),
};

interface ForgotTokenLike {
  data: Buffer;
  id: string;
  authKey: Buffer;
  bundleKey: Buffer;
  uid: string;
  email: string;
  createdAt: number;
  tries: number;
  ttl(asOf: number): number;
  failAttempt(): boolean;
}

describe('PasswordForgotToken', () => {
  it('can re-create from tokenData', async () => {
    const token: ForgotTokenLike = await PasswordForgotToken.create(ACCOUNT);
    const token2: ForgotTokenLike = await PasswordForgotToken.fromHex(token.data, ACCOUNT);
    expect(token.data).toEqual(token2.data);
    expect(token.id).toEqual(token2.id);
    expect(token.authKey).toEqual(token2.authKey);
    expect(token.bundleKey).toEqual(token2.bundleKey);
    expect(token.uid).toEqual(token2.uid);
    expect(token.email).toEqual(token2.email);
  });

  it('ttl "works"', async () => {
    const token: ForgotTokenLike = await PasswordForgotToken.create(ACCOUNT);
    token.createdAt = timestamp;
    expect(token.ttl(timestamp)).toBe(900);
    expect(token.ttl(timestamp + 1000)).toBe(899);
    expect(token.ttl(timestamp + 2000)).toBe(898);
  });

  it('failAttempt decrements `tries`', async () => {
    const token: ForgotTokenLike = await PasswordForgotToken.create(ACCOUNT);
    expect(token.tries).toBe(3);
    expect(token.failAttempt()).toBe(false);
    expect(token.tries).toBe(2);
    expect(token.failAttempt()).toBe(false);
    expect(token.tries).toBe(1);
    expect(token.failAttempt()).toBe(true);
  });
});
