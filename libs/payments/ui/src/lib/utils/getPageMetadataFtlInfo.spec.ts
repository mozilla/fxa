/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getPageMetadataFtlInfo } from './getPageMetadataFtlInfo';
import type { Page, PageType } from './types';

const MOCK_PRODUCT_TITLE = 'Mozilla VPN';

describe('getPageMetadataFtlInfo', () => {
  describe('checkout pages', () => {
    it.each([
      {
        page: 'start' as Page,
        titleFtl: 'metadata-title-checkout-start',
        titleFallback: `Checkout | ${MOCK_PRODUCT_TITLE}`,
        descriptionFtl: 'metadata-description-checkout-start',
        descriptionFallback:
          'Enter your payment details to complete your purchase.',
      },
      {
        page: 'processing' as Page,
        titleFtl: 'metadata-title-checkout-processing',
        titleFallback: `Processing | ${MOCK_PRODUCT_TITLE}`,
        descriptionFtl: 'metadata-description-checkout-processing',
        descriptionFallback:
          'Please wait while we finish processing your payment.',
      },
      {
        page: 'error' as Page,
        titleFtl: 'metadata-title-checkout-error',
        titleFallback: `Error | ${MOCK_PRODUCT_TITLE}`,
        descriptionFtl: 'metadata-description-checkout-error',
        descriptionFallback:
          'There was an error processing your subscription. If this problem persists, please contact support.',
      },
      {
        page: 'success' as Page,
        titleFtl: 'metadata-title-checkout-success',
        titleFallback: `Success | ${MOCK_PRODUCT_TITLE}`,
        descriptionFtl: 'metadata-description-checkout-success',
        descriptionFallback:
          'Congratulations! You have successfully completed your purchase.',
      },
      {
        page: 'needs_input' as Page,
        titleFtl: 'metadata-title-checkout-needs-input',
        titleFallback: `Action required | ${MOCK_PRODUCT_TITLE}`,
        descriptionFtl: 'metadata-description-checkout-needs-input',
        descriptionFallback:
          'Please complete the required action to proceed with your payment.',
      },
    ])(
      'returns $titleFtl for checkout $page page',
      ({
        page,
        titleFtl,
        titleFallback,
        descriptionFtl,
        descriptionFallback,
      }) => {
        expect(
          getPageMetadataFtlInfo(page, 'checkout', MOCK_PRODUCT_TITLE)
        ).toEqual({
          titleFtl,
          titleFallback,
          descriptionFtl,
          descriptionFallback,
        });
      }
    );

    it('returns the default metadata for an unrecognized checkout page', () => {
      expect(
        getPageMetadataFtlInfo(
          'landing' as Page,
          'checkout',
          MOCK_PRODUCT_TITLE
        )
      ).toEqual({
        titleFtl: 'metadata-title-default',
        titleFallback: `Page not found | ${MOCK_PRODUCT_TITLE}`,
        descriptionFtl: 'metadata-description-default',
        descriptionFallback: 'The page you requested was not found.',
      });
    });
  });

  describe('upgrade pages', () => {
    it.each([
      {
        page: 'start' as Page,
        titleFtl: 'metadata-title-upgrade-start',
        titleFallback: `Upgrade | ${MOCK_PRODUCT_TITLE}`,
        descriptionFtl: 'metadata-description-upgrade-start',
        descriptionFallback:
          'Enter your payment details to complete your upgrade.',
      },
      {
        page: 'processing' as Page,
        titleFtl: 'metadata-title-upgrade-processing',
        titleFallback: `Processing | ${MOCK_PRODUCT_TITLE}`,
        descriptionFtl: 'metadata-description-upgrade-processing',
        descriptionFallback:
          'Please wait while we finish processing your payment.',
      },
      {
        page: 'error' as Page,
        titleFtl: 'metadata-title-upgrade-error',
        titleFallback: `Error | ${MOCK_PRODUCT_TITLE}`,
        descriptionFtl: 'metadata-description-upgrade-error',
        descriptionFallback:
          'There was an error processing your upgrade. If this problem persists, please contact support.',
      },
      {
        page: 'success' as Page,
        titleFtl: 'metadata-title-upgrade-success',
        titleFallback: `Success | ${MOCK_PRODUCT_TITLE}`,
        descriptionFtl: 'metadata-description-upgrade-success',
        descriptionFallback:
          'Congratulations! You have successfully completed your upgrade.',
      },
      {
        page: 'needs_input' as Page,
        titleFtl: 'metadata-title-upgrade-needs-input',
        titleFallback: `Action required | ${MOCK_PRODUCT_TITLE}`,
        descriptionFtl: 'metadata-description-upgrade-needs-input',
        descriptionFallback:
          'Please complete the required action to proceed with your payment.',
      },
    ])(
      'returns $titleFtl for upgrade $page page',
      ({
        page,
        titleFtl,
        titleFallback,
        descriptionFtl,
        descriptionFallback,
      }) => {
        expect(
          getPageMetadataFtlInfo(page, 'upgrade', MOCK_PRODUCT_TITLE)
        ).toEqual({
          titleFtl,
          titleFallback,
          descriptionFtl,
          descriptionFallback,
        });
      }
    );

    it('returns the default metadata for an unrecognized upgrade page', () => {
      expect(
        getPageMetadataFtlInfo('landing' as Page, 'upgrade', MOCK_PRODUCT_TITLE)
      ).toEqual({
        titleFtl: 'metadata-title-default',
        titleFallback: `Page not found | ${MOCK_PRODUCT_TITLE}`,
        descriptionFtl: 'metadata-description-default',
        descriptionFallback: 'The page you requested was not found.',
      });
    });
  });

  it('returns the default metadata for an unrecognized pageType', () => {
    expect(
      getPageMetadataFtlInfo('start', 'unknown' as PageType, MOCK_PRODUCT_TITLE)
    ).toEqual({
      titleFtl: 'metadata-title-default',
      titleFallback: `Page not found | ${MOCK_PRODUCT_TITLE}`,
      descriptionFtl: 'metadata-description-default',
      descriptionFallback: 'The page you requested was not found.',
    });
  });
});
