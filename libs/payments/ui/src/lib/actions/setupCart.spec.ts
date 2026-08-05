/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SubplatInterval } from '@fxa/payments/customer';
import { setupCartAction } from './setupCart';

const mockSetupCart = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  setupCart: mockSetupCart,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

const mockGetSessionUid = jest.fn();
jest.mock('@fxa/payments/ui-auth', () => ({
  __esModule: true,
  getSessionUid: () => mockGetSessionUid(),
}));

describe('setupCartAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_INTERVAL = SubplatInterval.Monthly;
  const MOCK_OFFERING_ID = 'offering-vpn-123';
  const MOCK_TAX_ADDRESS = {
    countryCode: 'US',
    postalCode: '90210',
  };
  const MOCK_EXPERIMENT = 'experiment-1';
  const MOCK_PROMO_CODE = 'SAVE10';

  beforeEach(() => {
    mockSetupCart.mockReset();
    mockGetSessionUid.mockReset();
    mockGetSessionUid.mockResolvedValue(MOCK_UID);
  });

  it('calls setupCart with all parameters including optional ones', async () => {
    const mockResult = { cartId: 'cart-123' };
    mockSetupCart.mockResolvedValue(mockResult);

    await setupCartAction(
      MOCK_INTERVAL,
      MOCK_OFFERING_ID,
      MOCK_TAX_ADDRESS,
      MOCK_EXPERIMENT,
      MOCK_PROMO_CODE
    );

    expect(mockSetupCart).toHaveBeenCalledWith({
      interval: MOCK_INTERVAL,
      offeringConfigId: MOCK_OFFERING_ID,
      experiment: MOCK_EXPERIMENT,
      promoCode: MOCK_PROMO_CODE,
      uid: MOCK_UID,
      taxAddress: MOCK_TAX_ADDRESS,
    });
  });

  it('calls setupCart with undefined optional parameters when omitted', async () => {
    mockSetupCart.mockResolvedValue({ cartId: 'cart-123' });

    await setupCartAction(MOCK_INTERVAL, MOCK_OFFERING_ID, MOCK_TAX_ADDRESS);

    expect(mockSetupCart).toHaveBeenCalledWith({
      interval: MOCK_INTERVAL,
      offeringConfigId: MOCK_OFFERING_ID,
      experiment: undefined,
      promoCode: undefined,
      uid: MOCK_UID,
      taxAddress: MOCK_TAX_ADDRESS,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { cartId: 'cart-456', version: 1 };
    mockSetupCart.mockResolvedValue(mockResult);

    const result = await setupCartAction(
      MOCK_INTERVAL,
      MOCK_OFFERING_ID,
      MOCK_TAX_ADDRESS
    );

    expect(result).toEqual(mockResult);
  });

  it('passes uid as undefined when user is not authenticated', async () => {
    mockGetSessionUid.mockResolvedValue(undefined);
    mockSetupCart.mockResolvedValue({ cartId: 'cart-anon' });

    await setupCartAction(MOCK_INTERVAL, MOCK_OFFERING_ID, MOCK_TAX_ADDRESS);

    expect(mockSetupCart).toHaveBeenCalledWith(
      expect.objectContaining({ uid: undefined })
    );
  });

  it('propagates errors when the actions service rejects', async () => {
    mockSetupCart.mockRejectedValue(new Error('Invalid offering'));

    await expect(
      setupCartAction(MOCK_INTERVAL, MOCK_OFFERING_ID, MOCK_TAX_ADDRESS)
    ).rejects.toThrow('Invalid offering');
  });
});
