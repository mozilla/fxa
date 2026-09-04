/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render } from '@testing-library/react';
import { SessionFactory } from '@fxa/payments/ui-auth/testing';
import {
  CancelFlowContentFactory,
  InterstitialOfferPageContentFactory,
} from '@fxa/payments/management/testing';
import { SubscriptionParams } from '@fxa/payments/ui';
import InterstitialOfferPage from './page';

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
const mockNotFound = jest.fn();
const mockHeaders = jest.fn();
const mockInterstitialOffer = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  getInterstitialOfferContentAction: (
    ...args: [string, ...unknown[]]
  ) => mockGetInterstitialOfferContentAction(...args),
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
  notFound: (...args: [string, ...unknown[]]) => mockNotFound(...args),
}));

jest.mock('next/headers', () => ({
  __esModule: true,
  headers: () => mockHeaders(),
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  InterstitialOffer: (props: Record<string, unknown>) => {
    mockInterstitialOffer(props);
    return <div data-testid="interstitial-offer" />;
  },
}));

const MOCK_SUBSCRIPTION_ID = 'sub_abc123';
const MOCK_LOCALE = 'en';

const defaultParams = Promise.resolve({
  locale: MOCK_LOCALE,
  subscriptionId: MOCK_SUBSCRIPTION_ID,
});

const defaultSearchParams = Promise.resolve({});

const baseSession = SessionFactory();

const baseOfferContent = {
  pageContent: InterstitialOfferPageContentFactory({
    currentInterval: 'monthly',
    productName: 'Mozilla VPN',
    webIcon: 'icon.png',
  }),
  cancelContent: CancelFlowContentFactory({
    productName: 'Mozilla VPN',
    webIcon: 'icon.png',
    supportUrl: 'https://support.mozilla.org',
  }),
};

async function renderPage(
  paramsOverride?: Promise<SubscriptionParams>,
  searchParamsOverride?: Promise<Record<string, string>>
) {
  try {
    const jsx = await InterstitialOfferPage({
      params: paramsOverride ?? defaultParams,
      searchParams: searchParamsOverride ?? defaultSearchParams,
    });
    return render(jsx);
  } catch (e) {
    if (e instanceof RedirectError) return;
    throw e;
  }
}

describe('InterstitialOfferPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockAuth.mockResolvedValue(baseSession);
    mockGetInterstitialOfferContentAction.mockResolvedValue(baseOfferContent);
  });

  it('redirects to subscriptions landing when churn intervention is disabled', async () => {
    const { config } = require('apps/payments/next/config');
    config.churnInterventionConfig.enabled = false;

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/landing`
    );

    config.churnInterventionConfig.enabled = true;
  });

  it('redirects unauthenticated users with redirect_to param', async () => {
    mockAuth.mockResolvedValue(null);

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://payments.example.com/en/subscriptions/landing'
      )
    );
    const redirectUrl = new URL(mockRedirect.mock.calls[0][0] as string);
    expect(redirectUrl.searchParams.get('redirect_to')).toBe(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/offer`
    );
  });

  it('preserves search params in the redirect URL for unauthenticated users', async () => {
    mockAuth.mockResolvedValue(null);

    await renderPage(
      defaultParams,
      Promise.resolve({ utm_source: 'email', plan: 'pro' })
    );

    const redirectUrl = new URL(mockRedirect.mock.calls[0][0] as string);
    expect(redirectUrl.searchParams.get('utm_source')).toBe('email');
    expect(redirectUrl.searchParams.get('plan')).toBe('pro');
    expect(redirectUrl.searchParams.get('redirect_to')).toBe(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/offer`
    );
  });

  it('redirects to error when action throws', async () => {
    mockGetInterstitialOfferContentAction.mockRejectedValue(
      new Error('action failed')
    );

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/offer/error`
    );
  });

  it('redirects to error when cancelContent.flowType is not_found', async () => {
    mockGetInterstitialOfferContentAction.mockResolvedValue({
      ...baseOfferContent,
      cancelContent: {
        ...baseOfferContent.cancelContent,
        flowType: 'not_found',
      },
    });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/offer/error`
    );
  });

  it('redirects to error when there is no offer and not cancelAtPeriodEnd', async () => {
    mockGetInterstitialOfferContentAction.mockResolvedValue({
      pageContent: null,
      cancelContent: {
        ...baseOfferContent.cancelContent,
        cancelAtPeriodEnd: false,
      },
    });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/offer/error`
    );
  });

  it('renders InterstitialOffer with correct props including entrypoint in searchParams', async () => {
    await renderPage();

    expect(mockInterstitialOffer).toHaveBeenCalledWith({
      metricsEnabled: baseSession.user.metricsEnabled ?? true,
      locale: MOCK_LOCALE,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      pageContent: baseOfferContent.pageContent,
      cancelContent: baseOfferContent.cancelContent,
      searchParams: { entrypoint: 'subscription-management' },
    });
  });

  it('merges existing search params with entrypoint', async () => {
    await renderPage(
      defaultParams,
      Promise.resolve({ utm_source: 'email' })
    );

    expect(mockInterstitialOffer).toHaveBeenCalledWith(
      expect.objectContaining({
        searchParams: {
          utm_source: 'email',
          entrypoint: 'subscription-management',
        },
      })
    );
  });

  it('passes subscriptionId, acceptLanguage, and locale to getInterstitialOfferContentAction', async () => {
    await renderPage();

    expect(mockGetInterstitialOfferContentAction).toHaveBeenCalledWith(
      MOCK_SUBSCRIPTION_ID,
      'en-US',
      MOCK_LOCALE
    );
  });
});
