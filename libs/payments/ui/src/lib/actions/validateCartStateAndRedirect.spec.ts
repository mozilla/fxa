/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { validateCartStateAndRedirectAction } from './validateCartStateAndRedirect';
import { SupportedPages } from '../utils/types';

const mockGetDbCart = jest.fn();
jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: () => ({
      getDbCart: mockGetDbCart,
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

describe('validateCartStateAndRedirectAction', () => {
  const MOCK_CART_ID = 'cart_abc123';
  const MOCK_PATHNAME = '/en/vpn/monthly/checkout/cart_abc123/start';
  const MOCK_STATE = 'START';
  const MOCK_IS_FREE_TRIAL = false;

  // Helper: calls the action and catches the expected RedirectError
  async function callExpectingRedirect(
    ...args: Parameters<typeof validateCartStateAndRedirectAction>
  ) {
    try {
      await validateCartStateAndRedirectAction(...args);
    } catch (error) {
      if (error instanceof RedirectError) return;
      throw error;
    }
  }

  beforeEach(() => {
    mockGetDbCart.mockReset();
    mockRedirect.mockReset().mockImplementation((url: string) => {
      throw new RedirectError(url);
    });
    mockValidateCartState.mockReset();
    mockGetRedirect.mockReset();
    mockBuildRedirectUrl.mockReset();

    mockGetDbCart.mockResolvedValue({
      state: MOCK_STATE,
      isFreeTrial: MOCK_IS_FREE_TRIAL,
    });
    mockValidateCartState.mockReturnValue(true);
  });

  describe('when cart state matches the page', () => {
    it('returns state and isFreeTrial without redirectToUrl', async () => {
      const result = await validateCartStateAndRedirectAction(
        MOCK_CART_ID,
        SupportedPages.START,
        MOCK_PATHNAME
      );

      expect(result).toEqual({
        state: MOCK_STATE,
        isFreeTrial: MOCK_IS_FREE_TRIAL,
      });
    });

    it('does not call redirect regardless of redirectNow value', async () => {
      await validateCartStateAndRedirectAction(
        MOCK_CART_ID,
        SupportedPages.START,
        MOCK_PATHNAME,
        undefined,
        false
      );

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('when cart state does not match the page', () => {
    beforeEach(() => {
      mockValidateCartState.mockReturnValue(false);
      mockGetRedirect.mockReturnValue('processing');
    });

    it('calls redirect when redirectNow is true (default)', async () => {
      await callExpectingRedirect(
        MOCK_CART_ID,
        SupportedPages.START,
        MOCK_PATHNAME
      );

      expect(mockRedirect).toHaveBeenCalledWith(
        '/en/vpn/monthly/checkout/cart_abc123/processing'
      );
    });

    it('returns redirectToUrl, state, and isFreeTrial when redirectNow is false', async () => {
      const result = await validateCartStateAndRedirectAction(
        MOCK_CART_ID,
        SupportedPages.START,
        MOCK_PATHNAME,
        undefined,
        false
      );

      expect(result).toEqual({
        redirectToUrl: '/en/vpn/monthly/checkout/cart_abc123/processing',
        state: MOCK_STATE,
        isFreeTrial: MOCK_IS_FREE_TRIAL,
      });
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('appends search params to the redirect URL', async () => {
      const result = await validateCartStateAndRedirectAction(
        MOCK_CART_ID,
        SupportedPages.START,
        MOCK_PATHNAME,
        { utm_source: 'email' },
        false
      );

      expect(result).toEqual({
        redirectToUrl:
          '/en/vpn/monthly/checkout/cart_abc123/processing?utm_source=email',
        state: MOCK_STATE,
        isFreeTrial: MOCK_IS_FREE_TRIAL,
      });
    });
  });

  describe('when getDbCart throws CartUidMismatchError', () => {
    it('redirects via buildRedirectUrl, stripping cartId and cartVersion from searchParams', async () => {
      const uidError = new Error('Cart UID mismatch');
      uidError.name = 'CartUidMismatchError';
      mockGetDbCart.mockRejectedValue(uidError);
      mockBuildRedirectUrl.mockReturnValue('/en/vpn/monthly/new');

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
      expect(mockRedirect).toHaveBeenCalledWith('/en/vpn/monthly/new');
    });
  });

  describe('when getDbCart throws a generic error', () => {
    it('rethrows the error without catching it', async () => {
      const genericError = new Error('Service unavailable');
      mockGetDbCart.mockRejectedValue(genericError);

      await expect(
        validateCartStateAndRedirectAction(
          MOCK_CART_ID,
          SupportedPages.START,
          MOCK_PATHNAME
        )
      ).rejects.toThrow('Service unavailable');
    });
  });
});
