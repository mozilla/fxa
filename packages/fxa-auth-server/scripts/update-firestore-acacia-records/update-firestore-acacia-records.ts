/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Stripe from 'stripe';
import Container from 'typedi';
import {
  CollectionReference,
  DocumentData,
  Firestore,
} from '@google-cloud/firestore';
import PQueue from 'p-queue';
import { StatsD } from 'hot-shots';

import { AppConfig, AuthFirestore } from '../../lib/types';
import { ConfigType } from '../../config';
import { StripeHelper } from '../../lib/payments/stripe';
import { StripeFirestore } from '../../lib/payments/stripe-firestore';

/**
 * For RAM-preserving purposes only
 */
const QUEUE_SIZE_LIMIT = 1000;
/**
 * For RAM-preserving purposes only
 */
const QUEUE_CONCURRENCY_LIMIT = 3;

/**
 * Top-level fields the acacia API shape carried and the basil shape dropped. A
 * mirror doc holding any of them predates the webhook version cutover and has
 * to be re-fetched, whatever its values say.
 */
const ACACIA_SUBSCRIPTION_KEYS = [
  'current_period_end',
  'current_period_start',
  'discount',
  'plan',
];
const ACACIA_INVOICE_KEYS = [
  'charge',
  'discount',
  'payment_intent',
  'subscription',
  'total_tax_amounts',
];

export const isAcaciaShape = (record: DocumentData | undefined) =>
  !!record &&
  [...ACACIA_SUBSCRIPTION_KEYS, ...ACACIA_INVOICE_KEYS].some(
    (key) => key in record
  );

/**
 * The completion tally is meant to reconcile, so a follow-up run can be scoped
 * to whatever this one could not finish:
 *
 *   customersChecked        = customersSkippedDeleted + customersProcessed
 *                          + customersFailed
 *   subscriptionsChecked = subscriptionsCurrentShape + subscriptionsMissingDoc
 *                          + subscriptionsOutdatedShape + subscriptionsFailed
 *   invoicesChecked      = invoicesCurrentShape + invoicesOutdatedShape
 */
export class FirestoreAcaciaUpdater {
  private config: ConfigType;
  private firestore: Firestore;
  private stripeQueue: PQueue;
  private stripe: Stripe;
  private stripeFirestore: StripeFirestore;
  private customersChecked = 0;
  private customersSkippedDeleted = 0;
  private customersProcessed = 0;
  private customersFailed = 0;
  private subscriptionsChecked = 0;
  private subscriptionsCurrentShape = 0;
  private subscriptionsMissingDoc = 0;
  private subscriptionsOutdatedShape = 0;
  private subscriptionsFailed = 0;
  private subscriptionsInvoiceWalkFailed = 0;
  private subscriptionsResynced = 0;
  private subscriptionsResyncFailed = 0;
  private invoicesChecked = 0;
  private invoicesCurrentShape = 0;
  private invoicesOutdatedShape = 0;
  private invoicesResynced = 0;
  private invoicesResyncFailed = 0;
  private customerCollectionDbRef: CollectionReference;
  private subscriptionCollection: string;
  private invoiceCollection: string;

  constructor(
    private stripeHelper: StripeHelper,
    rateLimit: number,
    private log: any,
    private dryRun: boolean
  ) {
    this.stripe = this.stripeHelper.stripe;

    const config = Container.get<ConfigType>(AppConfig);
    this.config = config;

    const firestore = Container.get<Firestore>(AuthFirestore);
    this.firestore = firestore;

    const prefix = `${this.config.authFirestore.prefix}stripe-`;
    this.customerCollectionDbRef = this.firestore.collection(
      `${prefix}customers`
    );
    this.subscriptionCollection = `${prefix}subscriptions`;
    this.invoiceCollection = `${prefix}invoices`;

    this.stripeFirestore = new StripeFirestore(
      this.firestore,
      this.customerCollectionDbRef,
      this.stripe,
      prefix,
      Container.get(StatsD),
      this.log
    );

    this.stripeQueue = new PQueue({
      intervalCap: rateLimit,
      interval: 1000,
    });
  }

  private async enqueueRequest<T>(request: () => Promise<T>): Promise<T> {
    return this.stripeQueue.add(request) as Promise<T>;
  }

  async run(): Promise<void> {
    this.log.info('firestore-acacia-update-start', {
      dryRun: this.dryRun,
    });

    const queue = new PQueue({ concurrency: QUEUE_CONCURRENCY_LIMIT });

    await this.stripe.customers
      .list({
        limit: 25,
      })
      .autoPagingEach(async (customer) => {
        if (queue.size + queue.pending >= QUEUE_SIZE_LIMIT) {
          await queue.onSizeLessThan(
            QUEUE_SIZE_LIMIT - QUEUE_CONCURRENCY_LIMIT
          );
        }

        queue.add(() => {
          return this.processCustomer(customer);
        });
      });

    await queue.onIdle();

    this.log.info('firestore-acacia-update-complete', {
      dryRun: this.dryRun,
      customersChecked: this.customersChecked,
      customersSkippedDeleted: this.customersSkippedDeleted,
      customersProcessed: this.customersProcessed,
      customersFailed: this.customersFailed,
      subscriptionsChecked: this.subscriptionsChecked,
      subscriptionsCurrentShape: this.subscriptionsCurrentShape,
      subscriptionsMissingDoc: this.subscriptionsMissingDoc,
      subscriptionsOutdatedShape: this.subscriptionsOutdatedShape,
      subscriptionsFailed: this.subscriptionsFailed,
      subscriptionsInvoiceWalkFailed: this.subscriptionsInvoiceWalkFailed,
      subscriptionsResynced: this.subscriptionsResynced,
      subscriptionsResyncFailed: this.subscriptionsResyncFailed,
      invoicesChecked: this.invoicesChecked,
      invoicesCurrentShape: this.invoicesCurrentShape,
      invoicesOutdatedShape: this.invoicesOutdatedShape,
      invoicesResynced: this.invoicesResynced,
      invoicesResyncFailed: this.invoicesResyncFailed,
    });
  }

