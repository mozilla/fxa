/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SessionFactory } from '@fxa/payments/ui-auth/testing';
import { CmsOfferingContentFactory } from '@fxa/payments/management/testing';
import { SubscriptionParams } from '@fxa/payments/ui';
import LoyaltyDiscountCancelErrorPage from './page';

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
const mockHeaders = jest.fn();
const mockChurnError = jest.fn();
const mockGleanRetentionResult = jest.fn();
const mockGetL10n = jest.fn();

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
  ChurnError: (props: Record<string, unknown>) => {
    mockChurnError(props);
    return <div data-testid="churn-error" />;
  },
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

const basePageContent = {
  churnCancelContentEligibility: {
    cmsOfferingContent: CmsOfferingContentFactory({
      productName: 'Mozilla VPN',
      successActionButtonUrl: 'https://vpn.mozilla.org',
      supportUrl: 'https://support.mozilla.org',
      webIcon: 'icon.png',
    }),
    reason: 'discount_already_applied',
    cmsChurnInterventionEntry: null,
    isEligible: false,
  },
  cancelContent: {
    flowType: 'cancel',
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
    const jsx = await LoyaltyDiscountCancelErrorPage({
      params: paramsOverride ?? defaultParams,
      searchParams: searchParamsOverride ?? defaultSearchParams,
    });
    return render(jsx);
  } catch (e) {
    if (e instanceof RedirectError) return;
    throw e;
  }
}

describe('LoyaltyDiscountCancelErrorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockAuth.mockResolvedValue(baseSession);
    mockDetermineChurnCancelEligibilityAction.mockResolvedValue(basePageContent);
    mockGetL10n.mockReturnValue(mockL10n);
  });

  it('redirects to cancel page when churn intervention is disabled', async () => {
    const { config } = require('apps/payments/next/config');
    config.churnInterventionConfig.enabled = false;

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/cancel`
    );

    // Restore enabled state for other tests
    config.churnInterventionConfig.enabled = true;
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
    mockDetermineChurnCancelEligibilityAction.mockRejectedValue(
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
    mockDetermineChurnCancelEligibilityAction.mockResolvedValue(null);

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

  it('redirects to cancel page when isEligible is true', async () => {
    mockDetermineChurnCancelEligibilityAction.mockResolvedValue({
      ...basePageContent,
      churnCancelContentEligibility: {
        ...basePageContent.churnCancelContentEligibility,
        isEligible: true,
      },
    });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/loyalty-discount/cancel`
    );
  });

  it('renders offer expired UI for no_churn_intervention_found reason', async () => {
    mockDetermineChurnCancelEligibilityAction.mockResolvedValue({
      ...basePageContent,
      churnCancelContentEligibility: {
        ...basePageContent.churnCancelContentEligibility,
        reason: 'no_churn_intervention_found',
      },
    });

    await renderPage();

    expect(screen.getByText('This offer has expired')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Continue to cancel' })
    ).toHaveAttribute(
      'href',
      `/${MOCK_LOCALE}/subscriptions/${MOCK_SUBSCRIPTION_ID}/cancel`
    );
    expect(
      screen.getByRole('link', { name: 'Back to subscriptions' })
    ).toHaveAttribute('href', `/${MOCK_LOCALE}/subscriptions/landing`);
  });

  it('renders GleanRetentionResult and ChurnError for other error reasons', async () => {
    await renderPage();

    expect(mockGleanRetentionResult).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'retention_flow',
        flowType: 'cancel',
        eligibilityStatus: 'not_eligible',
        outcome: 'error',
        errorReason: 'discount_already_applied',
      })
    );
    expect(mockChurnError).toHaveBeenCalledWith(
      expect.objectContaining({
        cmsOfferingContent:
          basePageContent.churnCancelContentEligibility.cmsOfferingContent,
        locale: MOCK_LOCALE,
        reason: 'discount_already_applied',
        pageContent: basePageContent.cancelContent,
        subscriptionId: MOCK_SUBSCRIPTION_ID,
      })
    );
  });

  it('renders ChurnError when cancelContent.flowType is not cancel', async () => {
    mockDetermineChurnCancelEligibilityAction.mockResolvedValue({
      ...basePageContent,
      cancelContent: {
        ...basePageContent.cancelContent,
        flowType: 'not_found',
      },
    });

    await renderPage();

    expect(mockGleanRetentionResult).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'retention_flow',
        flowType: 'cancel',
        eligibilityStatus: 'not_eligible',
        outcome: 'error',
      })
    );
    expect(mockChurnError).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: MOCK_LOCALE,
        reason: 'discount_already_applied',
        subscriptionId: MOCK_SUBSCRIPTION_ID,
      })
    );
  });
});
