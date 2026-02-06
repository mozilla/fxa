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
  data: string | Buffer;
  id: string;
  authKey: string | Buffer;
  bundleKey: string | Buffer;
  uid: string;
  email: string;
  createdAt: number;
  tries: number;
  ttl(asOf: number): number;
  failAttempt(): boolean;
}

describe('PasswordForgotToken', () => {
  it('can re-create from tokenData', () => {
    let token: ForgotTokenLike | null = null;
    return PasswordForgotToken.create(ACCOUNT)
      .then((x: ForgotTokenLike) => {
        token = x;
      })
      .then(() => {
        return PasswordForgotToken.fromHex(token!.data, ACCOUNT);
      })
      .then((token2: ForgotTokenLike) => {
        expect(token!.data).toEqual(token2.data);
        expect(token!.id).toEqual(token2.id);
        expect(token!.authKey).toEqual(token2.authKey);
        expect(token!.bundleKey).toEqual(token2.bundleKey);
        expect(token!.uid).toEqual(token2.uid);
        expect(token!.email).toEqual(token2.email);
      });
  });

  it('ttl "works"', () => {
    return PasswordForgotToken.create(ACCOUNT).then((token: ForgotTokenLike) => {
      token.createdAt = timestamp;
      expect(token.ttl(timestamp)).toBe(900);
      expect(token.ttl(timestamp + 1000)).toBe(899);
      expect(token.ttl(timestamp + 2000)).toBe(898);
    });
  });

  it('failAttempt decrements `tries`', () => {
    return PasswordForgotToken.create(ACCOUNT).then((x: ForgotTokenLike) => {
      expect(x.tries).toBe(3);
      expect(x.failAttempt()).toBe(false);
      expect(x.tries).toBe(2);
      expect(x.failAttempt()).toBe(false);
      expect(x.tries).toBe(1);
      expect(x.failAttempt()).toBe(true);
    });
  });
});
