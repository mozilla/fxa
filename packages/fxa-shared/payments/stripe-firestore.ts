/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CollectionReference, Firestore } from '@google-cloud/firestore';
import { StatsD } from 'hot-shots';
import { ILogger } from '../log';
import { ACTIVE_SUBSCRIPTION_STATUSES } from '../subscriptions/stripe';
import { Stripe } from 'stripe';

export enum FirestoreStripeError {
  FIRESTORE_CUSTOMER_NOT_FOUND = 'FirestoreCustomerNotFound',
  FIRESTORE_SUBSCRIPTION_NOT_FOUND = 'FirestoreSubscriptionNotFound',
  FIRESTORE_INVOICE_NOT_FOUND = 'FirestoreInvoiceNotFound',
  FIRESTORE_PAYMENT_METHOD_NOT_FOUND = 'FirestorePaymentMethodNotFound',
  STRIPE_CUSTOMER_MISSING_UID = 'StripeCustomerMissingUid',
  STRIPE_CUSTOMER_DELETED = 'StripeCustomerDeleted',
}

export class FirestoreStripeErrorBuilder extends Error {
  public customerId?: string;
  constructor(
    message: string,
    code: FirestoreStripeError,
    customerId?: string
  ) {
    super(message);
    this.name = code;
    this.customerId = customerId;
  }
}

/**
 * Prepare a Stripe object for Firestore persistence.
 *
 * Stripe v22 (basil) parses `*_decimal` fields (e.g. `plan.amount_decimal`,
 * `price.unit_amount_decimal`) into `DecimalImpl` class instances. Firestore
 * rejects values with a custom prototype, so round-trip through JSON to convert
 * them back to their string representation — the shape consumers already expect
 * — before writing.
 */
function toFirestoreObject<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

/**
 * StripeFirestore manages access to the Stripe customer data stored in Firestore.
 *
 * The data is architected with sub-collections as follows:
 *
 *  - customers
 *    - payment_methods
 *    - subscriptions
 *      - invoices
 *
 * There are collectionGroup single field exceptions for subscription, invoice, and
 * payment_method ids allowing collectionGroup queries to directly locate a subscription,
 * invoice, or payment method without having to locate the customer.
 *
 * Customers are stored with a document id that corresponds to the FxA uid.
 * Subscriptions, invoices, and payment methods are all stored with a document id that
 * matches the Stripe object id.
 */
export class StripeFirestore {
  protected subscriptionCollection: string;
  protected invoiceCollection: string;
  protected paymentMethodCollection: string;

  /**
   * @param statsd - Optional. Several methods here degrade to a partial result
   *                 rather than throwing (see `ignoreErrors`); without metrics
   *                 those paths are invisible.
   * @param log - Optional, for the same reason.
   */
  constructor(
    protected firestore: Firestore,
    protected customerCollectionDbRef: CollectionReference,
    protected stripe: Stripe,
    prefix: string,
    protected MAX_RETRY_ATTEMPTS: number = 5,
    protected statsd?: StatsD,
    protected log?: ILogger
  ) {
    this.subscriptionCollection = `${prefix}subscriptions`;
    this.invoiceCollection = `${prefix}invoices`;
    this.paymentMethodCollection = `${prefix}payment_methods`;
  }

  /**
   * Retrieve a customer from Stripe and insert it if it doesn't exist.
   */
  async retrieveAndFetchCustomer(
    customerId: string,
    ignoreErrors: boolean = false
  ) {
    try {
      const customer = await this.retrieveCustomer({ customerId });
      return customer;
    } catch (err) {
      if (err.name === FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND) {
        this.statsd?.increment(
          'subscriptions.stripe_firestore.retrieve_and_fetch_customer',
          { outcome: 'firestore_miss', ignore_errors: `${ignoreErrors}` }
        );
        this.log?.info(
          'stripeFirestore.retrieveAndFetchCustomer.firestoreMiss',
          { customerId, ignoreErrors }
        );
        // DS: If the customer wasn't found in that first query. Looks like it falls back here, and failures are 'ignored' for the code path being traced.
        //     The ignored failures don't seem to transient, but they do look like unexpected states or something. More info / investigaiton would be good.
        //     - Why would this case happen?
        //     - Maybe this is no longer a thing that actually happens?
        //     - What are the side effects of 'ignoreErrors'?
        //     - Are there scenarios where we could 'transient' data states?
        return this.legacyFetchAndInsertCustomer(customerId, ignoreErrors);
      }
      this.statsd?.increment(
        'subscriptions.stripe_firestore.retrieve_and_fetch_customer.error',
      );
      throw err;
    }
  }

