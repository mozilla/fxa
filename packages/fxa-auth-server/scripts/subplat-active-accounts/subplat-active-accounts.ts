/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import fs from 'fs';
import os from 'os';
import path from 'path';
import Container from 'typedi';
import { BigQuery } from '@google-cloud/bigquery';
import {
  DocumentData,
  FieldPath,
  Firestore,
  QueryDocumentSnapshot,
} from '@google-cloud/firestore';
import { SubscriptionStatus } from 'app-store-server-api';
import { StatsD } from 'hot-shots';
import { ACTIVE_SUBSCRIPTION_STATUSES } from '@fxa/accounts/subscriptions-legacy/subscriptions/stripe';

import { AppConfig, AuthFirestore } from '../../lib/types';
import { ConfigType } from '../../config';

const UID_PATTERN = /^[0-9a-f]{32}$/;
const REPLACED_PURCHASE_USERID_PLACEHOLDER = 'invalid';
const ACTIVE_APPLE_STATUSES = [
  SubscriptionStatus.Active,
  SubscriptionStatus.InBillingGracePeriod,
];
const DAY_IN_MS = 86_400_000;
const BATCH_SIZE = 1000;

type Source = 'stripe' | 'apple' | 'google';

export class SubplatActiveAccounts {
  private config: ConfigType;
  private firestore: Firestore;
  private invalidUidCount = 0;

  constructor(
    private bigQuery: BigQuery,
    private statsd: StatsD,
    private log: any,
    private maxEndedAgeDays: number,
    private dryRun: boolean
  ) {
    this.config = Container.get<ConfigType>(AppConfig);
    this.firestore = Container.get<Firestore>(AuthFirestore);
  }

  async run(qualifiedTableId: string): Promise<number> {
    this.log.info('subplat-active-accounts-start', {
      qualifiedTableId,
      maxEndedAgeDays: this.maxEndedAgeDays,
      dryRun: this.dryRun,
    });

    const uids = await this.collectActiveUids(
      Date.now() - this.maxEndedAgeDays * DAY_IN_MS
    );

    if (uids.size === 0) {
      throw new Error(
        'No active SubPlat accounts found; refusing to replace the table.'
      );
    }

    if (!this.dryRun) {
      await this.replaceTable(qualifiedTableId, uids);
    }

    this.statsd.increment('subplat-active-accounts.uids', uids.size);
    this.log.info('subplat-active-accounts-complete', {
      uidCount: uids.size,
      invalidUidCount: this.invalidUidCount,
      dryRun: this.dryRun,
    });

    return uids.size;
  }

  async collectActiveUids(cutoffMs: number): Promise<Set<string>> {
    const uids = new Set<string>();
    const prefix = this.config.authFirestore.prefix;

    await this.collectFrom(
      'stripe',
      `${prefix}stripe-subscriptions`,
      uids,
      (doc) =>
        this.isActiveStripeSubscription(doc.data(), cutoffMs)
          ? doc.ref.parent.parent?.id
          : undefined
    );
    await this.collectFrom(
      'apple',
      `${prefix}iap-app-store-purchases`,
      uids,
      (doc) =>
        this.isActiveApplePurchase(doc.data(), cutoffMs)
          ? doc.data().userId
          : undefined
    );
    await this.collectFrom(
      'google',
      `${prefix}iap-play-purchases`,
      uids,
      (doc) =>
        this.isActiveGooglePurchase(doc.data(), cutoffMs)
          ? doc.data().userId
          : undefined
    );

    return uids;
  }

  isActiveStripeSubscription(subscription: DocumentData, cutoffMs: number) {
    if (ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
      return true;
    }
    return (
      typeof subscription.ended_at === 'number' &&
      subscription.ended_at * 1000 > cutoffMs
    );
  }

  isActiveApplePurchase(purchase: DocumentData, cutoffMs: number) {
    if (ACTIVE_APPLE_STATUSES.includes(purchase.status)) {
      return true;
    }
    return Number(purchase.expiresDate) > cutoffMs;
  }

  isActiveGooglePurchase(purchase: DocumentData, cutoffMs: number) {
    if (purchase.userId === REPLACED_PURCHASE_USERID_PLACEHOLDER) {
      return false;
    }
    return Number(purchase.expiryTimeMillis) > cutoffMs;
  }

  async replaceTable(qualifiedTableId: string, uids: Set<string>) {
    const [projectId, datasetId, tableId] = qualifiedTableId.split('.');
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'subplat-active-accounts-')
    );
    const filepath = path.join(directory, 'uids.csv');

    try {
      fs.writeFileSync(filepath, [...uids].join(os.EOL));
      await this.bigQuery
        .dataset(datasetId, { projectId })
        .table(tableId)
        .load(filepath, {
          sourceFormat: 'CSV',
          writeDisposition: 'WRITE_TRUNCATE',
          schema: {
            fields: [
              {
                name: 'uid',
                type: 'STRING',
                maxLength: '32',
                mode: 'REQUIRED',
              },
            ],
          },
        });
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  }

  private async collectFrom(
    source: Source,
    collectionId: string,
    uids: Set<string>,
    uidFor: (doc: QueryDocumentSnapshot) => string | undefined
  ) {
    let sourceCount = 0;
    for await (const docs of this.pages(collectionId)) {
      for (const doc of docs) {
        const uid = uidFor(doc)?.toLowerCase();
        if (uid === undefined) {
          continue;
        }
        if (!UID_PATTERN.test(uid)) {
          this.invalidUidCount++;
          continue;
        }
        uids.add(uid);
        sourceCount++;
      }
    }

    this.statsd.increment('subplat-active-accounts.source-uids', sourceCount, {
      source,
    });
    this.log.info('subplat-active-accounts-source-complete', {
      source,
      sourceCount,
    });
  }

  private async *pages(collectionId: string) {
    const query = this.firestore
      .collectionGroup(collectionId)
      .orderBy(FieldPath.documentId())
      .limit(BATCH_SIZE);
    let snapshot = await query.get();
    while (!snapshot.empty) {
      yield snapshot.docs;
      snapshot = await query.startAfter(snapshot.docs.at(-1)).get();
    }
  }
}
