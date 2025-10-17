/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CollectionReference,
  DocumentReference,
  QuerySnapshot,
  Timestamp,
} from '@google-cloud/firestore';
import {
  StripeWebhookEventFactory,
  StripeWebhookEventFirestoreRecordFactory,
} from './factories';
import { createStripeEvent } from './stripeEvent.repository';

describe('Stripe Event Repository', () => {
  let mockDb: jest.Mocked<CollectionReference>;
  let mockDoc: jest.Mocked<DocumentReference>;

  const mockStripeEvent = StripeWebhookEventFactory();
  const mockStripeEventFirestoreRecord =
    StripeWebhookEventFirestoreRecordFactory({
      eventId: mockStripeEvent.eventId,
      processedAt: Timestamp.fromDate(mockStripeEvent.processedAt),
      eventDetails: mockStripeEvent.eventDetails,
    });

  beforeEach(() => {
    mockDoc = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest
        .fn()
        .mockResolvedValue({ data: () => mockStripeEventFirestoreRecord }),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<DocumentReference>;

    mockDb = {
      doc: jest.fn().mockReturnValue(mockDoc),
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [{ ref: mockDoc, data: () => mockStripeEventFirestoreRecord }],
      } as unknown as QuerySnapshot),
    } as unknown as jest.Mocked<CollectionReference>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createStripeEvent', () => {
    it('creates a stripe event record successfully', async () => {
      const result = await createStripeEvent(mockDb, mockStripeEvent);
      expect(result).toEqual(mockStripeEvent);
      expect(mockDb.doc).toHaveBeenCalledWith(mockStripeEvent.eventId);
      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: mockStripeEventFirestoreRecord.eventId,
          processedAt: mockStripeEventFirestoreRecord.processedAt,
          eventDetails: mockStripeEventFirestoreRecord.eventDetails,
        })
      );
    });
  });
});
