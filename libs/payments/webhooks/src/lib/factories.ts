/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripeEventCustomerSubscriptionCreatedFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import {
  CustomerSubscriptionDeletedResponse,
  type StripeEventStoreEntry,
  type StripeEventStoreEntryFirestoreRecord,
} from './types';
import { Timestamp } from '@google-cloud/firestore';
import { faker } from '@faker-js/faker';

const subscription = StripeSubscriptionFactory();

export const CustomerSubscriptionDeletedResponseFactory = (
  override?: Partial<CustomerSubscriptionDeletedResponse>
): CustomerSubscriptionDeletedResponse => ({
  type: 'customer.subscription.deleted',
  event: StripeEventCustomerSubscriptionCreatedFactory(subscription),
  eventObjectData: subscription,
  ...override,
});

export const StripeEventStoreEntryFactory = (
  override?: Partial<StripeEventStoreEntry>
): StripeEventStoreEntry => ({
  eventId: `evt_${faker.string.alphanumeric({ length: 24 })}`,
  processedAt: new Date(),
  eventDetails: StripeEventCustomerSubscriptionCreatedFactory(),
  ...override,
});

export const StripeEventStoreEntryFirestoreRecordFactory = (
  override?: Partial<StripeEventStoreEntryFirestoreRecord>
): StripeEventStoreEntryFirestoreRecord => ({
  eventId: `evt_${faker.string.alphanumeric({ length: 24 })}`,
  processedAt: Timestamp.fromDate(new Date()),
  eventDetails: StripeEventCustomerSubscriptionCreatedFactory(),
  ...override,
});
