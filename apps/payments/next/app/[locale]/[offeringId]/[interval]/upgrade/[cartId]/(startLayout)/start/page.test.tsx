/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubPlatPaymentMethodType } from '@fxa/payments/customer';
import UpgradeStart from './page';

const mockFetchCMSData = jest.fn();
const mockGetCartOrRedirectAction = jest.fn();
const mockAuth = jest.fn();
const mockGetL10n = jest.fn();
const mockHeaders = jest.fn();
const mockPaymentSection = jest.fn();

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
  SupportedPages: { START: 'start' },
  buildPageMetadata: jest.fn(),
  CheckoutParams: {},
  SignedIn: ({ email }: { email: string }) => (
    <div data-testid="signed-in">{email}</div>
  ),
  SubscriptionTitle: () => <div />,
}));

jest.mock('apps/payments/next/config', () => ({
  __esModule: true,
  config: {
    paymentsNextHostedUrl: 'https://payments.example.com',
    contentServerUrl: 'https://accounts.example.com',
    paypal: { clientId: 'paypal-client-id' },
    location: { subscriptionsUnsupportedLocations: [] },
  },
}));

jest.mock('next/navigation', () => ({
  __esModule: true,
  redirect: jest.fn(),
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
  Header: () => <div />,
  MetricsWrapper: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  PaymentSection: (props: Record<string, unknown>) => {
    mockPaymentSection(props);
    return <div data-testid="payment-section" />;
  },
  PurchaseDetails: () => <div />,
  SelectTaxLocation: () => <div />,
}));

const MOCK_USER_ID = 'user-123';
const MOCK_USER_EMAIL = 'user@example.com';
const MOCK_CART_ID = 'cart-abc';
const MOCK_INVOICE_NUMBER = 'INV-001';

const baseCmsData = {
  apiIdentifier: 'offering-1',
  countries: ['US'],
  stripeProductId: 'prod_test',
  defaultPurchase: {
    purchaseDetails: {
      details: ['Detail 1'],
      productName: 'Test Product',
      subtitle: null,
      webIcon: 'https://example.com/icon.png',
      localizations: [],
    },
  },
  commonContent: {
    privacyNoticeUrl: 'https://example.com/privacy',
    privacyNoticeDownloadUrl: 'https://example.com/privacy-download',
    termsOfServiceUrl: 'https://example.com/terms',
    termsOfServiceDownloadUrl: 'https://example.com/terms-download',
    cancellationUrl: 'https://example.com/cancel',
    emailIcon: null,
    successActionButtonUrl: 'https://example.com/success',
    successActionButtonLabel: 'Download the app',
    newsletterLabelTextCode: null,
    newsletterSlug: null,
    localizations: [],
  },
};

const baseCart = {
  id: MOCK_CART_ID,
  uid: MOCK_USER_ID,
  createdAt: 1_700_000_000_000,
  version: 1,
  interval: 'monthly',
  offeringPrice: 999,
  amount: 999,
  metricsOptedOut: false,
  currency: 'usd',
  couponCode: null,
  taxAddress: { countryCode: 'US', postalCode: '94107' },
  freeTrialOffer: null,
  freeTrialUserEligible: false,
  isUpgradeFromTrial: false,
  upcomingInvoicePreview: {
    number: MOCK_INVOICE_NUMBER,
    currency: 'usd',
    amountDue: 999,
    totalAmount: 999,
    nextInvoiceDate: 1_703_000_000,
    creditApplied: null,
    startingBalance: 0,
  },
  latestInvoicePreview: {
    number: MOCK_INVOICE_NUMBER,
    currency: 'usd',
    amountDue: 999,
    totalAmount: 999,
    nextInvoiceDate: 1_703_000_000,
    creditApplied: null,
    startingBalance: 0,
  },
  paymentInfo: {
    type: 'card' as SubPlatPaymentMethodType,
    brand: 'visa',
    last4: '4242',
  },
};

const baseSession = {
  user: {
    id: MOCK_USER_ID,
    email: MOCK_USER_EMAIL,
    metricsEnabled: true,
  },
};

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
  const jsx = await UpgradeStart({
    params: (paramsOverride ?? defaultParams) as any,
    searchParams: (searchParamsOverride ?? defaultSearchParams) as any,
  });
  return render(jsx);
}

describe('UpgradeStart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: (name: string) => {
        if (name === 'accept-language') return 'en-US';
        if (name === 'x-nonce') return 'test-nonce';
        return null;
      },
    });
    mockFetchCMSData.mockResolvedValue(baseCmsData);
    mockGetCartOrRedirectAction.mockResolvedValue(baseCart);
    mockAuth.mockResolvedValue(baseSession);
    mockGetL10n.mockReturnValue(mockL10n);
  });

  it('renders the "Payment information" heading', async () => {
    await renderPage();

    expect(
      screen.getByRole('heading', { name: 'Payment information' })
    ).toBeInTheDocument();
  });

  it('shows card ending in last4 when payment info is card type', async () => {
    await renderPage();

    expect(screen.getByText(/Card ending in 4242/)).toBeInTheDocument();
  });

  it('shows wallet icon when payment info has walletType', async () => {
    mockGetCartOrRedirectAction.mockResolvedValue({
      ...baseCart,
      paymentInfo: {
        type: 'external_paypal' as SubPlatPaymentMethodType,
        walletType: 'paypal',
        brand: null,
        last4: null,
      },
    });

    await renderPage();

    // Wallet branch renders an Image with the card icon alt text
    const walletIcon = screen.getByAltText('Card');
    expect(walletIcon).toBeInTheDocument();
    // Should NOT show "Card ending in" text for wallet payments
    expect(screen.queryByText(/Card ending in/)).not.toBeInTheDocument();
  });

  it('shows trial upgrade acknowledgment when isUpgradeFromTrial is true', async () => {
    mockGetCartOrRedirectAction.mockResolvedValue({
      ...baseCart,
      isUpgradeFromTrial: true,
    });

    await renderPage();

    expect(
      screen.getByText(
        /By upgrading, your active free trial will end immediately/
      )
    ).toBeInTheDocument();
  });

  it('shows standard upgrade acknowledgment when isUpgradeFromTrial is false', async () => {
    await renderPage();

    expect(
      screen.getByText(/Your plan will change immediately/)
    ).toBeInTheDocument();
  });

  it('shows PaymentSection when cart has currency and taxAddress', async () => {
    await renderPage();

    expect(screen.getByTestId('payment-section')).toBeInTheDocument();
  });

  it('does NOT show PaymentSection when cart currency is missing', async () => {
    mockGetCartOrRedirectAction.mockResolvedValue({
      ...baseCart,
      currency: null,
    });

    await renderPage();

    expect(screen.queryByTestId('payment-section')).not.toBeInTheDocument();
  });
});
