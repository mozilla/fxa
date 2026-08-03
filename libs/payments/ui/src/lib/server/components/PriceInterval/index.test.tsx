/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import { PriceInterval } from './index';

jest.mock('../../../utils/helpers', () => ({
  formatPlanPricing: jest.fn(
    (amount: number, currency: string, interval: string) =>
      `$${(amount / 100).toFixed(2)}/${interval}`
  ),
}));

const mockL10n = {
  getString: (
    _id: string,
    varsOrFallback?: Record<string, unknown> | string,
    fallback?: string
  ) => {
    if (typeof varsOrFallback === 'string') return varsOrFallback;
    return fallback ?? _id;
  },
  getLocalizedCurrency: (amount: number, _currency: string) =>
    `$${(amount / 100).toFixed(2)}`,
};

type PriceIntervalProps = Parameters<typeof PriceInterval>[0];

const baseProps: PriceIntervalProps = {
  l10n: mockL10n as unknown as PriceIntervalProps['l10n'],
  amount: 999,
  currency: 'usd',
  interval: 'monthly',
  locale: 'en',
};

async function renderPriceInterval(
  propsOverride?: Partial<PriceIntervalProps>
) {
  const result = await PriceInterval({ ...baseProps, ...propsOverride });
  return render(<span>{result}</span>);
}

describe('PriceInterval', () => {
  it.each([
    { interval: 'daily', expectedId: 'plan-price-interval-daily' },
    { interval: 'weekly', expectedId: 'plan-price-interval-weekly' },
    { interval: 'monthly', expectedId: 'plan-price-interval-monthly' },
    { interval: 'halfyearly', expectedId: 'plan-price-interval-halfyearly' },
    { interval: 'yearly', expectedId: 'plan-price-interval-yearly' },
  ])(
    'uses $expectedId localization key for $interval interval',
    async ({ interval }) => {
      await renderPriceInterval({ interval });
      // The fallback from formatPlanPricing is rendered
      expect(screen.getByText(`$9.99/${interval}`)).toBeInTheDocument();
    }
  );

  it('defaults to monthly for unknown intervals', async () => {
    await renderPriceInterval({ interval: 'unknown_interval' });
    expect(screen.getByText('$9.99/unknown_interval')).toBeInTheDocument();
  });
});
