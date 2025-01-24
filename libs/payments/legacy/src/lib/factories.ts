/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SP2MapConfig, Currency, Intervals } from './sp2map.config';
import { StripeMetadataWithCMS } from './types';

export const StripeMetadataWithCMSFactory = (
  override?: Partial<StripeMetadataWithCMS>
): StripeMetadataWithCMS => ({
  ...override,
});

export const SP2MapConfigFactory = (
  override?: Partial<SP2MapConfig>
): SP2MapConfig => ({
  offerings: {
    vpn: CurrencyFactory(),
  },
  ...override,
});

export const CurrencyFactory = (override?: Partial<Currency>): Currency => ({
  currencies: {
    USD: IntervalsFactory(),
  },
  ...override,
});

export const IntervalsFactory = (override?: Partial<Intervals>): Intervals => ({
  monthly: ['prod_productid', 'price_priceId'],
  ...override,
});