  /**
   * Retrieve a subscription from Stripe and populate the Firestore record for
   * the customer and subscription if it doesn't exist.
   */
  async retrieveAndFetchSubscription(
    subscriptionId: string,
    ignoreErrors: boolean = false
  ) {
    try {
      const subscription = await this.retrieveSubscription(subscriptionId);
      return subscription;
    } catch (err) {
      if (err.name === FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND) {
        const subscription = await this.stripe.subscriptions.retrieve(
          subscriptionId
        );
        await this.legacyFetchAndInsertCustomer(
          subscription.customer as string,
          ignoreErrors
        );
        return subscription;
      }
      throw err;
    }
  }

  async fetchAndInsertSubscription(
    subscriptionId: string,
    uid: string,
  ) {
    return this.firestore.runTransaction(async (tx) => {
      // We read the subscription we plan to write to lock them via a Firestore transaction.
      // If any other transaction runs that reads the subscription overlapping with our read+write operation,
      // the transaction will fail and be retried. This ensures serialization of our updates, and no race condition
      // based on the speed at which the Stripe API responds.
      await tx.get(
        this.customerCollectionDbRef.doc(uid)
          .collection(this.subscriptionCollection)
          .doc(subscriptionId),
      );

      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      tx.set(
        this.customerCollectionDbRef
          .doc(uid)
          .collection(this.subscriptionCollection)
          .doc(subscription.id),
        toFirestoreObject(subscription)
      );

      return subscription;
    });
  }

  /**
   * Get a Stripe customer by id, and insert it into Firestore keyed to the fxa uid.
   *
   * This method is used for populating the customer if missing from Stripe and also
   * loads the customers subscriptions into Firestore.
   */
  async fetchAndInsertCustomer(
    customerId: string,
    eventTime: number,
    ignoreErrors: boolean = false
  ) {
    const [customer, subscriptions] = await Promise.all([
      this.stripe.customers.retrieve(customerId),
      this.stripe.subscriptions
        .list({
          customer: customerId,
          status: "all",
          limit: 100,
        })
        .autoPagingToArray({ limit: 10000 }),
    ]);
    if (customer.deleted) {
      if (ignoreErrors) {
        return customer;
      }
      throw new FirestoreStripeErrorBuilder(
        `Customer ${customerId} was deleted`,
        FirestoreStripeError.STRIPE_CUSTOMER_DELETED,
        customerId
      );
    }
    const customerUid = customer.metadata.userid;
    if (!customerUid) {
      if (ignoreErrors) {
        return customer;
      }
      throw new FirestoreStripeErrorBuilder(
        `Customer ${customerId} has no uid`,
        FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID,
        customerId
      );
    }

    await this.firestore.runTransaction(async (tx) => {
      const storedCustomer = await tx.get(
        this.customerCollectionDbRef
          .doc(customerUid)
      )

      const subscriptionsToUpdate: Stripe.Subscription[] = [];
      for (const subscription of subscriptions) {
        const storedSubscription = await tx.get(
          this.customerCollectionDbRef.doc(customerUid)
            .collection(this.subscriptionCollection)
            .doc(subscription.id),
        );

        const storedSubscriptionEventTime: number | undefined = storedSubscription.data()?.stripeEventCreatedTime;
        // stripeEventCreatedTime can be missing since we didn't previously write this value
        if (!storedSubscriptionEventTime || storedSubscriptionEventTime < eventTime) {
          // If we've already stored a newer record from a more recent Stripe
          // webhook event we don't need to do this write.
          // In the event of a collision, Firestore transactions are re-run multiple times
          // with random gaps. We don't need to re-run this event if we already have processed
          // an event newer.
          subscriptionsToUpdate.push(subscription);
        }
      }

      const storedCustomerEventTime: number | undefined = storedCustomer.data()?.stripeEventCreatedTime;
      // stripeEventCreatedTime can be missing since we didn't previously write this value
      if (!storedCustomerEventTime || storedCustomerEventTime < eventTime) {
        // If we've already stored a newer record from a more recent Stripe
        // webhook event we don't need to do this write.
        // In the event of a collision, Firestore transactions are re-run multiple times
        // with random gaps. We don't need to re-run this event if we already have processed
        // an event newer.
        const customerRecord = {
          ...customer,
          stripeEventCreatedTime: eventTime
        }
        tx.set(
          this.customerCollectionDbRef.doc(customerUid),
          toFirestoreObject(customerRecord)
        );
      }

      // Firestore transactions require writes to occur after all reads.
      for (const subscriptionToUpdate of subscriptionsToUpdate) {
        const subscriptionRecord = {
          ...subscriptionToUpdate,
          stripeEventCreatedTime: eventTime
        }
        tx.set(
          this.customerCollectionDbRef
            .doc(customerUid)
            .collection(this.subscriptionCollection)
            .doc(subscriptionToUpdate.id),
          toFirestoreObject(subscriptionRecord)
        );
      }
    });

    return customer;
  }

