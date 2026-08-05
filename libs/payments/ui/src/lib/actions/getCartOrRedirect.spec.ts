/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCartOrRedirectAction } from './getCartOrRedirect';
import { SupportedPages } from '../utils/types';

const mockGetCart = jest.fn();
jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: () => ({
      getCart: mockGetCart,
    }),
  }),
}));

// Next.js redirect() throws a special error to halt execution.
// We simulate that so control flow in the action stops after redirect().
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

const mockValidateCartState = jest.fn();
const mockGetRedirect = jest.fn();
jest.mock('../utils/get-cart', () => ({
  __esModule: true,
  validateCartState: (...args: unknown[]) => mockValidateCartState(...args),
  getRedirect: (...args: unknown[]) => mockGetRedirect(...args),
}));

const mockBuildRedirectUrl = jest.fn();
jest.mock('../utils/buildRedirectUrl', () => ({
  __esModule: true,
  buildRedirectUrl: (...args: unknown[]) => mockBuildRedirectUrl(...args),
}));

describe('getCartOrRedirectAction', () => {
  const MOCK_CART_ID = 'cart_abc123';
  const MOCK_PATHNAME = '/en/vpn/monthly/checkout/cart_abc123/start';
  const MOCK_CART = {
    id: MOCK_CART_ID,
    state: 'START',
    offeringConfigId: 'vpn',
  };

  // Helper: calls the action and catches the expected RedirectError.
  // Uses explicit parameter types to avoid TypeScript picking a single
  // overload from getCartOrRedirectAction's 5 overload signatures.
  async function callExpectingRedirect(
    cartId: string,
    page: SupportedPages,
    currentPathname: string,
    searchParams?: Record<string, string | string[] | undefined>
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (getCartOrRedirectAction as any)(
        cartId,
        page,
        currentPathname,
        searchParams
      );
    } catch (error) {
      if (error instanceof RedirectError) return;
      throw error;
    }
  }

  beforeEach(() => {
    mockGetCart.mockReset();
    mockRedirect.mockReset().mockImplementation((url: string) => {
      throw new RedirectError(url);
    });
    mockValidateCartState.mockReset();
    mockGetRedirect.mockReset();
    mockBuildRedirectUrl.mockReset();

    mockGetCart.mockResolvedValue(MOCK_CART);
    mockValidateCartState.mockReturnValue(true);
  });

  it('returns the cart when cart state matches the page', async () => {
    const result = await getCartOrRedirectAction(
      MOCK_CART_ID,
      SupportedPages.START,
      MOCK_PATHNAME
    );

    expect(result).toEqual(MOCK_CART);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('filters null values from searchParams before building query string', async () => {
    mockValidateCartState.mockReturnValue(false);
    mockGetRedirect.mockReturnValue('processing');

    await callExpectingRedirect(
      MOCK_CART_ID,
      SupportedPages.START,
      MOCK_PATHNAME,
      { utm_source: 'email', ref: null as unknown as string, keep: 'yes' }
    );

    const redirectUrl = mockRedirect.mock.calls[0][0] as string;
    expect(redirectUrl).toContain('utm_source=email');
    expect(redirectUrl).toContain('keep=yes');
    expect(redirectUrl).not.toContain('ref=');
  });

  it('redirects to the correct page when cart state does not match', async () => {
    mockValidateCartState.mockReturnValue(false);
    mockGetRedirect.mockReturnValue('processing');

    await callExpectingRedirect(
      MOCK_CART_ID,
      SupportedPages.START,
      MOCK_PATHNAME
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      '/en/vpn/monthly/checkout/cart_abc123/processing'
    );
  });

  it('appends search params to the state-mismatch redirect URL', async () => {
    mockValidateCartState.mockReturnValue(false);
    mockGetRedirect.mockReturnValue('processing');

    await callExpectingRedirect(
      MOCK_CART_ID,
      SupportedPages.START,
      MOCK_PATHNAME,
      { utm_source: 'email' }
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      '/en/vpn/monthly/checkout/cart_abc123/processing?utm_source=email'
    );
  });

  it('redirects via buildRedirectUrl when getCart throws CartUidMismatchError', async () => {
    const uidError = new Error('Cart UID mismatch');
    uidError.name = 'CartUidMismatchError';
    mockGetCart.mockRejectedValue(uidError);
    mockBuildRedirectUrl.mockReturnValue('/en/vpn/monthly/new');

    await callExpectingRedirect(
      MOCK_CART_ID,
      SupportedPages.START,
      MOCK_PATHNAME
    );

    expect(mockBuildRedirectUrl).toHaveBeenCalledWith(
      'vpn',
      'monthly',
      'new',
      'checkout',
      {
        locale: 'en',
        searchParams: {},
      }
    );
    expect(mockRedirect).toHaveBeenCalledWith('/en/vpn/monthly/new');
  });

  it('strips cartId and cartVersion from searchParams on CartUidMismatchError redirect', async () => {
    const uidError = new Error('Cart UID mismatch');
    uidError.name = 'CartUidMismatchError';
    mockGetCart.mockRejectedValue(uidError);
    mockBuildRedirectUrl.mockReturnValue('/en/vpn/monthly/new?ref=banner');

    await callExpectingRedirect(
      MOCK_CART_ID,
      SupportedPages.START,
      MOCK_PATHNAME,
      { cartId: 'old_cart', cartVersion: '2', ref: 'banner' }
    );

    expect(mockBuildRedirectUrl).toHaveBeenCalledWith(
      'vpn',
      'monthly',
      'new',
      'checkout',
      {
        locale: 'en',
        searchParams: { ref: 'banner' },
      }
    );
  });

  it('rethrows non-CartUidMismatchError errors from getCart', async () => {
    const genericError = new Error('Service unavailable');
    mockGetCart.mockRejectedValue(genericError);

    await expect(
      getCartOrRedirectAction(MOCK_CART_ID, SupportedPages.START, MOCK_PATHNAME)
    ).rejects.toThrow('Service unavailable');
  });
});
