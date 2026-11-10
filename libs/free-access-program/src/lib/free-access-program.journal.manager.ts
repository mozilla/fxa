/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import type { CollectionReference, Firestore } from '@google-cloud/firestore';

import { FirestoreService } from '@fxa/shared/db/firestore';
import type { FreeAccessProjection } from '@fxa/shared/cms';

import { FreeAccessProgramJournalManagerConfig } from './free-access-program.journal.manager.config';
import {
  deleteFreeAccessProgramPendingNotification,
  type FreeAccessPendingNotification,
  getDueFreeAccessProgramPendingNotifications,
  getFreeAccessProgramJournal,
  setFreeAccessProgramJournal,
  upsertFreeAccessProgramPendingNotifications,
} from './free-access-program.repository';

@Injectable()
export class FreeAccessProgramJournalManager {
  constructor(
    private config: FreeAccessProgramJournalManagerConfig,
    @Inject(FirestoreService) private firestore: Firestore
  ) {}

  get collectionRef(): CollectionReference {
    return this.firestore.collection(this.config.collectionName);
  }

  async get(): Promise<FreeAccessProjection | null> {
    return getFreeAccessProgramJournal(this.collectionRef);
  }

  async set(projection: FreeAccessProjection): Promise<void> {
    return setFreeAccessProgramJournal(this.collectionRef, projection);
  }

  async queueNotifications(emails: string[], notBefore: number): Promise<void> {
    return upsertFreeAccessProgramPendingNotifications(
      this.collectionRef,
      emails,
      notBefore
    );
  }

  async getDueNotifications(
    now: number,
    limit: number
  ): Promise<FreeAccessPendingNotification[]> {
    return getDueFreeAccessProgramPendingNotifications(
      this.collectionRef,
      now,
      limit
    );
  }

  async deleteNotification(
    notification: FreeAccessPendingNotification
  ): Promise<void> {
    return deleteFreeAccessProgramPendingNotification(
      this.collectionRef,
      notification
    );
  }
}
