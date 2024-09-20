/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';
import { PaymentsGleanManager } from './glean.manager';
import {
  CmsMetricsDataFactory,
  FxaPaySetupViewMetricsFactory,
} from './glean.factory';
import {
  MockPaymentsGleanFactory,
  PaymentsGleanProvider,
  PaymentsGleanServerEventsLogger,
} from './glean.provider';

describe('PaymentsGleanService', () => {
  let paymentsGleanManager: PaymentsGleanManager;
  let paymentsGleanServerEventsLogger: PaymentsGleanServerEventsLogger;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [MockPaymentsGleanFactory, PaymentsGleanManager],
    }).compile();

    paymentsGleanManager = moduleRef.get(PaymentsGleanManager);
    paymentsGleanServerEventsLogger = moduleRef.get(PaymentsGleanProvider);
  });

  it('should be defined', () => {
    expect(paymentsGleanManager).toBeDefined();
  });

  describe('recordFxaPaySetupView', () => {
    const mockCmsData = CmsMetricsDataFactory();
    const mockMetricsData = FxaPaySetupViewMetricsFactory();

    beforeEach(() => {
      jest
        .spyOn(paymentsGleanServerEventsLogger, 'recordPaySetupView')
        .mockReturnValue();
    });

    it('should record fxa pay setup view', async () => {
      await paymentsGleanManager.recordFxaPaySetupView(
        mockMetricsData,
        mockCmsData
      );
      expect(
        paymentsGleanServerEventsLogger.recordPaySetupView
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_checkout_type: mockMetricsData.checkoutType,
        })
      );
    });
  });
});