  /**
   * Get a Stripe customer by id, and insert it into Firestore keyed to the fxa uid.
   *
   * This method is used for populating the customer if missing from Stripe and also
   * loads the customers subscriptions into Firestore.
   *
   * This is kept for compatibility with methods that do not fire directly from a Stripe webhook but still want to populate Firestore
   */
  async legacyFetchAndInsertCustomer(
    customerId: string,
    ignoreErrors: boolean = false
  ) {
    const customerWithSubscriptions = await this.stripe.customers.retrieve(customerId, {
      expand: ["subscriptions"]
    });

    // DS: Same qeustion as before, what triggers this state?
    if (customerWithSubscriptions.deleted) {
      if (ignoreErrors) {
        this.statsd?.increment(
          'subscriptions.stripe_firestore.legacy_fetch_and_insert_customer',
          { outcome: 'deleted_ignored' }
        );
        this.log?.warn(
          'stripeFirestore.legacyFetchAndInsertCustomer.deletedIgnored',
          { customerId }
        );
        // DS: Potentail case where 0 subscriptions could be returned?
        return customerWithSubscriptions;
      }
      this.statsd?.increment(
        'subscriptions.stripe_firestore.legacy_fetch_and_insert_customer',
        { outcome: 'deleted_thrown' }
      );
      throw new FirestoreStripeErrorBuilder(
        `Customer ${customerId} was deleted`,
        FirestoreStripeError.STRIPE_CUSTOMER_DELETED,
        customerId
      );
    }

    // DS: What is this exactly?
    const customerWithSubscriptionsUid = customerWithSubscriptions.metadata.userid;
    if (!customerWithSubscriptionsUid) {
      if (ignoreErrors) {
        const droppedSubscriptionCount =
          customerWithSubscriptions.subscriptions?.data.length ?? 0;
        this.statsd?.increment(
          'subscriptions.stripe_firestore.legacy_fetch_and_insert_customer',
          {
            outcome: 'missing_uid_ignored',
            dropped_subscriptions: `${droppedSubscriptionCount > 0}`,
          }
        );
        this.log?.info(
          'stripeFirestore.legacyFetchAndInsertCustomer.missingUidIgnored',
          { customerId, droppedSubscriptionCount }
        );
        // DS: Is this suspicious? IUC, this would result in 0 subscriptions being returned.
        delete customerWithSubscriptions.subscriptions;
        return customerWithSubscriptions;
      }
      this.statsd?.increment(
        'subscriptions.stripe_firestore.legacy_fetch_and_insert_customer',
        { outcome: 'missing_uid_thrown' }
      );
      throw new FirestoreStripeErrorBuilder(
        `Customer ${customerId} has no uid`,
        FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID,
        customerId
      );
    }

    return this.firestore.runTransaction(async (tx) => {
      // We read all of the documents that we plan to write to lock them via a Firestore transaction.
      // If any other transaction runs that reads these documents overlapping with our read+write operation,
      // the transaction will fail and be retried. This ensures serialization of our updates, and no race condition
      // based on the speed at which the Stripe API responds.
      await tx.get(this.customerCollectionDbRef.doc(customerWithSubscriptionsUid));
      for (const subscription of customerWithSubscriptions.subscriptions?.data || []) {
        await tx.get(
          this.customerCollectionDbRef.doc(customerWithSubscriptionsUid)
            .collection(this.subscriptionCollection)
            .doc(subscription.id),
        );
      }

      const [customer, subscriptions] = await Promise.all([
        this.stripe.customers.retrieve(customerId),
        this.stripe.subscriptions
          .list({
            customer: customerId,
            status: "all",
            limit: 100,
          })
          .autoPagingToArray({ limit: 10000 }),
      ]);
      if (customer.deleted) {
        if (ignoreErrors) {
          this.statsd?.increment(
            'subscriptions.stripe_firestore.legacy_fetch_and_insert_customer',
            { outcome: 'deleted_in_transaction_ignored' }
          );
          this.log?.warn(
            'stripeFirestore.legacyFetchAndInsertCustomer.deletedInTransactionIgnored',
            { customerId }
          );
          return customer;
        }
        throw new FirestoreStripeErrorBuilder(
          `Customer ${customerId} was deleted`,
          FirestoreStripeError.STRIPE_CUSTOMER_DELETED,
          customerId
        );
      }

      const uid = customer.metadata.userid;
      if (!uid) {
        if (ignoreErrors) {
          this.statsd?.increment(
            'subscriptions.stripe_firestore.legacy_fetch_and_insert_customer',
            {
              outcome: 'missing_uid_in_transaction_ignored',
              dropped_subscriptions: `${(subscriptions?.length ?? 0) > 0}`,
            }
          );
          this.log?.warn(
            'stripeFirestore.legacyFetchAndInsertCustomer.missingUidInTransactionIgnored',
            {
              customerId,
              unwrittenSubscriptionCount: subscriptions?.length ?? 0,
            }
          );
          // DS: IUC, this would also result in 0 subscriptions being returned, because we'd exit
          //     before subscriptions are populated below?
          return customer;
        }
        throw new FirestoreStripeErrorBuilder(
          `Customer ${customerId} has no uid`,
          FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID,
          customerId
        );
      }

      tx.set(
        this.customerCollectionDbRef.doc(uid),
        toFirestoreObject(customer)
      );
      if (subscriptions) {
        // DS: Does this update the subscriptions for the customer's collection and also the customer object?
        for (const subscription of subscriptions) {
          tx.set(
            this.customerCollectionDbRef
              .doc(uid)
              .collection(this.subscriptionCollection)
              .doc(subscription.id),
            toFirestoreObject(subscription)
          );
        }
      }

      this.statsd?.increment(
        'subscriptions.stripe_firestore.legacy_fetch_and_insert_customer',
        {
          outcome: 'inserted',
          wrote_subscriptions: `${(subscriptions?.length ?? 0) > 0}`,
        }
      );

      return customer;
    });
  }

