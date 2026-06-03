/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import { SubPlatPaymentMethodType } from '@fxa/payments/customer';
import Manage from './page';

const mockGetSubManPageContentAction = jest.fn();
const mockGetExperimentsAction = jest.fn();
const mockAuth = jest.fn();
const mockGetL10n = jest.fn();
const mockRedirect = jest.fn();
const mockHeaders = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  getSubManPageContentAction: (...args: unknown[]) =>
    mockGetSubManPageContentAction(...args),
  getExperimentsAction: (...args: unknown[]) =>
    mockGetExperimentsAction(...args),
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
}));

jest.mock('apps/payments/next/config', () => ({
  __esModule: true,
  config: {
    paymentsNextHostedUrl: 'https://payments.example.com',
    contentServerUrl: 'https://accounts.example.com',
    csp: {
      paypalApi: 'https://paypal.example.com',
    },
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

const mockBanner = jest.fn();
const mockSubscriptionContent = jest.fn();
const mockFreeTrialContent = jest.fn();
const mockGleanPageView = jest.fn();

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  Banner: (props: Record<string, unknown>) => {
    mockBanner(props);
    return <div data-testid="banner">{props.children as React.ReactNode}</div>;
  },
  BannerVariant: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
    Info: 'info',
  },
  formatPlanInterval: (interval: string) => `Every ${interval}`,
  getCardIcon: () => ({
    img: '/mock-card.svg',
    altText: 'Card',
    width: 40,
    height: 24,
  }),
  GleanPageView: (props: Record<string, unknown>) => {
    mockGleanPageView(props);
    return <div data-testid="glean-page-view" />;
  },
  ManageParams: {},
  SubscriptionContent: (props: Record<string, unknown>) => {
    mockSubscriptionContent(props);
    return <div data-testid="subscription-content" />;
  },
  FreeTrialContent: (props: Record<string, unknown>) => {
    mockFreeTrialContent(props);
    return <div data-testid="free-trial-content" />;
  },
}));

