/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { PaymentsGleanManager } from './glean.manager';
import { PaymentsGleanService } from './glean.service';
import { MockPaymentsGleanFactory } from './glean.test-provider';
import { MockPaymentsGleanConfigProvider } from './glean.config';
import {
  AccountsMetricsDataFactory,
  CommonMetricsFactory,
  GenericGleanSubManageEventFactory,
  GleanMetricsDataFactory,
} from './glean.factory';
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
  StripeCustomerFactory,
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
import { AsyncLocalStorageCartProvider } from '@fxa/payments/cart';

describe('PaymentsGleanService', () => {
  let paymentsGleanService: PaymentsGleanService;
  let paymentsGleanManager: PaymentsGleanManager;
  let subscriptionManager: SubscriptionManager;
  let productConfigurationManager: ProductConfigurationManager;
  let accountManager: AccountManager;
  let customerManager: CustomerManager;
  let nimbusManager: NimbusManager;
  let logger: Logger;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountManager,
        AsyncLocalStorageCartProvider,
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
        PaymentsGleanService,
        ProductConfigurationManager,
        StrapiClient,
        StripeClient,
        StripeConfig,
        SubscriptionManager,
      ],
    }).compile();

    paymentsGleanService = moduleRef.get(PaymentsGleanService);
    paymentsGleanManager = moduleRef.get(PaymentsGleanManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    accountManager = moduleRef.get(AccountManager);
    customerManager = moduleRef.get(CustomerManager);
    nimbusManager = moduleRef.get(NimbusManager);
    logger = moduleRef.get(Logger);
  });

  describe('recordGenericSubManageEvent', () => {
    const mockEventData = GenericGleanSubManageEventFactory();

    beforeEach(() => {
      jest.spyOn(paymentsGleanManager, 'recordGenericEvent').mockReturnValue();
      jest
        .spyOn(paymentsGleanService, 'retrieveSubManageMetricsData')
        .mockResolvedValue(
          GleanMetricsDataFactory({
            accounts: AccountsMetricsDataFactory({ metricsOptOut: false }),
          })
        );
    });

    it('successfully calls GleanManager', async () => {
      await paymentsGleanService.recordGenericSubManageEvent(mockEventData);

      expect(
        paymentsGleanService.retrieveSubManageMetricsData
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
        .spyOn(paymentsGleanService, 'retrieveSubManageMetricsData')
        .mockResolvedValue(
          GleanMetricsDataFactory({
            accounts: AccountsMetricsDataFactory({ metricsOptOut: true }),
          })
        );
      await paymentsGleanService.recordGenericSubManageEvent(mockEventData);

      expect(
        paymentsGleanService.retrieveSubManageMetricsData
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
      jest.spyOn(paymentsGleanService, 'mapExperimentationMetricsData');
      jest.spyOn(paymentsGleanService, 'mapStripeMetricsData');
      jest.spyOn(paymentsGleanService, 'mapAccountsMetricsData');
      jest.spyOn(paymentsGleanService, 'mapSubPlatCmsMetricsData');
      jest.spyOn(paymentsGleanService, 'mapSessionMetricsData');
      jest
        .spyOn(nimbusManager, 'fetchExperiments')
        .mockResolvedValue(SubPlatNimbusResultFactory());
    });

    it('successfully retrieves all data', async () => {
      await paymentsGleanService.retrieveSubManageMetricsData(
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
        paymentsGleanService.mapExperimentationMetricsData
      ).toHaveBeenCalledWith(mockUid, mockCommonMetrics, mockCustomer);
      expect(paymentsGleanService.mapStripeMetricsData).toHaveBeenCalledWith(
        mockCustomer,
        mockPrice,
        mockSubscription
      );
      expect(paymentsGleanService.mapAccountsMetricsData).toHaveBeenCalledWith(
        mockUid,
        mockAccount
      );
      expect(
        paymentsGleanService.mapSubPlatCmsMetricsData
      ).toHaveBeenCalledWith(mockSubscription, mockPageContentUtil);
      expect(paymentsGleanService.mapSessionMetricsData).toHaveBeenCalledWith(
        mockCommonMetrics
      );
    });

    it('successfully complets without calling Stripe data', async () => {
      await paymentsGleanService.retrieveSubManageMetricsData(
        mockCommonMetrics,
        mockUid
      );

      expect(subscriptionManager.retrieve).not.toHaveBeenCalled();
      expect(customerManager.retrieve).not.toHaveBeenCalled();
      expect(
        productConfigurationManager.getPageContentByPriceIds
      ).not.toHaveBeenCalled();

      expect(
        paymentsGleanService.mapExperimentationMetricsData
      ).toHaveBeenCalledWith(mockUid, mockCommonMetrics, undefined);
      expect(paymentsGleanService.mapStripeMetricsData).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined
      );
      expect(paymentsGleanService.mapAccountsMetricsData).toHaveBeenCalledWith(
        mockUid,
        mockAccount
      );
      expect(
        paymentsGleanService.mapSubPlatCmsMetricsData
      ).toHaveBeenCalledWith(undefined, undefined);
      expect(paymentsGleanService.mapSessionMetricsData).toHaveBeenCalledWith(
        mockCommonMetrics
      );
    });

    it('successfully completes even if customer fails', async () => {
      jest
        .spyOn(customerManager, 'retrieve')
        .mockRejectedValue(new Error('testing'));
      await paymentsGleanService.retrieveSubManageMetricsData(
        mockCommonMetrics,
        mockUid,
        mockSubscriptionId
      );

      expect(
        paymentsGleanService.mapExperimentationMetricsData
      ).toHaveBeenCalledWith(mockUid, mockCommonMetrics, undefined);
      expect(paymentsGleanService.mapStripeMetricsData).toHaveBeenCalledWith(
        undefined,
        mockPrice,
        mockSubscription
      );
      expect(paymentsGleanService.mapAccountsMetricsData).toHaveBeenCalledWith(
        mockUid,
        mockAccount
      );
      expect(
        paymentsGleanService.mapSubPlatCmsMetricsData
      ).toHaveBeenCalledWith(mockSubscription, mockPageContentUtil);
      expect(paymentsGleanService.mapSessionMetricsData).toHaveBeenCalledWith(
        mockCommonMetrics
      );
    });

    it('successfully completes even if getPageContentByPriceIds fetch fails', async () => {
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockRejectedValue(new Error('testing'));

      await paymentsGleanService.retrieveSubManageMetricsData(
        mockCommonMetrics,
        mockUid,
        mockSubscriptionId
      );

      expect(
        paymentsGleanService.mapExperimentationMetricsData
      ).toHaveBeenCalledWith(mockUid, mockCommonMetrics, mockCustomer);
      expect(paymentsGleanService.mapStripeMetricsData).toHaveBeenCalledWith(
        mockCustomer,
        mockPrice,
        mockSubscription
      );
      expect(paymentsGleanService.mapAccountsMetricsData).toHaveBeenCalledWith(
        mockUid,
        mockAccount
      );
      expect(
        paymentsGleanService.mapSubPlatCmsMetricsData
      ).toHaveBeenCalledWith(mockSubscription, undefined);
      expect(paymentsGleanService.mapSessionMetricsData).toHaveBeenCalledWith(
        mockCommonMetrics
      );
    });

    it('successfully completes even if getPageContentByPriceIds fetch fails', async () => {
      jest
        .spyOn(accountManager, 'getAccounts')
        .mockRejectedValue(new Error('testing'));

      await paymentsGleanService.retrieveSubManageMetricsData(
        mockCommonMetrics,
        mockUid,
        mockSubscriptionId
      );

      expect(
        paymentsGleanService.mapExperimentationMetricsData
      ).toHaveBeenCalledWith(mockUid, mockCommonMetrics, mockCustomer);
      expect(paymentsGleanService.mapStripeMetricsData).toHaveBeenCalledWith(
        mockCustomer,
        mockPrice,
        mockSubscription
      );
      expect(paymentsGleanService.mapAccountsMetricsData).toHaveBeenCalledWith(
        mockUid,
        undefined
      );
      expect(
        paymentsGleanService.mapSubPlatCmsMetricsData
      ).toHaveBeenCalledWith(mockSubscription, mockPageContentUtil);
      expect(paymentsGleanService.mapSessionMetricsData).toHaveBeenCalledWith(
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
        discount: {
          coupon: {
            id: mockCouponCode,
          },
        } as any,
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
      const result = paymentsGleanService.mapStripeMetricsData(
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
      const result = paymentsGleanService.mapStripeMetricsData(
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
      const result = paymentsGleanService.mapAccountsMetricsData(
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
      const result = paymentsGleanService.mapAccountsMetricsData(
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
      const result = paymentsGleanService.mapSubPlatCmsMetricsData(
        mockSubscription,
        mockPageContentUtil
      );

      expect(result).toEqual({
        offeringId: expect.any(String),
        interval: expect.any(String),
      });
    });

    it('successfully returns undefined data', () => {
      const result = paymentsGleanService.mapSubPlatCmsMetricsData();

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
        paymentsGleanService.mapSessionMetricsData(mockCommonMetrics);
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
        paymentsGleanService.mapSessionMetricsData(mockCommonMetrics);
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
      jest.spyOn(logger, 'error');
    });

    it('successfully returns data fetched from nimbus', async () => {
      const result = await paymentsGleanService.mapExperimentationMetricsData(
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
      const result = await paymentsGleanService.mapExperimentationMetricsData(
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
