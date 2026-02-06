/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export {};

const mockConfig = { scrypt: { maxPending: 5 } };
const mockLog: { buffer: string[]; warn: (obj: string) => void } = {
  buffer: [],
  warn: function (obj: string) {
    mockLog.buffer.push(obj);
  },
};

const scrypt = require('./scrypt')(mockLog, mockConfig);

describe('scrypt', () => {
  it('scrypt basic', async () => {
    const K1 = Buffer.from(
      'f84913e3d8e6d624689d0a3e9678ac8dcc79d2c2f3d9641488cd9d6ef6cd83dd',
      'hex'
    );
    const salt = Buffer.from('identity.mozilla.com/picl/v1/scrypt');
    const K2 = await scrypt.hash(K1, salt, 65536, 8, 1, 32);
    expect(K2).toBe(
      '5b82f146a64126923e4167a0350bb181feba61f63cb1714012b19cb0be0119c5'
    );
  });

  it('scrypt enforces maximum number of pending requests', async () => {
    const K1 = Buffer.from(
      'f84913e3d8e6d624689d0a3e9678ac8dcc79d2c2f3d9641488cd9d6ef6cd83dd',
      'hex'
    );
    const salt = Buffer.from('identity.mozilla.com/picl/v1/scrypt');
    // Verify maxPending uses the config value
    expect(scrypt.maxPending).toBe(5);
    // Send many concurrent requests without yielding the event loop
    const promises: Promise<string>[] = [];
    for (let i = 0; i < 10; i++) {
      promises.push(scrypt.hash(K1, salt, 65536, 8, 1, 32));
    }
    try {
      await Promise.all(promises);
      throw new Error('too many pending scrypt hashes were allowed');
    } catch (err: any) {
      expect(err.message).toBe('too many pending scrypt hashes');
      expect(scrypt.numPendingHWM).toBe(6);
      expect(mockLog.buffer[0]).toBe('scrypt.maxPendingExceeded');
    }
  });
});
