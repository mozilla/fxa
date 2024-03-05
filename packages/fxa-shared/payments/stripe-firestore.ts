/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CollectionReference, Firestore } from '@google-cloud/firestore';
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

  constructor(
    protected firestore: Firestore,
    protected customerCollectionDbRef: CollectionReference,
    protected stripe: Stripe,
    prefix: string,
    protected MAX_RETRY_ATTEMPTS: number = 5
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
        return this.fetchAndInsertCustomer(customerId, ignoreErrors);
      }
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
        await this.fetchAndInsertCustomer(
          subscription.customer as string,
          ignoreErrors
        );
        return subscription;
      }
      throw err;
    }
  }

  /**
   * Get a Stripe customer by id, and insert it into Firestore keyed to the fxa uid.
   *
   * This method is used for populating the customer if missing from Stripe and also
   * loads the customers subscriptions into Firestore.
   */
  async fetchAndInsertCustomer(
    customerId: string,
    ignoreErrors: boolean = false
  ) {
    const [customer, subscriptions] = await Promise.all([
      this.stripe.customers.retrieve(customerId),
      this.stripe.subscriptions
        .list({
          customer: customerId,
        })
        .autoPagingToArray({ limit: 100 }),
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

    const uid = customer.metadata.userid;
    if (!uid) {
      if (ignoreErrors) {
        return customer;
      }
      throw new FirestoreStripeErrorBuilder(
        `Customer ${customerId} has no uid`,
        FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID,
        customerId
      );
    }

    const inserts = [this.insertCustomerRecord(uid, customer)];
    if (subscriptions) {
      for (const subscription of subscriptions) {
        inserts.push(
          this.customerCollectionDbRef
            .doc(uid)
            .collection(this.subscriptionCollection)
            .doc(subscription.id)
            .set(subscription)
        );
      }
    }
    await Promise.all(inserts);
    return customer;
  }

  /**
   * Insert a Stripe customer into Firestore keyed to the fxa id.
   */
  insertCustomerRecord(
    uid: string,
    customer: Partial<Stripe.Customer | Stripe.DeletedCustomer>
  ) {
    return this.customerCollectionDbRef.doc(uid).set(customer);
  }

  /**
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

    if (typeof invoice.subscription !== 'string') {
      // We can only insert invoices with a subscription for caching, but we
      // shouldn't throw errors just because we can't cache non-subscription invoices.
      // TODO: Cache non-subscription invoices.
      return invoice;
    }

    return customerSnap.docs[0].ref
      .collection(this.subscriptionCollection)
      .doc(invoice.subscription)
      .collection(this.invoiceCollection)
      .doc(invoice.id!)
      .set(invoice);
  }

  /**
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
        return customerSnap.data() as Stripe.Customer;
      }
    } else if (options.customerId) {
      const customerSnap = await this.customerCollectionDbRef
        .where('id', '==', options.customerId)
        .get();
      if (!customerSnap.empty) {
        return customerSnap.docs[0].data() as Stripe.Customer;
      }
    }
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
    return subscriptionSnap.docs
      .map((doc) => doc.data() as Stripe.Subscription)
      .filter((sub) => statusFilter.includes(sub.status));
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
