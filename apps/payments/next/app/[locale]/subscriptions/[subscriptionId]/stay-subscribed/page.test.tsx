/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render } from '@testing-library/react';
import { SessionFactory } from '@fxa/payments/ui-auth/testing';
import StaySubscribedPage from './page';

const mockGetStaySubscribedFlowContentAction = jest.fn();
const mockAuth = jest.fn();
const mockRedirect = jest.fn();
const mockNotFound = jest.fn();
const mockHeaders = jest.fn();
const mockStaySubscribed = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  getStaySubscribedFlowContentAction: (...args: unknown[]) =>
    mockGetStaySubscribedFlowContentAction(...args),
}));

jest.mock('apps/payments/next/auth', () => ({
  __esModule: true,
  auth: () => mockAuth(),
}));

jest.mock('apps/payments/next/config', () => ({
  __esModule: true,
  config: {
    paymentsNextHostedUrl: 'https://payments.example.com',
  },
}));

jest.mock('next/navigation', () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => mockRedirect(...args),
  notFound: (...args: unknown[]) => mockNotFound(...args),
}));

jest.mock('next/headers', () => ({
  __esModule: true,
  headers: () => mockHeaders(),
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  StaySubscribed: (props: Record<string, unknown>) => {
    mockStaySubscribed(props);
    return <div data-testid="stay-subscribed" />;
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
  flowType: 'stay_subscribed',
  productName: 'Test Product',
};

async function renderPage(
  paramsOverride?: Promise<Record<string, string>>,
  searchParamsOverride?: Promise<Record<string, string>>
) {
  const jsx = await StaySubscribedPage({
    params: (paramsOverride ?? defaultParams) as any,
    searchParams: (searchParamsOverride ?? defaultSearchParams) as any,
  });
  return render(jsx);
}

describe('StaySubscribedPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockAuth.mockResolvedValue(baseSession);
    mockGetStaySubscribedFlowContentAction.mockResolvedValue(basePageContent);
  });

  it('redirects unauthenticated users to the landing page', async () => {
    mockAuth.mockResolvedValue(null);

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      'https://payments.example.com/en/subscriptions/landing'
    );
  });

  it('redirects users with no session user id to the landing page', async () => {
    mockAuth.mockResolvedValue({ user: { id: undefined } });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      'https://payments.example.com/en/subscriptions/landing'
    );
  });

  it('preserves search params in the redirect URL for unauthenticated users', async () => {
    mockAuth.mockResolvedValue(null);

    await renderPage(
      defaultParams,
      Promise.resolve({ utm_source: 'email', plan: 'pro' })
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      'https://payments.example.com/en/subscriptions/landing?utm_source=email&plan=pro'
    );
  });

  it('calls notFound when pageContent.flowType is not_found', async () => {
    mockGetStaySubscribedFlowContentAction.mockResolvedValue({
      flowType: 'not_found',
    });

    await renderPage();

    expect(mockNotFound).toHaveBeenCalled();
  });

  it('renders StaySubscribed component with correct props', async () => {
    await renderPage();

    expect(mockStaySubscribed).toHaveBeenCalledWith({
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      locale: MOCK_LOCALE,
      pageContent: basePageContent,
    });
  });

  it('passes subscriptionId and acceptLanguage to getStaySubscribedFlowContentAction', async () => {
    await renderPage();

    expect(mockGetStaySubscribedFlowContentAction).toHaveBeenCalledWith(
      MOCK_SUBSCRIPTION_ID,
      'en-US'
    );
  });
});
