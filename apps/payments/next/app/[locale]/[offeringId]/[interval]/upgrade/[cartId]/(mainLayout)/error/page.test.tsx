/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FailCartDTOFactory } from '@fxa/payments/cart/testing';
import { SessionFactory } from '@fxa/payments/ui-auth/testing';
import UpgradeError from './page';

const mockGetCartOrRedirectAction = jest.fn();
const mockAuth = jest.fn();
const mockGetL10n = jest.fn();
const mockRedirect = jest.fn();
const mockHeaders = jest.fn();
const mockGetErrorFtlInfo = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  fetchCMSData: jest.fn(),
  getCartOrRedirectAction: (...args: unknown[]) =>
    mockGetCartOrRedirectAction(...args),
  getCartAction: jest.fn(),
  updateTaxAddressAction: jest.fn(),
}));

jest.mock('apps/payments/next/auth', () => ({
  __esModule: true,
  auth: () => mockAuth(),
}));

jest.mock('@fxa/payments/ui/server', () => ({
  __esModule: true,
  getApp: () => ({
    getL10n: (...args: unknown[]) => mockGetL10n(...args),
  }),
  SupportedPages: { ERROR: 'error' },
  buildPageMetadata: jest.fn(),
  CheckoutParams: {},
  getErrorFtlInfo: (...args: unknown[]) => mockGetErrorFtlInfo(...args),
}));

jest.mock('apps/payments/next/config', () => ({
  __esModule: true,
  config: {
    paymentsNextHostedUrl: 'https://payments.example.com',
    contentServerUrl: 'https://accounts.example.com',
    location: { subscriptionsUnsupportedLocations: [] },
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

// eslint-disable-next-line @next/next/no-img-element
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    className,
  }: {
    alt?: string;
    className?: string;
    src?: unknown;
    // eslint-disable-next-line @next/next/no-img-element
  }) => <img alt={alt ?? ''} className={className} src="mock-image" />,
}));

jest.mock('@fxa/shared/db/mysql/account', () => ({
  __esModule: true,
  CartState: {
    START: 'start',
    PROCESSING: 'processing',
    SUCCESS: 'success',
    NEEDS_INPUT: 'needs_input',
    FAIL: 'fail',
  },
}));

jest.mock('@fxa/payments/customer', () => ({
  __esModule: true,
  SubPlatPaymentMethodType: {
    PayPal: 'external_paypal',
    Stripe: 'stripe',
    Card: 'card',
    ApplePay: 'apple_pay',
    GooglePay: 'google_pay',
    Link: 'link',
  },
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  buildRedirectUrl: jest.fn(),
  getCardIcon: () => ({
    img: '/mock-card.svg',
    altText: 'Card',
    width: 40,
    height: 24,
  }),
  CartMutationProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  GleanRetentionResult: () => <div data-testid="glean-retention-result" />,
  Header: () => <div />,
  MetricsWrapper: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  PurchaseDetails: () => <div />,
  SelectTaxLocation: () => <div />,
}));

jest.mock(
  '@fxa/shared/assets/images/error.svg',
  () => ({ __esModule: true, default: 'error-icon.svg' }),
  { virtual: true }
);

const MOCK_USER_ID = 'user-123';
const MOCK_USER_EMAIL = 'user@example.com';
const MOCK_CART_ID = 'cart-abc';

const baseCart = FailCartDTOFactory({
  id: MOCK_CART_ID,
  uid: MOCK_USER_ID,
  errorReasonId: 'iap_upgrade_contact_support',
});

const baseSession = SessionFactory({ id: MOCK_USER_ID, email: MOCK_USER_EMAIL });

const mockL10n = {
  getString: (_id: string, ...rest: unknown[]) => {
    const fallback = rest.length === 1 ? rest[0] : rest[1];
    return typeof fallback === 'string' ? fallback : '';
  },
  getLocalizedCurrencyString: () => '$9.99',
  getLocalizedDate: () => 'Nov 14, 2023',
  getLocalizedDateString: () => 'Nov 14, 2023',
};

const defaultErrorFtlInfo = {
  messageFtl: 'error-ftl',
  message: 'An error occurred',
  buttonFtl: 'retry-ftl',
  buttonLabel: 'Try again',
  buttonUrl: 'https://payments.example.com/retry',
};

const defaultParams = Promise.resolve({
  locale: 'en',
  offeringId: 'offering-1',
  interval: 'monthly',
  cartId: MOCK_CART_ID,
});

const defaultSearchParams = Promise.resolve({});

async function renderPage(
  paramsOverride?: Promise<Record<string, string>>,
  searchParamsOverride?: Promise<Record<string, string | string[]>>
) {
  const jsx = await UpgradeError({
    params: (paramsOverride ?? defaultParams) as any,
    searchParams: (searchParamsOverride ?? defaultSearchParams) as any,
  });
  return render(jsx);
}

describe('UpgradeError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockGetCartOrRedirectAction.mockResolvedValue(baseCart);
    mockAuth.mockResolvedValue(baseSession);
    mockGetL10n.mockReturnValue(mockL10n);
    mockGetErrorFtlInfo.mockReturnValue(defaultErrorFtlInfo);
  });

  it('redirects when session uid does not match cart uid', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'different-user', email: 'other@example.com' },
    });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalled();
  });

  it('renders error message from cart errorReasonId', async () => {
    await renderPage();

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('shows retry button when error has buttonUrl', async () => {
    await renderPage();

    const retryLink = screen.getByRole('link', { name: 'Try again' });
    expect(retryLink).toHaveAttribute(
      'href',
      'https://payments.example.com/retry'
    );
  });

  it('does NOT show retry button when error has no buttonUrl', async () => {
    mockGetErrorFtlInfo.mockReturnValue({
      ...defaultErrorFtlInfo,
      buttonUrl: undefined,
    });

    await renderPage();

    expect(
      screen.queryByRole('link', { name: 'Try again' })
    ).not.toBeInTheDocument();
  });
});
