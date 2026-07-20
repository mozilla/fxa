/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import type { CollectionReference, Firestore } from '@google-cloud/firestore';
import { FirestoreService } from '@fxa/shared/db/firestore';
import { ChurnInterventionConfig } from './churn-intervention.config';
import { ChurnInterventionEntryNotFoundError } from './churn-intervention.error';
import type { ChurnInterventionEntry } from './churn-intervention.types';
import {
  createChurnInterventionEntry,
  getChurnInterventionEntryData,
  updateChurnInterventionEntry,
  deleteChurnInterventionEntry,
} from './churn-intervention.repository';

@Injectable()
export class ChurnInterventionManager {
  constructor(
    private config: ChurnInterventionConfig,
    @Inject(FirestoreService) private firestore: Firestore
  ) {}

  get collectionRef(): CollectionReference {
    return this.firestore.collection(this.config.collectionName);
  }

  async createEntry(entry: ChurnInterventionEntry) {
    const data = await createChurnInterventionEntry(this.collectionRef, {
      customerId: entry.customerId,
      churnInterventionId: entry.churnInterventionId,
      redemptionCount: entry.redemptionCount ?? 0,
    });
    return data;
  }

  async getOrCreateEntry(customerId: string, churnInterventionId: string) {
    try {
      const data = await getChurnInterventionEntryData(
        this.collectionRef,
        customerId,
        churnInterventionId
      );
      return {
        customerId: data.customerId,
        churnInterventionId: data.churnInterventionId,
        redemptionCount: data.redemptionCount,
      };
    } catch (error) {
      if (error instanceof ChurnInterventionEntryNotFoundError) {
        const created = await this.createEntry({
          customerId,
          churnInterventionId,
          redemptionCount: 0,
        });

        return {
          customerId: created.customerId,
          churnInterventionId: created.churnInterventionId,
          redemptionCount: created.redemptionCount ?? 0,
        };
      }
      throw error;
    }
  }

  async getRedemptionCountForUid(
    customerId: string,
    churnInterventionId: string
  ) {
    try {
      const churnInterventionEntryData = await this.getOrCreateEntry(
        customerId,
        churnInterventionId
      );
      return churnInterventionEntryData.redemptionCount ?? 0;
    } catch (error) {
      if (error instanceof ChurnInterventionEntryNotFoundError) {
        return 0;
      }
      throw error;
    }
  }

  async updateEntry(
    customerId: string,
    churnInterventionId: string,
    incrementBy: number
  ) {
    const data = await updateChurnInterventionEntry(
      this.collectionRef,
      customerId,
      churnInterventionId,
      incrementBy
    );
    return {
      customerId: data.customerId,
      churnInterventionId: data.churnInterventionId,
      redemptionCount: data.redemptionCount,
    };
  }

  async deleteEntry(customerId: string, churnInterventionId: string) {
    return await deleteChurnInterventionEntry(
      this.collectionRef,
      customerId,
      churnInterventionId
    );
  }
}
