/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { updateTaxAddressAction } from './updateTaxAddress';

const mockUpdateTaxAddress = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  updateTaxAddress: mockUpdateTaxAddress,
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

const mockRevalidatePath = jest.fn();
jest.mock('next/cache', () => ({
  __esModule: true,
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

describe('updateTaxAddressAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_CART_ID = 'cart-abc-123';
  const MOCK_VERSION = 1;
  const MOCK_OFFERING_ID = 'offering-vpn-123';
  const MOCK_TAX_ADDRESS = { countryCode: 'US', postalCode: '90210' };
  const MOCK_INTERVAL = 'monthly';

  beforeEach(() => {
    mockUpdateTaxAddress.mockReset();
    mockGetSessionUid.mockReset();
    mockRevalidatePath.mockReset();
    mockGetSessionUid.mockResolvedValue(MOCK_UID);
  });

  it('calls updateTaxAddress with all parameters including optional interval', async () => {
    const mockResult = { success: true };
    mockUpdateTaxAddress.mockResolvedValue(mockResult);

    await updateTaxAddressAction(
      MOCK_CART_ID,
      MOCK_VERSION,
      MOCK_OFFERING_ID,
      MOCK_TAX_ADDRESS,
      MOCK_INTERVAL
    );

    expect(mockUpdateTaxAddress).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      version: MOCK_VERSION,
      offeringId: MOCK_OFFERING_ID,
      taxAddress: MOCK_TAX_ADDRESS,
      uid: MOCK_UID,
      interval: MOCK_INTERVAL,
    });
  });

  it('calls revalidatePath after successful update', async () => {
    mockUpdateTaxAddress.mockResolvedValue({ success: true });

    await updateTaxAddressAction(
      MOCK_CART_ID,
      MOCK_VERSION,
      MOCK_OFFERING_ID,
      MOCK_TAX_ADDRESS
    );

    expect(mockRevalidatePath).toHaveBeenCalledWith(
      '/[locale]/[offeringId]/[interval]/checkout/[cartId]/start',
      'page'
    );
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { success: true, version: 2 };
    mockUpdateTaxAddress.mockResolvedValue(mockResult);

    const result = await updateTaxAddressAction(
      MOCK_CART_ID,
      MOCK_VERSION,
      MOCK_OFFERING_ID,
      MOCK_TAX_ADDRESS
    );

    expect(result).toEqual(mockResult);
  });

  it('handles optional interval parameter', async () => {
    mockUpdateTaxAddress.mockResolvedValue({ success: true });

    await updateTaxAddressAction(
      MOCK_CART_ID,
      MOCK_VERSION,
      MOCK_OFFERING_ID,
      MOCK_TAX_ADDRESS
    );

    expect(mockUpdateTaxAddress).toHaveBeenCalledWith(
      expect.objectContaining({ interval: undefined })
    );
  });

  it('propagates errors when the actions service rejects', async () => {
    mockUpdateTaxAddress.mockRejectedValue(new Error('Invalid tax address'));

    await expect(
      updateTaxAddressAction(
        MOCK_CART_ID,
        MOCK_VERSION,
        MOCK_OFFERING_ID,
        MOCK_TAX_ADDRESS
      )
    ).rejects.toThrow('Invalid tax address');
  });
});
