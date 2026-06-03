/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen, waitFor } from '@testing-library/react';
import {
  SubscriptionContentFactory,
  type SubscriptionContent as SubscriptionContentType,
} from '@fxa/payments/management/testing';
import { SubscriptionContent } from './index';

jest.mock('@fxa/payments/customer', () => ({
  SubplatInterval: {
    Daily: 'daily',
    Weekly: 'weekly',
    Monthly: 'monthly',
    HalfYearly: 'halfyearly',
    Yearly: 'yearly',
  },
  SubPlatPaymentMethodType: {
    Stripe: 'stripe',
    PayPal: 'paypal',
    GoogleIap: 'google_iap',
    AppleIap: 'apple_iap',
  },
}));

jest.mock('@fluent/react', () => ({
  __esModule: true,
  Localized: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLocalization: () => ({
    l10n: {
      getString: (
        _id: string,
        _vars?: Record<string, unknown>,
        fallback?: string
      ) => fallback || _id,
    },
  }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, className }: { alt?: string; className?: string }) => (
    <img alt={alt ?? ''} className={className} src="mock-image" />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    className,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    href: string | { pathname: string; query?: Record<string, unknown> };
    className?: string;
    'aria-label'?: string;
  }) => {
    const hrefStr = typeof href === 'string' ? href : href.pathname;
    return (
      <a href={hrefStr} className={className} aria-label={ariaLabel}>
        {children}
      </a>
    );
  },
}));

jest.mock('@fxa/shared/react', () => ({
  __esModule: true,
  LinkExternal: ({
    children,
    href,
    className,
    'data-testid': testId,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    'data-testid'?: string;
    'aria-label'?: string;
  }) => (
    <a
      href={href}
      className={className}
      data-testid={testId}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  ),
}));

const MOCK_LOCALE = 'en';

function buildSubscription(overrides?: Partial<SubscriptionContentType>) {
  return SubscriptionContentFactory({
    productName: 'Mozilla VPN',
    offeringApiIdentifier: 'vpn',
    canResubscribe: false,
    currency: 'usd',
    interval: 'monthly' as SubscriptionContentType['interval'],
    currentInvoiceTax: 100,
    currentInvoiceTotal: 999,
    currentInvoiceUrl: 'https://invoice.stripe.com/inv_123',
    currentPeriodEnd: 1702600000,
    nextInvoiceDate: 1702600000,
    nextInvoiceTax: 100,
    nextInvoiceTotal: 999,
    nextPromotionName: null,
    promotionName: null,
    isEligibleForChurnCancel: false,
    isEligibleForChurnStaySubscribed: false,
    isEligibleForOffer: false,
    churnStaySubscribedCtaMessage: null,
    ...overrides,
  });
}

