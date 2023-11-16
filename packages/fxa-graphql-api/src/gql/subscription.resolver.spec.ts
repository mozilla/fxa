/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from '../backend/subscription.service';
import { SubscriptionResolver } from './subscription.resolver';

describe('#unit - SubscriptionResolver', () => {
  let resolver: SubscriptionResolver;
  let mockSubscriptionService: Partial<SubscriptionService>;
  const mockSubscriptionProductInfo = {
    productId: 'foo',
    productName: 'bar',
  };

  beforeEach(async () => {
    mockSubscriptionService = {
      getProductInfo: jest.fn().mockReturnValue(mockSubscriptionProductInfo),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionResolver,
        { provide: SubscriptionService, useValue: mockSubscriptionService },
      ],
    }).compile();

    resolver = module.get<SubscriptionResolver>(SubscriptionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('calls product info service', async () => {
    const result = await resolver.productInfo('foo');
    expect(mockSubscriptionService.getProductInfo).toBeCalledWith('foo');
    expect(result).toEqual(mockSubscriptionProductInfo);
  });
});
