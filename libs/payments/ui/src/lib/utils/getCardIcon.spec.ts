/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { LocalizerRsc } from '@fxa/shared/l10n/server';
import { getCardIcon } from './getCardIcon';

const mockL10n: LocalizerRsc = {
  getString: (_id: string, fallback: string) => fallback,
} as unknown as LocalizerRsc;

describe('getCardIcon', () => {
  it.each([
    { brand: 'amex', altText: 'American Express logo' },
    { brand: 'apple_pay', altText: 'Apple Pay logo' },
    { brand: 'diners', altText: 'Diners logo' },
    { brand: 'discover', altText: 'Discover logo' },
    { brand: 'google_pay', altText: 'Google Pay logo' },
    { brand: 'jcb', altText: 'JCB logo' },
    { brand: 'link', altText: 'Link logo' },
    { brand: 'mastercard', altText: 'Mastercard logo' },
    { brand: 'paypal', altText: 'PayPal logo' },
    { brand: 'external_paypal', altText: 'PayPal logo' },
    { brand: 'unionpay', altText: 'Union Pay logo' },
    { brand: 'visa', altText: 'Visa logo' },
  ])('returns correct icon and alt text for "$brand"', ({ brand, altText }) => {
    const result = getCardIcon(brand, mockL10n);
    expect(result.altText).toBe(altText);
    expect(result.img).toBeDefined();
  });

  it('returns unbranded icon for unknown brand', () => {
    const result = getCardIcon('unknown_brand', mockL10n);
    expect(result.altText).toBe('Unbranded logo');
    expect(result.width).toBe(32);
    expect(result.height).toBe(20);
  });

  it.each([
    { brand: 'apple_pay', width: 45, height: 24 },
    { brand: 'google_pay', width: 45, height: 24 },
    { brand: 'link', width: 72, height: 24 },
    { brand: 'paypal', width: 91, height: 24 },
  ])('returns custom dimensions for "$brand"', ({ brand, width, height }) => {
    const result = getCardIcon(brand, mockL10n);
    expect(result.width).toBe(width);
    expect(result.height).toBe(height);
  });
});
