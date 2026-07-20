/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { MockLoggerProvider } from '@fxa/shared/log';

import { SetupIntentManager } from './setupIntent.manager';
import {
  StripeClient,
  MockStripeConfigProvider,
  StripeResponseFactory,
  StripeSetupIntentFactory,
} from '@fxa/payments/stripe';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { SetupIntentCancelInvalidStatusError } from './customer.error';

describe('SetupIntentManager', () => {
  let setupIntentManager: SetupIntentManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockStripeConfigProvider,
        SetupIntentManager,
        StripeClient,
        MockStatsDProvider,
        MockLoggerProvider,
      ],
    }).compile();

    setupIntentManager = moduleRef.get(SetupIntentManager);
    stripeClient = moduleRef.get(StripeClient);
  });

  describe('createAndConfirm', () => {
    it('should create and confirm intent', async () => {
      const mockConfirmationToken = 'confirmToken';
      const mockCustomerId = 'cus_12345';
      const mockResponse = StripeResponseFactory(StripeSetupIntentFactory());

      jest
        .spyOn(stripeClient, 'setupIntentCreate')
        .mockResolvedValue(mockResponse);

      const result = await setupIntentManager.createAndConfirm(
        mockCustomerId,
        mockConfirmationToken
      );

      expect(stripeClient.setupIntentCreate).toHaveBeenCalledWith({
        customer: mockCustomerId,
        confirm: true,
        confirmation_token: mockConfirmationToken,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        use_stripe_sdk: true,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should pass metadata through to setupIntentCreate when provided', async () => {
      const mockConfirmationToken = 'confirmToken';
      const mockCustomerId = 'cus_12345';
      const mockResponse = StripeResponseFactory(StripeSetupIntentFactory());

      jest
        .spyOn(stripeClient, 'setupIntentCreate')
        .mockResolvedValue(mockResponse);

      await setupIntentManager.createAndConfirm(
        mockCustomerId,
        mockConfirmationToken,
        { subscription_id: 'sub_abc' }
      );

      expect(stripeClient.setupIntentCreate).toHaveBeenCalledWith({
        customer: mockCustomerId,
        confirm: true,
        confirmation_token: mockConfirmationToken,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        use_stripe_sdk: true,
        metadata: { subscription_id: 'sub_abc' },
      });
    });
  });

  describe('update', () => {
    it('should update a setup intent', async () => {
      const mockSetupIntentId = 'seti_12345';
      const mockResponse = StripeResponseFactory(StripeSetupIntentFactory());
      const params = { metadata: { subscription_id: 'sub_abc' } };

      jest
        .spyOn(stripeClient, 'setupIntentUpdate')
        .mockResolvedValue(mockResponse);

      const result = await setupIntentManager.update(
        mockSetupIntentId,
        params
      );

      expect(stripeClient.setupIntentUpdate).toHaveBeenCalledWith(
        mockSetupIntentId,
        params
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('confirm', () => {
    it('should confirm an existing setup intent', async () => {
      const mockSetupIntentId = 'seti_12345';
      const mockConfirmationToken = 'confirmToken';
      const mockResponse = StripeResponseFactory(StripeSetupIntentFactory());

      jest
        .spyOn(stripeClient, 'setupIntentConfirm')
        .mockResolvedValue(mockResponse);

      const result = await setupIntentManager.confirm(
        mockSetupIntentId,
        mockConfirmationToken
      );

      expect(stripeClient.setupIntentConfirm).toHaveBeenCalledWith(
        mockSetupIntentId,
        {
          confirmation_token: mockConfirmationToken,
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('retrieve', () => {
    it('should retrieve a payment intent', async () => {
      const mockResponse = StripeResponseFactory(StripeSetupIntentFactory());

      jest
        .spyOn(stripeClient, 'setupIntentRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await setupIntentManager.retrieve(mockResponse.id);

      expect(stripeClient.setupIntentRetrieve).toHaveBeenCalledWith(
        mockResponse.id
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancel', () => {
    it('should cancel a setup intent with valid status', async () => {
      const mockSetupIntent = StripeResponseFactory(
        StripeSetupIntentFactory({
          status: 'requires_payment_method',
        })
      );

      jest
        .spyOn(stripeClient, 'setupIntentCancel')
        .mockResolvedValue(mockSetupIntent);

      const result = await setupIntentManager.cancel(
        mockSetupIntent.id,
        mockSetupIntent.status
      );

      expect(stripeClient.setupIntentCancel).toHaveBeenCalledWith(
        mockSetupIntent.id
      );
      expect(result).toEqual(mockSetupIntent);
    });

    it('should throw error for invalid status', async () => {
      const mockSetupIntentId = 'si_12345';
      const invalidStatus = 'succeeded';

      await expect(
        setupIntentManager.cancel(mockSetupIntentId, invalidStatus)
      ).rejects.toThrow(SetupIntentCancelInvalidStatusError);
    });
  });
});