  async processCustomer(
    stripeCustomer: Stripe.Customer | Stripe.DeletedCustomer
  ): Promise<void> {
    try {
      this.customersChecked++;

      if (stripeCustomer.deleted) {
        this.customersSkippedDeleted++;
        return;
      }

      if (!stripeCustomer.metadata.userid) {
        throw new Error(
          `Stripe customer ${stripeCustomer.id} is missing a userid`
        );
      }

      const subscriptions = await this.enqueueRequest(() =>
        this.stripe.subscriptions
          .list({
            customer: stripeCustomer.id,
            limit: 100,
            status: 'all',
          })
          .autoPagingToArray({ limit: 10000 })
      );

      for (const stripeSubscription of subscriptions) {
        await this.processSubscription(
          stripeCustomer.id,
          stripeCustomer.metadata.userid,
          stripeSubscription
        );
      }

      this.customersProcessed++;
    } catch (e) {
      this.customersFailed++;
      this.log.error('error-processing-customer', {
        customerId: stripeCustomer.id,
        error: e,
      });
    }
  }

  /**
   * A mirror doc missing altogether is drift rather than an outdated shape, so
   * it is left to the sync checker.
   */
  async processSubscription(
    customerId: string,
    uid: string,
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    try {
      this.subscriptionsChecked++;

      const subscriptionDoc = await this.customerCollectionDbRef
        .doc(uid)
        .collection(this.subscriptionCollection)
        .doc(stripeSubscription.id)
        .get();

      if (!subscriptionDoc.exists) {
        this.subscriptionsMissingDoc++;
      } else if (isAcaciaShape(subscriptionDoc.data())) {
        this.recordOutdated(
          'subscription',
          customerId,
          uid,
          stripeSubscription.id
        );
        await this.resyncSubscription(stripeSubscription.id, customerId, uid);
      } else {
        this.subscriptionsCurrentShape++;
      }

      await this.processInvoices(customerId, uid, stripeSubscription.id);
    } catch (e) {
      this.subscriptionsFailed++;
      this.log.error('error-processing-subscription', {
        customerId,
        uid,
        subscriptionId: stripeSubscription.id,
        error: e,
      });
    }
  }

  /**
   * Checks every invoice for a subscription, marks outdated ones, and resyncs them.
   */
  async processInvoices(
    customerId: string,
    uid: string,
    subscriptionId: string
  ): Promise<void> {
    try {
      const invoiceDocs = await this.customerCollectionDbRef
        .doc(uid)
        .collection(this.subscriptionCollection)
        .doc(subscriptionId)
        .collection(this.invoiceCollection)
        .get();

      for (const invoiceDoc of invoiceDocs.docs) {
        this.invoicesChecked++;

        if (isAcaciaShape(invoiceDoc.data())) {
          this.recordOutdated(
            'invoice',
            customerId,
            uid,
            subscriptionId,
            invoiceDoc.id
          );
          await this.resyncInvoice(invoiceDoc.id, customerId, subscriptionId);
        } else {
          this.invoicesCurrentShape++;
        }
      }
    } catch (e) {
      this.subscriptionsInvoiceWalkFailed++;
      this.log.error('error-processing-invoices', {
        customerId,
        uid,
        subscriptionId,
        error: e,
      });
    }
  }

  recordOutdated(
    type: 'subscription' | 'invoice',
    customerId: string,
    uid: string,
    subscriptionId: string,
    invoiceId: string | null = null
  ): void {
    if (type === 'subscription') {
      this.subscriptionsOutdatedShape++;
    } else {
      this.invoicesOutdatedShape++;
    }

    this.log.warn('firestore-acacia-record-outdated', {
      type,
      customerId,
      uid,
      subscriptionId,
      invoiceId,
    });
  }

  /**
   * Rewrites the subscription doc from the Stripe API, which the SDK pins to the
   * current version. `fetchAndInsertSubscription` reads Stripe inside the
   * transaction that locks the doc, so a webhook writing concurrently cannot
   * lose its update to a snapshot taken before that transaction opened.
   */
  async resyncSubscription(
    subscriptionId: string,
    customerId: string,
    uid: string
  ): Promise<void> {
    if (this.dryRun) {
      return;
    }

    try {
      await this.enqueueRequest(() =>
        this.stripeFirestore.fetchAndInsertSubscription(subscriptionId, uid)
      );
      this.subscriptionsResynced++;
    } catch (e) {
      this.subscriptionsResyncFailed++;
      this.log.error('failed-to-resync-subscription', {
        subscriptionId,
        customerId,
        uid,
        error: e,
      });
    }
  }

  async resyncInvoice(
    invoiceId: string,
    customerId: string,
    subscriptionId: string
  ): Promise<void> {
    if (this.dryRun) {
      return;
    }

    try {
      await this.enqueueRequest(() =>
        this.stripeFirestore.fetchAndInsertInvoice(
          invoiceId,
          Math.floor(Date.now() / 1000)
        )
      );
      this.invoicesResynced++;
    } catch (e) {
      this.invoicesResyncFailed++;
      this.log.error('failed-to-resync-invoice', {
        invoiceId,
        customerId,
        subscriptionId,
        error: e,
      });
    }
  }
}
