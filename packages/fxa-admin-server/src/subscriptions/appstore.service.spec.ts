/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MockConfig, MockLogService } from '../mocks';
import {
  AppStoreHelperService,
  AppStorePurchaseManagerService,
  AppStoreService,
} from './appstore.service';
import { FirestoreFactory } from './firestore.service';

describe.skip('AppStoreHelperService', () => {
  let service: AppStoreHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppStoreHelperService, MockConfig, MockLogService],
    }).compile();

    service = module.get<AppStoreHelperService>(AppStoreHelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe.skip('PurchaseManagerService', () => {
  let service: AppStorePurchaseManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppStorePurchaseManagerService,
        AppStoreHelperService,
        MockConfig,
        MockLogService,
        FirestoreFactory,
      ],
    }).compile();

    service = module.get<AppStorePurchaseManagerService>(
      AppStorePurchaseManagerService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe.skip('App Store Service', () => {
  let service: AppStoreService;

  const mockQueryCurrentSubscriptionPurchases = jest.fn();
  const MockPurchaseManagerService: Provider = {
    provide: AppStorePurchaseManagerService,
    useFactory: () => {
      return {
        queryCurrentSubscriptionPurchases:
          mockQueryCurrentSubscriptionPurchases,
      };
    },
  };

  beforeEach(async () => {
    mockQueryCurrentSubscriptionPurchases.mockClear();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppStoreService, MockPurchaseManagerService],
    }).compile();

    service = module.get<AppStoreService>(AppStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call purchase manager', async () => {
    await service.getSubscriptions('uid-123');
    expect(mockQueryCurrentSubscriptionPurchases).toBeCalledWith('uid-123');
  });
});
