/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import { UpgradePurchaseDetails } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    src,
    className,
  }: {
    alt?: string;
    src: string;
    className?: string;
  }) => <img alt={alt ?? ''} src={src} className={className} />,
}));

jest.mock('@fxa/payments/ui/server', () => ({
  __esModule: true,
  PriceInterval: ({
    amount,
    interval,
  }: {
    amount: number;
    currency: string;
    interval: string;
  }) => <span>{`$${(amount / 100).toFixed(2)}/${interval}`}</span>,
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
  getLocalizedCurrencyString: (
    amount: number,
    _currency: string,
    _locale: string
  ) => `$${(amount / 100).toFixed(2)}`,
};

type UpgradePurchaseDetailsProps = Parameters<typeof UpgradePurchaseDetails>[0];

const baseProps: UpgradePurchaseDetailsProps = {
  fromPrice: {
    currency: 'usd',
    interval: 'monthly',
    unitAmount: 999,
  },
  fromPurchaseDetails: {
    subtitle: 'Basic plan',
    productName: 'Mozilla VPN Basic',
    webIcon: 'https://example.com/basic-icon.png',
  },
  interval: 'monthly',
  invoice: {
    currency: 'usd',
    totalAmount: 1999,
    taxAmounts: [],
    discountAmount: null,
    subtotal: 1999,
    number: 'INV-0001',
    invoiceDate: 1700000000,
    nextInvoiceDate: 1702592000,
    amountDue: 1999,
    creditApplied: null,
    startingBalance: 0,
    totalExcludingTax: 1999,
  },
  l10n: mockL10n as unknown as UpgradePurchaseDetailsProps['l10n'],
  offeringPrice: 1999,
  purchaseDetails: {
    subtitle: 'Premium plan',
    productName: 'Mozilla VPN Premium',
    webIcon: 'https://example.com/premium-icon.png',
  },
  locale: 'en',
};

function renderUpgradePurchaseDetails(
  propsOverride?: Partial<UpgradePurchaseDetailsProps>
) {
  return render(<UpgradePurchaseDetails {...baseProps} {...propsOverride} />);
}

describe('UpgradePurchaseDetails', () => {
  it('renders the current plan heading and product name', () => {
    renderUpgradePurchaseDetails();
    expect(
      screen.getByRole('heading', { name: 'Current plan' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Mozilla VPN Basic' })
    ).toBeInTheDocument();
  });

  it('renders the new plan heading and product name', () => {
    renderUpgradePurchaseDetails();
    expect(
      screen.getByRole('heading', { name: 'New plan' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Mozilla VPN Premium' })
    ).toBeInTheDocument();
  });

  it('renders product logos for both plans', () => {
    renderUpgradePurchaseDetails();
    const logos = screen.getAllByRole('img');
    expect(logos).toHaveLength(2);
    expect(logos[0]).toHaveAttribute('alt', 'Mozilla VPN Basic');
    expect(logos[1]).toHaveAttribute('alt', 'Mozilla VPN Premium');
  });

  it('renders subtitles for both plans when provided', () => {
    renderUpgradePurchaseDetails();
    expect(screen.getByText(/Basic plan/)).toBeInTheDocument();
    expect(screen.getByText(/Premium plan/)).toBeInTheDocument();
  });

  it('does not render subtitles when null', () => {
    renderUpgradePurchaseDetails({
      fromPurchaseDetails: {
        subtitle: null,
        productName: 'Mozilla VPN Basic',
        webIcon: 'https://example.com/basic-icon.png',
      },
      purchaseDetails: {
        subtitle: null,
        productName: 'Mozilla VPN Premium',
        webIcon: 'https://example.com/premium-icon.png',
      },
    });
    expect(screen.queryByText(/Basic plan/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Premium plan/)).not.toBeInTheDocument();
  });

  it('renders the total amount', () => {
    renderUpgradePurchaseDetails();
    expect(screen.getByTestId('total-price')).toHaveTextContent('$19.99');
  });

  it('renders the amount due', () => {
    renderUpgradePurchaseDetails();
    expect(screen.getByTestId('amount-due')).toHaveTextContent('$19.99');
  });

  it('renders prorated price label when remainingAmountTotal differs from offeringPrice', () => {
    renderUpgradePurchaseDetails({
      invoice: {
        ...baseProps.invoice,
        remainingAmountTotal: 1500,
      },
    });
    expect(
      screen.getByText(/Prorated price for Mozilla VPN Premium/)
    ).toBeInTheDocument();
  });

  it('renders unused time credit when unusedAmountTotal is present', () => {
    renderUpgradePurchaseDetails({
      invoice: {
        ...baseProps.invoice,
        unusedAmountTotal: 500,
        subtotal: 1499,
      },
    });
    expect(screen.getByText('Credit from unused time')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Subtotal' })
    ).toBeInTheDocument();
  });

  it('does not render unused time credit when unusedAmountTotal is falsy', () => {
    renderUpgradePurchaseDetails();
    expect(
      screen.queryByText('Credit from unused time')
    ).not.toBeInTheDocument();
  });

  it('renders discount amount when present and positive', () => {
    renderUpgradePurchaseDetails({
      invoice: {
        ...baseProps.invoice,
        discountAmount: 200,
      },
    });
    expect(screen.getByText('Promo Code')).toBeInTheDocument();
  });

  it('does not render discount when discountAmount is null', () => {
    renderUpgradePurchaseDetails();
    expect(screen.queryByText('Promo Code')).not.toBeInTheDocument();
  });

  it('renders exclusive tax when a single non-zero exclusive tax rate exists', () => {
    renderUpgradePurchaseDetails({
      invoice: {
        ...baseProps.invoice,
        taxAmounts: [{ title: 'Sales Tax', inclusive: false, amount: 150 }],
      },
    });
    expect(screen.getByText('Taxes and Fees')).toBeInTheDocument();
  });

  it('does not render tax line for inclusive tax rates', () => {
    renderUpgradePurchaseDetails({
      invoice: {
        ...baseProps.invoice,
        taxAmounts: [{ title: 'VAT', inclusive: true, amount: 150 }],
      },
    });
    expect(screen.queryByText('Taxes and Fees')).not.toBeInTheDocument();
  });

  it('renders credit-to-account section when totalAmount is negative', () => {
    renderUpgradePurchaseDetails({
      invoice: {
        ...baseProps.invoice,
        totalAmount: -500,
      },
    });
    expect(screen.getByText('Credit issued to account')).toBeInTheDocument();
    expect(
      screen.getByText(/Credit will be applied to your account/)
    ).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-added-credit')).toHaveTextContent(
      '$5.00'
    );
  });

  it('does not render credit-to-account section when totalAmount is positive', () => {
    renderUpgradePurchaseDetails();
    expect(
      screen.queryByText('Credit issued to account')
    ).not.toBeInTheDocument();
  });

  it('renders credit applied when creditApplied and startingBalance are present', () => {
    renderUpgradePurchaseDetails({
      invoice: {
        ...baseProps.invoice,
        creditApplied: 300,
        startingBalance: -300,
      },
    });
    expect(screen.getByText('Credit applied')).toBeInTheDocument();
  });
});
