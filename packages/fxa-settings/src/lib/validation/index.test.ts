/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ValidationArguments } from 'class-validator';
import { isEmailValid } from '@fxa/shared/email';
import { IsEmailOrEmpty, isSigninEmail } from '.';

describe('isSigninEmail', () => {
  it.each([
    ['a standard address', 'first.last@gmail.com'],
    ['a dot before the @', 'first.last.@gmail.com'],
    ['a leading dot', '.first@gmail.com'],
    ['consecutive dots', 'first..last@gmail.com'],
  ])('accepts %s', (_shape, email) => {
    expect(isSigninEmail(email)).toBe(true);
  });

  it.each([
    ['a numeric TLD', 'first@gmail.123'],
    ['an IP address domain', 'first@1.2.3.4'],
    ['local-part dots with a numeric TLD', 'first.last.@gmail.123'],
    ['a local part made only of dots', '.@gmail.com'],
    ['an address without a TLD', 'user@localhost'],
    ['a space in the local part', 'first last@gmail.com'],
    ['a missing @', 'not-an-email'],
  ])('rejects %s', (_shape, email) => {
    expect(isSigninEmail(email)).toBe(false);
  });
});

describe('IsEmailOrEmpty', () => {
  const validator = new IsEmailOrEmpty();
  const accepts = (value: unknown) =>
    validator.validate(value, {} as ValidationArguments);

  describe('addresses that fail class-validator isEmail only on local-part dots', () => {
    it.each([
      ['a dot before the @', 'first.last.@gmail.com'],
      ['a leading dot', '.first@gmail.com'],
      ['consecutive dots', 'first..last@gmail.com'],
    ])('accepts %s', (_shape, email) => {
      expect(isEmailValid(email)).toBe(true);
      expect(accepts(email)).toBe(true);
    });
  });

  describe('addresses isEmailValid accepts that cannot receive mail', () => {
    it.each([
      ['a numeric TLD', 'first@gmail.123'],
      ['an IP address domain', 'first@1.2.3.4'],
      ['local-part dots with a numeric TLD', 'first.last.@gmail.123'],
    ])('rejects %s', (_shape, email) => {
      expect(isEmailValid(email)).toBe(true);
      expect(accepts(email)).toBe(false);
    });
  });

  describe('values accepted today', () => {
    it.each([
      ['an address with a TLD', 'first.last@gmail.com'],
      ['an address without a TLD', 'user@localhost'],
      ['an empty string', ''],
      ['undefined', undefined],
    ])('accepts %s', (_shape, value) => {
      expect(accepts(value)).toBe(true);
    });
  });

  describe('values rejected by both rules', () => {
    it.each([
      ['a missing @', 'not-an-email'],
      ['a space in the local part', 'first last@gmail.com'],
      ['a space in the domain', 'user@exa mple.com'],
      ['two @ characters', 'user@@gmail.com'],
      ['a domain label starting with a hyphen', 'user@-gmail.com'],
    ])('rejects %s', (_shape, email) => {
      expect(isEmailValid(email)).toBe(false);
      expect(accepts(email)).toBe(false);
    });
  });
});
