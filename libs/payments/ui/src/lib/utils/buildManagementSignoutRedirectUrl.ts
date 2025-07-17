/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { ReadonlyURLSearchParams } from 'next/navigation';

export function buildManagementSignoutRedirectUrl(
  params: Record<string, string | string[]>,
  searchParams: ReadonlyURLSearchParams,
) {
  const { locale } = params;
  const redirectToUrl = new URL(`/${locale}`);
  redirectToUrl.search = searchParams.toString();

  return redirectToUrl.href
}
