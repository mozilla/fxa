/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';

import {
  PriceManager,
  StripeClient,
  StripeConfig,
  StripeCustomerFactory,
  StripeSubscriptionFactory,
  SubplatInterval,
  SubscriptionManager,
} from '@fxa/payments/stripe';
import {
  ContentfulClientConfig,
  EligibilityContentByOfferingResultUtil,
  EligibilityContentOfferingResultFactory,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';

import { EligibilityManager } from './eligibility.manager';
import { EligibilityService } from './eligibility.service';
import {
  EligibilityStatus,
  OfferingComparison,
  OfferingOverlapProductResult,
} from './eligibility.types';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import * as StripeUtil from '../../../stripe/src/lib/stripe.util';

jest.mock('../../../stripe/src/lib/stripe.util');

const mockStripeUtil = jest.mocked(StripeUtil);

describe('EligibilityService', () => {
  let productConfigurationManager: ProductConfigurationManager;
  let eligibilityManager: EligibilityManager;
  let eligibilityService: EligibilityService;
  let subscriptionManager: SubscriptionManager;

  let mockOfferingResult: EligibilityContentByOfferingResultUtil;

  beforeEach(async () => {
    mockOfferingResult = {} as EligibilityContentByOfferingResultUtil;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockFirestoreProvider,
        ContentfulClientConfig,
        MockStatsDProvider,
        StripeConfig,
        StripeClient,
        SubscriptionManager,
        PriceManager,
        EligibilityManager,
        EligibilityService,
        ProductConfigurationManager,
        StrapiClient,
      ],
    }).compile();

    productConfigurationManager = module.get<ProductConfigurationManager>(
      ProductConfigurationManager
    );
    eligibilityManager = module.get<EligibilityManager>(EligibilityManager);
    eligibilityService = module.get<EligibilityService>(EligibilityService);
    subscriptionManager = module.get<SubscriptionManager>(SubscriptionManager);
  });

  describe('checkEligibility', () => {
    it('returns create eligibility status for a new customer', async () => {
      const interval = SubplatInterval.Monthly;
      const mockOffering = EligibilityContentOfferingResultFactory();

      const result = await eligibilityService.checkEligibility(
        interval,
        mockOffering.apiIdentifier,
        undefined
      );
      expect(result).toEqual(EligibilityStatus.CREATE);
    });

    it('throws an error for no offering for offeringConfigId', async () => {
      const expectedError = new Error('No offering available');
      const mockCustomer = StripeCustomerFactory();
      const interval = SubplatInterval.Monthly;

      jest
        .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
        .mockResolvedValue({
          getOffering: jest.fn().mockImplementation(() => {
            throw expectedError;
          }),
        } as unknown as EligibilityContentByOfferingResultUtil);

      await expect(
        eligibilityService.checkEligibility(
          interval,
          'prod_test1',
          mockCustomer.id
        )
      ).rejects.toEqual(expectedError);
    });

    it('returns eligibility status successfully', async () => {
      const mockCustomer = StripeCustomerFactory();
      const interval = SubplatInterval.Monthly;
      const mockOffering = EligibilityContentOfferingResultFactory();
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.UPGRADE,
          offeringProductId: 'prod_test',
          type: 'offering',
        },
      ] as OfferingOverlapProductResult[];
      const mockSubscription = StripeSubscriptionFactory();

      jest
        .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
        .mockResolvedValue(mockOfferingResult);

      mockOfferingResult.getOffering = jest.fn().mockReturnValue(mockOffering);

      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockSubscription]);

      mockStripeUtil.getSubscribedPrices.mockReturnValue([]);
      mockStripeUtil.getSubscribedProductIds.mockReturnValue([]);

      jest
        .spyOn(eligibilityManager, 'getProductIdOverlap')
        .mockReturnValue(mockOverlapResult);

      jest
        .spyOn(eligibilityManager, 'compareOverlap')
        .mockResolvedValue(EligibilityStatus.UPGRADE);

      await eligibilityService.checkEligibility(
        interval,
        mockOffering.apiIdentifier,
        mockCustomer.id
      );

      expect(
        productConfigurationManager.getEligibilityContentByOffering
      ).toHaveBeenCalledWith(mockOffering.apiIdentifier);
      expect(subscriptionManager.listForCustomer).toHaveBeenCalledWith(
        mockCustomer.id
      );
      expect(eligibilityManager.getProductIdOverlap).toHaveBeenCalledWith(
        [],
        mockOffering
      );
      expect(eligibilityManager.compareOverlap).toHaveBeenCalledWith(
        mockOverlapResult,
        mockOffering,
        interval,
        []
      );
    });
  });
});