  /**
   * @deprecated This method does not support transactions.
   *
   * Insert a Stripe customer into Firestore keyed to the fxa id.
   */
  insertCustomerRecord(
    uid: string,
    customer: Partial<Stripe.Customer | Stripe.DeletedCustomer>
  ) {
    return this.customerCollectionDbRef.doc(uid).set(toFirestoreObject(customer));
  }

  /**
   * @deprecated This method does not support transactions.
   *
   * Insert an invoice record into Firestore under the customer's stripe id.
   */
  async insertInvoiceRecord(
    invoice: Partial<Stripe.Invoice>,
    ignoreErrors: boolean = false
  ) {
    const customerId = invoice.customer as string;
    const customerSnap = await this.customerCollectionDbRef
      .where('id', '==', customerId)
      .get();
    if (customerSnap.empty) {
      if (ignoreErrors) {
        return invoice;
      }
      throw new FirestoreStripeErrorBuilder(
        `Customer ${invoice.customer} was not found`,
        FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND,
        customerId
      );
    }

    const subscription = invoice.parent?.subscription_details?.subscription;
    if (typeof subscription !== 'string') {
      // We can only insert invoices with a subscription for caching, but we
      // shouldn't throw errors just because we can't cache non-subscription invoices.
      // TODO: Cache non-subscription invoices.
      return invoice;
    }

    return customerSnap.docs[0].ref
      .collection(this.subscriptionCollection)
      .doc(subscription)
      .collection(this.invoiceCollection)
      .doc(invoice.id!)
      .set(toFirestoreObject(invoice));
  }

