/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getChurnInterventionDataAction } from './getChurnInterventionData';

const mockGetChurnInterventionEntryData = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  getChurnInterventionEntryData: mockGetChurnInterventionEntryData,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

describe('getChurnInterventionDataAction', () => {
  const MOCK_CUSTOMER_ID = 'cus_abc123';
  const MOCK_CHURN_INTERVENTION_ID = 'churn_int_456';

  beforeEach(() => {
    mockGetChurnInterventionEntryData.mockReset();
  });

  it('calls getChurnInterventionEntryData with customerId and churnInterventionId', async () => {
    const mockResult = {
      churnInterventionId: MOCK_CHURN_INTERVENTION_ID,
      stripeCouponId: 'coupon_789',
    };
    mockGetChurnInterventionEntryData.mockResolvedValue(mockResult);

    await getChurnInterventionDataAction(
      MOCK_CUSTOMER_ID,
      MOCK_CHURN_INTERVENTION_ID
    );

    expect(mockGetChurnInterventionEntryData).toHaveBeenCalledWith({
      customerId: MOCK_CUSTOMER_ID,
      churnInterventionId: MOCK_CHURN_INTERVENTION_ID,
    });
  });

  it('returns the churn intervention entry from the service', async () => {
    const mockResult = {
      churnInterventionId: MOCK_CHURN_INTERVENTION_ID,
      stripeCouponId: 'coupon_789',
      discountAmount: 50,
    };
    mockGetChurnInterventionEntryData.mockResolvedValue(mockResult);

    const result = await getChurnInterventionDataAction(
      MOCK_CUSTOMER_ID,
      MOCK_CHURN_INTERVENTION_ID
    );

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when the actions service rejects', async () => {
    mockGetChurnInterventionEntryData.mockRejectedValue(
      new Error('Intervention not found')
    );

    await expect(
      getChurnInterventionDataAction(
        MOCK_CUSTOMER_ID,
        MOCK_CHURN_INTERVENTION_ID
      )
    ).rejects.toThrow('Intervention not found');
  });
});
