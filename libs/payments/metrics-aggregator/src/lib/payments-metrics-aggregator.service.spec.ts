/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import {
  AccountsMetricsDataFactory,
  CommonMetricsFactory,
  GenericGleanSubManageEventFactory,
  GleanMetricsDataFactory,
  MockPaymentsGleanConfigProvider,
  MockPaymentsGleanFactory,
  PaymentsGleanConfig,
  PaymentsGleanManager,
} from '@fxa/payments/metrics';
import { PaymentsMetricsAggregatorService } from './payments-metrics-aggregator.service';
import { AccountManager } from '@fxa/shared/account/account';
import {
  CustomerManager,
  PriceManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import { Logger } from '@nestjs/common';
import {
  MockNimbusManagerConfigProvider,
  NimbusManager,
  SubPlatNimbusResultFactory,
} from '@fxa/payments/experiments';
import {
  MockStrapiClientConfigProvider,
  PageContentByPriceIdByPriceIdsResultFactory,
  PageContentByPriceIdsResultUtil,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import {
  AccountFactory,
  MockAccountDatabaseNestFactory,
} from '@fxa/shared/db/mysql/account';
import {
  MockStripeConfigProvider,
  StripeClient,
  StripeConfig,
  StripeCouponFactory,
  StripeCustomerFactory,
  StripeDiscountFactory,
  StripePriceFactory,
  StripeResponseFactory,
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
} from '@fxa/payments/stripe';
import {
  MockNimbusClientConfigProvider,
  NimbusClient,
} from '@fxa/shared/experiments';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

describe('PaymentsMetricsAggregatorService', () => {
  let aggregatorService: PaymentsMetricsAggregatorService;
  let paymentsGleanManager: PaymentsGleanManager;
  let subscriptionManager: SubscriptionManager;
  let productConfigurationManager: ProductConfigurationManager;
  let accountManager: AccountManager;
  let customerManager: CustomerManager;
  let nimbusManager: NimbusManager;
  let gleanConfig: PaymentsGleanConfig;
  let logger: Logger;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountManager,
        CustomerManager,
        Logger,
        MockFirestoreProvider,
        MockNimbusManagerConfigProvider,
        MockNimbusClientConfigProvider,
        MockAccountDatabaseNestFactory,
        MockPaymentsGleanConfigProvider,
        MockPaymentsGleanFactory,
        MockStatsDProvider,
        MockStrapiClientConfigProvider,
        MockStripeConfigProvider,
        NimbusClient,
        NimbusManager,
        PriceManager,
        PaymentsGleanManager,
        PaymentsMetricsAggregatorService,
        ProductConfigurationManager,
        StrapiClient,
        StripeClient,
        StripeConfig,
        SubscriptionManager,
      ],
    }).compile();

    aggregatorService = moduleRef.get(PaymentsMetricsAggregatorService);
    paymentsGleanManager = moduleRef.get(PaymentsGleanManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    accountManager = moduleRef.get(AccountManager);
    customerManager = moduleRef.get(CustomerManager);
    nimbusManager = moduleRef.get(NimbusManager);
    gleanConfig = moduleRef.get(PaymentsGleanConfig);
    logger = moduleRef.get(Logger);
  });

  describe('handleUserDelete', () => {
    const mockUid = 'test-uid-123';
    const mockNimbusIds = ['nimbus-id-1', 'nimbus-id-2'];

    beforeEach(() => {
      jest
        .spyOn(nimbusManager, 'generateAllNimbusIdsForDeletion')
        .mockReturnValue(mockNimbusIds);
      jest.spyOn(logger, 'log').mockImplementation(() => {});
    });

    it('logs one entry per nimbus user id', () => {
      aggregatorService.handleUserDelete(mockUid);

      expect(
        nimbusManager.generateAllNimbusIdsForDeletion
      ).toHaveBeenCalledWith(mockUid);
      expect(logger.log).toHaveBeenCalledTimes(mockNimbusIds.length);
      for (const nimbusUserId of mockNimbusIds) {
        expect(logger.log).toHaveBeenCalledWith('glean.user.delete', {
          uid: mockUid,
          nimbus_user_id: nimbusUserId,
        });
      }
    });

    it('still logs deletion even when glean is disabled', () => {
      gleanConfig.enabled = false;

      aggregatorService.handleUserDelete(mockUid);

      expect(
        nimbusManager.generateAllNimbusIdsForDeletion
      ).toHaveBeenCalledWith(mockUid);
      expect(logger.log).toHaveBeenCalledTimes(mockNimbusIds.length);
      for (const nimbusUserId of mockNimbusIds) {
        expect(logger.log).toHaveBeenCalledWith('glean.user.delete', {
          uid: mockUid,
          nimbus_user_id: nimbusUserId,
        });
      }

      gleanConfig.enabled = true;
    });

    it('logs a single entry when one namespace is configured', () => {
      jest
        .spyOn(nimbusManager, 'generateAllNimbusIdsForDeletion')
        .mockReturnValue(['single-nimbus-id']);

      aggregatorService.handleUserDelete(mockUid);

      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('glean.user.delete', {
        uid: mockUid,
        nimbus_user_id: 'single-nimbus-id',
      });
    });
  });

  describe('recordGenericSubManageEvent', () => {
    const mockEventData = GenericGleanSubManageEventFactory();

    beforeEach(() => {
      jest.spyOn(paymentsGleanManager, 'recordGenericEvent').mockReturnValue();
      jest
        .spyOn(aggregatorService, 'retrieveSubManageMetricsData')
        .mockResolvedValue(
          GleanMetricsDataFactory({
            accounts: AccountsMetricsDataFactory({ metricsOptOut: false }),
          })
        );
    });

    it('successfully calls GleanManager', async () => {
      await aggregatorService.recordGenericSubManageEvent(mockEventData);

      expect(
        aggregatorService.retrieveSubManageMetricsData
      ).toHaveBeenCalledWith(
        mockEventData.commonMetrics,
        mockEventData.uid,
        mockEventData.subscriptionId
      );
      expect(paymentsGleanManager.recordGenericEvent).toHaveBeenCalledWith(
        mockEventData.eventName,
        expect.any(Object)
      );
    });

    it('does not call GleanManager if opted out', async () => {
      jest
        .spyOn(aggregatorService, 'retrieveSubManageMetricsData')
        .mockResolvedValue(
          GleanMetricsDataFactory({
            accounts: AccountsMetricsDataFactory({ metricsOptOut: true }),
          })
        );
      await aggregatorService.recordGenericSubManageEvent(mockEventData);

      expect(
        aggregatorService.retrieveSubManageMetricsData
      ).toHaveBeenCalledWith(
        mockEventData.commonMetrics,
        mockEventData.uid,
        mockEventData.subscriptionId
      );
      expect(paymentsGleanManager.recordGenericEvent).not.toHaveBeenCalled();
    });
  });

  describe('retrieveSubManageMetricsData', () => {
    const mockPrice = StripePriceFactory();
    const mockSubscriptionItem = StripeSubscriptionItemFactory({
      price: mockPrice,
    });
    const mockSubscription = StripeResponseFactory(
      StripeSubscriptionFactory({
        items: {
          object: 'list',
          data: [mockSubscriptionItem],
          has_more: false,
          url: `/v1/subscription_items?subscription=sub_$`,
        },
      })
    );
    const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
    const mockAccount = AccountFactory();
    const mockPageContentUtil = new PageContentByPriceIdsResultUtil(
      PageContentByPriceIdByPriceIdsResultFactory()
    );
    const mockCommonMetrics = CommonMetricsFactory();
    const mockUid = mockAccount.uid.toString();
    const mockSubscriptionId = mockSubscription.id;

    beforeEach(() => {
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(accountManager, 'getAccounts')
        .mockResolvedValue([mockAccount]);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(mockPageContentUtil);
      jest.spyOn(aggregatorService, 'mapExperimentationMetricsData');
      jest.spyOn(aggregatorService, 'mapStripeMetricsData');
      jest.spyOn(aggregatorService, 'mapAccountsMetricsData');
      jest.spyOn(aggregatorService, 'mapSubPlatCmsMetricsData');
      jest.spyOn(aggregatorService, 'mapSessionMetricsData');
      jest
        .spyOn(nimbusManager, 'fetchExperiments')
        .mockResolvedValue(SubPlatNimbusResultFactory());
    });

    it('successfully retrieves all data', async () => {
      await aggregatorService.retrieveSubManageMetricsData(
        mockCommonMetrics,
        mockUid,
        mockSubscriptionId
      );

      expect(subscriptionManager.retrieve).toHaveBeenCalledWith(
        mockSubscriptionId
      );
      expect(accountManager.getAccounts).toHaveBeenCalledWith([mockUid]);
      expect(customerManager.retrieve).toHaveBeenCalledWith(
        mockSubscription.customer
      );
      expect(
        productConfigurationManager.getPageContentByPriceIds
      ).toHaveBeenCalledWith([mockPrice.id]);
      expect(
        aggregatorService.mapExperimentationMetricsData
      ).toHaveBeenCalledWith(mockUid, mockCommonMetrics, mockCustomer);
      expect(aggregatorService.mapStripeMetricsData).toHaveBeenCalledWith(
        mockCustomer,
        mockPrice,
        mockSubscription
      );
      expect(aggregatorService.mapAccountsMetricsData).toHaveBeenCalledWith(
        mockUid,
        mockAccount
      );
      expect(
        aggregatorService.mapSubPlatCmsMetricsData
      ).toHaveBeenCalledWith(mockSubscription, mockPageContentUtil);
      expect(aggregatorService.mapSessionMetricsData).toHaveBeenCalledWith(
        mockCommonMetrics
      );
    });

    it('successfully complets without calling Stripe data', async () => {
      await aggregatorService.retrieveSubManageMetricsData(
        mockCommonMetrics,
        mockUid
      );

      expect(subscriptionManager.retrieve).not.toHaveBeenCalled();
      expect(customerManager.retrieve).not.toHaveBeenCalled();
      expect(
        productConfigurationManager.getPageContentByPriceIds
      ).not.toHaveBeenCalled();

      expect(
        aggregatorService.mapExperimentationMetricsData
      ).toHaveBeenCalledWith(mockUid, mockCommonMetrics, undefined);
      expect(aggregatorService.mapStripeMetricsData).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined
      );
      expect(aggregatorService.mapAccountsMetricsData).toHaveBeenCalledWith(
        mockUid,
        mockAccount
      );
      expect(
        aggregatorService.mapSubPlatCmsMetricsData
      ).toHaveBeenCalledWith(undefined, undefined);
      expect(aggregatorService.mapSessionMetricsData).toHaveBeenCalledWith(
        mockCommonMetrics
      );
    });

    it('successfully completes even if customer fails', async () => {
      jest
        .spyOn(customerManager, 'retrieve')
        .mockRejectedValue(new Error('testing'));
      await aggregatorService.retrieveSubManageMetricsData(
        mockCommonMetrics,
        mockUid,
        mockSubscriptionId
      );

      expect(
        aggregatorService.mapExperimentationMetricsData
      ).toHaveBeenCalledWith(mockUid, mockCommonMetrics, undefined);
      expect(aggregatorService.mapStripeMetricsData).toHaveBeenCalledWith(
        undefined,
        mockPrice,
        mockSubscription
      );
      expect(aggregatorService.mapAccountsMetricsData).toHaveBeenCalledWith(
        mockUid,
        mockAccount
      );
      expect(
        aggregatorService.mapSubPlatCmsMetricsData
      ).toHaveBeenCalledWith(mockSubscription, mockPageContentUtil);
      expect(aggregatorService.mapSessionMetricsData).toHaveBeenCalledWith(
        mockCommonMetrics
      );
    });

    it('successfully completes even if getPageContentByPriceIds fetch fails', async () => {
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockRejectedValue(new Error('testing'));

      await aggregatorService.retrieveSubManageMetricsData(
        mockCommonMetrics,
        mockUid,
        mockSubscriptionId
      );

      expect(
        aggregatorService.mapExperimentationMetricsData
      ).toHaveBeenCalledWith(mockUid, mockCommonMetrics, mockCustomer);
      expect(aggregatorService.mapStripeMetricsData).toHaveBeenCalledWith(
        mockCustomer,
        mockPrice,
        mockSubscription
      );
      expect(aggregatorService.mapAccountsMetricsData).toHaveBeenCalledWith(
        mockUid,
        mockAccount
      );
      expect(
        aggregatorService.mapSubPlatCmsMetricsData
      ).toHaveBeenCalledWith(mockSubscription, undefined);
      expect(aggregatorService.mapSessionMetricsData).toHaveBeenCalledWith(
        mockCommonMetrics
      );
    });

    it('successfully completes even if getPageContentByPriceIds fetch fails', async () => {
      jest
        .spyOn(accountManager, 'getAccounts')
        .mockRejectedValue(new Error('testing'));

      await aggregatorService.retrieveSubManageMetricsData(
        mockCommonMetrics,
        mockUid,
        mockSubscriptionId
      );

      expect(
        aggregatorService.mapExperimentationMetricsData
      ).toHaveBeenCalledWith(mockUid, mockCommonMetrics, mockCustomer);
      expect(aggregatorService.mapStripeMetricsData).toHaveBeenCalledWith(
        mockCustomer,
        mockPrice,
        mockSubscription
      );
      expect(aggregatorService.mapAccountsMetricsData).toHaveBeenCalledWith(
        mockUid,
        undefined
      );
      expect(
        aggregatorService.mapSubPlatCmsMetricsData
      ).toHaveBeenCalledWith(mockSubscription, mockPageContentUtil);
      expect(aggregatorService.mapSessionMetricsData).toHaveBeenCalledWith(
        mockCommonMetrics
      );
    });
  });

  describe('mapStripeMetricsData', () => {
    const mockCouponCode = 'testCode';
    const mockPrice = StripePriceFactory();
    const mockSubscriptionItem = StripeSubscriptionItemFactory({
      price: mockPrice,
    });
    const mockSubscription = StripeResponseFactory(
      StripeSubscriptionFactory({
        discounts: [
          StripeDiscountFactory({
            source: {
              type: 'coupon',
              coupon: StripeCouponFactory({ id: mockCouponCode }),
            },
          }),
        ],
        items: {
          object: 'list',
          data: [mockSubscriptionItem],
          has_more: false,
          url: `/v1/subscription_items?subscription=sub_$`,
        },
      })
    );
    const mockCustomer = StripeResponseFactory(
      StripeCustomerFactory({
        currency: 'usd',
        shipping: {
          address: {
            country: 'US',
            postal_code: '12345',
            state: null,
            city: null,
            line1: null,
            line2: null,
          },
        },
      })
    );

    it('successfully returns all data', () => {
      const result = aggregatorService.mapStripeMetricsData(
        mockCustomer,
        mockPrice,
        mockSubscription
      );

      expect(result).toEqual({
        customerId: mockCustomer.id,
        couponCode: mockCouponCode,
        currency: mockCustomer.currency,
        taxAddress: {
          countryCode: 'US',
          postalCode: '12345',
        },
        productId: mockPrice.product,
        priceId: mockPrice.id,
      });
    });

    it('successfully returns undefined data', () => {
      const result = aggregatorService.mapStripeMetricsData(
        undefined,
        undefined,
        undefined
      );
      expect(result).toEqual({
        customerId: undefined,
        couponCode: undefined,
        currency: undefined,
        taxAddress: {
          countryCode: '',
          postalCode: '',
        },
        productId: undefined,
        priceId: undefined,
      });
    });
  });
  describe('mapAccountsMetricsData', () => {
    const mockAccount = AccountFactory({ metricsOptOutAt: null });
    const mockUid = mockAccount.uid.toString();

    it('successfully returns all data', () => {
      const result = aggregatorService.mapAccountsMetricsData(
        mockUid,
        mockAccount
      );

      expect(result).toEqual({
        uid: mockUid,
        metricsOptOut: false,
        locale: mockAccount.locale,
      });
    });

    it('successfully returns undefined data', () => {
      const result = aggregatorService.mapAccountsMetricsData(
        mockUid,
        undefined
      );

      expect(result).toEqual({
        uid: mockUid,
        metricsOptOut: true,
        locale: undefined,
      });
    });
  });
  describe('mapSubPlatCmsMetricsData', () => {
    const mockPrice = StripePriceFactory();
    const mockSubscriptionItem = StripeSubscriptionItemFactory({
      price: mockPrice,
    });
    const mockSubscription = StripeResponseFactory(
      StripeSubscriptionFactory({
        items: {
          object: 'list',
          data: [mockSubscriptionItem],
          has_more: false,
          url: `/v1/subscription_items?subscription=sub_$`,
        },
      })
    );
    const mockPageContentUtil = new PageContentByPriceIdsResultUtil(
      PageContentByPriceIdByPriceIdsResultFactory()
    );
    it('successfully returns all data', () => {
      const result = aggregatorService.mapSubPlatCmsMetricsData(
        mockSubscription,
        mockPageContentUtil
      );

      expect(result).toEqual({
        offeringId: expect.any(String),
        interval: expect.any(String),
      });
    });

    it('successfully returns undefined data', () => {
      const result = aggregatorService.mapSubPlatCmsMetricsData();

      expect(result).toEqual({
        offeringId: undefined,
        interval: undefined,
      });
    });
  });
  describe('mapSessionMetricsData', () => {
    it('successfully returns all data', () => {
      const mockCommonMetrics = CommonMetricsFactory({
        params: {
          locale: 'en',
        },
      });

      const result =
        aggregatorService.mapSessionMetricsData(mockCommonMetrics);
      expect(result).toEqual({
        locale: 'en',
        ipAddress: mockCommonMetrics.ipAddress,
        deviceType: mockCommonMetrics.deviceType,
        userAgent: mockCommonMetrics.userAgent,
      });
    });

    it('successfully returns undefined data', () => {
      const mockCommonMetrics = CommonMetricsFactory();

      const result =
        aggregatorService.mapSessionMetricsData(mockCommonMetrics);
      expect(result).toEqual({
        locale: undefined,
        ipAddress: mockCommonMetrics.ipAddress,
        deviceType: mockCommonMetrics.deviceType,
        userAgent: mockCommonMetrics.userAgent,
      });
    });
  });
  describe('mapExperimentationMetricsData', () => {
    const mockCommonMetrics = CommonMetricsFactory();
    const mockUid = 'uid';
    const mockCustomer = StripeResponseFactory(
      StripeCustomerFactory({
        currency: 'usd',
        shipping: {
          address: {
            country: 'US',
            postal_code: '12345',
            state: null,
            city: null,
            line1: null,
            line2: null,
          },
        },
      })
    );
    const fetchedNimbusUserId = 'fetched_nimbus_user_id';
    const generatedNimbusUserId = 'generated_nimbus_user_id';

    beforeEach(() => {
      jest
        .spyOn(nimbusManager, 'generateNimbusId')
        .mockReturnValue(generatedNimbusUserId);
      jest.spyOn(nimbusManager, 'fetchExperiments').mockResolvedValue(
        SubPlatNimbusResultFactory({
          Enrollments: [{ nimbus_user_id: fetchedNimbusUserId }] as any,
        })
      );
      jest.spyOn(logger, 'error').mockImplementation(() => {});
    });

    it('successfully returns data fetched from nimbus', async () => {
      const result = await aggregatorService.mapExperimentationMetricsData(
        mockUid,
        mockCommonMetrics,
        mockCustomer
      );

      expect(result).toEqual({
        nimbusUserId: fetchedNimbusUserId,
      });
    });

    it('successfully returns generated data', async () => {
      jest
        .spyOn(nimbusManager, 'fetchExperiments')
        .mockRejectedValue(new Error('testing'));
      const result = await aggregatorService.mapExperimentationMetricsData(
        mockUid,
        mockCommonMetrics,
        mockCustomer
      );

      expect(logger.error).toHaveBeenCalled();
      expect(result).toEqual({
        nimbusUserId: generatedNimbusUserId,
      });
    });
  });
});