  /**
   * Insert an invoice record into Firestore under the customer's stripe id.
   */
  async fetchAndInsertInvoice(
    invoiceId: string,
    eventTime: number,
    ignoreErrors: boolean = false,
  ) {
    const invoice = await this.stripe.invoices.retrieve(invoiceId, {
      expand: ['discounts.source.coupon'],
    });
    const subscriptionId = invoice.parent?.subscription_details?.subscription;
    if (subscriptionId == null) {
      // We can only insert invoices with a subscription for caching, but we
      // shouldn't throw errors just because we can't cache non-subscription invoices.
      // TODO: Cache non-subscription invoices.
      return invoice;
    }
    if (typeof subscriptionId !== 'string') {
      throw new Error("subscriptionId must be of type string");
    }

    const customerId = invoice.customer;
    if (typeof customerId !== 'string') {
      throw new Error("customerId must be of type string");
    }

    const customerSnap = await this.customerCollectionDbRef
      .where('id', '==', customerId)
      .get();
    if (customerSnap.empty) {
      if (ignoreErrors) {
        return invoice;
      }
      throw new FirestoreStripeErrorBuilder(
        `Customer ${customerId} was not found`,
        FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND,
        customerId
      );
    }

    const customerUid = customerSnap.docs[0].data().metadata.userid;
    if (!customerUid) {
      if (ignoreErrors) {
        return invoice;
      }
      throw new FirestoreStripeErrorBuilder(
        `Customer ${customerId} has no uid`,
        FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID,
        customerId
      );
    }

    return this.firestore.runTransaction(async (tx) => {
      const storedInvoice = await tx.get(
        this.customerCollectionDbRef
          .doc(customerUid)
          .collection(this.subscriptionCollection)
          .doc(subscriptionId)
          .collection(this.invoiceCollection)
          .doc(invoiceId)
      )

      const storedEventTime: number | undefined = storedInvoice.data()?.stripeEventCreatedTime;
      // stripeEventCreatedTime can be missing since we didn't previously write this value
      if (storedEventTime && storedEventTime >= eventTime) {
        // We've already stored a newer record from a more recent Stripe
        // webhook event.
        // In the event of a collision, Firestore transactions are re-run multiple times
        // with random gaps. We don't need to re-run this event if we already have processed
        // an event newer.
        return invoice;
      }

      const record = {
        ...invoice,
        stripeEventCreatedTime: eventTime
      }
      tx.set(
        this.customerCollectionDbRef
          .doc(customerUid)
          .collection(this.subscriptionCollection)
          .doc(subscriptionId)
          .collection(this.invoiceCollection)
          .doc(invoiceId),
        toFirestoreObject(record)
      );

      return invoice;
    });
  }

