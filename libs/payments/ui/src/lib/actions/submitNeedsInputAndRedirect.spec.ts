/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { submitNeedsInputAndRedirectAction } from './submitNeedsInputAndRedirect';

const mockSubmitNeedsInput = jest.fn();
const mockLoggerError = jest.fn();
jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: () => ({
      submitNeedsInput: mockSubmitNeedsInput,
    }),
    getLogger: () => ({
      error: mockLoggerError,
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

const mockGetAdditionalRequestArgs = jest.fn();
jest.mock('../utils/getAdditionalRequestArgs', () => ({
  __esModule: true,
  getAdditionalRequestArgs: (...args: unknown[]) =>
    mockGetAdditionalRequestArgs(...args),
}));

describe('submitNeedsInputAndRedirectAction', () => {
  const MOCK_CART_ID = 'cart_abc123';
  const MOCK_PARAMS = { locale: 'en', offeringId: 'vpn' };
  const MOCK_PATHNAME = '/en/vpn/monthly/checkout/cart_abc123/needs_input';
  const MOCK_SEARCH_PARAMS = { utm_source: 'email' };
  const MOCK_ADDITIONAL_ARGS = {
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
  };

  async function callExpectingRedirect(
    ...args: Parameters<typeof submitNeedsInputAndRedirectAction>
  ) {
    try {
      await submitNeedsInputAndRedirectAction(...args);
    } catch (error) {
      if (error instanceof RedirectError) return;
      throw error;
    }
  }

  beforeEach(() => {
    mockSubmitNeedsInput.mockReset();
    mockLoggerError.mockReset();
    mockRedirect.mockReset().mockImplementation((url: string) => {
      throw new RedirectError(url);
    });
    mockGetAdditionalRequestArgs.mockReset();

    mockGetAdditionalRequestArgs.mockResolvedValue(MOCK_ADDITIONAL_ARGS);
    mockSubmitNeedsInput.mockResolvedValue(undefined);
  });

  it('submits needs input and redirects to the success path on success', async () => {
    await callExpectingRedirect(MOCK_CART_ID, MOCK_PARAMS, MOCK_PATHNAME);

    expect(mockSubmitNeedsInput).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      requestArgs: expect.objectContaining({
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      }),
    });
    expect(mockRedirect).toHaveBeenCalledWith(
      '/en/vpn/monthly/checkout/cart_abc123/success'
    );
  });

  it('logs the error and redirects to the error path when submitNeedsInput throws', async () => {
    const error = new Error('Service unavailable');
    mockSubmitNeedsInput.mockRejectedValue(error);

    await callExpectingRedirect(MOCK_CART_ID, MOCK_PARAMS, MOCK_PATHNAME);

    expect(mockLoggerError).toHaveBeenCalledWith(
      'Error submitting needs input',
      { error }
    );
    expect(mockRedirect).toHaveBeenCalledWith(
      '/en/vpn/monthly/checkout/cart_abc123/error'
    );
  });

  it('includes flattened params and search params in requestArgs', async () => {
    await callExpectingRedirect(
      MOCK_CART_ID,
      MOCK_PARAMS,
      MOCK_PATHNAME,
      MOCK_SEARCH_PARAMS
    );

    expect(mockSubmitNeedsInput).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      requestArgs: {
        ...MOCK_ADDITIONAL_ARGS,
        params: { locale: 'en', offeringId: 'vpn' },
        searchParams: { utm_source: 'email' },
      },
    });
  });

  it('appends search params to the redirect URL when provided', async () => {
    await callExpectingRedirect(
      MOCK_CART_ID,
      MOCK_PARAMS,
      MOCK_PATHNAME,
      MOCK_SEARCH_PARAMS
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      '/en/vpn/monthly/checkout/cart_abc123/success?utm_source=email'
    );
  });

  it('redirects without query string when searchParams is undefined', async () => {
    await callExpectingRedirect(MOCK_CART_ID, MOCK_PARAMS, MOCK_PATHNAME);

    expect(mockRedirect).toHaveBeenCalledWith(
      '/en/vpn/monthly/checkout/cart_abc123/success'
    );
  });
});
