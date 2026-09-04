/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { handleStripeErrorAction } from './handleStripeError';

const mockFinalizeCartWithError = jest.fn();
jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: () => ({
      finalizeCartWithError: mockFinalizeCartWithError,
    }),
  }),
}));

// Next.js redirect() throws a special error to halt execution.
class RedirectError extends Error {
  constructor(url: string) {
    super(`NEXT_REDIRECT: ${url}`);
    this.name = 'RedirectError';
  }
}
const mockRedirect = jest.fn().mockImplementation((url: string) => {
  throw new RedirectError(url);
});
jest.mock('next/navigation', () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

const mockStripeErrorToErrorReasonId = jest.fn();
jest.mock('@fxa/payments/cart', () => ({
  __esModule: true,
  stripeErrorToErrorReasonId: (...args: unknown[]) =>
    mockStripeErrorToErrorReasonId(...args),
}));

describe('handleStripeErrorAction', () => {
  const MOCK_CART_ID = 'cart_abc123';
  const MOCK_ERROR_REASON_ID = 'card_declined';
  const MOCK_STRIPE_ERROR = {
    type: 'card_error' as const,
    code: 'card_declined',
    message: 'Your card was declined.',
  };
  const MOCK_PATHNAME = '/en/vpn/monthly/checkout/cart_abc123/start';

  async function callExpectingRedirect(
    ...args: Parameters<typeof handleStripeErrorAction>
  ) {
    try {
      await handleStripeErrorAction(...args);
    } catch (error) {
      if (error instanceof RedirectError) return;
      throw error;
    }
  }

  beforeEach(() => {
    mockFinalizeCartWithError.mockReset();
    mockRedirect.mockReset().mockImplementation((url: string) => {
      throw new RedirectError(url);
    });
    mockStripeErrorToErrorReasonId.mockReset();

    mockStripeErrorToErrorReasonId.mockReturnValue(MOCK_ERROR_REASON_ID);
    mockFinalizeCartWithError.mockResolvedValue(undefined);
  });

  it('converts the Stripe error and finalizes the cart with the error reason', async () => {
    await callExpectingRedirect(MOCK_CART_ID, MOCK_STRIPE_ERROR, MOCK_PATHNAME);

    expect(mockStripeErrorToErrorReasonId).toHaveBeenCalledWith(
      MOCK_STRIPE_ERROR
    );
    expect(mockFinalizeCartWithError).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      errorReasonId: MOCK_ERROR_REASON_ID,
    });
  });

  it('redirects to the error path by replacing the last URL segment', async () => {
    await callExpectingRedirect(MOCK_CART_ID, MOCK_STRIPE_ERROR, MOCK_PATHNAME);

    expect(mockRedirect).toHaveBeenCalledWith(
      '/en/vpn/monthly/checkout/cart_abc123/error'
    );
  });

  it('appends search params to the redirect URL when provided', async () => {
    await callExpectingRedirect(
      MOCK_CART_ID,
      MOCK_STRIPE_ERROR,
      MOCK_PATHNAME,
      { utm_source: 'email', ref: 'banner' }
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      '/en/vpn/monthly/checkout/cart_abc123/error?utm_source=email&ref=banner'
    );
  });

  it('redirects without query string when searchParams is undefined', async () => {
    await callExpectingRedirect(
      MOCK_CART_ID,
      MOCK_STRIPE_ERROR,
      MOCK_PATHNAME,
      undefined
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      '/en/vpn/monthly/checkout/cart_abc123/error'
    );
  });
});
