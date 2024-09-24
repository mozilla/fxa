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
import {
  AccountFactory,
  MockAccountDatabaseNestFactory,
} from '@fxa/shared/db/mysql/account';
import { AccountManager } from '@fxa/shared/account/account';
import { faker } from '@faker-js/faker';

describe('PaymentsGleanService', () => {
  let paymentsGleanService: PaymentsGleanService;
  let paymentsGleanManager: PaymentsGleanManager;
  let productConfigurationManager: ProductConfigurationManager;
  let accountsManager: AccountManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockPaymentsGleanFactory,
        MockStrapiClientConfigProvider,
        MockStripeConfigProvider,
        MockAccountDatabaseNestFactory,
        MockFirestoreProvider,
        MockStatsDProvider,
        StrapiClient,
        StripeClient,
        PriceManager,
        PaymentsGleanManager,
        ProductConfigurationManager,
        PaymentsGleanService,
        AccountManager,
      ],
    }).compile();

    paymentsGleanService = moduleRef.get(PaymentsGleanService);
    paymentsGleanManager = moduleRef.get(PaymentsGleanManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    accountsManager = moduleRef.get(AccountManager);
  });

  it('should be defined', () => {
    expect(paymentsGleanService).toBeDefined();
    expect(paymentsGleanManager).toBeDefined();
    expect(productConfigurationManager).toBeDefined();
    expect(accountsManager).toBeDefined();
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

    it('should not call recordFxaPaySetupView if opted out', async () => {
      const uid = Buffer.from(
        faker.string.hexadecimal({
          length: 32,
          prefix: '',
          casing: 'lower',
        }),
        'hex'
      );
      const mockUser = AccountFactory({
        uid,
        metricsOptOutAt: new Date().valueOf(),
      });
      jest.spyOn(accountsManager, 'getAccounts').mockResolvedValue([mockUser]);

      await paymentsGleanService.handleEventFxaPaySetupView({
        ...mockMetricsData,
        uid: uid.toString('hex'),
      });
      expect(paymentsGleanManager.recordFxaPaySetupView).not.toHaveBeenCalled();
    });
  });
});
