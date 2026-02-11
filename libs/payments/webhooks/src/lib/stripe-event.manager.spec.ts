/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import {
  MockStripeConfigProvider,
  StripeClient,
  StripeEventCustomerSubscriptionCreatedFactory,
} from '@fxa/payments/stripe';
import { StripeEventManager } from './stripe-event.manager';
import { StripeWebhookService } from './stripe-webhooks.service';
import { SubscriptionEventsService } from './subscription-handler.service';
import {
  CustomerManager,
  InvoiceManager,
  PriceManager,
  SubscriptionManager,
  PaymentMethodManager,
} from '@fxa/payments/customer';
import { PaymentsEmitterService } from '@fxa/payments/events';
import {
  MockPaypalClientConfigProvider,
  PayPalClient,
} from '@fxa/payments/paypal';
import {
  CurrencyManager,
  MockCurrencyConfigProvider,
} from '@fxa/payments/currency';
import {
  MockPaymentsGleanConfigProvider,
  MockPaymentsGleanFactory,
  PaymentsGleanManager,
} from '@fxa/payments/metrics';
import {
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { CartManager } from '@fxa/payments/cart';
import { AccountManager } from '@fxa/shared/account/account';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { StripeEventCustomerSubscriptionDeletedFactory } from 'libs/payments/stripe/src/lib/factories/event.factory';
import { Logger } from '@nestjs/common';

import {
  createStripeEventStoreEntry,
  getStripeEventStoreEntry,
} from './stripe-event-store.repository';
import { MockStripeEventConfigProvider } from './stripe-event.config';
import { StripeEventStoreEntryFactory } from './factories';
import {
  StripeEventStoreEntryAlreadyExistsError,
  StripeEventStoreEntryNotFoundError,
} from './stripe-event-store.error';
import {
  MockNimbusClientConfigProvider,
  NimbusClient,
} from '@fxa/shared/experiments';
import {
  MockNimbusManagerConfigProvider,
  NimbusManager,
} from '@fxa/payments/experiments';

jest.mock('./stripe-event-store.repository');
const mockedGetStripeEventStoreEntry = jest.mocked(getStripeEventStoreEntry);
const mockedCreateStripeEventStoreEntry = jest.mocked(
  createStripeEventStoreEntry
);

describe('StripeEventManager', () => {
  let stripeEventManager: StripeEventManager;
  let stripeClient: StripeClient;

  const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  };

  const paymentMethodManagerMock = {
    determineType: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: PaymentMethodManager,
          useValue: paymentMethodManagerMock,
        },
        MockStripeConfigProvider,
        MockStripeEventConfigProvider,
        StripeClient,
        StripeEventManager,
        StripeWebhookService,
        SubscriptionEventsService,
        SubscriptionManager,
        CustomerManager,
        InvoiceManager,
        PaymentsEmitterService,
        PayPalClient,
        CurrencyManager,
        MockCurrencyConfigProvider,
        PaymentsGleanManager,
        MockPaymentsGleanConfigProvider,
        MockPaymentsGleanFactory,
        ProductConfigurationManager,
        CartManager,
        AccountManager,
        MockPaypalClientConfigProvider,
        MockStrapiClientConfigProvider,
        StrapiClient,
        MockStrapiClientConfigProvider,
        MockFirestoreProvider,
        MockStatsDProvider,
        PriceManager,
        MockAccountDatabaseNestFactory,
        NimbusClient,
        MockNimbusClientConfigProvider,
        NimbusManager,
        MockNimbusManagerConfigProvider,
      ],
    }).compile();

    stripeEventManager = module.get(StripeEventManager);
    stripeClient = module.get(StripeClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SubscriptionEventsService', () => {
    describe('constructWebhookEventResponse', () => {
      it('customer.subscription.deleted - returns subscription object', () => {
        jest
          .spyOn(stripeClient, 'constructWebhookEvent')
          .mockReturnValue(StripeEventCustomerSubscriptionDeletedFactory());
        const result = stripeEventManager.constructWebhookEventResponse({}, '');
        expect(result.type).toBe('customer.subscription.deleted');
      });

      it('customer.subscription.created - returns default', () => {
        jest
          .spyOn(stripeClient, 'constructWebhookEvent')
          .mockReturnValue(StripeEventCustomerSubscriptionCreatedFactory());
        const result = stripeEventManager.constructWebhookEventResponse({}, '');
        expect(result.type).toBe('customer.subscription.created');
      });
    });

    describe('isProcessed', () => {
      const mockEventStoreEntry = StripeEventStoreEntryFactory();
      beforeEach(() => {
        mockedGetStripeEventStoreEntry.mockResolvedValue(mockEventStoreEntry);
      });

      it('returns true if event is processed', async () => {
        const result = await stripeEventManager.isProcessed(
          mockEventStoreEntry.eventId
        );
        expect(result).toBeTruthy();
        expect(mockedGetStripeEventStoreEntry).toHaveBeenCalledWith(
          undefined,
          mockEventStoreEntry.eventId
        );
      });

      it('returns false if event is not processed', async () => {
        mockedGetStripeEventStoreEntry.mockRejectedValue(
          new StripeEventStoreEntryNotFoundError(mockEventStoreEntry.eventId)
        );
        const result = await stripeEventManager.isProcessed(
          mockEventStoreEntry.eventId
        );
        expect(result).toBeFalsy();
        expect(mockedGetStripeEventStoreEntry).toHaveBeenCalledWith(
          undefined,
          mockEventStoreEntry.eventId
        );
      });

      it('throws an error if unexpected error occurs', async () => {
        const expectedError = new Error('Unexpected error');
        mockedGetStripeEventStoreEntry.mockRejectedValue(expectedError);
        await expect(
          stripeEventManager.isProcessed(mockEventStoreEntry.eventId)
        ).rejects.toThrow(expectedError);
      });
    });

    describe('markAsProcessed', () => {
      const mockEventStoreEntry = StripeEventStoreEntryFactory();
      beforeEach(() => {
        mockedCreateStripeEventStoreEntry.mockResolvedValue(
          mockEventStoreEntry
        );
      });

      it('successfully creates a new record', async () => {
        await stripeEventManager.markAsProcessed(
          mockEventStoreEntry.eventDetails
        );
        expect(mockedCreateStripeEventStoreEntry).toHaveBeenCalledWith(
          undefined,
          {
            eventId: mockEventStoreEntry.eventId,
            processedAt: expect.any(Date),
            eventDetails: mockEventStoreEntry.eventDetails,
          }
        );
      });

      it('logs a warning if entry already exists', async () => {
        const expectedError = new StripeEventStoreEntryAlreadyExistsError(
          mockEventStoreEntry.eventId
        );
        mockedCreateStripeEventStoreEntry.mockRejectedValue(expectedError);
        await stripeEventManager.markAsProcessed(
          mockEventStoreEntry.eventDetails
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(expectedError);
      });

      it('throws an error if unexpected error occurs', async () => {
        const expectedError = new Error('Unexpected error');
        mockedCreateStripeEventStoreEntry.mockRejectedValue(expectedError);
        await expect(
          stripeEventManager.markAsProcessed(mockEventStoreEntry.eventDetails)
        ).rejects.toThrow(expectedError);
      });
    });
  });
});
