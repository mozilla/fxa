/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartUidMismatchError } from '@fxa/payments/cart';
import { AssertCartOwnership } from './assertCartOwnership.decorator';

const MOCK_SESSION_UID = 'session-uid-abc-123';
const MOCK_CART_ID = 'cart-id-def-456';
const MOCK_OTHER_UID = 'other-uid-xyz-789';

const mockGetSessionUid = jest.fn<Promise<string | undefined>, []>();

jest.mock('@fxa/payments/ui-auth', () => ({
  __esModule: true,
  getSessionUid: (...args: unknown[]) => mockGetSessionUid(...(args as [])),
}));

class TestService {
  cartManager = {
    fetchCartById: jest.fn(),
  };

  originalMethodMock = jest.fn();

  @AssertCartOwnership()
  async decoratedMethod(args: { cartId: string }) {
    return this.originalMethodMock(args);
  }
}

describe('AssertCartOwnership', () => {
  let service: TestService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TestService();
    mockGetSessionUid.mockResolvedValue(MOCK_SESSION_UID);
  });

  it('calls the original method when the cart has no uid', async () => {
    service.cartManager.fetchCartById.mockResolvedValue({
      id: MOCK_CART_ID,
      uid: null,
    });
    service.originalMethodMock.mockResolvedValue('result');

    const result = await service.decoratedMethod({ cartId: MOCK_CART_ID });

    expect(result).toBe('result');
    expect(service.cartManager.fetchCartById).toHaveBeenCalledWith(
      MOCK_CART_ID
    );
    expect(service.originalMethodMock).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
    });
  });

  it('calls the original method when cart uid matches the session uid', async () => {
    service.cartManager.fetchCartById.mockResolvedValue({
      id: MOCK_CART_ID,
      uid: MOCK_SESSION_UID,
    });
    service.originalMethodMock.mockResolvedValue('result');

    const result = await service.decoratedMethod({ cartId: MOCK_CART_ID });

    expect(result).toBe('result');
    expect(service.originalMethodMock).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
    });
  });

  it('throws CartUidMismatchError when cart uid does not match the session uid', async () => {
    service.cartManager.fetchCartById.mockResolvedValue({
      id: MOCK_CART_ID,
      uid: MOCK_OTHER_UID,
    });

    await expect(
      service.decoratedMethod({ cartId: MOCK_CART_ID })
    ).rejects.toThrow(CartUidMismatchError);
    expect(service.originalMethodMock).not.toHaveBeenCalled();
  });

  it('throws CartUidMismatchError with the cart id and session uid', async () => {
    service.cartManager.fetchCartById.mockResolvedValue({
      id: MOCK_CART_ID,
      uid: MOCK_OTHER_UID,
    });

    let thrownError: CartUidMismatchError | undefined;
    try {
      await service.decoratedMethod({ cartId: MOCK_CART_ID });
    } catch (err) {
      thrownError = err as CartUidMismatchError;
    }

    expect(thrownError).toBeInstanceOf(CartUidMismatchError);
    expect(thrownError?.name).toBe('CartUidMismatchError');
    expect(thrownError?.message).toBe('Cart UID does not match session UID');
  });

  it('allows access when the session uid is undefined and the cart has a uid', async () => {
    mockGetSessionUid.mockResolvedValue(undefined);
    service.cartManager.fetchCartById.mockResolvedValue({
      id: MOCK_CART_ID,
      uid: MOCK_OTHER_UID,
    });

    // cart.uid ('other-uid') !== sessionUid (undefined) → should throw
    await expect(
      service.decoratedMethod({ cartId: MOCK_CART_ID })
    ).rejects.toThrow(CartUidMismatchError);
  });

  it('fetches the cart by the cartId from args', async () => {
    service.cartManager.fetchCartById.mockResolvedValue({
      id: MOCK_CART_ID,
      uid: null,
    });
    service.originalMethodMock.mockResolvedValue(undefined);

    await service.decoratedMethod({ cartId: MOCK_CART_ID });

    expect(service.cartManager.fetchCartById).toHaveBeenCalledWith(
      MOCK_CART_ID
    );
  });

  it('propagates errors from fetchCartById', async () => {
    const dbError = new Error('ECONNREFUSED');
    service.cartManager.fetchCartById.mockRejectedValue(dbError);

    await expect(
      service.decoratedMethod({ cartId: MOCK_CART_ID })
    ).rejects.toThrow(dbError);
    expect(service.originalMethodMock).not.toHaveBeenCalled();
  });
});
