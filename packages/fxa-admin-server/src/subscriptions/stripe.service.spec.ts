/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { STRIPE_PRICE_METADATA } from 'fxa-shared/payments/stripe';
import { AbbrevPlan } from 'fxa-shared/subscriptions/types';
import Stripe from 'stripe';
import {
  MockConfig,
  mockFirestoreCollection,
  MockFirestoreFactory,
  MockLogService,
  MockMetricsFactory,
  MockStripeFactory,
} from '../mocks';
import {
  iapPurchaseToPlan,
  StripePaymentConfigManagerService,
  StripeFirestoreService,
  StripeService,
  validateStripePlan,
} from './stripe.service';

describe('Stripe Factory', () => {
  let service: Stripe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockConfig, MockStripeFactory],
    }).compile();

    service = module.get<Stripe>('STRIPE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('PaymentConfigManagerService', () => {
  let service: StripePaymentConfigManagerService;

  beforeEach(async () => {
    mockFirestoreCollection.mockReturnValue({
      onSnapshot: jest.fn(),
      get: async () => ({
        docs: [],
      }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripePaymentConfigManagerService,
        MockConfig,
        MockLogService,
        MockFirestoreFactory,
      ],
    }).compile();

    service = module.get<StripePaymentConfigManagerService>(
      StripePaymentConfigManagerService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('StripeFirestoreService', () => {
  let service: StripeFirestoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeFirestoreService,
        MockConfig,
        MockFirestoreFactory,
        MockStripeFactory,
      ],
    }).compile();

    service = module.get<StripeFirestoreService>(StripeFirestoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('Stripe Service', () => {
  let service: StripeService;

  const mockLookupLatestInvoice = jest.fn();
  const MockStripeFactory: Provider = {
    provide: 'STRIPE',
    useFactory: () => {
      return {
        invoices: {
          retrieve: mockLookupLatestInvoice,
        },
        on: jest.fn(),
      };
    },
  };

  const MockStripeFirestoreService: Provider = {
    provide: StripeFirestoreService,
    useValue: {},
  };

  const MockPaymentConfigManagerService: Provider = {
    provide: StripePaymentConfigManagerService,
    useValue: {},
  };

  beforeEach(async () => {
    mockLookupLatestInvoice.mockClear();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        MockConfig,
        MockLogService,
        MockStripeFirestoreService,
        MockPaymentConfigManagerService,
        MockStripeFactory,
        MockMetricsFactory,
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('invalidates empty plan', () => {
    const result = validateStripePlan({ metadata: {} });
    expect(result).toBeFalsy();
  });

  it('validates plan', () => {
    const baseUrl = 'https://accounts-static.cdn.mozilla.net';

    const result = validateStripePlan({
      metadata: {
        webIconURL: `${baseUrl}/icon`,
        successActionButtonURL: `${baseUrl}/dl`,
        appStoreLink: `${baseUrl}/appstore`,
        playStoreLink: `${baseUrl}/appstore`,
        productSet: 'product-123',
        productOrder: '123',
        'product:termsOfServiceDownloadURL': `${baseUrl}/legal/test-123`,
        'product:termsOfServiceURL': `${baseUrl}/toc`,
        'product:privacyNoticeDownloadURL': `${baseUrl}/legal/test-123`,
        'product:privacyNoticeURL': `${baseUrl}/privacy`,
        'product:cancellationSurveyURL': `${baseUrl}/cancel-survey`,
        'capabilities-test1': 'test-123',
      },
    });
    expect(result).toBeTruthy();
  });

  it('looks up latest invoice', async () => {
    mockLookupLatestInvoice.mockImplementation(async () => ({
      hosted_invoice_url: 'http://www.foo.bar',
    }));
    const result1 = await service.lookupLatestInvoice('');
    const result2 = await service.lookupLatestInvoice('invoice-123');

    expect(result2).toEqual({ hosted_invoice_url: 'http://www.foo.bar' });
    expect(mockLookupLatestInvoice).toBeCalledWith('invoice-123');
    expect(result1).toBeNull();
  });

  it('creates manage subscription link', async () => {
    const customerId = 'customer-123';
    const manageSessionUrl =
      'https://dashboard.stripe.com/customers/customer-123';

    const result1 = await service.createManageSubscriptionLink(customerId);

    expect(result1).toEqual(manageSessionUrl);
  });

  describe('iap mappings', () => {
    const plan: AbbrevPlan = {
      active: true,
      amount: 1.0,
      configuration: null,
      currency: 'USD',
      interval: 'day',
      interval_count: 1,
      plan_id: 'plan-123',
      plan_metadata: {},
      plan_name: 'plan 123',
      product_id: 'product-123',
      product_metadata: {},
      product_name: 'product 123',
    };

    const plans = [
      {
        ...plan,
        plan_id: `playstore-${plan.plan_id}`,
        plan_metadata: {
          [STRIPE_PRICE_METADATA.PLAY_SKU_IDS]: 'product-123,product-234',
        },
      },
      {
        ...plan,
        plan_id: `appstore-${plan.plan_id}`,
        plan_metadata: {
          [STRIPE_PRICE_METADATA.APP_STORE_PRODUCT_IDS]:
            'product-123,product-234',
        },
      },
      plan,
    ];

    it('maps iap play store purchase to plan', () => {
      const playStoreResult = iapPurchaseToPlan(
        'product-123',
        'iap_google',
        plans
      );

      expect(playStoreResult).toBeDefined();
      expect(playStoreResult?.plan_id).toEqual('playstore-plan-123');
    });

    it('maps iap app store purchase to plan', () => {
      const appStoreResult = iapPurchaseToPlan(
        'product-123',
        'iap_apple',
        plans
      );

      expect(appStoreResult).toBeDefined();
      expect(appStoreResult?.plan_id).toEqual('appstore-plan-123');
    });

    it('maps iap purchase to plan ignoring case', () => {
      const appStoreResult = iapPurchaseToPlan(
        'PRODUCT-123',
        'iap_apple',
        plans
      );

      expect(appStoreResult).toBeDefined();
      expect(appStoreResult?.plan_id).toEqual('appstore-plan-123');
    });

    it('returns undefined iap purchase for unknown plan', () => {
      const result = iapPurchaseToPlan('product-123', 'iap_google', [plans[2]]);
      expect(result).toBeUndefined();
    });

    it('throws for invalid type', () => {
      expect(() =>
        iapPurchaseToPlan('product-123', 'iap_goo0gle', [plans[2]])
      ).toThrow('Invalid iapType');
    });
  });
});
