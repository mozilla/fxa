/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';
import {
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { PaymentsGleanManager } from './glean.manager';
import { PaymentsGleanService } from './glean.service';
import {
  CmsMetricsDataFactory,
  FxaPaySetupViewMetricsFactory,
  ParamsFactory,
} from './glean.factory';
import {
  MockStripeConfigProvider,
  StripeClient,
  StripePriceFactory,
} from '@fxa/payments/stripe';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { PriceManager } from '@fxa/payments/customer';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockPaymentsGleanFactory } from './glean.provider';

describe('PaymentsGleanService', () => {
  let paymentsGleanService: PaymentsGleanService;
  let paymentsGleanManager: PaymentsGleanManager;
  let productConfigurationManager: ProductConfigurationManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockPaymentsGleanFactory,
        MockStrapiClientConfigProvider,
        MockStripeConfigProvider,
        MockFirestoreProvider,
        MockStatsDProvider,
        StrapiClient,
        StripeClient,
        PriceManager,
        PaymentsGleanManager,
        ProductConfigurationManager,
        PaymentsGleanService,
      ],
    }).compile();

    paymentsGleanService = moduleRef.get(PaymentsGleanService);
    paymentsGleanManager = moduleRef.get(PaymentsGleanManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
  });

  it('should be defined', () => {
    expect(paymentsGleanService).toBeDefined();
    expect(paymentsGleanManager).toBeDefined();
    expect(productConfigurationManager).toBeDefined();
  });

  describe('handleEventFxaPaySetupView', () => {
    const mockCmsData = CmsMetricsDataFactory();
    const mockMetricsData = FxaPaySetupViewMetricsFactory({
      params: ParamsFactory(),
    });
    const mockStripePrice = StripePriceFactory({
      id: mockCmsData.priceId,
      product: mockCmsData.productId,
    });

    beforeEach(() => {
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockStripePrice);
      jest
        .spyOn(paymentsGleanManager, 'recordFxaPaySetupView')
        .mockResolvedValue();
    });

    it('should call manager record method', async () => {
      await paymentsGleanService.handleEventFxaPaySetupView(mockMetricsData);
      expect(
        productConfigurationManager.retrieveStripePrice
      ).toHaveBeenCalledWith(
        mockMetricsData.params['offeringId'],
        mockMetricsData.params['interval']
      );
      expect(paymentsGleanManager.recordFxaPaySetupView).toHaveBeenCalledWith(
        mockMetricsData,
        mockCmsData
      );
    });

    it('should call manager record method with empty data', async () => {
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockRejectedValue(new Error('fail'));
      await paymentsGleanService.handleEventFxaPaySetupView(mockMetricsData);
      expect(
        productConfigurationManager.retrieveStripePrice
      ).toHaveBeenCalledWith(
        mockMetricsData.params['offeringId'],
        mockMetricsData.params['interval']
      );
      expect(paymentsGleanManager.recordFxaPaySetupView).toHaveBeenCalledWith(
        mockMetricsData,
        { priceId: '', productId: '' }
      );
    });
  });
});
