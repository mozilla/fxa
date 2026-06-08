/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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
    paypal: { clientId: 'paypal-client-id' },
    csp: { paypalApi: 'https://paypal.example.com' },
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
    Card: 'card',
    ApplePay: 'apple_pay',
    GooglePay: 'google_pay',
    Link: 'link',
    Stripe: 'stripe',
  },
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  Banner: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant: string;
  }) => (
    <div data-testid={`banner-${variant}`} role="alert">
      {children}
    </div>
  ),
  BannerVariant: {
    Error: 'error',
    Info: 'info',
    Success: 'success',
    Warning: 'warning',
  },
  formatPlanInterval: jest.fn(() => 'monthly'),
  FreeTrialContent: () => <div data-testid="free-trial-content" />,
  getCardIcon: jest.fn(() => ({
    img: 'mock-card.svg',
    altText: 'PayPal',
    width: 40,
    height: 24,
  })),
  GleanPageView: () => null,
  SubscriptionContent: () => <div data-testid="subscription-content" />,
}));

jest.mock('@fxa/shared/react', () => ({
  __esModule: true,
  LinkExternal: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  ),
}));

jest.mock('clsx', () => ({
  __esModule: true,
  default: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

jest.mock(
  '@fxa/shared/assets/images/alert-yellow.svg',
  () => 'alert-yellow.svg',
  { virtual: true }
);
jest.mock(
  '@fxa/shared/assets/images/arrow-down.svg',
  () => 'arrow-down.svg',
  { virtual: true }
);
jest.mock(
  '@fxa/shared/assets/images/apple-logo.svg',
  () => 'apple-logo.svg',
  { virtual: true }
);
jest.mock(
  '@fxa/shared/assets/images/google-logo.svg',
  () => 'google-logo.svg',
  { virtual: true }
);
jest.mock(
  '@fxa/shared/assets/images/new-window.svg',
  () => 'new-window.svg',
  { virtual: true }
);
jest.mock('@fxa/shared/assets/images/error.svg', () => 'error.svg', {
  virtual: true,
});

const MOCK_USER_ID = 'user-123';

const baseSession = {
  user: {
    id: MOCK_USER_ID,
    email: 'user@example.com',
    metricsEnabled: true,
  },
};

const basePageContent = {
  accountCreditBalance: { balance: 0, currency: null },
  defaultPaymentMethod: undefined,
  isStripeCustomer: true,
  subscriptions: [],
  appleIapSubscriptions: [],
  googleIapSubscriptions: [],
  trialSubscriptions: [],
};

const mockL10n = {
  getString: (_id: string, ...rest: unknown[]) => {
    const fallback = rest.length === 1 ? rest[0] : rest[1];
    return typeof fallback === 'string' ? fallback : '';
  },
  getLocalizedMonthYearString: () => '12/2030',
  getLocalizedCurrencyString: () => '$0.00',
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

describe('Manage page — payment method error banner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({ get: () => 'en-US' });
    mockAuth.mockResolvedValue(baseSession);
    mockGetL10n.mockReturnValue(mockL10n);
    mockGetExperimentsAction.mockResolvedValue({ Features: {} });
    mockGetSubManPageContentAction.mockResolvedValue(basePageContent);
  });

  it('does not render error banner when there is no payment method error', async () => {
    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      defaultPaymentMethod: {
        type: 'external_paypal',
        billingAgreementId: 'ba_active',
      },
      subscriptions: [
        {
          id: 'sub_1',
          productName: 'Test Product',
          currency: 'usd',
          interval: 'monthly',
          currentInvoiceTax: 0,
          currentInvoiceTotal: 999,
          currentPeriodEnd: 1700000000,
          nextInvoiceDate: 1703000000,
          isEligibleForChurnStaySubscribed: false,
        },
      ],
    });

    await renderPage();

    expect(screen.queryByTestId('banner-error')).not.toBeInTheDocument();
  });

  it('renders error banner with PayPal funding source error content', async () => {
    const paypalFundingSourceError = {
      paymentMethodType: 'external_paypal',
      bannerType: 'error',
      bannerTitle: 'Invalid payment information',
      bannerTitleFtl:
        'error-payment-method-banner-title-invalid-payment-information',
      bannerMessage: 'There is an issue with your account.',
      bannerMessageFtl: 'error-payment-method-banner-message-account-issue',
      bannerLinkLabel: 'Manage payment method',
      bannerLinkLabelFtl:
        'subscription-management-button-manage-payment-method-1',
      message:
        'There is an issue with your PayPal account. Please resolve the issue to maintain your active subscriptions.',
      messageFtl: 'subscription-management-error-paypal-billing-agreement',
    };

    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      defaultPaymentMethod: {
        type: 'external_paypal',
        billingAgreementId: 'ba_123',
        hasPaymentMethodError: paypalFundingSourceError,
      },
      subscriptions: [
        {
          id: 'sub_1',
          productName: 'Test Product',
          currency: 'usd',
          interval: 'monthly',
          currentInvoiceTax: 0,
          currentInvoiceTotal: 999,
          currentPeriodEnd: 1700000000,
          nextInvoiceDate: 1703000000,
          isEligibleForChurnStaySubscribed: false,
        },
      ],
    });

    await renderPage();

    const errorBanner = screen.getByTestId('banner-error');
    expect(errorBanner).toBeInTheDocument();
    expect(errorBanner).toHaveTextContent('Invalid payment information');
    expect(errorBanner).toHaveTextContent(
      'There is an issue with your account.'
    );
    expect(errorBanner).toHaveTextContent('Manage payment method');
  });

  it('links to PayPal payment management page when error is on PayPal method', async () => {
    const paypalError = {
      paymentMethodType: 'external_paypal',
      bannerType: 'error',
      bannerTitle: 'Invalid payment information',
      bannerTitleFtl:
        'error-payment-method-banner-title-invalid-payment-information',
      bannerMessage: 'There is an issue with your account.',
      bannerMessageFtl: 'error-payment-method-banner-message-account-issue',
      bannerLinkLabel: 'Manage payment method',
      bannerLinkLabelFtl:
        'subscription-management-button-manage-payment-method-1',
      message:
        'There is an issue with your PayPal account. Please resolve the issue to maintain your active subscriptions.',
      messageFtl: 'subscription-management-error-paypal-billing-agreement',
    };

    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      defaultPaymentMethod: {
        type: 'external_paypal',
        billingAgreementId: 'ba_123',
        hasPaymentMethodError: paypalError,
      },
      subscriptions: [
        {
          id: 'sub_1',
          productName: 'Test Product',
          currency: 'usd',
          interval: 'monthly',
          currentInvoiceTax: 0,
          currentInvoiceTotal: 999,
          currentPeriodEnd: 1700000000,
          nextInvoiceDate: 1703000000,
          isEligibleForChurnStaySubscribed: false,
        },
      ],
    });

    await renderPage();

    const errorBanner = screen.getByTestId('banner-error');
    const bannerLink = errorBanner.querySelector('a');
    expect(bannerLink).toHaveAttribute(
      'href',
      'https://payments.example.com/en/subscriptions/payments/paypal'
    );
  });

  it('renders inline error message in payment method details section', async () => {
    const paypalError = {
      paymentMethodType: 'external_paypal',
      bannerType: 'error',
      bannerTitle: 'Invalid payment information',
      bannerTitleFtl:
        'error-payment-method-banner-title-invalid-payment-information',
      bannerMessage: 'There is an issue with your account.',
      bannerMessageFtl: 'error-payment-method-banner-message-account-issue',
      bannerLinkLabel: 'Manage payment method',
      bannerLinkLabelFtl:
        'subscription-management-button-manage-payment-method-1',
      message:
        'There is an issue with your PayPal account. Please resolve the issue to maintain your active subscriptions.',
      messageFtl: 'subscription-management-error-paypal-billing-agreement',
    };

    mockGetSubManPageContentAction.mockResolvedValue({
      ...basePageContent,
      defaultPaymentMethod: {
        type: 'external_paypal',
        billingAgreementId: 'ba_123',
        hasPaymentMethodError: paypalError,
      },
      subscriptions: [
        {
          id: 'sub_1',
          productName: 'Test Product',
          currency: 'usd',
          interval: 'monthly',
          currentInvoiceTax: 0,
          currentInvoiceTotal: 999,
          currentPeriodEnd: 1700000000,
          nextInvoiceDate: 1703000000,
          isEligibleForChurnStaySubscribed: false,
        },
      ],
    });

    await renderPage();

    expect(
      screen.getByText(
        /There is an issue with your PayPal account\. Please resolve the issue to maintain your active subscriptions\./
      )
    ).toBeInTheDocument();
  });
});
