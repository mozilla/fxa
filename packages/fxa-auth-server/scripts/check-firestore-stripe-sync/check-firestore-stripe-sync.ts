/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Stripe from 'stripe';
import Container from 'typedi';
import { CollectionReference, Firestore } from '@google-cloud/firestore';
import PQueue from 'p-queue';

import { AppConfig, AuthFirestore } from '../../lib/types';
import { ConfigType } from '../../config';
import { StripeHelper } from '../../lib/payments/stripe';

/**
  * For RAM-preserving pruposes only
  */
const QUEUE_SIZE_LIMIT = 1000;
/**
  * For RAM-preserving pruposes only
  */
const QUEUE_CONCURRENCY_LIMIT = 3;

export class FirestoreStripeSyncChecker {
  private config: ConfigType;
  private firestore: Firestore;
  private stripeQueue: PQueue;
  private stripe: Stripe;
  private customersCheckedCount = 0;
  private subscriptionsCheckedCount = 0;
  private outOfSyncCount = 0;
  private customersMissingInFirestore = 0;
  private subscriptionsMissingInFirestore = 0;
  private customersMismatched = 0;
  private subscriptionsMismatched = 0;
  private customerCollectionDbRef: CollectionReference;
  private subscriptionCollection: string;

  constructor(
    private stripeHelper: StripeHelper,
    rateLimit: number,
    private log: any,
  ) {
    this.stripe = this.stripeHelper.stripe;

    const config = Container.get<ConfigType>(AppConfig);
    this.config = config;

    const firestore = Container.get<Firestore>(AuthFirestore);
    this.firestore = firestore;

    this.customerCollectionDbRef = this.firestore.collection(`${this.config.authFirestore.prefix}stripe-customers`);
    this.subscriptionCollection = `${this.config.authFirestore.prefix}stripe-subscriptions`;

    this.stripeQueue = new PQueue({
      intervalCap: rateLimit,
      interval: 1000,
    });
  }

  private async enqueueRequest<T>(request: () => Promise<T>): Promise<T> {
    return this.stripeQueue.add(request) as Promise<T>;
  }

  async run(): Promise<void> {
    this.log.info('firestore-stripe-sync-check-start');

    const queue = new PQueue({ concurrency: QUEUE_CONCURRENCY_LIMIT });

    await this.stripe.customers.list({
      limit: 25,
    }).autoPagingEach(async (customer) => {
      if (queue.size + queue.pending >= QUEUE_SIZE_LIMIT) {
        await queue.onSizeLessThan(QUEUE_SIZE_LIMIT - QUEUE_CONCURRENCY_LIMIT);
      }

      queue.add(() => {
        return this.checkCustomerSync(customer);
      });
    });

    await queue.onIdle();

    this.log.info('firestore-stripe-sync-check-complete', {
      customersCheckedCount: this.customersCheckedCount,
      subscriptionsCheckedCount: this.subscriptionsCheckedCount,
      outOfSyncCount: this.outOfSyncCount,
      customersMissingInFirestore: this.customersMissingInFirestore,
      subscriptionsMissingInFirestore: this.subscriptionsMissingInFirestore,
      customersMismatched: this.customersMismatched,
      subscriptionsMismatched: this.subscriptionsMismatched,
    });
  }

