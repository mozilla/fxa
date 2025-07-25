/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { ReadonlyURLSearchParams } from 'next/navigation';
import { CheckoutParams } from './types';

export const buildCartSignOutRedirectPath = (
  params: CheckoutParams,
  searchParams: ReadonlyURLSearchParams,
  cart: { taxAddress: { countryCode: string; postalCode: string } }
) => {
  const { locale, offeringId, interval } = params;
  const redirectToUrl = new URL('./', `/${locale}/${offeringId}/${interval}/new`);
  redirectToUrl.search = searchParams.toString();
  redirectToUrl.searchParams.set('countryCode', cart.taxAddress.countryCode);
  redirectToUrl.searchParams.set('postalCode', cart.taxAddress.postalCode);

  return redirectToUrl.href;
};
