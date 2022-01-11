/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CollectionReference, Firestore } from '@google-cloud/firestore';
import { ACTIVE_SUBSCRIPTION_STATUSES } from 'fxa-shared/subscriptions/stripe';
import { Stripe } from 'stripe';

export enum FirestoreStripeError {
  FIRESTORE_CUSTOMER_NOT_FOUND = 'FirestoreCustomerNotFound',
  FIRESTORE_SUBSCRIPTION_NOT_FOUND = 'FirestoreSubscriptionNotFound',
  FIRESTORE_INVOICE_NOT_FOUND = 'FirestoreInvoiceNotFound',
  FIRESTORE_PAYMENT_METHOD_NOT_FOUND = 'FirestorePaymentMethodNotFound',
  STRIPE_CUSTOMER_MISSING_UID = 'StripeCustomerMissingUid',
  STRIPE_CUSTOMER_DELETED = 'StripeCustomerDeleted',
}

export function newFirestoreStripeError(
  message: string,
  code: FirestoreStripeError
): Error {
  const error = new Error(message);
  error.name = code;
  return error;
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
  private subscriptionCollection: string;
  private invoiceCollection: string;
  private paymentMethodCollection: string;

  constructor(
    private firestore: Firestore,
    private customerCollectionDbRef: CollectionReference,
    private stripe: Stripe,
    prefix: string
  ) {
    this.subscriptionCollection = `${prefix}subscriptions`;
    this.invoiceCollection = `${prefix}invoices`;
    this.paymentMethodCollection = `${prefix}payment_methods`;
  }

  /**
   * Retrieve a customer from Stripe and insert it if it doesn't exist.
   */
  async retrieveAndFetchCustomer(customerId: string) {
    try {
      const customer = await this.retrieveCustomer({ customerId });
      return customer;
    } catch (err) {
      if (err.name === FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND) {
        return this.fetchAndInsertCustomer(customerId);
      }
      throw err;
    }
  }

  /**
   * Retrieve a subscription from Stripe and populate the Firestore record for
   * the customer and subscription if it doesn't exist.
   */
  async retrieveAndFetchSubscription(subscriptionId: string) {
    try {
      const subscription = await this.retrieveSubscription(subscriptionId);
      return subscription;
    } catch (err) {
      if (err.name === FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND) {
        const subscription = await this.stripe.subscriptions.retrieve(
          subscriptionId
        );
        await this.fetchAndInsertCustomer(subscription.customer as string);
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
  async fetchAndInsertCustomer(customerId: string) {
    const [customer, subscriptions] = await Promise.all([
      this.stripe.customers.retrieve(customerId),
      this.stripe.subscriptions
        .list({
          customer: customerId,
        })
        .autoPagingToArray({ limit: 100 }),
    ]);
    if (customer.deleted) {
      throw newFirestoreStripeError(
        `Customer ${customerId} was deleted`,
        FirestoreStripeError.STRIPE_CUSTOMER_DELETED
      );
    }

    const uid = customer.metadata.userid;
    if (!uid) {
      throw newFirestoreStripeError(
        `Customer ${customerId} has no uid`,
        FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID
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
   * Insert a customer record into Firestore under the fxa id.
   * If the customer does not exist, this will backfill the customer with all their
   * subscriptions.
   *
   * Note: This is slightly different than the `retrieveAndFetchCustomer` method above
   * as this will avoid inserting the record if the customer did not exist in Firestore
   * and was fetched.
   */
  async insertCustomerRecordWithBackfill(
    uid: string,
    customer: Partial<Stripe.Customer | Stripe.DeletedCustomer>
  ) {
    try {
      await this.retrieveCustomer({ uid });
    } catch (err) {
      if (err.name === FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND) {
        return this.fetchAndInsertCustomer(customer.id!);
      } else {
        throw err;
      }
    }
    return this.insertCustomerRecord(uid, customer);
  }

  /**
   * Insert a subscription record into Firestore under the customer's stripe id.
   */
  async insertSubscriptionRecord(subscription: Partial<Stripe.Subscription>) {
    const customerSnap = await this.customerCollectionDbRef
      .where('id', '==', subscription.customer as string)
      .get();
    if (customerSnap.empty) {
      throw newFirestoreStripeError(
        `Customer ${subscription.customer} was not found`,
        FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
      );
    }

    return customerSnap.docs[0].ref
      .collection(this.subscriptionCollection)
      .doc(subscription.id!)
      .set(subscription);
  }

  /**
   * Insert a subscription record into Firestore under the customer's stripe id.
   * If the customer does not exist, this will backfill the customer with all their
   * subscriptions.
   */
  async insertSubscriptionRecordWithBackfill(
    subscription: Partial<Stripe.Subscription>
  ) {
    try {
      await this.insertSubscriptionRecord(subscription);
    } catch (err) {
      if (err.name === FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND) {
        await this.fetchAndInsertCustomer(subscription.customer as string);
      } else {
        throw err;
      }
    }
  }

  /**
   * Insert an invoice record into Firestore under the customer's stripe id.
   */
  async insertInvoiceRecord(invoice: Partial<Stripe.Invoice>) {
    const customerSnap = await this.customerCollectionDbRef
      .where('id', '==', invoice.customer as string)
      .get();
    if (customerSnap.empty) {
      throw newFirestoreStripeError(
        `Customer ${invoice.customer} was not found`,
        FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
      );
    }

    if (typeof invoice.subscription !== 'string') {
      throw new Error(`Invoice ${invoice.id} has no subscription id.`);
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
    paymentMethod: Partial<Stripe.PaymentMethod>
  ) {
    const customerSnap = await this.customerCollectionDbRef
      .where('id', '==', paymentMethod.customer as string)
      .get();
    if (customerSnap.empty) {
      throw newFirestoreStripeError(
        `Customer ${paymentMethod.customer} was not found`,
        FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
      );
    }

    return customerSnap.docs[0].ref
      .collection(this.paymentMethodCollection)
      .doc(paymentMethod.id!)
      .set(paymentMethod, { merge: true });
  }

  /**
   * Insert a payment method record into Firestore under the customer's stripe id.
   * If the customer does not exist, this will backfill the customer with all their
   * subscriptions.
   */
  async insertPaymentMethodRecordWithBackfill(
    paymentMethod: Partial<Stripe.PaymentMethod>
  ) {
    try {
      await this.insertPaymentMethodRecord(paymentMethod);
    } catch (err) {
      if (err.name === FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND) {
        await this.fetchAndInsertCustomer(paymentMethod.customer as string);
        return this.insertPaymentMethodRecord(paymentMethod);
      } else {
        throw err;
      }
    }
    return;
  }

  /**
   * Remove a payment method record from Firestore under the customer's stripe id.
   */
  async removePaymentMethodRecord(paymentMethodId: string) {
    const paymentMethodSnap = await this.firestore
      .collectionGroup(this.paymentMethodCollection)
      .where('id', '==', paymentMethodId)
      .get();
    if (paymentMethodSnap.empty) {
      return;
    }
    return paymentMethodSnap.docs[0].ref.delete();
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
    throw newFirestoreStripeError(
      `Customer ${options.customerId || options.uid} was not found`,
      FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
    );
  }

  /**
   * Retrieve all the customer subscriptions from Firestore.
   */
  async retrieveCustomerSubscriptions(customerId: string) {
    const customerSnap = await this.customerCollectionDbRef
      .where('id', '==', customerId)
      .get();
    if (customerSnap.empty) {
      throw newFirestoreStripeError(
        `Customer ${customerId} was not found`,
        FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
      );
    }

    const subscriptionSnap = await customerSnap.docs[0].ref
      .collection(this.subscriptionCollection)
      .get();
    return subscriptionSnap.docs
      .map((doc) => doc.data() as Stripe.Subscription)
      .filter((sub) => ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status));
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
    throw newFirestoreStripeError(
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
    throw newFirestoreStripeError(
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
    throw newFirestoreStripeError(
      `Payment method ${paymentMethodId} was not found`,
      FirestoreStripeError.FIRESTORE_PAYMENT_METHOD_NOT_FOUND
    );
  }
}
