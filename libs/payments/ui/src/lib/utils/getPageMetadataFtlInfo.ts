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
            titleFtl: 'metadata-title-checkout-start',
            titleFallback: `Checkout | ${productTitle}`,
            descriptionFtl: 'metadata-description-checkout-start',
            descriptionFallback: 'Enter your payment details to complete your purchase.',
          };
        case 'processing':
          return {
            titleFtl: 'metadata-title-checkout-processing',
            titleFallback: `Processing | ${productTitle}`,
            descriptionFtl: 'metadata-description-checkout-processing',
            descriptionFallback: 'Please wait while we finish processing your payment.',
          };
        case 'error':
          return {
            titleFtl: 'metadata-title-checkout-error',
            titleFallback: `Error | ${productTitle}`,
            descriptionFtl: 'metadata-description-checkout-error',
            descriptionFallback: 'There was an error processing your subscription. If this problem persists, please contact support.',
          };
        case 'success':
          return {
            titleFtl: 'metadata-title-checkout-success',
            titleFallback: `Success | ${productTitle}`,
            descriptionFtl: 'metadata-description-checkout-success',
            descriptionFallback: 'Congratulations! You have successfully completed your purchase.',
          };
        case 'needs_input':
          return {
            titleFtl: 'metadata-title-checkout-needs-input',
            titleFallback: `Action required | ${productTitle}`,
            descriptionFtl: 'metadata-description-checkout-needs-input',
            descriptionFallback: 'Please complete the required action to proceed with your payment.',
          };
        default:
          return {
            titleFtl: 'metadata-title-default',
            titleFallback: `Page not found | ${productTitle}`,
            descriptionFtl: 'metadata-description-default',
            descriptionFallback: 'The page you requested was not found.',
          };
      }
    case 'upgrade':
      switch (page) {
        case 'start':
          return {
            titleFtl: 'metadata-title-upgrade-start',
            titleFallback: `Upgrade | ${productTitle}`,
            descriptionFtl: 'metadata-description-upgrade-start',
            descriptionFallback: 'Enter your payment details to complete your upgrade.',
          };
        case 'processing':
          return {
            titleFtl: 'metadata-title-upgrade-processing',
            titleFallback: `Processing | ${productTitle}`,
            descriptionFtl: 'metadata-description-upgrade-processing',
            descriptionFallback: 'Please wait while we finish processing your payment.',
          };
        case 'error':
          return {
            titleFtl: 'metadata-title-upgrade-error',
            titleFallback: `Error | ${productTitle}`,
            descriptionFtl: 'metadata-description-upgrade-error',
            descriptionFallback: 'There was an error processing your upgrade. If this problem persists, please contact support.',
          };
        case 'success':
          return {
            titleFtl: 'metadata-title-upgrade-success',
            titleFallback: `Success | ${productTitle}`,
            descriptionFtl: 'metadata-description-upgrade-success',
            descriptionFallback: 'Congratulations! You have successfully completed your upgrade.',
          };
        case 'needs_input':
          return {
            titleFtl: 'metadata-title-upgrade-needs-input',
            titleFallback: `Action required | ${productTitle}`,
            descriptionFtl: 'metadata-description-upgrade-needs-input',
            descriptionFallback: 'Please complete the required action to proceed with your payment.',
          };
        default:
          return {
            titleFtl: 'metadata-title-default',
            titleFallback: `Page not found | ${productTitle}`,
            descriptionFtl: 'metadata-description-default',
            descriptionFallback: 'The page you requested was not found.',
          };
      }
    default:
      return {
        titleFtl: 'metadata-title-default',
        titleFallback: `Page not found | ${productTitle}`,
        descriptionFtl: 'metadata-description-default',
        descriptionFallback: 'The page you requested was not found.',
      };
  }
}
