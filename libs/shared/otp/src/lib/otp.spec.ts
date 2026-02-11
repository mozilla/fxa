/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomInt: jest.fn().mockImplementation((_, __, cb) => {
    cb(undefined, 1999);
  }),
  timingSafeEqual: jest.fn(),
}));
import * as crypto from 'crypto';
import { OtpManager } from './otp';

const storageAdapter = (() => {
  const values: Record<string, string> = {};

  return {
    set: jest
      .fn()
      .mockImplementation((key: string, val: string) => (values[key] = val)),
    get: jest.fn().mockImplementation((key: string) => values[key]),
    del: jest.fn().mockImplementation((key: string) => delete values[key]),
  };
})();

describe('OtpManager', () => {
  const otpManager = new OtpManager(
    { digits: 6, kind: 'testo' },
    storageAdapter
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('calls crypto.randomInt to generate the value', async () => {
      await otpManager.create('user_1987');
      expect(crypto.randomInt).toHaveBeenCalledTimes(1);
    });

    it('returns a numeric string with configured number of digits', async () => {
      const code = await otpManager.create('user_1987');
      expect(code).toMatch(/^\d{6}$/);
    });

    it('sets the value with the storage adapter', async () => {
      const code = await otpManager.create('user_1987');
      expect(storageAdapter.set).toHaveBeenCalledTimes(1);
      expect(storageAdapter.set).toHaveBeenCalledWith(
        'otp:testo:user_1987',
        code
      );
    });
  });

  describe('isValid', () => {
    it('calls crypto.timingSafeEqual to compare values', async () => {
      const code = await otpManager.create('cheese9000');
      await otpManager.isValid('cheese9000', code);
      expect(crypto.timingSafeEqual).toHaveBeenCalledTimes(1);
      expect(crypto.timingSafeEqual).toHaveBeenCalledWith(
        Buffer.from(code),
        Buffer.from(code)
      );
    });

    it('returns false when the code is not found', async () => {
      const actual = await otpManager.isValid('cheese9001', '929291');
      expect(storageAdapter.get).toHaveBeenCalledTimes(1);
      expect(storageAdapter.get).toHaveBeenCalledWith('otp:testo:cheese9001');
      expect(crypto.timingSafeEqual).toHaveBeenCalledTimes(0);
      expect(actual).toBe(false);
    });
  });

  describe('delete', () => {
    it('deletes the value with the storage adapter', async () => {
      await otpManager.delete('crashbandicoot');
      expect(storageAdapter.del).toHaveBeenCalledTimes(1);
      expect(storageAdapter.del).toHaveBeenCalledWith(
        'otp:testo:crashbandicoot'
      );
    });
  });
});
