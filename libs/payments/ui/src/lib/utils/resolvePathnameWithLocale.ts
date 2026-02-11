/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { parseAcceptLanguage } from '@fxa/shared/l10n';

// Pathnames that should not be redirected or modified
const EXCLUDE_PATHNAMES = ['/'];

function isValidLocale(locale: string) {
  try {
    return !!Intl.DateTimeFormat.supportedLocalesOf([locale]).length;
  } catch (e) {
    return false;
  }
}

export function resolvePathnameWithLocale(
  pathname: string,
  acceptLanguage: string | null
) {
  if (EXCLUDE_PATHNAMES.includes(pathname)) {
    return {
      redirect: false,
      pathname: pathname,
    };
  }

  const pathLocale = pathname.split('/')[1];
  const validLocale = isValidLocale(pathLocale);
  const parsedPathLocale = parseAcceptLanguage(
    acceptLanguage,
    undefined,
    pathLocale
  )[0];

  if (validLocale && parsedPathLocale === pathLocale) {
    return {
      redirect: false,
      pathname: pathname,
    };
  } else if (validLocale && parsedPathLocale !== pathLocale) {
    // existing locale is valid, but not supported
    // redirect replacing existing locale
    const newPathname = `/${parsedPathLocale}${pathname.substring(
      pathLocale.length + 1
    )}`;
    return {
      redirect: true,
      pathname: newPathname,
    };
  } else {
    // assume no locale provided and insert locale
    const newPathname = `/${parsedPathLocale}${pathname}`;
    return {
      redirect: true,
      pathname: newPathname,
    };
  }
}
