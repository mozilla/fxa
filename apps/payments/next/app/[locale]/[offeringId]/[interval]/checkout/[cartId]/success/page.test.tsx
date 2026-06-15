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

const mockFetchCMSData = jest.fn();
const mockGetCartOrRedirectAction = jest.fn();
const mockAuth = jest.fn();
const mockGetL10n = jest.fn();
const mockRedirect = jest.fn();
const mockHeaders = jest.fn();
const mockTermsAndPrivacy = jest.fn();

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
  TermsAndPrivacy: (props: Record<string, unknown>) => {
    mockTermsAndPrivacy(props);
    return <div data-testid="terms-and-privacy" />;
  },
  PriceInterval: () => <div />,
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
  Header: () => <div />,
  MetricsWrapper: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  PurchaseDetails: () => <div />,
  SelectTaxLocation: () => <div />,
}));

import CheckoutSuccess from './page';
import CheckoutLayout from '../layout';

const MOCK_USER_ID = 'user-123';
const MOCK_USER_EMAIL = 'user@example.com';
const MOCK_CART_ID = 'cart-abc';
const MOCK_INVOICE_NUMBER = 'INV-001';
const MOCK_SUCCESS_URL = 'https://download.example.com/app';
const MOCK_SUCCESS_LABEL = 'Download the app';
const MOCK_TOS_URL = 'https://example.com/terms';
const MOCK_PRIVACY_URL = 'https://example.com/privacy';
const MOCK_PRIVACY_DOWNLOAD_URL = 'https://example.com/privacy-download';
const MOCK_TOS_DOWNLOAD_URL = 'https://example.com/terms-download';
const MOCK_CANCELLATION_URL = 'https://example.com/cancel';

const mockCommonContent = PageContentCommonContentResultFactory({
  privacyNoticeUrl: MOCK_PRIVACY_URL,
  privacyNoticeDownloadUrl: MOCK_PRIVACY_DOWNLOAD_URL,
  termsOfServiceUrl: MOCK_TOS_URL,
  termsOfServiceDownloadUrl: MOCK_TOS_DOWNLOAD_URL,
  cancellationUrl: MOCK_CANCELLATION_URL,
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
  const jsx = await CheckoutSuccess({
    params: (paramsOverride ?? defaultParams) as any,
    searchParams: (searchParamsOverride ?? defaultSearchParams) as any,
  });
  return render(jsx);
}

describe('CheckoutSuccess', () => {
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

  it('renders the confirmation page with heading, order details, and payment info', async () => {
    await renderPage();

    expect(
      screen.getByRole('heading', {
        name: 'Thanks, now check your email!',
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/Order details/)).toBeInTheDocument();
    expect(screen.getByText(/Payment information/)).toBeInTheDocument();
    expect(screen.getByText(/INV-001/)).toBeInTheDocument();
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

  it('redirects when session uid does not match cart uid', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'different-user', email: 'other@example.com' },
    });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalled();
  });

  it('redirects when session is missing', async () => {
    mockAuth.mockResolvedValue(null);

    await renderPage();

    expect(mockRedirect).toHaveBeenCalled();
  });
});

/**
 * Legal links (TOS, Privacy Notice) are rendered by the TermsAndPrivacy
 * component in the checkout layout, not the success page itself. These
 * tests verify the layout passes the correct CMS-sourced URLs to
 * TermsAndPrivacy.
 */
describe('Checkout layout legal links on confirmation page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockFetchCMSData.mockResolvedValue(baseCmsData);
    mockAuth.mockResolvedValue(baseSession);
    mockGetL10n.mockReturnValue(mockL10n);

    // getCartAction is used by the layout (not getCartOrRedirectAction)
    const actions = require('@fxa/payments/ui/actions');
    actions.getCartAction.mockResolvedValue({
      ...baseCart,
      state: 'SUCCESS',
      hasActiveSubscriptions: false,
    });
  });

  async function renderLayout() {
    const jsx = await CheckoutLayout({
      children: <div data-testid="child-page" />,
      params: defaultParams as any,
    });
    return render(jsx);
  }

  it('passes the Terms of Service URL to TermsAndPrivacy', async () => {
    await renderLayout();

    expect(mockTermsAndPrivacy).toHaveBeenCalledWith(
      expect.objectContaining({
        termsOfServiceUrl: MOCK_TOS_URL,
      })
    );
  });

  it('passes the Privacy Notice URL to TermsAndPrivacy', async () => {
    await renderLayout();

    expect(mockTermsAndPrivacy).toHaveBeenCalledWith(
      expect.objectContaining({
        privacyNoticeUrl: MOCK_PRIVACY_URL,
      })
    );
  });

  it('passes the Terms of Service download URL to TermsAndPrivacy', async () => {
    await renderLayout();

    expect(mockTermsAndPrivacy).toHaveBeenCalledWith(
      expect.objectContaining({
        termsOfServiceDownloadUrl: MOCK_TOS_DOWNLOAD_URL,
      })
    );
  });
});
