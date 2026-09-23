/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import {
  Timestamp,
  type CollectionReference,
  type Firestore,
} from '@google-cloud/firestore';

import { FirestoreService } from '@fxa/shared/db/firestore';

import { MeteringConfig } from './metering.config';
import {
  deleteUsageGrant,
  getUsageGrants,
  insertUsageGrant,
  type NewUsageGrant,
  type UsageGrantRecord,
} from './usage-grants.repository';
import { isUsageGrantActive } from './utils/isUsageGrantActive';

export interface CreateUsageGrantData {
  subject: string;
  slug: string;
  amount: number;
  grantedBy: string;
  reason?: string;
  expiresAt: Date | null;
}

@Injectable()
export class UsageGrantsManager {
  constructor(
    private readonly meteringConfig: MeteringConfig,
    @Inject(FirestoreService) private readonly firestore: Firestore
  ) {}

  get collectionRef(): CollectionReference {
    return this.firestore.collection(
      this.meteringConfig.usageGrants.firestoreCollectionName
    );
  }

  async createGrant(data: CreateUsageGrantData): Promise<UsageGrantRecord> {
    const record: NewUsageGrant = {
      subject: data.subject,
      slug: data.slug,
      amount: data.amount,
      grantedBy: data.grantedBy,
      reason: data.reason,
      createdAt: Timestamp.now(),
      expiresAt: data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null,
    };
    return insertUsageGrant(this.collectionRef, record);
  }

  async listGrants(
    subject: string,
    slug?: string
  ): Promise<UsageGrantRecord[]> {
    const grants = await getUsageGrants(this.collectionRef, subject);
    return slug === undefined
      ? grants
      : grants.filter((grant) => grant.slug === slug);
  }

  async deleteGrant(id: string): Promise<void> {
    return deleteUsageGrant(this.collectionRef, id);
  }

  async getActiveGrantedAmount(
    subject: string,
    slug: string,
    date: Date
  ): Promise<number> {
    const grants = await getUsageGrants(this.collectionRef, subject);
    return grants
      .filter(
        (grant) =>
          grant.slug === slug && isUsageGrantActive(grant.expiresAt, date)
      )
      .reduce((total, grant) => total + grant.amount, 0);
  }
}
