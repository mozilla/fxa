/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripeEventCustomerSubscriptionCreatedFactory,
  StripeEventCustomerSubscriptionUpdatedFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import {
  CustomerSubscriptionDeletedResponse,
  CustomerSubscriptionUpdatedResponse,
  type StripeEventStoreEntry,
  type StripeEventStoreEntryFirestoreRecord,
} from './types';
import {
  FxaProfileChangeEvent,
  FxaSecurityEventTokenPayload,
} from './fxa-webhooks.types';
import { FXA_PROFILE_EVENT_URI } from './fxa-webhooks.types';
import { Timestamp } from '@google-cloud/firestore';
import { faker } from '@faker-js/faker';

const subscription = StripeSubscriptionFactory();

export const CustomerSubscriptionDeletedResponseFactory = (
  override?: Partial<CustomerSubscriptionDeletedResponse>
): CustomerSubscriptionDeletedResponse => ({
  type: 'customer.subscription.deleted',
  event: StripeEventCustomerSubscriptionCreatedFactory(undefined, subscription),
  eventObjectData: subscription,
  ...override,
});

export const CustomerSubscriptionUpdatedResponseFactory = (
  override?: Partial<CustomerSubscriptionUpdatedResponse>,
  subscriptionOverride?: Partial<ReturnType<typeof StripeSubscriptionFactory>>,
  previousAttributes?: Partial<ReturnType<typeof StripeSubscriptionFactory>>
): CustomerSubscriptionUpdatedResponse => {
  const sub = StripeSubscriptionFactory(subscriptionOverride);
  return {
    type: 'customer.subscription.updated',
    event: StripeEventCustomerSubscriptionUpdatedFactory(
      undefined,
      sub,
      previousAttributes
    ),
    eventObjectData: sub,
    ...override,
  };
};

export const StripeEventStoreEntryFactory = (
  override?: Partial<StripeEventStoreEntry>
): StripeEventStoreEntry => {
  const eventId = `evt_${faker.string.alphanumeric({ length: 24 })}`;
  return {
    eventId,
    processedAt: new Date(),
    eventDetails: StripeEventCustomerSubscriptionCreatedFactory({
      id: eventId,
    }),
    ...override,
  };
};

export const StripeEventStoreEntryFirestoreRecordFactory = (
  override?: Partial<StripeEventStoreEntryFirestoreRecord>
): StripeEventStoreEntryFirestoreRecord => {
  const eventId = `evt_${faker.string.alphanumeric({ length: 24 })}`;
  return {
    eventId,
    processedAt: Timestamp.fromDate(new Date()),
    eventDetails: StripeEventCustomerSubscriptionCreatedFactory({
      id: eventId,
    }),
    ...override,
  };
};

export const FxaProfileChangeEventFactory = (
  override?: Partial<FxaProfileChangeEvent>
): FxaProfileChangeEvent => ({
  email: faker.internet.email(),
  ...override,
});

export const FxaSecurityEventTokenPayloadFactory = (
  events: Record<string, Record<string, any>>,
  override?: Partial<FxaSecurityEventTokenPayload>
): FxaSecurityEventTokenPayload => ({
  iss: faker.internet.url(),
  sub: faker.string.hexadecimal({
    length: 32,
    prefix: '',
    casing: 'lower',
  }),
  aud: faker.string.hexadecimal({ length: 16 }),
  iat: Math.floor(Date.now() / 1000),
  jti: faker.string.alphanumeric({ length: 16 }),
  events,
  ...override,
});

export const FxaProfileChangeSecurityEventTokenPayloadFactory = (
  eventOverride?: Partial<FxaProfileChangeEvent>,
  payloadOverride?: Partial<FxaSecurityEventTokenPayload>
): FxaSecurityEventTokenPayload =>
  FxaSecurityEventTokenPayloadFactory(
    {
      [FXA_PROFILE_EVENT_URI]: FxaProfileChangeEventFactory(eventOverride),
    },
    payloadOverride
  );