  async checkCustomerSync(stripeCustomer: Stripe.Customer | Stripe.DeletedCustomer): Promise<void> {
    try {
      if (stripeCustomer.deleted) {
        return;
      }

      this.customersCheckedCount++;

      if (!stripeCustomer.metadata.userid) {
        throw new Error(`Stripe customer ${stripeCustomer.id} is missing a userid`);
      }

      const firestoreCustomerDoc = await this.customerCollectionDbRef
        .doc(stripeCustomer.metadata.userid)
        .get();

      if (!firestoreCustomerDoc.exists) {
        this.handleOutOfSync(stripeCustomer.id, 'Customer exists in Stripe but not in Firestore', 'customer_missing');
        return;
      }

      const firestoreCustomer = firestoreCustomerDoc.data();

      if (!this.isCustomerInSync(firestoreCustomer, stripeCustomer)) {
        this.handleOutOfSync(stripeCustomer.id, 'Customer mismatch', 'customer_mismatch');
        return;
      }

      const subscriptions = await this.enqueueRequest(() =>
        this.stripe.subscriptions.list({
          customer: stripeCustomer.id,
          limit: 100,
          status: "all",
        })
      );
      for (const stripeSubscription of subscriptions.data) {
        await this.checkSubscriptionSync(stripeCustomer.id, stripeCustomer.metadata.userid, stripeSubscription);
      }
    } catch (e) {
      this.log.error('error-checking-customer', {
        customerId: stripeCustomer.id,
        error: e,
      });
    }
  }

  async checkSubscriptionSync(customerId: string, uid: string, stripeSubscription: Stripe.Subscription): Promise<void> {
    try {
      this.subscriptionsCheckedCount++;

      const subscriptionDoc = await this.customerCollectionDbRef
        .doc(uid)
        .collection(this.subscriptionCollection)
        .doc(stripeSubscription.id)
        .get();

      if (!subscriptionDoc.exists) {
        this.handleOutOfSync(customerId, 'Subscription exists in Stripe but not in Firestore', 'subscription_missing', stripeSubscription.id);
        return;
      }

      const firestoreSubscription = subscriptionDoc.data();

      if (!this.isSubscriptionInSync(firestoreSubscription, stripeSubscription)) {
        this.handleOutOfSync(customerId, 'Subscription data mismatch', 'subscription_mismatch', stripeSubscription.id);
        return;
      }
    } catch (e) {
      this.log.error('error-checking-subscription', {
        customerId,
        subscriptionId: stripeSubscription.id,
        error: e,
      });
    }
  }

  isCustomerInSync(firestoreCustomer: any, stripeCustomer: Stripe.Customer): boolean {
    for (const key of Object.keys(stripeCustomer)) {
      if (
        stripeCustomer[key] !== null
        && stripeCustomer[key] !== undefined
        && !["string", "number"].includes(typeof stripeCustomer[key])
      ) continue;

      if (firestoreCustomer[key] !== stripeCustomer[key]) {
        return false;
      }
    }

    return true;
  }

  isSubscriptionInSync(firestoreSubscription: any, stripeSubscription: Stripe.Subscription): boolean {
    for (const key of Object.keys(stripeSubscription)) {
      if (
        stripeSubscription[key] !== null
        && stripeSubscription[key] !== undefined
        && !["string", "number"].includes(typeof stripeSubscription[key])
      ) continue;

      if (firestoreSubscription[key] !== stripeSubscription[key]) {
        return false;
      }
    }

    return true;
  }

  handleOutOfSync(customerId: string, reason: string, type: string, subscriptionId: string | null = null): void {
    this.outOfSyncCount++;

    if (type === 'customer_missing') {
      this.customersMissingInFirestore++;
    } else if (type === 'customer_mismatch') {
      this.customersMismatched++;
    } else if (type === 'subscription_missing') {
      this.subscriptionsMissingInFirestore++;
    } else if (type === 'subscription_mismatch') {
      this.subscriptionsMismatched++;
    }

    this.log.warn('firestore-stripe-out-of-sync', {
      customerId,
      subscriptionId,
      reason,
      type,
    });

    this.triggerResync(customerId);
  }

  async triggerResync(customerId: string): Promise<void> {
    try {
      await this.enqueueRequest(() =>
        this.stripe.customers.update(customerId, {
          metadata: {
            forcedResyncAt: Date.now().toString(),
          },
        })
      );
    } catch (e) {
      this.log.error('failed-to-trigger-resync', {
        customerId,
        error: e,
      });
    }
  }
}
