/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { AuthUiErrors } from './auth-errors/auth-errors';
import { getLocalizedErrorMessage, isIncorrectPassword } from './error-utils';

const ftlMsgResolver = {
  getMsg: (id: string, fallback: string) => `${id}|${fallback}`,
} as unknown as FtlMsgResolver;

describe('getLocalizedErrorMessage', () => {
  it('renders INCORRECT_EMAIL_CASE as the incorrect-password message', () => {
    expect(
      getLocalizedErrorMessage(
        ftlMsgResolver,
        AuthUiErrors.INCORRECT_EMAIL_CASE
      )
    ).toBe('auth-error-103|Incorrect password');
  });

  it('renders INCORRECT_PASSWORD as the incorrect-password message', () => {
    expect(
      getLocalizedErrorMessage(ftlMsgResolver, AuthUiErrors.INCORRECT_PASSWORD)
    ).toBe('auth-error-103|Incorrect password');
  });
});

describe('isIncorrectPassword', () => {
  it.each([
    {
      name: 'INCORRECT_PASSWORD',
      errno: AuthUiErrors.INCORRECT_PASSWORD.errno,
    },
    {
      name: 'INCORRECT_EMAIL_CASE',
      errno: AuthUiErrors.INCORRECT_EMAIL_CASE.errno,
    },
  ])('returns true for $name', ({ errno }) => {
    expect(isIncorrectPassword(errno)).toBe(true);
  });

  it.each([
    { name: 'THROTTLED', errno: AuthUiErrors.THROTTLED.errno },
    { name: 'a missing errno', errno: undefined },
  ])('returns false for $name', ({ errno }) => {
    expect(isIncorrectPassword(errno)).toBe(false);
  });
});
