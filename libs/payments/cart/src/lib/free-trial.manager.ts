/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import { Timestamp, type CollectionReference, type Firestore } from '@google-cloud/firestore';
import { FirestoreService } from '@fxa/shared/db/firestore';
import { FreeTrialConfig } from './free-trial.config';
import {
  getLatestFreeTrialRecordData,
  insertFreeTrialRecord,
} from './free-trial.repository';

@Injectable()
export class FreeTrialManager {
  constructor(
    private config: FreeTrialConfig,
    @Inject(FirestoreService) private firestore: Firestore
  ) {}

  get collectionRef(): CollectionReference {
    return this.firestore.collection(this.config.firestoreCollectionName);
  }

  async recordFreeTrial(uid: string, freeTrialConfigId: string): Promise<void> {
    await insertFreeTrialRecord(this.collectionRef, {
      uid,
      freeTrialConfigId,
      startedAt: Timestamp.now(),
    });
  }

  async isBlockedByCooldown(
    uid: string,
    freeTrialConfigId: string,
    cooldownPeriodMonths: number
  ): Promise<boolean> {
    const record = await getLatestFreeTrialRecordData(this.collectionRef, uid, freeTrialConfigId);
    if (!record) {
      return false;
    }

    const cooldownEnd = new Date(record.startedAt.toMillis());
    cooldownEnd.setMonth(cooldownEnd.getMonth() + cooldownPeriodMonths);

    return cooldownEnd.getTime() >= Date.now();
  }
}
