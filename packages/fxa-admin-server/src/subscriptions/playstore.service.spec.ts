/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MockConfig, MockFirestoreFactory, MockLogService } from '../mocks';
import {
  PlayStorePurchaseManagerService,
  PlayStoreService,
  PlayStoreUserManagerService,
} from './playstore.service';

describe('PurchaseManagerService', () => {
  let service: PlayStorePurchaseManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayStorePurchaseManagerService,
        MockConfig,
        MockFirestoreFactory,
        MockLogService,
      ],
    }).compile();

    service = module.get<PlayStorePurchaseManagerService>(
      PlayStorePurchaseManagerService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('UserManagerService', () => {
  let service: PlayStoreUserManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayStoreUserManagerService,
        MockConfig,
        MockLogService,
        PlayStorePurchaseManagerService,
        MockFirestoreFactory,
      ],
    }).compile();

    service = module.get<PlayStoreUserManagerService>(
      PlayStoreUserManagerService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('PlayStoreService', () => {
  let service: PlayStoreService;

  const mockQueryCurrentSubscriptions = jest.fn();
  const MockUserManagerService: Provider = {
    provide: PlayStoreUserManagerService,
    useValue: {
      queryCurrentSubscriptions: mockQueryCurrentSubscriptions,
    },
  };

  const MockPurchaseManagerService: Provider = {
    provide: PlayStorePurchaseManagerService,
    useValue: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayStoreService,
        MockUserManagerService,
        MockPurchaseManagerService,
      ],
    }).compile();

    service = module.get<PlayStoreService>(PlayStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('gets subscriptions', async () => {
    await service.getSubscriptions('uid-123');

    expect(mockQueryCurrentSubscriptions).toBeCalledWith('uid-123');
  });
});
