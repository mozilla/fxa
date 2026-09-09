/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import { ChurnError } from './index';
import {
  CancelFlowContentFactory,
  CmsOfferingContentFactory,
} from '@fxa/payments/management/testing';

jest.mock('@fxa/payments/customer', () => ({
  SubPlatPaymentMethodType: {
    Stripe: 'stripe',
    PayPal: 'paypal',
  },
}));

const mockHeaders = jest.fn();
jest.mock('next/headers', () => ({
  __esModule: true,
  headers: () => mockHeaders(),
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
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const mockGetNextChargeChurnContent = jest.fn();
const mockAlreadyCanceling = jest.fn();

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  getNextChargeChurnContent: (...args: unknown[]) =>
    mockGetNextChargeChurnContent(...args),
  AlreadyCanceling: (props: Record<string, unknown>) => {
    mockAlreadyCanceling(props);
    return <div data-testid="already-canceling" />;
  },
  SubPlatPaymentMethodType: {
    Stripe: 'stripe',
    PayPal: 'paypal',
  },
}));

const mockGetL10n = jest.fn();
jest.mock('@fxa/payments/ui/server', () => ({
  __esModule: true,
  getApp: () => ({
    getL10n: mockGetL10n,
  }),
}));

jest.mock('@fxa/shared/react', () => ({
  __esModule: true,
  LinkExternal: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
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
};

const baseCmsOfferingContent = CmsOfferingContentFactory({
  productName: 'Mozilla VPN',
  successActionButtonUrl: 'https://vpn.mozilla.org',
  supportUrl: 'https://support.mozilla.org',
  webIcon: 'https://example.com/icon.png',
});

const basePageContent = CancelFlowContentFactory({
  currency: 'usd',
  currentPeriodEnd: 1735689600,
  productName: 'Mozilla VPN',
  webIcon: 'https://example.com/icon.png',
});

type ChurnErrorProps = Parameters<typeof ChurnError>[0];

const baseProps: ChurnErrorProps = {
  cmsOfferingContent: baseCmsOfferingContent,
  locale: 'en',
  reason: 'general_error',
  pageContent: basePageContent,
  subscriptionId: 'sub_123',
};

async function renderChurnError(propsOverride?: Partial<ChurnErrorProps>) {
  const jsx = await ChurnError({ ...baseProps, ...propsOverride });
  return render(jsx);
}

describe('ChurnError', () => {
  beforeEach(() => {
    mockHeaders.mockReset();
    mockGetL10n.mockReset();
    mockAlreadyCanceling.mockReset();
    mockGetNextChargeChurnContent.mockReset();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockGetL10n.mockReturnValue(mockL10n);
    mockGetNextChargeChurnContent.mockReturnValue({
      l10nId: 'mock-next-charge-id',
      l10nVars: { amount: '$9.99' },
      fallback: 'Next charge: $9.99',
    });
  });

  describe('customer_mismatch', () => {
    it('renders the customer mismatch heading and message', async () => {
      await renderChurnError({ reason: 'customer_mismatch' });

      expect(
        screen.getByRole('heading', {
          name: /Coupon can't be redeemed/i,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/coupon was issued for a different subscription/i)
      ).toBeInTheDocument();
    });

    it('renders sign in and contact support links', async () => {
      await renderChurnError({ reason: 'customer_mismatch' });

      expect(screen.getByRole('link', { name: /Sign in/i })).toHaveAttribute(
        'href',
        '/en/subscriptions/landing'
      );
      expect(
        screen.getByRole('link', { name: /Contact Support/i })
      ).toHaveAttribute('href', 'https://support.mozilla.org');
    });
  });

  describe('already_canceling_at_period_end', () => {
    it('renders AlreadyCanceling when pageContent is valid', async () => {
      await renderChurnError({
        reason: 'already_canceling_at_period_end',
      });

      expect(screen.getByTestId('already-canceling')).toBeInTheDocument();
      expect(mockAlreadyCanceling).toHaveBeenCalledWith({
        currentPeriodEnd: 1735689600,
        locale: 'en',
        productName: 'Mozilla VPN',
        webIcon: 'https://example.com/icon.png',
      });
    });

    it('falls through to general error when pageContent is not_found', async () => {
      await renderChurnError({
        reason: 'already_canceling_at_period_end',
        pageContent: { flowType: 'not_found' as const },
      });

      expect(
        screen.getByRole('heading', {
          name: /There was an issue/i,
        })
      ).toBeInTheDocument();
    });
  });

  describe('discount_already_applied', () => {
    it('renders the discount already applied heading', async () => {
      await renderChurnError({ reason: 'discount_already_applied' });

      expect(
        screen.getByRole('heading', {
          name: /Discount code already applied/i,
        })
      ).toBeInTheDocument();
    });

    it('renders manage subscriptions and contact support links', async () => {
      await renderChurnError({ reason: 'discount_already_applied' });

      expect(
        screen.getByRole('link', { name: /Manage subscriptions/i })
      ).toHaveAttribute('href', '/en/subscriptions/landing');
      expect(
        screen.getByRole('link', { name: /Contact Support/i })
      ).toHaveAttribute('href', 'https://support.mozilla.org');
    });
  });

  describe('redemption_limit_exceeded', () => {
    it('renders the same UI as discount_already_applied', async () => {
      await renderChurnError({ reason: 'redemption_limit_exceeded' });

      expect(
        screen.getByRole('heading', {
          name: /Discount code already applied/i,
        })
      ).toBeInTheDocument();
    });
  });

  describe('subscription_not_active', () => {
    it('renders the subscription not active heading', async () => {
      await renderChurnError({ reason: 'subscription_not_active' });

      expect(
        screen.getByRole('heading', {
          name: /only available to current Mozilla VPN/i,
        })
      ).toBeInTheDocument();
    });

    it('renders the go to product page link', async () => {
      await renderChurnError({ reason: 'subscription_not_active' });

      expect(
        screen.getByRole('link', { name: /Go to Mozilla VPN/i })
      ).toHaveAttribute('href', 'https://vpn.mozilla.org');
    });
  });

  describe('subscription_still_active', () => {
    it('renders the subscription still active heading', async () => {
      await renderChurnError({ reason: 'subscription_still_active' });

      expect(
        screen.getByRole('heading', {
          name: /Mozilla VPN subscription is still active/i,
        })
      ).toBeInTheDocument();
    });

    it('renders product and manage subscriptions links', async () => {
      await renderChurnError({ reason: 'subscription_still_active' });

      expect(
        screen.getByRole('link', { name: /Go to Mozilla VPN/i })
      ).toHaveAttribute('href', 'https://vpn.mozilla.org');
      expect(
        screen.getByRole('link', { name: /Manage subscriptions/i })
      ).toHaveAttribute('href', '/en/subscriptions/landing');
    });

    it('falls through to general error when pageContent is not_found', async () => {
      await renderChurnError({
        reason: 'subscription_still_active',
        pageContent: { flowType: 'not_found' as const },
      });

      expect(
        screen.getByRole('heading', {
          name: /There was an issue/i,
        })
      ).toBeInTheDocument();
    });
  });

  describe('general error (default fallback)', () => {
    it('renders the general error heading', async () => {
      await renderChurnError({ reason: 'unknown_reason' });

      expect(
        screen.getByRole('heading', {
          name: /There was an issue with renewing your subscription/i,
        })
      ).toBeInTheDocument();
    });

    it('renders contact support and try again links', async () => {
      await renderChurnError({ reason: 'unknown_reason' });

      expect(
        screen.getByRole('link', { name: /Contact Support/i })
      ).toHaveAttribute('href', 'https://support.mozilla.org');
      expect(screen.getByRole('link', { name: /Try again/i })).toHaveAttribute(
        'href',
        '/en/subscriptions/sub_123/loyalty-discount/stay-subscribed'
      );
    });

    it('renders general error when cmsOfferingContent is null', async () => {
      await renderChurnError({
        reason: 'discount_already_applied',
        cmsOfferingContent: null,
      });

      expect(
        screen.getByRole('heading', {
          name: /There was an issue/i,
        })
      ).toBeInTheDocument();
    });
  });
});
