/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NeedsInputCartDTOFactory } from '@fxa/payments/cart/testing';
import { SessionFactory } from '@fxa/payments/ui-auth/testing';
import NeedsInputPage from './page';

const mockGetCartOrRedirectAction = jest.fn();
const mockAuth = jest.fn();
const mockGetL10n = jest.fn();
const mockRedirect = jest.fn();
const mockHeaders = jest.fn();
const mockStripeWrapper = jest.fn();
const mockPaymentInputHandler = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  getCartOrRedirectAction: (...args: unknown[]) =>
    mockGetCartOrRedirectAction(...args),
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
  SupportedPages: { NEEDS_INPUT: 'needs_input' },
  buildPageMetadata: jest.fn(),
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
}));

jest.mock('next/headers', () => ({
  __esModule: true,
  headers: () => mockHeaders(),
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  buildRedirectUrl: jest
    .fn()
    .mockReturnValue('https://payments.example.com/redirect'),
  CheckoutParams: {},
  LoadingSpinner: ({ className }: { className?: string }) => (
    <div data-testid="loading-spinner" className={className} />
  ),
  StripeWrapper: (props: Record<string, unknown>) => {
    mockStripeWrapper(props);
    return (
      <div data-testid="stripe-wrapper">
        {props.children as React.ReactNode}
      </div>
    );
  },
  PaymentInputHandler: (props: Record<string, unknown>) => {
    mockPaymentInputHandler(props);
    return <div data-testid="payment-input-handler" />;
  },
}));

const MOCK_USER_ID = 'user-123';
const MOCK_CART_ID = 'cart-abc';

const baseCart = NeedsInputCartDTOFactory({
  id: MOCK_CART_ID,
  uid: MOCK_USER_ID,
  amount: 999,
  currency: 'usd',
});

const baseSession = SessionFactory({ id: MOCK_USER_ID, email: 'user@example.com' });

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
  const jsx = await NeedsInputPage({
    params: (paramsOverride ?? defaultParams) as any,
    searchParams: (searchParamsOverride ?? defaultSearchParams) as any,
  });
  return render(jsx);
}

describe('NeedsInputPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockGetCartOrRedirectAction.mockResolvedValue(baseCart);
    mockAuth.mockResolvedValue(baseSession);
    mockGetL10n.mockReturnValue(mockL10n);
  });

  it('redirects when session is missing', async () => {
    mockAuth.mockResolvedValue(null);

    await renderPage();

    expect(mockRedirect).toHaveBeenCalled();
  });

  it('redirects when cart uid does not match session uid', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'different-user', email: 'other@example.com' },
    });

    await renderPage();

    expect(mockRedirect).toHaveBeenCalled();
  });

  it('throws error when cart currency is missing', async () => {
    mockGetCartOrRedirectAction.mockResolvedValue({
      ...baseCart,
      currency: null,
    });

    await expect(renderPage()).rejects.toThrow(
      'Currency is missing from the cart'
    );
  });

  it('renders StripeWrapper with correct amount and currency', async () => {
    await renderPage();

    expect(screen.getByTestId('stripe-wrapper')).toBeInTheDocument();
    expect(mockStripeWrapper).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 999,
        currency: 'usd',
        locale: 'en',
      })
    );
  });

  it('renders PaymentInputHandler with cart id', async () => {
    await renderPage();

    expect(screen.getByTestId('payment-input-handler')).toBeInTheDocument();
    expect(mockPaymentInputHandler).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
    });
  });

  it('renders the processing payment message', async () => {
    await renderPage();

    expect(
      screen.getByText(/Please wait while we process your payment/i)
    ).toBeInTheDocument();
  });

  it('renders the loading spinner', async () => {
    await renderPage();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders the payment-processing section', async () => {
    await renderPage();

    expect(screen.getByTestId('payment-processing')).toBeInTheDocument();
  });
});
