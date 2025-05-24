/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Page, PageType } from './types';

export function getPageMetadataFtlInfo(
  page: Page,
  pageType: PageType,
  productTitle: string
) {
  switch (pageType) {
    case 'checkout':
      switch (page) {
        case 'start':
          return {
            titleFtl: 'metadata-title-start',
            titleFallback: `Checkout | ${productTitle}`,
            descriptionFtl: 'metadata-description-start',
            descriptionFallback: 'Enter your payment details to complete your purchase.',
          };
        default:
          return {
            titleFtl: 'metadata-title-default',
            titleFallback: `Default | ${productTitle}`,
            descriptionFtl: 'metadata-description-default',
            descriptionFallback: 'Mozilla!!',
          };
      }
    //case 'upgrade':
    default:
      return {
        titleFtl: 'metadata-title-default',
        titleFallback: `Default | ${productTitle}`,
        descriptionFtl: 'metadata-description-default',
        descriptionFallback: 'Mozilla!!',
      };
  }
}
