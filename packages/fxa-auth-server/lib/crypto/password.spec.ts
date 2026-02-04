/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export {};

const mockLog = {};
const mockConfig = {};
const Password = require('./password')(mockLog, mockConfig);

describe('Password', () => {
  it('password version zero', async () => {
    const pwd = Buffer.from('aaaaaaaaaaaaaaaa');
    const salt = Buffer.from('bbbbbbbbbbbbbbbb');
    const p1 = new Password(pwd, salt, 0);
    expect(p1.version).toBe(0);
    const p2 = new Password(pwd, salt, 0);
    expect(p2.version).toBe(0);
    const hash = await p1.verifyHash();
    const matched = await p2.matches(hash);
    expect(matched).toBe(true);
  });

  it('password version one', async () => {
    const pwd = Buffer.from('aaaaaaaaaaaaaaaa');
    const salt = Buffer.from('bbbbbbbbbbbbbbbb');
    const p1 = new Password(pwd, salt, 1);
    expect(p1.version).toBe(1);
    const p2 = new Password(pwd, salt, 1);
    expect(p2.version).toBe(1);
    const hash = await p1.verifyHash();
    const matched = await p2.matches(hash);
    expect(matched).toBe(true);
  });

  it('passwords of different versions should not match', async () => {
    const pwd = Buffer.from('aaaaaaaaaaaaaaaa');
    const salt = Buffer.from('bbbbbbbbbbbbbbbb');
    const p1 = new Password(pwd, salt, 0);
    const p2 = new Password(pwd, salt, 1);
    const hash = await p1.verifyHash();
    const matched = await p2.matches(hash);
    expect(matched).toBe(false);
  });

  it('scrypt queue stats can be reported', () => {
    const stat = Password.stat();
    expect(stat.stat).toBe('scrypt');
    expect(stat).toHaveProperty('numPending');
    expect(stat).toHaveProperty('numPendingHWM');
  });
});
