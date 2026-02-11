/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Page, PageType } from './types';
import { URLSearchParams } from 'url';

interface Optional {
  baseUrl?: string;
  locale?: string;
  cartId?: string;
  searchParams?: Record<string, string | string[]>;
}

export function buildRedirectUrl(
  offeringId: string,
  interval: string,
  page: Page,
  pageType: PageType,
  optional?: Optional
) {
  const baseUrl = optional?.baseUrl ? optional?.baseUrl : '';

  const startUrl = baseUrl === '/' ? baseUrl : `${baseUrl}/`;
  const pageTypeUrl = ['landing', 'new', 'location', 'page-not-found'].includes(
    page
  )
    ? ''
    : `${pageType}/`;
  const endUrl = optional?.cartId ? `${optional?.cartId}/${page}` : page;

  const searchParamsString = optional?.searchParams
    ? `?${new URLSearchParams(optional?.searchParams).toString()}`
    : '';
  const localeString = optional?.locale ? `${optional.locale}/` : '';

  return `${startUrl}${localeString}${offeringId}/${interval}/${pageTypeUrl}${endUrl}${searchParamsString}`;
}
