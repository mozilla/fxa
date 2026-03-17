/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';
import { PaymentsGleanManager } from './glean.manager';
import {
  CartMetricsFactory,
  CmsMetricsDataFactory,
  CommonMetricsFactory,
  ExperimentationDataFactory,
  SubscriptionCancellationDataFactory,
  TrialConversionDataFactory,
} from './glean.factory';
import { PaymentsGleanProvider } from './glean.types';
import { MockPaymentsGleanFactory } from './glean.test-provider';
import {
  MockPaymentsGleanConfigProvider,
  PaymentsGleanConfig,
} from './glean.config';
import { SubPlatPaymentMethodType } from '@fxa/payments/customer';

const mockCommonMetricsData = {
  commonMetricsData: CommonMetricsFactory(),
  cartMetricsData: CartMetricsFactory(),
  cmsMetricsData: CmsMetricsDataFactory(),
  subscriptionCancellationData: SubscriptionCancellationDataFactory(),
  experimentationData: ExperimentationDataFactory(),
};
const mockCommonMetrics = { common: 'metrics' };
const mockPaymentProvider = 'stripe';
const mockPaymentMethod = SubPlatPaymentMethodType.Card;

describe('PaymentsGleanManager', () => {
  let paymentsGleanManager: PaymentsGleanManager;
  let paymentsGleanServerEventsLogger: any;
  let spyPopulateCommonMetrics: jest.SpyInstance;

  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = { ...originalEnv, CI: '' };
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockPaymentsGleanFactory,
        PaymentsGleanManager,
        MockPaymentsGleanConfigProvider,
      ],
    }).compile();

    paymentsGleanManager = moduleRef.get(PaymentsGleanManager);
    paymentsGleanServerEventsLogger = moduleRef.get(PaymentsGleanProvider);
  });

  afterEach(() => {
    process.env = originalEnv;
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

    it('should record fxa pay setup submit', () => {
      paymentsGleanManager.recordFxaPaySetupSubmit(
        mockCommonMetricsData,
        mockPaymentProvider,
        mockPaymentMethod
      );
      expect(spyPopulateCommonMetrics).toHaveBeenCalledWith(
        mockCommonMetricsData,
        mockPaymentProvider,
        mockPaymentMethod
      );
      expect(
        paymentsGleanServerEventsLogger.recordPaySetupSubmit
      ).toHaveBeenCalledWith({
        ...mockCommonMetrics,
        subscription_payment_provider: mockPaymentProvider,
        subscription_payment_method: mockPaymentMethod,
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

    it('should record fxa pay setup success', () => {
      paymentsGleanManager.recordFxaPaySetupSuccess(
        mockCommonMetricsData,
        mockPaymentProvider,
        mockPaymentMethod
      );
      expect(spyPopulateCommonMetrics).toHaveBeenCalledWith(
        mockCommonMetricsData,
        mockPaymentProvider,
        mockPaymentMethod
      );
      expect(
        paymentsGleanServerEventsLogger.recordPaySetupSuccess
      ).toHaveBeenCalledWith({
        ...mockCommonMetrics,
        subscription_payment_provider: mockPaymentProvider,
        subscription_payment_method: mockPaymentMethod,
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

    it('should record fxa pay setup fail', () => {
      paymentsGleanManager.recordFxaPaySetupFail(
        mockCommonMetricsData,
        mockPaymentProvider
      );
      expect(spyPopulateCommonMetrics).toHaveBeenCalledWith(
        mockCommonMetricsData,
      );
      expect(
        paymentsGleanServerEventsLogger.recordPaySetupFail
      ).toHaveBeenCalledWith({
        ...mockCommonMetrics,
        subscription_payment_provider: mockPaymentProvider,
      });
    });
  });

  describe('recordFxaSubscriptionEnded', () => {
    beforeEach(() => {
      jest
        .spyOn(paymentsGleanServerEventsLogger, 'recordSubscriptionEnded')
        .mockReturnValue({});
      spyPopulateCommonMetrics = jest
        .spyOn(paymentsGleanManager as any, 'populateCommonMetrics')
        .mockReturnValue(mockCommonMetrics);
    });

    it('should record subscribe - subscription_ended', () => {
      paymentsGleanManager.recordFxaSubscriptionEnded(
        {
          cmsMetricsData: mockCommonMetricsData.cmsMetricsData,
          subscriptionCancellationData:
            mockCommonMetricsData.subscriptionCancellationData,
        },
        mockPaymentProvider
      );
      expect(spyPopulateCommonMetrics).toHaveBeenCalledWith(
        {
          cmsMetricsData: mockCommonMetricsData.cmsMetricsData,
          subscriptionCancellationData:
            mockCommonMetricsData.subscriptionCancellationData,
        },
        mockPaymentProvider
      );
      expect(
        paymentsGleanServerEventsLogger.recordSubscriptionEnded
      ).toHaveBeenCalledWith({
        ...mockCommonMetrics,
        subscription_payment_provider: mockPaymentProvider,
      });
    });
  });

  describe('recordFxaSubscriptionTrialConverted', () => {
    beforeEach(() => {
      jest
        .spyOn(
          paymentsGleanServerEventsLogger,
          'recordSubscriptionTrialConverted'
        )
        .mockReturnValue({});
      spyPopulateCommonMetrics = jest
        .spyOn(paymentsGleanManager as any, 'populateCommonMetrics')
        .mockReturnValue(mockCommonMetrics);
    });

    it('should record subscription trial converted', () => {
      const mockTrialConversionData = TrialConversionDataFactory();
      const metricsData = {
        cmsMetricsData: mockCommonMetricsData.cmsMetricsData,
        trialConversionData: mockTrialConversionData,
      };
      paymentsGleanManager.recordFxaSubscriptionTrialConverted(
        metricsData,
        mockPaymentProvider
      );
      expect(spyPopulateCommonMetrics).toHaveBeenCalledWith(metricsData);
      expect(
        paymentsGleanServerEventsLogger.recordSubscriptionTrialConverted
      ).toHaveBeenCalledWith({
        ...mockCommonMetrics,
        subscription_payment_provider: mockPaymentProvider,
        subscription_product_id: mockTrialConversionData.productId,
        subscription_provider_event_id:
          mockTrialConversionData.providerEventId,
        trial_conversion_status: mockTrialConversionData.conversionStatus,
        subscription_billing_country: mockTrialConversionData.billingCountry,
      });
    });
  });

  describe('enabled is false', () => {
    {
      let paymentsGleanManager: PaymentsGleanManager;
      let paymentsGleanServerEventsLogger: any;

      beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
          providers: [
            MockPaymentsGleanFactory,
            PaymentsGleanManager,
            MockPaymentsGleanConfigProvider,
            {
              provide: PaymentsGleanConfig,
              useValue: {
                enabled: false,
              },
            },
          ],
        }).compile();

        paymentsGleanManager = moduleRef.get(PaymentsGleanManager);
        paymentsGleanServerEventsLogger = moduleRef.get(PaymentsGleanProvider);
        jest.spyOn(paymentsGleanServerEventsLogger, 'recordPaySetupView');
        jest.spyOn(paymentsGleanServerEventsLogger, 'recordPaySetupEngage');
        jest.spyOn(paymentsGleanServerEventsLogger, 'recordPaySetupSubmit');
        jest.spyOn(paymentsGleanServerEventsLogger, 'recordPaySetupSuccess');
        jest.spyOn(paymentsGleanServerEventsLogger, 'recordPaySetupFail');
      });

      it('recordFxaPaySetupView', () => {
        paymentsGleanManager.recordFxaPaySetupView(mockCommonMetricsData);
        expect(
          paymentsGleanServerEventsLogger.recordPaySetupView
        ).not.toHaveBeenCalled();
      });

      it('recordFxaPaySetupEngage', () => {
        paymentsGleanManager.recordFxaPaySetupEngage(mockCommonMetricsData);
        expect(
          paymentsGleanServerEventsLogger.recordPaySetupEngage
        ).not.toHaveBeenCalled();
      });

      it('recordFxaPaySetupSubmit', () => {
        paymentsGleanManager.recordFxaPaySetupSubmit(mockCommonMetricsData);
        expect(
          paymentsGleanServerEventsLogger.recordPaySetupSubmit
        ).not.toHaveBeenCalled();
      });

      it('recordFxaPaySetupSuccess', () => {
        paymentsGleanManager.recordFxaPaySetupSuccess(mockCommonMetricsData);
        expect(
          paymentsGleanServerEventsLogger.recordPaySetupSuccess
        ).not.toHaveBeenCalled();
      });

      it('recordFxaPaySetupFail', () => {
        paymentsGleanManager.recordFxaPaySetupFail(mockCommonMetricsData);
        expect(
          paymentsGleanServerEventsLogger.recordPaySetupFail
        ).not.toHaveBeenCalled();
      });
    }
  });
});
