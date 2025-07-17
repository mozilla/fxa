/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { SubscriptionManagementService } from '@fxa/payments/management';
import {
  AccountCustomerManager,
  StripeClient,
  MockStripeConfigProvider,
} from '@fxa/payments/stripe';
import {
  CustomerManager,
  CustomerSessionManager,
  SetupIntentManager,
} from '@fxa/payments/customer';
import { Logger } from '@nestjs/common';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';

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
      providers: [
        MockAccountDatabaseNestFactory,
        MockStripeConfigProvider,
        StripeClient,
        AccountCustomerManager,
        CustomerSessionManager,
        SetupIntentManager,
        CustomerManager,
        SubscriptionManagementService,
        Logger,
        MockStatsDProvider,
      ],
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
