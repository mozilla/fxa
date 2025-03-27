/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export function buildSp2RedirectUrl(
  productId: string,
  priceId: string,
  contentServerUrl: string,
  searchParams: URLSearchParams
) {
  // Remove SP2 redirect logic specific query params
  searchParams.delete('currency');
  searchParams.delete('spVersion');

  const remainingQueryParams = searchParams.toString();

  const baseUrl = `${contentServerUrl}/subscriptions/products/${productId}?plan=${priceId}`;

  if (remainingQueryParams) {
    return `${baseUrl}&${remainingQueryParams}`;
  } else {
    return baseUrl;
  }
}
