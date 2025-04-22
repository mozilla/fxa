/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';

import {
  PriceManager,
  SubplatInterval,
  SubscriptionManager,
} from '@fxa/payments/customer';
import {
  StripeClient,
  StripeConfig,
  StripeCustomerFactory,
  StripePriceFactory,
} from '@fxa/payments/stripe';
import {
  EligibilityContentByOfferingResultFactory,
  EligibilityContentByOfferingResultUtil,
  EligibilityContentOfferingResultFactory,
  EligibilityOfferingResultFactory,
  IapOfferingByStoreIDResultFactory,
  IapOfferingResultFactory,
  IapOfferingsByStoreIDsResultUtil,
  IapOfferingSubGroupOfferingResultFactory,
  IapOfferingSubGroupResultFactory,
  IapWithOfferingResultFactory,
  MockStrapiClientConfigProvider,
  OfferingNotFoundError,
  PageContentOfferingTransformedFactory,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

import { EligibilityManager } from './eligibility.manager';
import { EligibilityService } from './eligibility.service';
import {
  EligibilityStatus,
  LocationStatus,
  OfferingComparison,
  OfferingOverlapResult,
} from './eligibility.types';
import { LocationConfig, MockLocationConfigProvider } from './location.config';
import {
  AppleIapClient,
  AppleIapPurchaseManager,
  GoogleIapClient,
  GoogleIapPurchaseManager,
  MockAppleIapClientConfigProvider,
  MockGoogleIapClientConfigProvider,
} from '@fxa/payments/iap';
import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';

describe('EligibilityService', () => {
  let productConfigurationManager: ProductConfigurationManager;
  let eligibilityManager: EligibilityManager;
  let eligibilityService: EligibilityService;
  let subscriptionManager: SubscriptionManager;
  let appleIapPurchaseManager: AppleIapPurchaseManager;
  let googleIapPurchaseManager: GoogleIapPurchaseManager;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockStrapiClientConfigProvider,
        EligibilityManager,
        EligibilityService,
        AppleIapPurchaseManager,
        AppleIapClient,
        MockAppleIapClientConfigProvider,
        GoogleIapPurchaseManager,
        GoogleIapClient,
        MockGoogleIapClientConfigProvider,
        LocationConfig,
        MockFirestoreProvider,
        MockLocationConfigProvider,
        MockStatsDProvider,
        Logger,
        PriceManager,
        ProductConfigurationManager,
        StrapiClient,
        StripeClient,
        StripeConfig,
        SubscriptionManager,
      ],
    }).compile();

    eligibilityManager = module.get(EligibilityManager);
    eligibilityService = module.get(EligibilityService);
    productConfigurationManager = module.get(ProductConfigurationManager);
    subscriptionManager = module.get(SubscriptionManager);
    appleIapPurchaseManager = module.get(AppleIapPurchaseManager);
    googleIapPurchaseManager = module.get(GoogleIapPurchaseManager);
  });

  describe('checkEligibility', () => {
    it('returns create eligibility status for a new customer', async () => {
      const interval = SubplatInterval.Monthly;
      const mockOffering = EligibilityContentOfferingResultFactory();

      const result = await eligibilityService.checkEligibility(
        interval,
        mockOffering.apiIdentifier,
        undefined,
        undefined
      );
      expect(result).toEqual({
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      });
    });

    it('throws an error for no offering for offeringConfigId', async () => {
      const mockCustomer = StripeCustomerFactory();
      const interval = SubplatInterval.Monthly;
      const offeringApiIdentifier = faker.string.uuid();

      jest.spyOn(appleIapPurchaseManager, 'getForUser').mockResolvedValue([]);
      jest.spyOn(googleIapPurchaseManager, 'getForUser').mockResolvedValue([]);
      jest
        .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
        .mockResolvedValue(
          new EligibilityContentByOfferingResultUtil(
            EligibilityContentByOfferingResultFactory({
              offerings: [],
            })
          )
        );

      await expect(
        eligibilityService.checkEligibility(
          interval,
          offeringApiIdentifier,
          faker.string.uuid(),
          mockCustomer.id
        )
      ).rejects.toThrowError(OfferingNotFoundError);
    });

    it('returns IAP overlap when user has IAP subscriptions in the same subgroup', async () => {
      const mockCustomer = StripeCustomerFactory();
      const interval = SubplatInterval.Monthly;
      const offeringApiIdentifier = faker.string.uuid();

      jest.spyOn(appleIapPurchaseManager, 'getForUser').mockResolvedValue([]);
      jest.spyOn(googleIapPurchaseManager, 'getForUser').mockResolvedValue([]);
      jest
        .spyOn(productConfigurationManager, 'getIapOfferings')
        .mockResolvedValue(
          new IapOfferingsByStoreIDsResultUtil(
            IapOfferingByStoreIDResultFactory({
              iaps: [
                IapWithOfferingResultFactory({
                  offering: IapOfferingResultFactory({
                    subGroups: [
                      IapOfferingSubGroupResultFactory({
                        offerings: [
                          IapOfferingSubGroupOfferingResultFactory({
                            apiIdentifier: offeringApiIdentifier,
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              ],
            })
          )
        );
      jest
        .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
        .mockResolvedValue(
          new EligibilityContentByOfferingResultUtil(
            EligibilityContentByOfferingResultFactory({
              offerings: [],
            })
          )
        );

      await expect(
        eligibilityService.checkEligibility(
          interval,
          offeringApiIdentifier,
          faker.string.uuid(),
          mockCustomer.id
        )
      ).rejects.toThrowError(OfferingNotFoundError);
    });

    it('returns eligibility status successfully', async () => {
      const mockCustomer = StripeCustomerFactory();
      const interval = SubplatInterval.Monthly;
      const mockOffering = EligibilityContentOfferingResultFactory();
      const mockFromPrice = StripePriceFactory();
      const mockFromOfferingId = 'prod_test';
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.UPGRADE,
          priceId: 'prod_test',
          fromOfferingId: mockOffering.apiIdentifier,
        },
      ] satisfies OfferingOverlapResult[];

      jest.spyOn(appleIapPurchaseManager, 'getForUser').mockResolvedValue([]);
      jest.spyOn(googleIapPurchaseManager, 'getForUser').mockResolvedValue([]);
      jest
        .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
        .mockResolvedValue(
          new EligibilityContentByOfferingResultUtil(
            EligibilityContentByOfferingResultFactory({
              offerings: [mockOffering],
            })
          )
        );

      jest.spyOn(subscriptionManager, 'listForCustomer').mockResolvedValue([]);

      jest
        .spyOn(eligibilityManager, 'getOfferingOverlap')
        .mockResolvedValue(mockOverlapResult);

      jest.spyOn(eligibilityManager, 'compareOverlap').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.UPGRADE,
        fromOfferingConfigId: mockFromOfferingId,
        fromPrice: mockFromPrice,
      });

      await eligibilityService.checkEligibility(
        interval,
        mockOffering.apiIdentifier,
        faker.string.uuid(),
        mockCustomer.id
      );

      expect(
        productConfigurationManager.getEligibilityContentByOffering
      ).toHaveBeenCalledWith(mockOffering.apiIdentifier);
      expect(subscriptionManager.listForCustomer).toHaveBeenCalledWith(
        mockCustomer.id
      );
      expect(eligibilityManager.getOfferingOverlap).toHaveBeenCalledWith({
        priceIds: [],
        targetOffering: mockOffering,
      });
      expect(eligibilityManager.compareOverlap).toHaveBeenCalledWith(
        mockOverlapResult,
        mockOffering,
        interval,
        []
      );
    });
  });

  describe('getProductAvailabilityForLocation', () => {
    it('returns valid location', async () => {
      const mockOffering = EligibilityOfferingResultFactory({
        countries: ['US', 'CA', 'GB'],
      });
      const mockCountryCode = 'GB';

      jest.spyOn(productConfigurationManager, 'fetchCMSData').mockResolvedValue(
        PageContentOfferingTransformedFactory({
          countries: ['US', 'CA', 'GB'],
        })
      );

      const { status } =
        await eligibilityService.getProductAvailabilityForLocation(
          mockOffering.apiIdentifier,
          mockCountryCode
        );

      expect(status).toEqual(LocationStatus.Valid);
    });

    it('returns sanctioned location', async () => {
      const mockOffering = EligibilityOfferingResultFactory({
        countries: ['US', 'CA', 'GB'],
      });
      const mockCountryCode = 'CN';

      jest.spyOn(productConfigurationManager, 'fetchCMSData').mockResolvedValue(
        PageContentOfferingTransformedFactory({
          countries: ['US', 'CA', 'GB'],
        })
      );

      const { status } =
        await eligibilityService.getProductAvailabilityForLocation(
          mockOffering.apiIdentifier,
          mockCountryCode
        );
      expect(status).toEqual(LocationStatus.SanctionedLocation);
    });

    it('returns product not available in location', async () => {
      const mockOffering = EligibilityOfferingResultFactory({
        countries: ['US', 'CA', 'GB'],
      });
      const mockCountryCode = 'RO';

      jest.spyOn(productConfigurationManager, 'fetchCMSData').mockResolvedValue(
        PageContentOfferingTransformedFactory({
          countries: ['US', 'CA', 'GB'],
        })
      );

      const { status } =
        await eligibilityService.getProductAvailabilityForLocation(
          mockOffering.apiIdentifier,
          mockCountryCode
        );
      expect(status).toEqual(LocationStatus.ProductNotAvailable);
    });

    it('returns unresolved', async () => {
      const mockOffering = EligibilityOfferingResultFactory({
        countries: ['US', 'CA', 'GB'],
      });

      jest.spyOn(productConfigurationManager, 'fetchCMSData').mockResolvedValue(
        PageContentOfferingTransformedFactory({
          countries: ['US', 'CA', 'GB'],
        })
      );

      const { status } =
        await eligibilityService.getProductAvailabilityForLocation(
          mockOffering.apiIdentifier,
          undefined
        );
      expect(status).toEqual(LocationStatus.Unresolved);
    });
  });
});
