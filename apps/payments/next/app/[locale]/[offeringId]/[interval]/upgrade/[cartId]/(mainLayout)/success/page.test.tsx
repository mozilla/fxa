/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  InvoiceFactory,
  PaymentInfoFactory,
  SuccessCartDTOFactory,
} from '@fxa/payments/cart/testing';
import { SessionFactory } from '@fxa/payments/ui-auth/testing';
import {
  PageContentCommonContentResultFactory,
  PageContentOfferingTransformedFactory,
} from '@fxa/shared/cms/testing';
import UpgradeSuccess from './page';

const mockFetchCMSData = jest.fn();
const mockGetCartOrRedirectAction = jest.fn();
const mockAuth = jest.fn();
const mockGetL10n = jest.fn();
const mockRedirect = jest.fn();
const mockHeaders = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  fetchCMSData: (...args: unknown[]) => mockFetchCMSData(...args),
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
  SupportedPages: { SUCCESS: 'success' },
  buildPageMetadata: jest.fn(),
  CheckoutParams: {},
  SignedIn: () => <div />,
  SubscriptionTitle: () => <div />,
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
  CouponForm: () => <div />,
  GleanRetentionResult: () => <div data-testid="glean-retention-result" />,
  Header: () => <div />,
  MetricsWrapper: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  PurchaseDetails: () => <div />,
  SelectTaxLocation: () => <div />,
}));

const MOCK_USER_ID = 'user-123';
const MOCK_USER_EMAIL = 'user@example.com';
const MOCK_CART_ID = 'cart-abc';
const MOCK_INVOICE_NUMBER = 'INV-001';
const MOCK_SUCCESS_URL = 'https://download.example.com/app';
const MOCK_SUCCESS_LABEL = 'Download the app';

const mockCommonContent = PageContentCommonContentResultFactory({
  emailIcon: null,
  successActionButtonUrl: MOCK_SUCCESS_URL,
  successActionButtonLabel: MOCK_SUCCESS_LABEL,
  newsletterLabelTextCode: null,
  newsletterSlug: null,
});

const baseCmsData = PageContentOfferingTransformedFactory({
  commonContent: {
    ...mockCommonContent,
    localizations: [mockCommonContent],
  },
});

const mockInvoice = InvoiceFactory({
  number: MOCK_INVOICE_NUMBER,
  currency: 'usd',
});

const baseCart = SuccessCartDTOFactory({
  id: MOCK_CART_ID,
  uid: MOCK_USER_ID,
  upcomingInvoicePreview: mockInvoice,
  latestInvoicePreview: mockInvoice,
  paymentInfo: PaymentInfoFactory({
    type: 'card',
    brand: 'visa',
    last4: '4242',
  }),
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
  const jsx = await UpgradeSuccess({
    params: (paramsOverride ?? defaultParams) as any,
    searchParams: (searchParamsOverride ?? defaultSearchParams) as any,
  });
  return render(jsx);
}

describe('UpgradeSuccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockFetchCMSData.mockResolvedValue(baseCmsData);
    mockGetCartOrRedirectAction.mockResolvedValue(baseCart);
    mockAuth.mockResolvedValue(baseSession);
    mockGetL10n.mockReturnValue(mockL10n);
  });

  it('redirects when session is missing', async () => {
    mockAuth.mockResolvedValue(null);

    await renderPage();

    expect(mockRedirect).toHaveBeenCalled();
  });

  it('redirects when session uid does not match cart uid', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'different-user', email: 'other@example.com' },
    });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalled();
  });

  it('renders the confirmation heading', async () => {
    await renderPage();

    expect(
      screen.getByRole('heading', {
        name: 'Thanks, now check your email!',
      })
    ).toBeInTheDocument();
  });

  it('shows invoice number and date', async () => {
    await renderPage();

    expect(screen.getByText(/INV-001/)).toBeInTheDocument();
    expect(screen.getByText(/Nov 14, 2023/)).toBeInTheDocument();
  });

  it('shows card payment info with last4', async () => {
    await renderPage();

    expect(screen.getByText(/Card ending in 4242/)).toBeInTheDocument();
  });

  it('renders the success action button with the CMS-configured href', async () => {
    await renderPage();

    const button = screen.getByRole('button', { name: MOCK_SUCCESS_LABEL });
    expect(button.closest('a')).toHaveAttribute('href', MOCK_SUCCESS_URL);
  });

  it('falls back to default label when CMS successActionButtonLabel is empty', async () => {
    mockFetchCMSData.mockResolvedValue({
      ...baseCmsData,
      commonContent: {
        ...baseCmsData.commonContent,
        successActionButtonLabel: '',
        localizations: [
          {
            ...baseCmsData.commonContent.localizations[0],
            successActionButtonLabel: '',
          },
        ],
      },
    });

    await renderPage();

    const button = screen.getByRole('button', {
      name: 'Continue to download',
    });
    expect(button.closest('a')).toHaveAttribute('href', MOCK_SUCCESS_URL);
  });
});
