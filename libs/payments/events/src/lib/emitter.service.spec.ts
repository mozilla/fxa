/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';
import {
  EligibilityContentByPlanIdsQueryFactory,
  EligibilityContentByPlanIdsResult,
  EligibilityContentByPlanIdsResultUtil,
  EligibilityOfferingResultFactory,
  EligibilityPurchaseResultFactory,
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import {
  MockStripeConfigProvider,
  StripeClient,
  StripePriceFactory,
  StripeResponseFactory,
} from '@fxa/payments/stripe';
import {
  MockStatsDProvider,
  StatsD,
  StatsDService,
} from '@fxa/shared/metrics/statsd';
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
  SP3RolloutEventFactory,
  SubscriptionEndedFactory,
} from './emitter.factories';
import {
  AccountFactory,
  MockAccountDatabaseNestFactory,
} from '@fxa/shared/db/mysql/account';
import { AccountManager } from '@fxa/shared/account/account';
import { retrieveAdditionalMetricsData } from './util/retrieveAdditionalMetricsData';

jest.mock('./util/retrieveAdditionalMetricsData');
const mockedRetrieveAdditionalMetricsData = jest.mocked(
  retrieveAdditionalMetricsData
);

describe('PaymentsEmitterService', () => {
  let accountManager: AccountManager;
  let paymentsEmitterService: PaymentsEmitterService;
  let paymentsGleanManager: PaymentsGleanManager;
  let productConfigurationManager: ProductConfigurationManager;
  let cartManager: CartManager;
  let statsd: StatsD;

  const additionalMetricsData = AdditionalMetricsDataFactory();
  const mockCommonMetricsData = CommonMetricsFactory({
    params: CheckoutParamsFactory(),
  });
  const mockCheckoutPaymentEvents = {
    ...mockCommonMetricsData,
    paymentProvider: 'stripe' as PaymentProvidersType,
  };
  let retrieveOptOutMock: jest.SpyInstance<any, unknown[], any>;

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

    accountManager = moduleRef.get(AccountManager);
    paymentsEmitterService = moduleRef.get(PaymentsEmitterService);
    paymentsGleanManager = moduleRef.get(PaymentsGleanManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    cartManager = moduleRef.get(CartManager);
    statsd = moduleRef.get<StatsD>(StatsDService);
  });

  it('should be defined', () => {
    expect(accountManager).toBeDefined();
    expect(paymentsEmitterService).toBeDefined();
    expect(paymentsGleanManager).toBeDefined();
    expect(productConfigurationManager).toBeDefined();
  });

  beforeEach(() => {
    retrieveOptOutMock = jest
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
    const mockOfferingId = 'VPN';
    const mockInterval = 'month';
    const mockSubplatInterval = 'monthly';
    const cancellationEventData = SubscriptionEndedFactory({
      productId: additionalMetricsData.cmsMetricsData.productId,
      priceId: additionalMetricsData.cmsMetricsData.priceId,
      priceInterval: mockInterval,
      priceIntervalCount: 1,
      paymentProvider: 'card',
    });

    const mockPrice = StripeResponseFactory(
      StripePriceFactory({
        id: additionalMetricsData.cmsMetricsData.priceId,
        product: additionalMetricsData.cmsMetricsData.productId,
      })
    );
    const mockElibilityOfferingResult = EligibilityOfferingResultFactory({
      apiIdentifier: mockOfferingId,
    });

    const util = new EligibilityContentByPlanIdsResultUtil(
      EligibilityContentByPlanIdsQueryFactory({
        purchases: [
          EligibilityPurchaseResultFactory({
            stripePlanChoices: [
              {
                stripePlanChoice: cancellationEventData.priceId,
              },
            ],
            offering: mockElibilityOfferingResult,
          }),
        ],
      }) as EligibilityContentByPlanIdsResult
    );

    const subscriptionCancellationData = {
      offeringId: mockOfferingId,
      interval: mockSubplatInterval,
      cancellationReason: cancellationEventData.cancellationReason,
      providerEventId: cancellationEventData.providerEventId,
    };

    beforeEach(() => {
      jest
        .spyOn(paymentsGleanManager, 'recordFxaSubscriptionEnded')
        .mockReturnValue();
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(util);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
    });

    it('should call manager record method', async () => {
      await paymentsEmitterService.handleSubscriptionEnded(
        cancellationEventData
      );
      expect(
        productConfigurationManager.getPurchaseDetailsForEligibility
      ).toHaveBeenCalledWith([cancellationEventData.priceId]);
      expect(
        paymentsGleanManager.recordFxaSubscriptionEnded
      ).toHaveBeenCalledWith(
        {
          cmsMetricsData: additionalMetricsData.cmsMetricsData,
          subscriptionCancellationData,
        },
        cancellationEventData.paymentProvider
      );
    });

    it('should not call manager record method if user has opted out', async () => {
      retrieveOptOutMock.mockRestore();

      const mockUid = 'f440f251e8af9b0cf4bb3037529eda40';
      const mockOptOutAccount = AccountFactory({
        metricsOptOutAt: 1,
        uid: Buffer.from(mockUid, 'hex'),
      });
      jest
        .spyOn(accountManager, 'getAccounts')
        .mockResolvedValue([mockOptOutAccount]);

      const eventData = {
        ...cancellationEventData,
        uid: mockUid,
      };
      await paymentsEmitterService.handleSubscriptionEnded(eventData);
      expect(accountManager.getAccounts).toHaveBeenCalledWith([mockUid]);
      expect(
        paymentsGleanManager.recordFxaSubscriptionEnded
      ).not.toHaveBeenCalled();
    });

    it('calls manager record method with undefined interval if interval is not provided', async () => {
      const eventData = {
        ...cancellationEventData,
        priceInterval: undefined,
      };
      await paymentsEmitterService.handleSubscriptionEnded(eventData);
      expect(
        paymentsGleanManager.recordFxaSubscriptionEnded
      ).toHaveBeenCalledWith(
        {
          cmsMetricsData: additionalMetricsData.cmsMetricsData,
          subscriptionCancellationData: {
            ...subscriptionCancellationData,
            interval: undefined,
          },
        },
        cancellationEventData.paymentProvider
      );
    });

    it('calls manager record method with undefined interval if interval count is not provided', async () => {
      const eventData = {
        ...cancellationEventData,
        priceIntervalCount: undefined,
      };
      await paymentsEmitterService.handleSubscriptionEnded(eventData);
      expect(
        paymentsGleanManager.recordFxaSubscriptionEnded
      ).toHaveBeenCalledWith(
        {
          cmsMetricsData: additionalMetricsData.cmsMetricsData,
          subscriptionCancellationData: {
            ...subscriptionCancellationData,
            interval: undefined,
          },
        },
        cancellationEventData.paymentProvider
      );
    });

    it('calls manager record method with undefined offeringId on cms error', async () => {
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockRejectedValue(new Error('bad'));

      const eventData = cancellationEventData;
      await paymentsEmitterService.handleSubscriptionEnded(eventData);
      expect(
        paymentsGleanManager.recordFxaSubscriptionEnded
      ).toHaveBeenCalledWith(
        {
          cmsMetricsData: additionalMetricsData.cmsMetricsData,
          subscriptionCancellationData: {
            ...subscriptionCancellationData,
            offeringId: undefined,
          },
        },
        cancellationEventData.paymentProvider
      );
    });
  });

  describe('handleSP3Rollout', () => {
    const completeEventData = SP3RolloutEventFactory();
    beforeEach(() => {
      jest.spyOn(statsd, 'increment').mockReturnValue();
    });

    it('should call manager record method', async () => {
      await paymentsEmitterService.handleSP3Rollout(completeEventData);

      expect(statsd.increment).toHaveBeenCalledWith(
        'sp3_rollout',
        expect.any(Object)
      );
    });
  });
});