describe('SubscriptionContent', () => {
  describe('active subscription', () => {
    it('renders product name', async () => {
      const subscription = buildSubscription({ productName: 'Mozilla VPN' });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(
          screen.getByRole('link', {
            name: /Cancel your subscription to Mozilla VPN/i,
          })
        ).toBeInTheDocument();
      });
    });

    it('renders plan interval — monthly', async () => {
      const subscription = buildSubscription({
        interval: 'monthly' as SubscriptionContentType['interval'],
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Last bill/)).toBeInTheDocument();
      });
    });

    it('renders plan interval — yearly', async () => {
      const subscription = buildSubscription({
        interval: 'yearly' as SubscriptionContentType['interval'],
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Last bill/)).toBeInTheDocument();
      });
    });

    it('renders price with currency symbol', async () => {
      const subscription = buildSubscription({
        currentInvoiceTotal: 999,
        currentInvoiceTax: 0,
        currency: 'usd',
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(screen.getByText('$9.99')).toBeInTheDocument();
      });
    });

    it('renders next billing date', async () => {
      const subscription = buildSubscription({
        canResubscribe: false,
        nextInvoiceTotal: 999,
        currentPeriodEnd: 1702600000,
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Next bill/)).toBeInTheDocument();
      });
    });

    it('renders last bill date and amount', async () => {
      const subscription = buildSubscription({
        currentInvoiceTotal: 1499,
        currentInvoiceTax: 150,
        currency: 'usd',
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Last bill/)).toBeInTheDocument();
      });
      expect(screen.getByText(/\$14\.99/)).toBeInTheDocument();
      expect(screen.getByText(/\$1\.50/)).toBeInTheDocument();
    });

    it('renders cancel button with product name', async () => {
      const subscription = buildSubscription({
        canResubscribe: false,
        productName: 'Mozilla VPN',
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(
          screen.getByRole('link', {
            name: /Cancel your subscription to Mozilla VPN/i,
          })
        ).toBeInTheDocument();
        expect(screen.getByText('Cancel subscription')).toBeInTheDocument();
      });
    });

    it('does not render expiry date or stay-subscribed button', async () => {
      const subscription = buildSubscription({ canResubscribe: false });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Last bill/)).toBeInTheDocument();
      });

      expect(screen.queryByText(/Expires on/)).not.toBeInTheDocument();
      expect(screen.queryByText('Stay subscribed')).not.toBeInTheDocument();
    });
  });

  describe('cancelled subscription (canResubscribe=true)', () => {
    it('renders expiry date instead of next billing date', async () => {
      const subscription = buildSubscription({
        canResubscribe: true,
        currentPeriodEnd: 1702600000,
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Expires on/)).toBeInTheDocument();
      });

      expect(screen.queryByText(/Next bill/)).not.toBeInTheDocument();
    });

    it('renders "Stay subscribed" button', async () => {
      const subscription = buildSubscription({
        canResubscribe: true,
        productName: 'Mozilla VPN',
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(screen.getByText('Stay subscribed')).toBeInTheDocument();
        expect(
          screen.getByRole('link', {
            name: /Stay subscribed to Mozilla VPN/i,
          })
        ).toBeInTheDocument();
      });
    });

    it('hides cancel button', async () => {
      const subscription = buildSubscription({ canResubscribe: true });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(screen.getByText('Stay subscribed')).toBeInTheDocument();
      });

      expect(screen.queryByText('Cancel subscription')).not.toBeInTheDocument();
    });
  });

  describe('active subscription — edge cases', () => {
    it('renders without invoice URL when currentInvoiceUrl is null', async () => {
      const subscription = buildSubscription({
        currentInvoiceUrl: null,
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Last bill/)).toBeInTheDocument();
      });

      expect(
        screen.queryByTestId('link-external-view-invoice')
      ).not.toBeInTheDocument();
    });

    it('renders last bill amount without tax line when currentInvoiceTax is 0', async () => {
      const subscription = buildSubscription({
        currentInvoiceTotal: 1499,
        currentInvoiceTax: 0,
        nextInvoiceTotal: 1499,
        nextInvoiceTax: 0,
        currency: 'usd',
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      // The billing content renders after the isClient useEffect fires
      await waitFor(() => {
        expect(screen.getByText(/Last bill/)).toBeInTheDocument();
      });

      // Should show amounts without a separate tax line
      expect(screen.getAllByText('$14.99').length).toBeGreaterThan(0);
      expect(screen.queryByText(/\+ .* tax/)).not.toBeInTheDocument();
    });

    it('renders next bill without tax when nextInvoiceTax is undefined', async () => {
      const subscription = buildSubscription({
        canResubscribe: false,
        nextInvoiceTotal: 499,
        nextInvoiceTax: undefined,
        currency: 'usd',
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Next bill/)).toBeInTheDocument();
        expect(screen.getByText('$4.99')).toBeInTheDocument();
      });
    });

    it('does not render next bill section when nextInvoiceTotal is undefined', async () => {
      const subscription = buildSubscription({
        canResubscribe: false,
        nextInvoiceTotal: undefined,
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Last bill/)).toBeInTheDocument();
      });

      expect(screen.queryByText(/Next bill/)).not.toBeInTheDocument();
    });

    it('renders view invoice link with correct aria-label', async () => {
      const subscription = buildSubscription({
        productName: 'Relay Premium',
        currentInvoiceUrl: 'https://invoice.stripe.com/inv_abc',
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        const invoiceLink = screen.getByTestId('link-external-view-invoice');
        expect(invoiceLink).toHaveAttribute(
          'aria-label',
          'View invoice for Relay Premium'
        );
        expect(invoiceLink).toHaveAttribute(
          'href',
          'https://invoice.stripe.com/inv_abc'
        );
      });
    });
  });

  describe('with coupon', () => {
    it('renders coupon discount information', async () => {
      const subscription = buildSubscription({
        canResubscribe: false,
        nextPromotionName: 'SAVE20',
        nextInvoiceTotal: 799,
      });

      render(
        <SubscriptionContent subscription={subscription} locale={MOCK_LOCALE} />
      );

      await waitFor(() => {
        expect(
          screen.getByText(/SAVE20 discount will be applied/)
        ).toBeInTheDocument();
      });
    });
  });
});
