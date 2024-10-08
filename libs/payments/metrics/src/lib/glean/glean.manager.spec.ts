/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';
import { PaymentsGleanManager } from './glean.manager';
import {
  CartMetricsFactory,
  CmsMetricsDataFactory,
  CommonMetricsFactory,
} from './glean.factory';
import { PaymentsGleanProvider } from './glean.types';
import { MockPaymentsGleanFactory } from './glean.test-provider';

const mockCommonMetricsData = {
  commonMetricsData: CommonMetricsFactory(),
  cartMetricsData: CartMetricsFactory(),
  cmsMetricsData: CmsMetricsDataFactory(),
};
const mockCommonMetrics = { common: 'metrics' };
const mockPaymentProvider = 'stripe';

describe('PaymentsGleanManager', () => {
  let paymentsGleanManager: PaymentsGleanManager;
  let paymentsGleanServerEventsLogger: any;
  let spyPopulateCommonMetrics: jest.SpyInstance;

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
    beforeEach(() => {
      jest
        .spyOn(paymentsGleanServerEventsLogger, 'recordPaySetupView')
        .mockReturnValue({});
      spyPopulateCommonMetrics = jest
        .spyOn(paymentsGleanManager as any, 'populateCommonMetrics')
        .mockReturnValue(mockCommonMetrics);
    });

    it('should record fxa pay setup view', () => {
      paymentsGleanManager.recordFxaPaySetupView(mockCommonMetricsData);
      expect(
        paymentsGleanServerEventsLogger.recordPaySetupView
      ).toHaveBeenCalledWith(mockCommonMetrics);
    });
  });

  describe('recordFxaPaySetupEngage', () => {
    beforeEach(() => {
      jest
        .spyOn(paymentsGleanServerEventsLogger, 'recordPaySetupEngage')
        .mockReturnValue({});
      spyPopulateCommonMetrics = jest
        .spyOn(paymentsGleanManager as any, 'populateCommonMetrics')
        .mockReturnValue(mockCommonMetrics);
    });

    it('should record fxa pay setup engage', () => {
      paymentsGleanManager.recordFxaPaySetupEngage(mockCommonMetricsData);
      expect(spyPopulateCommonMetrics).toHaveBeenCalledWith(
        mockCommonMetricsData
      );
      expect(
        paymentsGleanServerEventsLogger.recordPaySetupEngage
      ).toHaveBeenCalledWith(mockCommonMetrics);
    });
  });

  describe('recordFxaPaySetupSubmit', () => {
    beforeEach(() => {
      jest
        .spyOn(paymentsGleanServerEventsLogger, 'recordPaySetupSubmit')
        .mockReturnValue({});
      spyPopulateCommonMetrics = jest
        .spyOn(paymentsGleanManager as any, 'populateCommonMetrics')
        .mockReturnValue(mockCommonMetrics);
    });

    it('should record fxa pay setup engage', () => {
      paymentsGleanManager.recordFxaPaySetupSubmit(
        mockCommonMetricsData,
        mockPaymentProvider
      );
      expect(spyPopulateCommonMetrics).toHaveBeenCalledWith(
        mockCommonMetricsData
      );
      expect(
        paymentsGleanServerEventsLogger.recordPaySetupSubmit
      ).toHaveBeenCalledWith({
        ...mockCommonMetrics,
        subscription_payment_provider: mockPaymentProvider,
      });
    });
  });

  describe('recordFxaPaySetupSuccess', () => {
    beforeEach(() => {
      jest
        .spyOn(paymentsGleanServerEventsLogger, 'recordPaySetupSuccess')
        .mockReturnValue({});
      spyPopulateCommonMetrics = jest
        .spyOn(paymentsGleanManager as any, 'populateCommonMetrics')
        .mockReturnValue(mockCommonMetrics);
    });

    it('should record fxa pay setup engage', () => {
      paymentsGleanManager.recordFxaPaySetupSuccess(
        mockCommonMetricsData,
        mockPaymentProvider
      );
      expect(spyPopulateCommonMetrics).toHaveBeenCalledWith(
        mockCommonMetricsData
      );
      expect(
        paymentsGleanServerEventsLogger.recordPaySetupSuccess
      ).toHaveBeenCalledWith({
        ...mockCommonMetrics,
        subscription_payment_provider: mockPaymentProvider,
      });
    });
  });

  describe('recordFxaPaySetupFail', () => {
    beforeEach(() => {
      jest
        .spyOn(paymentsGleanServerEventsLogger, 'recordPaySetupFail')
        .mockReturnValue({});
      spyPopulateCommonMetrics = jest
        .spyOn(paymentsGleanManager as any, 'populateCommonMetrics')
        .mockReturnValue(mockCommonMetrics);
    });

    it('should record fxa pay setup engage', () => {
      paymentsGleanManager.recordFxaPaySetupFail(
        mockCommonMetricsData,
        mockPaymentProvider
      );
      expect(spyPopulateCommonMetrics).toHaveBeenCalledWith(
        mockCommonMetricsData
      );
      expect(
        paymentsGleanServerEventsLogger.recordPaySetupFail
      ).toHaveBeenCalledWith({
        ...mockCommonMetrics,
        subscription_payment_provider: mockPaymentProvider,
      });
    });
  });
});
