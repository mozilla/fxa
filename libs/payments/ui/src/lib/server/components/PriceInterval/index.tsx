/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocalizerRsc } from '@fxa/shared/l10n/server';
import { formatPlanPricing } from '../../../utils/helpers';

type PriceIntervalProps = {
  l10n: LocalizerRsc;
  amount: number;
  currency: string;
  interval: string;
  locale: string;
};

export async function PriceInterval(props: PriceIntervalProps) {
  const { l10n, amount, currency, interval, locale } = props;
  let priceIntervalId;
  switch (interval) {
    case 'daily':
      priceIntervalId = 'plan-price-interval-daily';
      break;
    case 'weekly':
      priceIntervalId = 'plan-price-interval-weekly';
      break;
    case 'halfyearly':
      priceIntervalId = 'plan-price-interval-halfyearly';
      break;
    case 'yearly':
      priceIntervalId = 'plan-price-interval-yearly';
      break;
    case 'monthly':
    default:
      priceIntervalId = 'plan-price-interval-monthly';
      break;
  }

  return l10n.getString(
    priceIntervalId,
    {
      amount: l10n.getLocalizedCurrency(amount, currency),
    },
    formatPlanPricing(amount, currency, interval, false, 0, locale)
  );
}
