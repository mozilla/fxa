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
  StripeCustomerFactory,
  StripePriceFactory,
  StripeResponseFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import {
  MockStatsDProvider,
  StatsD,
  StatsDService,
} from '@fxa/shared/metrics/statsd';
import {
  PriceManager,
  CustomerManager,
  SubscriptionManager,
  PaymentMethodManager,
  SubPlatPaymentMethodType,
  StripePaymentMethodTypeResponseFactory,
} from '@fxa/payments/customer';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import {
  CheckoutParamsFactory,
  CommonMetricsFactory,
  MockPaymentsGleanConfigProvider,
  MockPaymentsGleanFactory,
  PaymentsGleanManager,
} from '@fxa/payments/metrics';
import { CartManager } from '@fxa/payments/cart';
import { PaymentsEmitterService } from './emitter.service';
import {
  AdditionalMetricsDataFactory,
  AuthEventsFactory,
  SP3RolloutEventFactory,
  SubscriptionEndedFactory,
} from './emitter.factories';
import {
  AccountFactory,
  MockAccountDatabaseNestFactory,
} from '@fxa/shared/db/mysql/account';
import { AccountManager } from '@fxa/shared/account/account';
import { retrieveAdditionalMetricsData } from './util/retrieveAdditionalMetricsData';
import { Logger } from '@nestjs/common';
import { EmitterServiceHandleAuthError } from './emitter.error';
import {
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalClientConfig,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import {
  MockNimbusClientConfigProvider,
  NimbusClient,
  NimbusEnrollmentFactory,
} from '@fxa/shared/experiments';
import {
  MockNimbusManagerConfigProvider,
  NimbusManager,
  SubPlatNimbusResultFactory,
} from '@fxa/payments/experiments';
import * as Sentry from '@sentry/nestjs';
import { faker } from '@faker-js/faker/.';

jest.mock('./util/retrieveAdditionalMetricsData');
const mockedRetrieveAdditionalMetricsData = jest.mocked(
  retrieveAdditionalMetricsData
);

jest.mock('@sentry/nestjs', () => ({
  captureException: jest.fn(),
}));

describe('PaymentsEmitterService', () => {
  let accountManager: AccountManager;
  let cartManager: CartManager;
  let customerManager: CustomerManager;
  let paymentsEmitterService: PaymentsEmitterService;
  let paymentsGleanManager: PaymentsGleanManager;
  let paymentMethodManager: PaymentMethodManager;
  let productConfigurationManager: ProductConfigurationManager;
  let nimbusManager: NimbusManager;
  let statsd: StatsD;
  let logger: Logger;
  let subscriptionManager: SubscriptionManager;

  const additionalMetricsData = AdditionalMetricsDataFactory();
  const mockCommonMetricsData = CommonMetricsFactory({
    params: CheckoutParamsFactory(),
  });
  const mockCheckoutPaymentEvents = {
    ...mockCommonMetricsData,
    paymentProvider: SubPlatPaymentMethodType.Stripe,
  };
  let retrieveOptOutMock: jest.SpyInstance<any, unknown[], any>;
  const mockLogger = {
    error: jest.fn(),
    log: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: Logger,
          useValue: mockLogger,
        },
        MockPaymentsGleanConfigProvider,
        MockAccountDatabaseNestFactory,
        MockPaymentsGleanFactory,
        MockStrapiClientConfigProvider,
        MockStripeConfigProvider,
        MockFirestoreProvider,
        MockStatsDProvider,
        AccountManager,
        CartManager,
        CustomerManager,
        StrapiClient,
        StripeClient,
        PriceManager,
        PaymentsGleanManager,
        ProductConfigurationManager,
        PaypalBillingAgreementManager,
        PayPalClient,
        PaypalClientConfig,
        PaypalCustomerManager,
        PaymentsEmitterService,
        PaymentMethodManager,
        SubscriptionManager,
        NimbusClient,
        MockNimbusClientConfigProvider,
        NimbusManager,
        MockNimbusManagerConfigProvider,
      ],
    }).compile();

    accountManager = moduleRef.get(AccountManager);
    customerManager = moduleRef.get(CustomerManager);
    paymentsEmitterService = moduleRef.get(PaymentsEmitterService);
    paymentsGleanManager = moduleRef.get(PaymentsGleanManager);
    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    nimbusManager = moduleRef.get(NimbusManager);
    cartManager = moduleRef.get(CartManager);
    statsd = moduleRef.get<StatsD>(StatsDService);
    logger = moduleRef.get<Logger>(Logger);
    subscriptionManager = moduleRef.get(SubscriptionManager);
  });

  it('should be defined', () => {
    expect(accountManager).toBeDefined();
    expect(paymentsEmitterService).toBeDefined();
    expect(paymentsGleanManager).toBeDefined();
    expect(productConfigurationManager).toBeDefined();
  });

  const mockEnrollment = NimbusEnrollmentFactory();
  const mockSubPlatExperiments = SubPlatNimbusResultFactory({
    Enrollments: [mockEnrollment],
  });
  const nimbusUserId = mockEnrollment.nimbus_user_id;
  const generatedNimbusUserId = NimbusEnrollmentFactory().nimbus_user_id;

  beforeEach(() => {
    retrieveOptOutMock = jest
      .spyOn(paymentsEmitterService as any, 'retrieveOptOut')
      .mockResolvedValue(false);
    mockedRetrieveAdditionalMetricsData.mockResolvedValue(
      additionalMetricsData
    );
    jest
      .spyOn(nimbusManager, 'fetchExperiments')
      .mockResolvedValue(mockSubPlatExperiments);
    jest
      .spyOn(nimbusManager, 'generateNimbusId')
      .mockReturnValue(generatedNimbusUserId);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getNimbusUserId', () => {
    const mockInput = {
      uid: faker.string.uuid(),
      language: faker.location.language().alpha2,
      region: faker.location.countryCode('alpha-2'),
      experimentationId: faker.string.uuid(),
      experimentationPreview: faker.datatype.boolean(),
    };
    beforeEach(() => {
      jest
        .spyOn(nimbusManager, 'generateNimbusId')
        .mockReturnValue(generatedNimbusUserId);
      jest
        .spyOn(nimbusManager, 'fetchExperiments')
        .mockResolvedValue(mockSubPlatExperiments);
    });

    it('should return enrollment nimbusUserId', async () => {
      const result = await paymentsEmitterService.getNimbusUserId(mockInput);
      expect(result).toEqual(mockEnrollment.nimbus_user_id);
      expect(nimbusManager.generateNimbusId).toHaveBeenCalledWith(
        mockInput.uid,
        mockInput.experimentationId
      );
      expect(nimbusManager.fetchExperiments).toHaveBeenCalledWith({
        nimbusUserId: generatedNimbusUserId,
        language: mockInput.language,
        region: mockInput.region,
        preview: mockInput.experimentationPreview,
      });
    });

    it('should return generated nimbusUserId', async () => {
      jest
        .spyOn(nimbusManager, 'fetchExperiments')
        .mockResolvedValue(SubPlatNimbusResultFactory({ Enrollments: [] }));
      const result = await paymentsEmitterService.getNimbusUserId(mockInput);
      expect(result).toEqual(generatedNimbusUserId);
    });

    it('should return generated nimbusUserId on fetchExperiments failure', async () => {
      const expectedError = new Error('failed to fetch');
      jest
        .spyOn(nimbusManager, 'fetchExperiments')
        .mockRejectedValue(expectedError);
      const result = await paymentsEmitterService.getNimbusUserId(mockInput);
      expect(result).toEqual(generatedNimbusUserId);
      expect(Sentry.captureException).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('handleAuthEvent', () => {
    const authEventData = AuthEventsFactory();
    beforeEach(() => {
      jest.spyOn(statsd, 'increment').mockReturnValue();
    });

    it('should call manager record method', async () => {
      await paymentsEmitterService.handleAuthEvent(authEventData);

      expect(statsd.increment).toHaveBeenCalledWith(`auth_event`, {
        type: authEventData.type,
      });
    });

    it('should log the error if provided', async () => {
      const errorMessage = 'Error message text';
      const authEventData = AuthEventsFactory({ errorMessage });
      await paymentsEmitterService.handleAuthEvent(authEventData);

      expect(logger.error).toHaveBeenCalledWith(
        new EmitterServiceHandleAuthError(errorMessage)
      );
    });
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
        experimentationData: { nimbusUserId },
        ...additionalMetricsData,
      });
      expect(nimbusManager.fetchExperiments).toHaveBeenCalled();
      expect(nimbusManager.generateNimbusId).toHaveBeenCalled();
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
      expect(nimbusManager.fetchExperiments).not.toHaveBeenCalled();
      expect(nimbusManager.generateNimbusId).not.toHaveBeenCalled();
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
          experimentationData: { nimbusUserId },
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
          experimentationData: { nimbusUserId },
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
    const mockCustomer = StripeCustomerFactory();
    const mockSubscription = StripeSubscriptionFactory();
    const mockPaymentMethodType = StripePaymentMethodTypeResponseFactory();
    beforeEach(() => {
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockCustomer));
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue(StripeResponseFactory([mockSubscription]));
      jest
        .spyOn(paymentMethodManager, 'determineType')
        .mockResolvedValue(mockPaymentMethodType);
      jest
        .spyOn(paymentsGleanManager, 'recordFxaPaySetupSuccess')
        .mockReturnValue();
    });

    it('should call manager record method', async () => {
      await paymentsEmitterService.handleCheckoutSuccess(
        mockCheckoutPaymentEvents
      );

      expect(customerManager.retrieve).toHaveBeenCalled();
      expect(subscriptionManager.listForCustomer).toHaveBeenCalled();
      expect(paymentMethodManager.determineType).toHaveBeenCalled();
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
          experimentationData: { nimbusUserId },
          ...additionalMetricsData,
        },
        mockPaymentMethodType.type
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
      expect(paymentsGleanManager.recordFxaPaySetupFail).toHaveBeenCalledWith({
        commonMetricsData: mockCheckoutPaymentEvents,
        experimentationData: { nimbusUserId },
        ...additionalMetricsData,
      });
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
      paymentProvider: SubPlatPaymentMethodType.Card,
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