  /**
   * @deprecated This method does not support transactions.
   *
   * Insert an invoice record into Firestore under the customer's stripe id.
   */
  async insertPaymentMethodRecord(
    paymentMethod: Partial<Stripe.PaymentMethod>,
    ignoreErrors: boolean = false
  ) {
    const customerId = paymentMethod.customer as string;
    const customerSnap = await this.customerCollectionDbRef
      .where('id', '==', customerId)
      .get();
    if (customerSnap.empty) {
      if (ignoreErrors) {
        return paymentMethod;
      }
      throw new FirestoreStripeErrorBuilder(
        `Customer ${paymentMethod.customer} was not found`,
        FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND,
        customerId
      );
    }

    return customerSnap.docs[0].ref
      .collection(this.paymentMethodCollection)
      .doc(paymentMethod.id!)
      .set(paymentMethod, { merge: true });
  }

  /**
   * Insert an invoice record into Firestore under the customer's stripe id.
   */
  async fetchAndInsertPaymentMethod(
    paymentMethodId: string,
    eventTime: number,
    ignoreErrors: boolean = false
  ) {
    const paymentMethod = await this.stripe.paymentMethods.retrieve(
      paymentMethodId
    );
    // If this payment method is not attached, we can't store it in firestore as
    // the customer may not exist. It is possible that a payment_method.detached
    // event has already been processed, detaching the payment method.
    if (!paymentMethod.customer) {
      return paymentMethod;
    }
    const customerId = paymentMethod.customer as string;
    const customerSnap = await this.customerCollectionDbRef
      .where('id', '==', customerId)
      .get();
    if (customerSnap.empty) {
      if (ignoreErrors) {
        return paymentMethod;
      }
      throw new FirestoreStripeErrorBuilder(
        `Customer ${paymentMethod.customer} was not found`,
        FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND,
        customerId
      );
    }
    const customerUid = customerSnap.docs[0].data().metadata.userid;
    if (!customerUid) {
      if (ignoreErrors) {
        return paymentMethod;
      }
      throw new FirestoreStripeErrorBuilder(
        `Customer ${customerId} has no uid`,
        FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID,
        customerId
      );
    }

    return await this.firestore.runTransaction(async (tx) => {
      const storedPaymentMethod = await tx.get(
        this.customerCollectionDbRef
          .doc(customerUid)
          .collection(this.paymentMethodCollection)
          .doc(paymentMethod.id)
      );

      const storedEventTime: number | undefined = storedPaymentMethod.data()?.stripeEventCreatedTime;
      // stripeEventCreatedTime can be missing since we didn't previously write this value
      if (eventTime && storedEventTime && storedEventTime >= eventTime) {
        // We've already stored a newer record from a more recent Stripe
        // webhook event.
        // In the event of a collision, Firestore transactions are re-run multiple times
        // with random gaps. We don't need to re-run this event if we already have processed
        // an event newer.
        return;
      }

      const record = {
        ...paymentMethod,
        stripeEventCreatedTime: eventTime
      }

      tx.set(
        this.customerCollectionDbRef
          .doc(customerUid)
          .collection(this.paymentMethodCollection)
          .doc(paymentMethodId),
        record,
      );

      return paymentMethod;
    });
  }

  /**
   * Retrieve the customer from Firestore by either FxA uid or Stripe customer id.
   */
  async retrieveCustomer(
    options:
      | { uid: string; customerId?: undefined }
      | { uid?: undefined; customerId: string }
  ) {
    if (options.uid) {
      const customerSnap = await this.customerCollectionDbRef
        .doc(options.uid)
        .get();
      if (customerSnap.exists) {
        this.statsd?.increment(
          'subscriptions.stripe_firestore.retrieve_customer',
          { lookup: 'uid', outcome: 'hit' }
        );
        return customerSnap.data() as Stripe.Customer;
      }
    } else if (options.customerId) {
      // DS: Why are these call snap? Is this eventual or gauranteed consistency?
      //     Probably not important for this investigation, more just curious...
      const customerSnap = await this.customerCollectionDbRef
        .where('id', '==', options.customerId)
        .get();
      if (!customerSnap.empty) {
        // A query (not a doc read) can match more than one document; if it ever
        // does we silently take the first, so surface that here.
        this.statsd?.increment(
          'subscriptions.stripe_firestore.retrieve_customer',
          {
            lookup: 'customer_id',
            outcome: 'hit',
            multiple_matches: `${customerSnap.size > 1}`,
          }
        );
        if (customerSnap.size > 1) {
          this.log?.warn('stripeFirestore.retrieveCustomer.multipleMatches', {
            customerId: options.customerId,
            matchCount: customerSnap.size,
          });
        }
        return customerSnap.docs[0].data() as Stripe.Customer;
      }
    }
    this.statsd?.increment('subscriptions.stripe_firestore.retrieve_customer', {
      lookup: options.uid ? 'uid' : 'customer_id',
      outcome: 'miss',
    });
    throw new FirestoreStripeErrorBuilder(
      `Customer ${options.customerId || options.uid} was not found`,
      FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND,
      options.customerId
    );
  }

