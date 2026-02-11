/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test as passwordCheck } from '../lib/common-password-list';

describe('common-password-list', () => {
  test('returns `true` when password is in list', () => {
    const badPasswords = ['password', 'password123', '1loveyou'];
    badPasswords.forEach((password) => {
      expect(passwordCheck(password)).toBe(true);
    });
  });

  test('returns `false` when password is not in list', () => {
    const goodPasswords = ['notinyour!', 'combo1234$#', 'JUA7MYM8ni3cgU'];
    goodPasswords.forEach((password) => {
      expect(passwordCheck(password)).toBe(false);
    });
  });
});