jest.mock('@fxa/shared/react', () => ({
  __esModule: true,
  LinkExternal: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock(
  '@fxa/shared/assets/images/alert-yellow.svg',
  () => ({ __esModule: true, default: 'alert-yellow.svg' }),
  { virtual: true }
);
jest.mock(
  '@fxa/shared/assets/images/arrow-down.svg',
  () => ({ __esModule: true, default: 'arrow-down.svg' }),
  { virtual: true }
);
jest.mock(
  '@fxa/shared/assets/images/apple-logo.svg',
  () => ({ __esModule: true, default: 'apple-logo.svg' }),
  { virtual: true }
);
jest.mock(
  '@fxa/shared/assets/images/google-logo.svg',
  () => ({ __esModule: true, default: 'google-logo.svg' }),
  { virtual: true }
);
jest.mock(
  '@fxa/shared/assets/images/new-window.svg',
  () => ({ __esModule: true, default: 'new-window.svg' }),
  { virtual: true }
);

const MOCK_USER_ID = 'user-123';
const MOCK_USER_EMAIL = 'user@example.com';
const MOCK_PRODUCT_NAME = 'Mozilla VPN';
const MOCK_SUPPORT_URL = 'https://support.example.com/vpn';
const MOCK_WEB_ICON = 'https://example.com/icon.png';

const mockL10n = {
  getString: (_id: string, ...rest: unknown[]) => {
    const fallback = rest.length === 1 ? rest[0] : rest[1];
    return typeof fallback === 'string' ? fallback : '';
  },
  getLocalizedCurrencyString: () => '$5.00',
  getLocalizedDate: () => 'Nov 14, 2023',
  getLocalizedDateString: () => 'Nov 14, 2023',
  getLocalizedMonthYearString: () => '12/2025',
  getFragmentWithSource: (
    _id: string,
    _opts: unknown,
    fallback: React.ReactNode
  ) => fallback,
};

const baseSession = {
  user: {
    id: MOCK_USER_ID,
    email: MOCK_USER_EMAIL,
    metricsEnabled: true,
  },
};

const basePageContent = {
  accountCreditBalance: { balance: 0, currency: 'usd' },
  defaultPaymentMethod: undefined,
  isStripeCustomer: false,
  subscriptions: [],
  appleIapSubscriptions: [],
  googleIapSubscriptions: [],
  trialSubscriptions: [],
};

const baseSub = {
  productName: MOCK_PRODUCT_NAME,
  interval: 'monthly',
  supportUrl: MOCK_SUPPORT_URL,
  webIcon: MOCK_WEB_ICON,
  couponCode: null,
  nextInvoiceDate: 1_703_000_000,
  amount: 999,
  currency: 'usd',
};

const baseAppleIap = {
  productName: 'Apple VPN',
  webIcon: MOCK_WEB_ICON,
  supportUrl: MOCK_SUPPORT_URL,
  storeId: 'apple-store-123',
  expiresDate: 1_703_000_000_000,
};

const baseGoogleIap = {
  productName: 'Google VPN',
  webIcon: MOCK_WEB_ICON,
  supportUrl: MOCK_SUPPORT_URL,
  storeId: 'google-store-456',
  expiryTimeMillis: 1_703_000_000_000,
  autoRenewing: true,
  sku: 'vpn_monthly',
  packageName: 'org.mozilla.vpn',
};

const defaultParams = Promise.resolve({ locale: 'en' });
const defaultSearchParams = Promise.resolve({});

async function renderPage(
  paramsOverride?: Promise<Record<string, string>>,
  searchParamsOverride?: Promise<Record<string, string | string[]>>
) {
  const jsx = await Manage({
    params: (paramsOverride ?? defaultParams) as any,
    searchParams: (searchParamsOverride ?? defaultSearchParams) as any,
  });
  return render(jsx);
}

describe('Manage subscription page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockAuth.mockResolvedValue(baseSession);
    mockGetL10n.mockReturnValue(mockL10n);
    mockGetExperimentsAction.mockResolvedValue({ Features: {} });
    mockGetSubManPageContentAction.mockResolvedValue(basePageContent);
  });

  it('redirects unauthenticated users to the landing page', async () => {
    mockAuth.mockResolvedValue(null);

    await renderPage();

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/en/subscriptions/landing')
    );
  });

  it('renders the "Subscriptions" heading', async () => {
    await renderPage();

    expect(
      screen.getByRole('heading', { name: 'Subscriptions' })
    ).toBeInTheDocument();
  });

  it('shows "no active subscriptions" empty state when subscriptions array is empty', async () => {
    await renderPage();

    expect(
      screen.getByText('You have no active subscriptions')
    ).toBeInTheDocument();
    expect(
      screen.getByText('New subscriptions will appear here.')
    ).toBeInTheDocument();
  });

  it('shows "Get help" link for each subscription', async () => {
    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      subscriptions: [baseSub],
    });

    await renderPage();

    expect(
      screen.getByRole('link', { name: `Get help for ${MOCK_PRODUCT_NAME}` })
    ).toBeInTheDocument();
  });

  it('shows credit balance when balance is greater than zero', async () => {
    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      accountCreditBalance: { balance: 500, currency: 'usd' },
    });

    await renderPage();

    expect(screen.getByText('Credit balance')).toBeInTheDocument();
    expect(screen.getByText('$5.00')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Credit will automatically be applied to future invoices'
      )
    ).toBeInTheDocument();
  });

  it('hides credit balance section when balance is zero', async () => {
    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      accountCreditBalance: { balance: 0, currency: 'usd' },
    });

    await renderPage();

    expect(screen.queryByText('Credit balance')).not.toBeInTheDocument();
  });

  it('shows payment method with card brand, last4, and expiration date', async () => {
    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      isStripeCustomer: true,
      defaultPaymentMethod: {
        type: SubPlatPaymentMethodType.Card,
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025,
        hasPaymentMethodError: undefined,
      },
    });

    await renderPage();

    expect(screen.getByText('Payment method')).toBeInTheDocument();
    expect(screen.getByText('Card ending in 4242')).toBeInTheDocument();
    expect(screen.getByText('Expires 12/2025')).toBeInTheDocument();
  });

  it('shows "Add" button for Stripe customer with no default payment method', async () => {
    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      isStripeCustomer: true,
      defaultPaymentMethod: undefined,
      subscriptions: [baseSub],
    });

    await renderPage();

    expect(screen.getByText('Payment method')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Add payment method' })
    ).toBeInTheDocument();
  });

  it('does not show payment method section for non-Stripe customer', async () => {
    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      isStripeCustomer: false,
      defaultPaymentMethod: undefined,
    });

    await renderPage();

    expect(screen.queryByText('Payment method')).not.toBeInTheDocument();
  });

  it('renders web subscriptions with product name, interval, and support link', async () => {
    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      subscriptions: [baseSub],
    });

    await renderPage();

    expect(
      screen.getByRole('heading', { name: MOCK_PRODUCT_NAME })
    ).toBeInTheDocument();
    expect(screen.getByText('Every monthly')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: `Get help for ${MOCK_PRODUCT_NAME}` })
    ).toHaveAttribute('href', MOCK_SUPPORT_URL);
  });

  it('renders Apple IAP subscriptions with Apple logo text', async () => {
    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      appleIapSubscriptions: [baseAppleIap],
    });

    await renderPage();

    expect(
      screen.getByRole('heading', { name: 'Apple VPN' })
    ).toBeInTheDocument();
    expect(screen.getByText('Apple in-app purchase')).toBeInTheDocument();
  });

  it('renders Google IAP subscriptions with Google logo text', async () => {
    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      googleIapSubscriptions: [baseGoogleIap],
    });

    await renderPage();

    expect(
      screen.getByRole('heading', { name: 'Google VPN' })
    ).toBeInTheDocument();
    expect(screen.getByText('Google in-app purchase')).toBeInTheDocument();
  });

  it('shows payment method error banner when hasPaymentMethodError is set', async () => {
    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      isStripeCustomer: true,
      defaultPaymentMethod: {
        type: SubPlatPaymentMethodType.Card,
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025,
        hasPaymentMethodError: {
          bannerType: 'error',
          bannerTitle: 'Payment failed',
          bannerTitleFtl: 'payment-error-title',
          bannerMessage: 'Your card was declined.',
          bannerMessageFtl: 'payment-error-message',
          bannerLinkLabel: 'Update payment method',
          bannerLinkLabelFtl: 'payment-error-link',
          paymentMethodType: SubPlatPaymentMethodType.Card,
          messageFtl: 'payment-error-inline',
          message: 'Your card was declined.',
        },
      },
    });

    await renderPage();

    expect(screen.getByText('Payment failed')).toBeInTheDocument();
    // Message appears in both the error banner and inline payment method error
    expect(screen.getAllByText('Your card was declined.')).toHaveLength(2);
    expect(
      screen.getByRole('link', { name: 'Update payment method' })
    ).toBeInTheDocument();
  });

  it('shows "no payment method" warning banner for Stripe customer with subscriptions but no default payment method', async () => {
    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      isStripeCustomer: true,
      defaultPaymentMethod: undefined,
      subscriptions: [baseSub],
    });

    await renderPage();

    expect(screen.getByText('No payment method added')).toBeInTheDocument();
    // Text appears in both the warning banner and the payment details section
    expect(
      screen.getAllByText(
        'Please add a payment method to avoid interruption to your subscriptions.'
      )
    ).toHaveLength(2);
  });

  it('passes subscription data to SubscriptionContent component', async () => {
    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      subscriptions: [baseSub],
    });

    await renderPage();

    expect(mockSubscriptionContent).toHaveBeenCalledWith(
      expect.objectContaining({
        subscription: baseSub,
        locale: 'en',
      })
    );
  });
});
