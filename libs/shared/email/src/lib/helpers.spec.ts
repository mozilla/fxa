/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { isEmailValid } from './helpers';

describe('isEmailValid', () => {
  it('returns true for valid email', () => {
    expect(isEmailValid('a@b.c')).toBe(true);
  });

  it('returns false for email without a local part', () => {
    expect(isEmailValid('@b.c')).toBe(false);
  });

  it('returns false for email without a domain', () => {
    expect(isEmailValid('a@')).toBe(false);
  });

  it('returns false for email with a single-part domain', () => {
    expect(isEmailValid('a@b')).toBe(false);
  });

  it('returns true for email with 64-character local part', () => {
    expect(isEmailValid('a'.repeat(64) + '@b.c')).toBe(true);
  });

  it('returns false for email with 65-character local part', () => {
    expect(isEmailValid('a'.repeat(65) + '@b.c')).toBe(false);
  });

  it('returns true for email with 256 characters', () => {
    expect(isEmailValid('a@' + 'a'.repeat(252) + '.b')).toBe(true);
  });

  it('returns false for email with 257 characters', () => {
    expect(isEmailValid('a@' + 'a'.repeat(253) + '.b')).toBe(false);
  });

  it.each([
    'tim@tim-example.net',
    'a+b+c@wibble.example.com',
    '#!?-@t-e-s-t.c-o-m',
  ])('returns true for valid email %s', (email) => {
    expect(isEmailValid(email)).toBe(true);
  });

  it.each([
    'notAnEmailAddress',
    '\n@example.com',
    'me@hello world.com',
    'me@hello+world.com',
    'me@.example',
    'me@example.com-',
    'me@example..com',
    'me@-example-.com',
    'me@example-.com',
    'me@example.-com',
  ])('returns false for invalid email %j', (email) => {
    expect(isEmailValid(email)).toBe(false);
  });

  it('returns true if email address contains an apostrophe', () => {
    expect(isEmailValid("a'b@example.com")).toBe(true);
  });

  it('returns false if email address contains a single quote', () => {
    expect(isEmailValid('a’b@example.com')).toBe(false);
  });
});
