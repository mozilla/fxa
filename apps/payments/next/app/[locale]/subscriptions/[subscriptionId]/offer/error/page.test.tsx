/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SessionFactory } from '@fxa/payments/ui-auth/testing';
import {
  CancelFlowContentFactory,
  InterstitialOfferPageContentFactory,
} from '@fxa/payments/management/testing';
import { SubscriptionParams } from '@fxa/payments/ui';
import InterstitialOfferErrorPage from './page';

jest.mock('@fxa/payments/customer', () => ({}));

const mockGetInterstitialOfferContentAction = jest.fn();
const mockAuth = jest.fn();
class RedirectError extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT: ${url}`);
  }
}
const mockRedirect = jest.fn((...args: unknown[]) => {
  throw new RedirectError(args[0] as string);
});
const mockHeaders = jest.fn();
const mockGleanRetentionResult = jest.fn();
const mockGetL10n = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  getInterstitialOfferContentAction: (...args: [string, ...unknown[]]) =>
    mockGetInterstitialOfferContentAction(...args),
}));

jest.mock('apps/payments/next/auth', () => ({
  __esModule: true,
  auth: () => mockAuth(),
}));

jest.mock('apps/payments/next/config', () => ({
  __esModule: true,
  config: {
    paymentsNextHostedUrl: 'https://payments.example.com',
    churnInterventionConfig: { enabled: true },
  },
}));

jest.mock('next/navigation', () => ({
  __esModule: true,
  redirect: (...args: [string, ...unknown[]]) => mockRedirect(...args),
}));

jest.mock('next/headers', () => ({
  __esModule: true,
  headers: () => mockHeaders(),
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  GleanRetentionResult: (props: Record<string, unknown>) => {
    mockGleanRetentionResult(props);
    return <div data-testid="glean-retention-result" />;
  },
}));

jest.mock('@fxa/payments/ui/server', () => ({
  __esModule: true,
  getApp: () => ({ getL10n: mockGetL10n }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt?: string }) => <img alt={alt ?? ''} src="mock" />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock('@fxa/shared/react', () => ({
  __esModule: true,
  LinkExternal: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} data-testid="link-external">
      {children}
    </a>
  ),
}));

const MOCK_SUBSCRIPTION_ID = 'sub_abc123';
const MOCK_LOCALE = 'en';

const defaultParams = Promise.resolve({
  locale: MOCK_LOCALE,
  subscriptionId: MOCK_SUBSCRIPTION_ID,
});

const defaultSearchParams = Promise.resolve({});

const baseSession = SessionFactory();

const mockL10n = {
  getString: (_id: string, fallback: string) => fallback,
};

const baseOfferContent = {
  cancelContent: CancelFlowContentFactory({
    productName: 'Mozilla VPN',
    webIcon: 'icon.png',
    supportUrl: 'https://support.mozilla.org',
  }),
  pageContent: InterstitialOfferPageContentFactory({
    productName: 'Mozilla VPN',
    webIcon: 'icon.png',
  }),
  reason: 'subscription_not_active',
};

async function renderPage(
  paramsOverride?: Promise<SubscriptionParams>,
  searchParamsOverride?: Promise<Record<string, string>>
) {
  try {
    const jsx = await InterstitialOfferErrorPage({
      params: paramsOverride ?? defaultParams,
      searchParams: searchParamsOverride ?? defaultSearchParams,
    });
    return render(jsx);
  } catch (e) {
    if (e instanceof RedirectError) return;
    throw e;
  }
}

describe('InterstitialOfferErrorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockAuth.mockResolvedValue(baseSession);
    mockGetInterstitialOfferContentAction.mockResolvedValue(baseOfferContent);
    mockGetL10n.mockReturnValue(mockL10n);
  });

  it('redirects to landing page when churn intervention is disabled', async () => {
    const configMock = jest.requireMock('apps/payments/next/config');
    configMock.config.churnInterventionConfig.enabled = false;

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/landing`
    );

    configMock.config.churnInterventionConfig.enabled = true;
  });

  it('redirects unauthenticated users to the landing page', async () => {
    mockAuth.mockResolvedValue(null);

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://payments.example.com/en/subscriptions/landing'
      )
    );
  });

  it('redirects to offer page when reason is eligible', async () => {
    mockGetInterstitialOfferContentAction.mockResolvedValue({
      ...baseOfferContent,
      reason: 'eligible',
    });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/offer`
    );
  });

  it('renders subscription not found heading for subscription_not_active reason', async () => {
    await renderPage();

    expect(
      screen.getByRole('heading', {
        name: 'We couldn’t find an active subscription',
      })
    ).toBeInTheDocument();
  });

  it('renders customer mismatch heading for customer_mismatch reason', async () => {
    mockGetInterstitialOfferContentAction.mockResolvedValue({
      ...baseOfferContent,
      reason: 'customer_mismatch',
    });

    await renderPage();

    expect(
      screen.getByRole('heading', {
        name: 'This subscription is not associated with your account',
      })
    ).toBeInTheDocument();
  });

  it('renders general error heading for unknown reason', async () => {
    mockGetInterstitialOfferContentAction.mockResolvedValue({
      ...baseOfferContent,
      reason: 'some_unknown_reason',
    });

    await renderPage();

    expect(
      screen.getByRole('heading', {
        name: 'Offer isn’t available',
      })
    ).toBeInTheDocument();
  });

  it('renders GleanRetentionResult with eventType interstitial_offer', async () => {
    await renderPage();

    expect(mockGleanRetentionResult).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'interstitial_offer',
        flowType: 'cancel',
        eligibilityStatus: 'not_eligible',
        outcome: 'error',
        errorReason: 'subscription_not_active',
      })
    );
  });

  it('shows Continue to cancel link for general error', async () => {
    mockGetInterstitialOfferContentAction.mockResolvedValue({
      ...baseOfferContent,
      reason: 'general_error',
    });

    await renderPage();

    expect(
      screen.getByRole('link', { name: 'Continue to cancel' })
    ).toHaveAttribute(
      'href',
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/cancel`
    );
  });
});
