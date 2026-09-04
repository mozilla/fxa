/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render } from '@testing-library/react';
import { SessionFactory } from '@fxa/payments/ui-auth/testing';
import {
  CancelFlowContentFactory,
  CmsChurnInterventionEntryFactory,
} from '@fxa/payments/management/testing';
import { SubscriptionParams } from '@fxa/payments/ui';
import LoyaltyDiscountCancelPage from './page';

jest.mock('@fxa/payments/customer', () => ({}));

const mockDetermineChurnCancelEligibilityAction = jest.fn();
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
const mockChurnCancel = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  determineChurnCancelEligibilityAction: (
    ...args: [string, ...unknown[]]
  ) => mockDetermineChurnCancelEligibilityAction(...args),
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
  ChurnCancel: (props: Record<string, unknown>) => {
    mockChurnCancel(props);
    return <div data-testid="churn-cancel" />;
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

const basePageContent = {
  churnCancelContentEligibility: {
    cmsOfferingContent: { successActionButtonUrl: 'https://vpn.mozilla.org' },
    reason: 'eligible',
    cmsChurnInterventionEntry: CmsChurnInterventionEntryFactory({
      apiIdentifier: 'vpn',
    }),
    isEligible: true,
  },
  cancelContent: CancelFlowContentFactory({
    productName: 'Mozilla VPN',
  }),
};

async function renderPage(
  paramsOverride?: Promise<SubscriptionParams>,
  searchParamsOverride?: Promise<Record<string, string>>
) {
  try {
    const jsx = await LoyaltyDiscountCancelPage({
      params: paramsOverride ?? defaultParams,
      searchParams: searchParamsOverride ?? defaultSearchParams,
    });
    return render(jsx);
  } catch (e) {
    if (e instanceof RedirectError) return;
    throw e;
  }
}

describe('LoyaltyDiscountCancelPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockAuth.mockResolvedValue(baseSession);
    mockDetermineChurnCancelEligibilityAction.mockResolvedValue(
      basePageContent
    );
  });

  it('redirects to cancel page when churn intervention is disabled', async () => {
    const { config } = require('apps/payments/next/config');
    config.churnInterventionConfig.enabled = false;

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/cancel`
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
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/loyalty-discount/cancel`
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
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/loyalty-discount/cancel`
    );
  });

  it('redirects to error when action throws', async () => {
    mockDetermineChurnCancelEligibilityAction.mockRejectedValue(
      new Error('action failed')
    );

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/loyalty-discount/cancel/error`
    );
  });

  it('redirects to error when pageContent is null', async () => {
    mockDetermineChurnCancelEligibilityAction.mockResolvedValue(null);

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/loyalty-discount/cancel/error`
    );
  });

  it('redirects to error when reason is not in the allowed set', async () => {
    mockDetermineChurnCancelEligibilityAction.mockResolvedValue({
      ...basePageContent,
      churnCancelContentEligibility: {
        ...basePageContent.churnCancelContentEligibility,
        reason: 'some_other_reason',
      },
    });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/loyalty-discount/cancel/error`
    );
  });

  it('redirects to error when cancelContent.flowType is not cancel', async () => {
    mockDetermineChurnCancelEligibilityAction.mockResolvedValue({
      ...basePageContent,
      cancelContent: {
        ...basePageContent.cancelContent,
        flowType: 'stay_subscribed',
      },
    });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/loyalty-discount/cancel/error`
    );
  });

  it('redirects to error when cmsChurnInterventionEntry is null', async () => {
    mockDetermineChurnCancelEligibilityAction.mockResolvedValue({
      ...basePageContent,
      churnCancelContentEligibility: {
        ...basePageContent.churnCancelContentEligibility,
        cmsChurnInterventionEntry: null,
      },
    });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/loyalty-discount/cancel/error`
    );
  });

  it('renders ChurnCancel with correct props when all conditions are met', async () => {
    await renderPage();

    expect(mockChurnCancel).toHaveBeenCalledWith({
      metricsEnabled: baseSession.user.metricsEnabled ?? true,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      locale: MOCK_LOCALE,
      reason: basePageContent.churnCancelContentEligibility.reason,
      cmsChurnInterventionEntry:
        basePageContent.churnCancelContentEligibility.cmsChurnInterventionEntry,
      cmsOfferingContent:
        basePageContent.churnCancelContentEligibility.cmsOfferingContent,
      cancelContent: basePageContent.cancelContent,
    });
  });

  it('passes subscriptionId and acceptLanguage to determineChurnCancelEligibilityAction', async () => {
    await renderPage();

    expect(mockDetermineChurnCancelEligibilityAction).toHaveBeenCalledWith(
      MOCK_SUBSCRIPTION_ID,
      'en-US'
    );
  });
});
