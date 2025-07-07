/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { SubscriptionManagementService } from '@fxa/payments/management';
import { Logger } from '@nestjs/common';

jest.mock('@fxa/shared/error', () => ({
  ...jest.requireActual('@fxa/shared/error'),
  SanitizeExceptions: jest.fn(({ allowlist = [] } = {}) => {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      return descriptor;
    };
  }),
}));

describe('SubscriptionManagementService', () => {
  let subscriptionManagementService: SubscriptionManagementService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [Logger, SubscriptionManagementService],
    }).compile();

    subscriptionManagementService = moduleRef.get(
      SubscriptionManagementService
    );
  });

  describe('checkInitialization', () => {
    it('is initialized', () => {
      const initialization =
        subscriptionManagementService.checkInitialization();
      expect(initialization.initialized).toBeTruthy();
    });
  });
});