  /**
   * Retrieve all the customer subscriptions from Firestore.
   * @param customerId - The target customer
   * @param statusFilter - Optional list of subscription statuses to filter by. Only
   *                       subscriptions with status contained in this list will be
   *                       returned. Defaults to ACTIVE_SUBSCRIPTION_STATUSES.
   */
  async retrieveCustomerSubscriptions(
    customerId: string,
    statusFilter: Stripe.Subscription.Status[] = ACTIVE_SUBSCRIPTION_STATUSES
  ) {
    const customerSnap = await this.customerCollectionDbRef
      .where('id', '==', customerId)
      .get();
    if (customerSnap.empty) {
      throw new FirestoreStripeErrorBuilder(
        `Customer ${customerId} was not found`,
        FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND,
        customerId
      );
    }

    const subscriptionSnap = await customerSnap.docs[0].ref
      .collection(this.subscriptionCollection)
      .get();
    const subscriptions = subscriptionSnap.docs.map(
      (doc) => doc.data() as Stripe.Subscription
    );
    const filtered = subscriptions.filter((sub) =>
      statusFilter.includes(sub.status)
    );
    this.statsd?.increment(
      'subscriptions.stripe_firestore.retrieve_customer_subscriptions',
      {
        outcome:
          filtered.length > 0
            ? 'has_subscriptions'
            : subscriptions.length === 0
              ? 'none_stored'
              : 'all_filtered_out',
      }
    );

    return filtered;
  }

  /**
   * Retrieve a subscription from Firestore by Stripe subscription id.
   */
  async retrieveSubscription(subscriptionId: string) {
    const subscriptionSnap = await this.firestore
      .collectionGroup(this.subscriptionCollection)
      .where('id', '==', subscriptionId)
      .get();
    if (!subscriptionSnap.empty) {
      return subscriptionSnap.docs[0].data() as Stripe.Subscription;
    }
    throw new FirestoreStripeErrorBuilder(
      `Subscription ${subscriptionId} was not found`,
      FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND
    );
  }

  /**
   * Retrieve an invoice from Firestore by Stripe invoice id.
   */
  async retrieveInvoice(invoiceId: string) {
    const invoiceSnap = await this.firestore
      .collectionGroup(this.invoiceCollection)
      .where('id', '==', invoiceId)
      .get();
    if (!invoiceSnap.empty) {
      return invoiceSnap.docs[0].data() as Stripe.Invoice;
    }
    throw new FirestoreStripeErrorBuilder(
      `Invoice ${invoiceId} was not found`,
      FirestoreStripeError.FIRESTORE_INVOICE_NOT_FOUND
    );
  }

  /**
   * Retrieve a payment method from Firestore by Stripe payment method id.
   */
  async retrievePaymentMethod(paymentMethodId: string) {
    const paymentMethodSnap = await this.firestore
      .collectionGroup(this.paymentMethodCollection)
      .where('id', '==', paymentMethodId)
      .get();
    if (!paymentMethodSnap.empty) {
      return paymentMethodSnap.docs[0].data() as Stripe.PaymentMethod;
    }
    throw new FirestoreStripeErrorBuilder(
      `Payment method ${paymentMethodId} was not found`,
      FirestoreStripeError.FIRESTORE_PAYMENT_METHOD_NOT_FOUND
    );
  }
}
