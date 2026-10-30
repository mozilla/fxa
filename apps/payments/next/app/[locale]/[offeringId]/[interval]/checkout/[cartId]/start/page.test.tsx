/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StartCartDTOFactory } from '@fxa/payments/cart/testing';
import {
  PageContentCommonContentResultFactory,
  PageContentOfferingTransformedFactory,
} from '@fxa/shared/cms/testing';
import { SessionFactory } from '@fxa/payments/ui-auth/testing';
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

const mockConfig = {
  paymentsNextHostedUrl: 'https://payments.example.com',
  paypal: { clientId: 'paypal-client-id' },
  featureFlagPasskeySignin: false,
};

jest.mock('apps/payments/next/config', () => ({
  __esModule: true,
  get config() {
    return mockConfig;
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
  AuthOptionButton: ({
    children,
    leadingIcon,
  }: {
    children: React.ReactNode;
    leadingIcon: React.ReactNode;
  }) => (
    <button type="submit">
      {leadingIcon}
      {children}
    </button>
  ),
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

jest.mock(
  '@fxa/shared/assets/images/apple-logo-cropped-black.svg',
  () => 'apple-logo-cropped-black.svg',
  { virtual: true }
);
jest.mock(
  '@fxa/shared/assets/images/google-logo-viewbox.svg',
  () => 'google-logo-viewbox.svg',
  { virtual: true }
);
jest.mock('@fxa/shared/assets/images/passkey.svg', () => 'passkey.svg', {
  virtual: true,
});

const MOCK_USER_ID = 'user-123';
const MOCK_USER_EMAIL = 'user@example.com';
const MOCK_CART_ID = 'cart-abc';

const baseCmsData = PageContentOfferingTransformedFactory({
  commonContent: {
    ...PageContentCommonContentResultFactory({
      newsletterLabelTextCode: null,
      privacyNoticeUrl: 'https://example.com/privacy',
      termsOfServiceUrl: 'https://example.com/terms',
    }),
    localizations: [],
  },
});

const baseCart = StartCartDTOFactory({
  id: MOCK_CART_ID,
  uid: MOCK_USER_ID,
  amount: 999,
  currency: 'usd',
});

const baseSession = SessionFactory({ id: MOCK_USER_ID, email: MOCK_USER_EMAIL });

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
    mockConfig.featureFlagPasskeySignin = false;
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

  describe('sign-in options', () => {
    beforeEach(() => {
      mockGetCartOrRedirectAction.mockResolvedValue({
        ...baseCart,
        uid: null,
      });
      mockAuth.mockResolvedValue(null);
    });

    // Server actions can't be submitted through jsdom, so call the action of
    // the <form> wrapping the sign-in option with the given label.
    async function submitSignInOption(label: string) {
      const jsx = await Checkout({
        params: defaultParams as any,
        searchParams: defaultSearchParams as any,
      });
      const action = findFormAction(jsx, label);
      expect(action).toBeDefined();
      await action?.();
    }

    function findFormAction(
      node: React.ReactNode,
      label: string
    ): (() => Promise<void>) | undefined {
      if (Array.isArray(node)) {
        for (const child of node) {
          const action = findFormAction(child, label);
          if (action) return action;
        }
        return undefined;
      }
      if (!React.isValidElement(node)) return undefined;
      const props = node.props as {
        action?: () => Promise<void>;
        children?: React.ReactNode;
      };
      if (node.type === 'form' && React.isValidElement(props.children)) {
        const buttonLabel = (props.children.props as { children?: unknown })
          .children;
        if (buttonLabel === label) return props.action;
      }
      return findFormAction(props.children, label);
    }

    it('hides the passkey button when the passkey flag is off', async () => {
      await renderPage();

      expect(
        screen.queryByRole('button', { name: /Sign in with passkey/i })
      ).not.toBeInTheDocument();
    });

    it('shows the passkey button above Google and Apple when the passkey flag is on', async () => {
      mockConfig.featureFlagPasskeySignin = true;

      await renderPage();

      const buttonNames = screen
        .getAllByRole('button')
        .map((button) => button.textContent);
      expect(buttonNames).toEqual([
        'Sign in with passkey',
        'Continue with Google',
        'Continue with Apple',
      ]);
    });

    it('sends passkey sign-in to the accounts login page without a deeplink', async () => {
      mockConfig.featureFlagPasskeySignin = true;
      await submitSignInOption('Sign in with passkey');

      expect(mockSignIn).toHaveBeenCalledWith('fxa', {
        redirectTo: 'https://payments.example.com/redirect',
      });
    });

    it('sends Google sign-in with the googleLogin deeplink', async () => {
      await submitSignInOption('Continue with Google');

      expect(mockSignIn).toHaveBeenCalledWith(
        'fxa',
        { redirectTo: 'https://payments.example.com/redirect' },
        { deeplink: 'googleLogin' }
      );
    });

    it('sends Apple sign-in with the appleLogin deeplink', async () => {
      await submitSignInOption('Continue with Apple');

      expect(mockSignIn).toHaveBeenCalledWith(
        'fxa',
        { redirectTo: 'https://payments.example.com/redirect' },
        { deeplink: 'appleLogin' }
      );
    });
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
