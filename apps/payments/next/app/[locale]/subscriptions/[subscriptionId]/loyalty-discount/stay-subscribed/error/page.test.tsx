/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from '@testing-library/react';
import { SessionFactory } from '@fxa/payments/ui-auth/testing';
import { CmsOfferingContentFactory } from '@fxa/payments/management/testing';
import { SubscriptionParams } from '@fxa/payments/ui';
import LoyaltyDiscountStaySubscribedErrorPage from './page';

jest.mock('@fxa/payments/customer', () => ({}));

const mockDetermineStaySubscribedEligibilityAction = jest.fn();
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
const mockChurnError = jest.fn();
const mockGleanRetentionResult = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  determineStaySubscribedEligibilityAction: (
    ...args: [string, ...unknown[]]
  ) => mockDetermineStaySubscribedEligibilityAction(...args),
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
  redirect: (...args: unknown[]) => mockRedirect(...args),
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
  ChurnError: (props: Record<string, unknown>) => {
    mockChurnError(props);
    return <div data-testid="churn-error" />;
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
  churnStaySubscribedEligibility: {
    cmsOfferingContent: CmsOfferingContentFactory({
      productName: 'Mozilla VPN',
      successActionButtonUrl: 'https://vpn.mozilla.org',
      supportUrl: 'https://support.mozilla.org',
      webIcon: 'icon.png',
    }),
    reason: 'discount_already_applied',
    isEligible: false,
  },
  staySubscribedContent: {
    flowType: 'stay_subscribed',
    active: true,
    cancelAtPeriodEnd: false,
    productName: 'Mozilla VPN',
  },
};

async function renderPage(
  paramsOverride?: Promise<SubscriptionParams>,
  searchParamsOverride?: Promise<Record<string, string>>
) {
  try {
    const jsx = await LoyaltyDiscountStaySubscribedErrorPage({
      params: paramsOverride ?? defaultParams,
      searchParams: searchParamsOverride ?? defaultSearchParams,
    });
    return render(jsx);
  } catch (e) {
    if (e instanceof RedirectError) return;
    throw e;
  }
}

describe('LoyaltyDiscountStaySubscribedErrorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockAuth.mockResolvedValue(baseSession);
    mockDetermineStaySubscribedEligibilityAction.mockResolvedValue(
      basePageContent
    );
  });

  it('redirects to stay-subscribed page when churn intervention is disabled', async () => {
    const configMock = jest.requireMock('apps/payments/next/config');
    configMock.config.churnInterventionConfig.enabled = false;

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/stay-subscribed`
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

  it('renders ChurnError with general_error when action throws', async () => {
    mockDetermineStaySubscribedEligibilityAction.mockRejectedValue(
      new Error('Server error')
    );

    await renderPage();

    expect(mockChurnError).toHaveBeenCalledWith(
      expect.objectContaining({
        cmsOfferingContent: undefined,
        locale: MOCK_LOCALE,
        reason: 'general_error',
        pageContent: { flowType: 'not_found' },
        subscriptionId: MOCK_SUBSCRIPTION_ID,
      })
    );
  });

  it('renders ChurnError with general_error when pageContent is null', async () => {
    mockDetermineStaySubscribedEligibilityAction.mockResolvedValue(null);

    await renderPage();

    expect(mockChurnError).toHaveBeenCalledWith(
      expect.objectContaining({
        cmsOfferingContent: undefined,
        locale: MOCK_LOCALE,
        reason: 'general_error',
        pageContent: { flowType: 'not_found' },
        subscriptionId: MOCK_SUBSCRIPTION_ID,
      })
    );
  });

  it('redirects to stay-subscribed page when isEligible is true', async () => {
    mockDetermineStaySubscribedEligibilityAction.mockResolvedValue({
      ...basePageContent,
      churnStaySubscribedEligibility: {
        ...basePageContent.churnStaySubscribedEligibility,
        isEligible: true,
      },
    });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/loyalty-discount/stay-subscribed`
    );
  });

  it('renders GleanRetentionResult with flowType stay', async () => {
    await renderPage();

    expect(mockGleanRetentionResult).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'retention_flow',
        flowType: 'stay',
        eligibilityStatus: 'not_eligible',
        outcome: 'error',
        errorReason: 'discount_already_applied',
      })
    );
  });

  it('renders ChurnError with correct reason and staySubscribedContent', async () => {
    await renderPage();

    expect(mockChurnError).toHaveBeenCalledWith(
      expect.objectContaining({
        cmsOfferingContent:
          basePageContent.churnStaySubscribedEligibility.cmsOfferingContent,
        locale: MOCK_LOCALE,
        reason: 'discount_already_applied',
        pageContent: basePageContent.staySubscribedContent,
        subscriptionId: MOCK_SUBSCRIPTION_ID,
      })
    );
  });

  it('renders ChurnError fallback when staySubscribedContent flowType is not stay_subscribed', async () => {
    mockDetermineStaySubscribedEligibilityAction.mockResolvedValue({
      ...basePageContent,
      staySubscribedContent: { flowType: 'not_found' },
    });

    await renderPage();

    expect(mockChurnError).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: 'discount_already_applied',
        pageContent: { flowType: 'not_found' },
        subscriptionId: MOCK_SUBSCRIPTION_ID,
      })
    );
  });

  it('renders ChurnError fallback when cmsOfferingContent is null', async () => {
    mockDetermineStaySubscribedEligibilityAction.mockResolvedValue({
      ...basePageContent,
      churnStaySubscribedEligibility: {
        ...basePageContent.churnStaySubscribedEligibility,
        cmsOfferingContent: null,
        isEligible: false,
      },
    });

    await renderPage();

    expect(mockChurnError).toHaveBeenCalledWith(
      expect.objectContaining({
        cmsOfferingContent: null,
        reason: 'discount_already_applied',
        pageContent: basePageContent.staySubscribedContent,
        subscriptionId: MOCK_SUBSCRIPTION_ID,
      })
    );
  });
});
