/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export {};

const log = { trace() {} };
const tokens = require('./index')(log);
const AccountResetToken = tokens.AccountResetToken;

const ACCOUNT = {
  uid: 'xxx',
};

interface TokenLike {
  data: Buffer;
  id: string;
  authKey: Buffer;
  bundleKey: Buffer;
  uid: string;
}

describe('account reset tokens', () => {
  it('should re-create from tokenData', async () => {
    const token: TokenLike = await AccountResetToken.create(ACCOUNT);
    const token2: TokenLike = await AccountResetToken.fromHex(token.data, ACCOUNT);
    expect(token.data).toEqual(token2.data);
    expect(token.id).toEqual(token2.id);
    expect(token.authKey).toEqual(token2.authKey);
    expect(token.bundleKey).toEqual(token2.bundleKey);
    expect(token.uid).toEqual(token2.uid);
  });

  it('should have test-vector compliant key derivations', async () => {
    const tokenData =
      'c0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedf';
    const token: TokenLike = await AccountResetToken.fromHex(tokenData, ACCOUNT);
    expect(token.data.toString('hex')).toBe(tokenData);
    expect(token.id).toBe(
      '46ec557e56e531a058620e9344ca9c75afac0d0bcbdd6f8c3c2f36055d9540cf'
    );
    expect(token.authKey.toString('hex')).toBe(
      '716ebc28f5122ef48670a48209190a1605263c3188dfe45256265929d1c45e48'
    );
    expect(token.bundleKey.toString('hex')).toBe(
      'aa5906d2318c6e54ecebfa52f10df4c036165c230cc78ee859f546c66ea3c126'
    );
  });
});
