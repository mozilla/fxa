/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';
import {
  EligibilityContentByPlanIdsQueryFactory,
  EligibilityContentByPlanIdsResult,
  EligibilityContentByPlanIdsResultUtil,
  EligibilityPurchaseResultFactory,
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { MockStripeConfigProvider, StripeClient } from '@fxa/payments/stripe';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { PriceManager } from '@fxa/payments/customer';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import {
  CheckoutParamsFactory,
  CommonMetricsFactory,
  MockPaymentsGleanConfigProvider,
  MockPaymentsGleanFactory,
  PaymentProvidersType,
  PaymentsGleanManager,
} from '@fxa/payments/metrics';
import { CartManager } from '@fxa/payments/cart';
import { PaymentsEmitterService } from './emitter.service';
import {
  AdditionalMetricsDataFactory,
  SubscriptionEndedFactory,
} from './emitter.factories';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { AccountManager } from '@fxa/shared/account/account';
import { retrieveAdditionalMetricsData } from './util/retrieveAdditionalMetricsData';

jest.mock('./util/retrieveAdditionalMetricsData');
const mockedRetrieveAdditionalMetricsData = jest.mocked(
  retrieveAdditionalMetricsData
);

describe('PaymentsEmitterService', () => {
  let paymentsEmitterService: PaymentsEmitterService;
  let paymentsGleanManager: PaymentsGleanManager;
  let productConfigurationManager: ProductConfigurationManager;
  let cartManager: CartManager;

  const additionalMetricsData = AdditionalMetricsDataFactory();
  const mockCommonMetricsData = CommonMetricsFactory({
    params: CheckoutParamsFactory(),
  });
  const mockCheckoutPaymentEvents = {
    ...mockCommonMetricsData,
    paymentProvider: 'stripe' as PaymentProvidersType,
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockPaymentsGleanConfigProvider,
        MockAccountDatabaseNestFactory,
        MockPaymentsGleanFactory,
        MockStrapiClientConfigProvider,
        MockStripeConfigProvider,
        MockFirestoreProvider,
        MockStatsDProvider,
        AccountManager,
        CartManager,
        StrapiClient,
        StripeClient,
        PriceManager,
        PaymentsGleanManager,
        ProductConfigurationManager,
        PaymentsEmitterService,
      ],
    }).compile();

    paymentsEmitterService = moduleRef.get(PaymentsEmitterService);
    paymentsGleanManager = moduleRef.get(PaymentsGleanManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    cartManager = moduleRef.get(CartManager);
  });

  it('should be defined', () => {
    expect(paymentsEmitterService).toBeDefined();
    expect(paymentsGleanManager).toBeDefined();
    expect(productConfigurationManager).toBeDefined();
  });

  beforeEach(() => {
    jest
      .spyOn(paymentsEmitterService as any, 'retrieveOptOut')
      .mockResolvedValue(false);
    mockedRetrieveAdditionalMetricsData.mockResolvedValue(
      additionalMetricsData
    );
  });

  describe('handleCheckoutView', () => {
    beforeEach(() => {
      jest
        .spyOn(paymentsGleanManager, 'recordFxaPaySetupView')
        .mockReturnValue();
    });

    it('should call manager record method', async () => {
      await paymentsEmitterService.handleCheckoutView(mockCommonMetricsData);

      expect(mockedRetrieveAdditionalMetricsData).toHaveBeenCalledWith(
        productConfigurationManager,
        cartManager,
        mockCommonMetricsData.params
      );
      expect(paymentsGleanManager.recordFxaPaySetupView).toHaveBeenCalledWith({
        commonMetricsData: mockCommonMetricsData,
        ...additionalMetricsData,
      });
    });

    it('should not record glean event if user opts out', async () => {
      jest
        .spyOn(paymentsEmitterService as any, 'retrieveOptOut')
        .mockResolvedValue(true);
      await paymentsEmitterService.handleCheckoutView(
        mockCheckoutPaymentEvents
      );
      expect(mockedRetrieveAdditionalMetricsData).toHaveBeenCalledWith(
        productConfigurationManager,
        cartManager,
        mockCommonMetricsData.params
      );
      expect(paymentsGleanManager.recordFxaPaySetupView).not.toHaveBeenCalled();
    });
  });

  describe('handleCheckoutEngage', () => {
    beforeEach(() => {
      jest
        .spyOn(paymentsGleanManager, 'recordFxaPaySetupEngage')
        .mockReturnValue();
    });

    it('should call manager record method', async () => {
      await paymentsEmitterService.handleCheckoutEngage(mockCommonMetricsData);

      expect(mockedRetrieveAdditionalMetricsData).toHaveBeenCalledWith(
        productConfigurationManager,
        cartManager,
        mockCommonMetricsData.params
      );
      expect(paymentsGleanManager.recordFxaPaySetupEngage).toHaveBeenCalledWith(
        {
          commonMetricsData: mockCommonMetricsData,
          ...additionalMetricsData,
        }
      );
    });

    it('should not record glean event if user opts out', async () => {
      jest
        .spyOn(paymentsEmitterService as any, 'retrieveOptOut')
        .mockResolvedValue(true);
      await paymentsEmitterService.handleCheckoutEngage(
        mockCheckoutPaymentEvents
      );
      expect(mockedRetrieveAdditionalMetricsData).toHaveBeenCalledWith(
        productConfigurationManager,
        cartManager,
        mockCommonMetricsData.params
      );
      expect(
        paymentsGleanManager.recordFxaPaySetupEngage
      ).not.toHaveBeenCalled();
    });
  });

  describe('handleCheckoutSubmit', () => {
    beforeEach(() => {
      jest
        .spyOn(paymentsGleanManager, 'recordFxaPaySetupSubmit')
        .mockReturnValue();
    });

    it('should call manager record method', async () => {
      await paymentsEmitterService.handleCheckoutSubmit(
        mockCheckoutPaymentEvents
      );

      expect(mockedRetrieveAdditionalMetricsData).toHaveBeenCalledWith(
        productConfigurationManager,
        cartManager,
        mockCommonMetricsData.params
      );
      expect(paymentsGleanManager.recordFxaPaySetupSubmit).toHaveBeenCalledWith(
        {
          commonMetricsData: mockCheckoutPaymentEvents,
          ...additionalMetricsData,
        },
        mockCheckoutPaymentEvents.paymentProvider
      );
    });

    it('should not record glean event if user opts out', async () => {
      jest
        .spyOn(paymentsEmitterService as any, 'retrieveOptOut')
        .mockResolvedValue(true);
      await paymentsEmitterService.handleCheckoutSubmit(
        mockCheckoutPaymentEvents
      );
      expect(mockedRetrieveAdditionalMetricsData).toHaveBeenCalledWith(
        productConfigurationManager,
        cartManager,
        mockCommonMetricsData.params
      );
      expect(
        paymentsGleanManager.recordFxaPaySetupSubmit
      ).not.toHaveBeenCalled();
    });
  });

  describe('handleCheckoutSuccess', () => {
    beforeEach(() => {
      jest
        .spyOn(paymentsGleanManager, 'recordFxaPaySetupSuccess')
        .mockReturnValue();
    });

    it('should call manager record method', async () => {
      await paymentsEmitterService.handleCheckoutSuccess(
        mockCheckoutPaymentEvents
      );

      expect(mockedRetrieveAdditionalMetricsData).toHaveBeenCalledWith(
        productConfigurationManager,
        cartManager,
        mockCommonMetricsData.params
      );
      expect(
        paymentsGleanManager.recordFxaPaySetupSuccess
      ).toHaveBeenCalledWith(
        {
          commonMetricsData: mockCheckoutPaymentEvents,
          ...additionalMetricsData,
        },
        mockCheckoutPaymentEvents.paymentProvider
      );
    });

    it('should not record glean event if user opts out', async () => {
      jest
        .spyOn(paymentsEmitterService as any, 'retrieveOptOut')
        .mockResolvedValue(true);
      await paymentsEmitterService.handleCheckoutSuccess(
        mockCheckoutPaymentEvents
      );
      expect(mockedRetrieveAdditionalMetricsData).toHaveBeenCalledWith(
        productConfigurationManager,
        cartManager,
        mockCommonMetricsData.params
      );
      expect(
        paymentsGleanManager.recordFxaPaySetupSuccess
      ).not.toHaveBeenCalled();
    });
  });

  describe('handleCheckoutFail', () => {
    beforeEach(() => {
      jest
        .spyOn(paymentsGleanManager, 'recordFxaPaySetupFail')
        .mockReturnValue();
    });

    it('should call manager record method', async () => {
      await paymentsEmitterService.handleCheckoutFail(
        mockCheckoutPaymentEvents
      );

      expect(mockedRetrieveAdditionalMetricsData).toHaveBeenCalledWith(
        productConfigurationManager,
        cartManager,
        mockCommonMetricsData.params
      );
      expect(paymentsGleanManager.recordFxaPaySetupFail).toHaveBeenCalledWith(
        {
          commonMetricsData: mockCheckoutPaymentEvents,
          ...additionalMetricsData,
        },
        mockCheckoutPaymentEvents.paymentProvider
      );
    });

    it('should not record glean event if user opts out', async () => {
      jest
        .spyOn(paymentsEmitterService as any, 'retrieveOptOut')
        .mockResolvedValue(true);
      await paymentsEmitterService.handleCheckoutFail(
        mockCheckoutPaymentEvents
      );
      expect(mockedRetrieveAdditionalMetricsData).toHaveBeenCalledWith(
        productConfigurationManager,
        cartManager,
        mockCommonMetricsData.params
      );
      expect(paymentsGleanManager.recordFxaPaySetupFail).not.toHaveBeenCalled();
    });
  });

  describe('handleSubscriptionEnded', () => {
    const completeEventData = SubscriptionEndedFactory({
      priceInterval: 'month',
      priceIntervalCount: 1,
      paymentProvider: 'card',
    });
    const util = new EligibilityContentByPlanIdsResultUtil(
      EligibilityContentByPlanIdsQueryFactory({
        purchases: [
          EligibilityPurchaseResultFactory({
            stripePlanChoices: [
              {
                stripePlanChoice: completeEventData.priceId,
              },
            ],
          }),
        ],
      }) as EligibilityContentByPlanIdsResult
    );

    beforeEach(() => {
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(util);
    });

    it('should call manager record method', async () => {
      await paymentsEmitterService.handleSubscriptionEnded(completeEventData);

      expect(
        productConfigurationManager.getPurchaseDetailsForEligibility
      ).toHaveBeenCalledWith([completeEventData.priceId]);
    });
  });
});
