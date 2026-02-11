/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { resolvePathnameWithLocale } from './resolvePathnameWithLocale';

import { parseAcceptLanguage } from '@fxa/shared/l10n';
jest.mock('@fxa/shared/l10n');
const mockedParseAcceptLanguage = jest.mocked(parseAcceptLanguage);

describe('resolvePathnameWithLocale', () => {
  it('handles a pathname excluded from processing', () => {
    const pathname = '/';

    expect(resolvePathnameWithLocale(pathname, null)).toEqual({
      redirect: false,
      pathname,
    });
  });

  it('handles a pathname with valid locale', () => {
    const pathname = '/es-ES/rest';
    mockedParseAcceptLanguage.mockReturnValue(['es-ES']);

    expect(resolvePathnameWithLocale(pathname, null)).toEqual({
      redirect: false,
      pathname,
    });
  });

  it('handles a pathname with valid locale but not supported by the monorepo', () => {
    const pathname = '/es-ES/rest';
    mockedParseAcceptLanguage.mockReturnValue(['de']);

    expect(resolvePathnameWithLocale(pathname, null)).toEqual({
      redirect: true,
      pathname: '/de/rest',
    });
  });

  it('handles a pathname with invalid locale', () => {
    const pathname = '/abcdef/rest';
    mockedParseAcceptLanguage.mockReturnValue(['de']);

    expect(resolvePathnameWithLocale(pathname, null)).toEqual({
      redirect: true,
      pathname: '/de/abcdef/rest',
    });
  });
});
