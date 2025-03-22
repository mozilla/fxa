import { Inject, Injectable } from '@nestjs/common';
import type { CollectionReference, Firestore } from '@google-cloud/firestore';
import { FirestoreService } from '@fxa/shared/db/firestore';
import { AppleIapClientConfig } from './apple-iap.client.config';
import {
  decodeNotificationPayload,
  decodeTransaction,
  type DecodedNotificationPayload,
} from 'app-store-server-api';
import { AppleIapClient } from './apple-iap.client';

@Injectable()
export class AppleIapStoreManager {
  collectionRef: CollectionReference;

  constructor(
    config: AppleIapClientConfig,
    @Inject(FirestoreService) private firestore: Firestore,
    private appleIapClient: AppleIapClient
  ) {
    this.collectionRef = this.firestore.collection(config.collectionName);
  }

  async decodeNotificationPayload(payload: string): Promise<{
    bundleId: string;
    decodedPayload: DecodedNotificationPayload;
    originalTransactionId: string;
  }> {
    const decodedPayload = await decodeNotificationPayload(payload);

    if (!decodedPayload.data) {
      throw new Error('Decoded payload contains no data');
    }

    const { bundleId, originalTransactionId } = await decodeTransaction(
      decodedPayload.data.signedTransactionInfo
    );

    return {
      bundleId,
      decodedPayload,
      originalTransactionId,
    };
  }

  async getSubscriptionStatuses(
    bundleId: string,
    originalTransactionId: string
  ) {
    return this.appleIapClient.getSubscriptionStatuses(
      bundleId,
      originalTransactionId
    );
  }
}
