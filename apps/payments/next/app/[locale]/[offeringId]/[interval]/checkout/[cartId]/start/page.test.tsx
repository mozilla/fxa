/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Checkout from './page';

const mockFetchCMSData = jest.fn();
const mockGetCartOrRedirectAction = jest.fn();
const mockAuth = jest.fn();
const mockSignIn = jest.fn();
const mockGetL10n = jest.fn();
const mockRedirect = jest.fn();
const mockHeaders = jest.fn();
const mockCookies = jest.fn();
const mockPaymentSection = jest.fn();
const mockSignInForm = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  fetchCMSData: (...args: unknown[]) => mockFetchCMSData(...args),
  getCartOrRedirectAction: (...args: unknown[]) =>
    mockGetCartOrRedirectAction(...args),
}));

jest.mock('apps/payments/next/auth', () => ({
  __esModule: true,
  auth: () => mockAuth(),
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

jest.mock('@fxa/payments/ui/server', () => ({
  __esModule: true,
  getApp: () => ({
    getL10n: (...args: unknown[]) => mockGetL10n(...args),
  }),
  SupportedPages: { START: 'start' },
  CheckoutParams: {},
  buildPageMetadata: jest.fn(),
  SignedIn: ({ email }: { email: string }) => (
    <div data-testid="signed-in">{email}</div>
  ),
}));

jest.mock('apps/payments/next/config', () => ({
  __esModule: true,
  config: {
    paymentsNextHostedUrl: 'https://payments.example.com',
    paypal: { clientId: 'paypal-client-id' },
  },
}));

jest.mock('next/navigation', () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

jest.mock('next/headers', () => ({
  __esModule: true,
  headers: () => mockHeaders(),
  cookies: () => mockCookies(),
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

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  buildRedirectUrl: jest
    .fn()
    .mockReturnValue('https://payments.example.com/redirect'),
  BaseButton: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  ),
  ButtonVariant: { ThirdParty: 'third-party' },
  PaymentSection: (props: Record<string, unknown>) => {
    mockPaymentSection(props);
    return <div data-testid="payment-section" />;
  },
  SAW_TRIAL_OFFER_COOKIE_PREFIX: 'saw_trial_',
  SignInForm: (props: Record<string, unknown>) => {
    mockSignInForm(props);
    return <div data-testid="sign-in-form" />;
  },
}));

jest.mock('clsx', () => ({
  __esModule: true,
  default: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

jest.mock('@fxa/shared/assets/images/apple-logo.svg', () => 'apple-logo.svg', {
  virtual: true,
});
jest.mock(
  '@fxa/shared/assets/images/google-logo.svg',
  () => 'google-logo.svg',
  { virtual: true }
);

const MOCK_USER_ID = 'user-123';
const MOCK_USER_EMAIL = 'user@example.com';
const MOCK_CART_ID = 'cart-abc';

const baseCmsData = {
  apiIdentifier: 'offering-1',
  commonContent: {
    newsletterLabelTextCode: null,
    privacyNoticeUrl: 'https://example.com/privacy',
    termsOfServiceUrl: 'https://example.com/terms',
  },
};

const baseCart = {
  id: MOCK_CART_ID,
  uid: MOCK_USER_ID,
  version: 1,
  interval: 'monthly',
  amount: 999,
  currency: 'usd',
  couponCode: null,
  taxAddress: { countryCode: 'US', postalCode: '94107' },
};

const baseSession = {
  user: {
    id: MOCK_USER_ID,
    email: MOCK_USER_EMAIL,
  },
};

const mockL10n = {
  getString: (_id: string, ...rest: unknown[]) => {
    const fallback = rest.length === 1 ? rest[0] : rest[1];
    return typeof fallback === 'string' ? fallback : '';
  },
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
  const jsx = await Checkout({
    params: (paramsOverride ?? defaultParams) as any,
    searchParams: (searchParamsOverride ?? defaultSearchParams) as any,
  });
  return render(jsx);
}

describe('Checkout start page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockCookies.mockResolvedValue({
      get: () => undefined,
    });
    mockFetchCMSData.mockResolvedValue(baseCmsData);
    mockGetCartOrRedirectAction.mockResolvedValue(baseCart);
    mockAuth.mockResolvedValue(baseSession);
    mockGetL10n.mockReturnValue(mockL10n);
  });

  it('redirects when cart uid does not match session uid', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'different-user', email: 'other@example.com' },
    });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalled();
  });

  it('shows sign-in section when user is not authenticated', async () => {
    mockGetCartOrRedirectAction.mockResolvedValue({
      ...baseCart,
      uid: null,
    });
    mockAuth.mockResolvedValue(null);

    await renderPage();

    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Continue with Google/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Continue with Apple/i })
    ).toBeInTheDocument();
  });

  it('shows "Choose your payment method" heading when authenticated', async () => {
    await renderPage();

    expect(
      screen.getByRole('heading', { name: /Choose your payment method/i })
    ).toBeInTheDocument();
  });

  it('shows PaymentSection when cart has currency and tax address', async () => {
    await renderPage();

    expect(screen.getByTestId('payment-section')).toBeInTheDocument();
    expect(mockPaymentSection).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentsInfo: {
          amount: 999,
          currency: 'usd',
        },
        locale: 'en',
      })
    );
  });

  it('does not show PaymentSection when cart currency is missing', async () => {
    mockGetCartOrRedirectAction.mockResolvedValue({
      ...baseCart,
      currency: null,
    });

    await renderPage();

    expect(screen.queryByTestId('payment-section')).not.toBeInTheDocument();
  });

  it('does not show PaymentSection when tax address is missing', async () => {
    mockGetCartOrRedirectAction.mockResolvedValue({
      ...baseCart,
      taxAddress: null,
    });

    await renderPage();

    expect(screen.queryByTestId('payment-section')).not.toBeInTheDocument();
  });

  it('does not show sign-in section when user is authenticated', async () => {
    await renderPage();

    expect(screen.queryByTestId('sign-in-form')).not.toBeInTheDocument();
  });

  it('shows step 2 heading with disabled styling when not authenticated', async () => {
    mockGetCartOrRedirectAction.mockResolvedValue({
      ...baseCart,
      uid: null,
    });
    mockAuth.mockResolvedValue(null);

    await renderPage();

    expect(screen.getByTestId('header-prefix')).toBeInTheDocument();
  });
});
