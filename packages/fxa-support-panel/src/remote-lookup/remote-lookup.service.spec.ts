/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';
import superagent from 'superagent';

import { RemoteLookupService } from './remote-lookup.service';

const now = new Date().getTime();
const MS_IN_SEC = 1000;

export const MOCKDATA = {
  account: {
    createdAt: now,
    email: 'test+quux@example.com',
    emailVerified: true,
    locale: 'en-us',
  },
  devices: [
    {
      createdAt: 1578414423827,
      name: 'desktop',
      type: 'browser',
    },
  ],
  signinLocations: [
    {
      city: 'Heapolandia',
      country: 'United Devices of von Neumann',
      countryCode: 'UVN',
      lastAccessTime: 1578414423827,
      state: 'Memory Palace',
      stateCode: 'MP',
    },
    {
      city: 'Boring',
      country: 'United States',
      countryCode: 'US',
      lastAccessTime: 1578498222026,
      state: 'Oregon',
      stateCode: 'OR',
    },
  ],
  subscriptions: {
    [MozillaSubscriptionTypes.WEB]: [
      {
        created: 1555354567,
        current_period_end: 1579716673,
        current_period_start: 1579630273,
        plan_changed: 1579630273,
        previous_product: 'Old Product',
        product_name: 'Example Product',
        status: 'active',
        subscription_id: 'sub_GZ7WKEJp1YGZ86',
      },
      {
        created: 1588972390,
        current_period_end: 1591650790,
        current_period_start: 1588972390,
        plan_changed: null,
        previous_product: null,
        product_name: 'Amazing Product',
        status: 'active',
        subscription_id: 'sub_12345',
      },
    ],
    [MozillaSubscriptionTypes.IAP_GOOGLE]: [
      {
        auto_renewing: false,
        expiry_time_millis: 1591650790000,
        package_name: 'club.foxkeh',
        sku: 'LOL.daily',
        product_id: 'prod_testo',
        product_name: 'LOL Daily',
      },
    ],
    [MozillaSubscriptionTypes.IAP_APPLE]: [
      {
        app_store_product_id: 'wow',
        auto_renewing: false,
        bundle_id: 'hmm',
        expiry_time_millis: 1591650790000,
        product_id: 'prod_123',
        product_name: 'Cooking with Foxkeh',
      },
    ],
  },
  totp: {
    enabled: true,
    epoch: now,
    sharedSecret: '',
    verified: true,
  },
};

export const formattedSubscriptions = {
  [MozillaSubscriptionTypes.WEB]: [
    {
      created: String(new Date(1555354567 * MS_IN_SEC)),
      current_period_end: String(new Date(1579716673 * MS_IN_SEC)),
      current_period_start: String(new Date(1579630273 * MS_IN_SEC)),
      plan_changed: String(new Date(1579630273 * MS_IN_SEC)),
      previous_product: 'Old Product',
      product_name: 'Example Product',
      status: 'active',
      subscription_id: 'sub_GZ7WKEJp1YGZ86',
    },
    {
      created: String(new Date(1588972390 * MS_IN_SEC)),
      current_period_end: String(new Date(1591650790 * MS_IN_SEC)),
      current_period_start: String(new Date(1588972390 * MS_IN_SEC)),
      plan_changed: 'N/A',
      previous_product: 'N/A',
      product_name: 'Amazing Product',
      status: 'active',
      subscription_id: 'sub_12345',
    },
  ],
  [MozillaSubscriptionTypes.IAP_GOOGLE]: [
    {
      auto_renewing: false,
      expiry_time_millis: 1591650790000,
      expiry: String(new Date(1591650790 * MS_IN_SEC)),
      package_name: 'club.foxkeh',
      sku: 'LOL.daily',
      product_id: 'prod_testo',
      product_name: 'LOL Daily',
    },
  ],
  [MozillaSubscriptionTypes.IAP_APPLE]: [
    {
      app_store_product_id: 'wow',
      auto_renewing: false,
      bundle_id: 'hmm',
      expiry_time_millis: 1591650790000,
      expiry: String(new Date(1591650790 * MS_IN_SEC)),
      product_id: 'prod_123',
      product_name: 'Cooking with Foxkeh',
    },
  ],
};

export const formattedSigninLocations = [
  {
    city: 'Heapolandia',
    country: 'United Devices of von Neumann',
    countryCode: 'UVN',
    lastAccessTime: new Date(1578414423827),
    state: 'Memory Palace',
    stateCode: 'MP',
  },
  {
    city: 'Boring',
    country: 'United States',
    countryCode: 'US',
    lastAccessTime: new Date(1578498222026),
    state: 'Oregon',
    stateCode: 'OR',
  },
];

describe('RemoteLookupService', () => {
  let service: RemoteLookupService;

  beforeEach(async () => {
    const mockConfig = jest.fn().mockReturnValue({});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoteLookupService,
        {
          provide: ConfigService,
          useValue: { get: mockConfig },
        },
      ],
    }).compile();

    service = module.get<RemoteLookupService>(RemoteLookupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calls a URL with headers set', async () => {
    (jest.spyOn(superagent, 'get') as jest.Mock).mockReturnValue({
      set: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue({
          body: MOCKDATA.account,
        }),
      }),
    });
    expect(await service.authServerGetBody('url')).toStrictEqual(
      MOCKDATA.account
    );
  });

  describe('subscriptions', () => {
    it('returns successfully', async () => {
      service.authServerGetBody = jest
        .fn()
        .mockResolvedValue(MOCKDATA.subscriptions);
      expect(await service.subscriptions('test', 'email')).toStrictEqual(
        formattedSubscriptions
      );
    });

    it('handles subscriptions not found', async () => {
      service.authServerGetBody = jest
        .fn()
        .mockRejectedValue({ status: 500, response: { body: { errno: 998 } } });
      expect(await service.subscriptions('test', 'email')).toStrictEqual({
        [MozillaSubscriptionTypes.WEB]: [],
        [MozillaSubscriptionTypes.IAP_GOOGLE]: [],
        [MozillaSubscriptionTypes.IAP_APPLE]: [],
      });
    });

    it('re-throws other errors', async () => {
      expect.assertions(1);
      service.authServerGetBody = jest
        .fn()
        .mockRejectedValue(new Error('unknown'));
      try {
        await service.subscriptions('test', 'email');
      } catch (err) {
        expect(err).toStrictEqual(new Error('unknown'));
      }
    });
  });

  it('returns signin locations', async () => {
    service.authServerGetBody = jest
      .fn()
      .mockResolvedValue(MOCKDATA.signinLocations);
    expect(await service.signinLocations('test')).toStrictEqual(
      formattedSigninLocations
    );
  });
});
