/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CollectionReference, Firestore } from '@google-cloud/firestore';
import { Stripe } from 'stripe';

export enum FirestoreStripeError {
  FIRESTORE_CUSTOMER_NOT_FOUND = 'FirestoreCustomerNotFound',
  FIRESTORE_SUBSCRIPTION_NOT_FOUND = 'FirestoreSubscriptionNotFound',
  FIRESTORE_INVOICE_NOT_FOUND = 'FirestoreInvoiceNotFound',
  STRIPE_CUSTOMER_MISSING_UID = 'StripeCustomerMissingUid',
  STRIPE_CUSTOMER_DELETED = 'StripeCustomerDeleted',
}

function newFirestoreStripeError(
  message: string,
  code: FirestoreStripeError
): Error {
  const error = new Error(message);
  error.name = code;
  return error;
}

export class StripeFirestore {
  constructor(
    private firestore: Firestore,
    private customerCollectionDbRef: CollectionReference,
    private stripe: Stripe
  ) {}

  /**
   * Get a Stripe customer by id, and insert it into Firestore keyed to the fxa uid.
   *
   * This method is used for populating the customer if missing from Stripe and also
   * loads the customers subscriptions into Firestore.
   */
  async fetchAndInsertCustomer(customerId: string) {
    const customer = await this.stripe.customers.retrieve(customerId, {
      expand: ['subscriptions'],
    });
    if (customer.deleted) {
      throw newFirestoreStripeError(
        `Customer ${customerId} was deleted`,
        FirestoreStripeError.STRIPE_CUSTOMER_DELETED
      );
    }
    // Drop Stripe.Response attribute from API call.
    delete (customer as any).lastResponse;

    const uid = customer.metadata.userid;
    if (!uid) {
      throw newFirestoreStripeError(
        `Customer ${customerId} has no uid`,
        FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID
      );
    }

    const inserts = [this.insertCustomerRecord(uid, customer)];
    if (customer.subscriptions) {
      for (const subscription of customer.subscriptions.data) {
        inserts.push(
          this.customerCollectionDbRef
            .doc(uid)
            .collection('subscriptions')
            .doc(subscription.id)
            .set(subscription, { merge: true })
        );
      }
    }
    await Promise.all(inserts);
    return customer;
  }

  /**
   * Insert a Stripe customer into Firestore keyed to the fxa id.
   */
  insertCustomerRecord(uid: string, customer: Stripe.Customer) {
    return this.customerCollectionDbRef.doc(uid).set(customer, { merge: true });
  }

  /**
   * Insert a subscription record into Firestore under the customer's stripe id.
   */
  async insertSubscriptionRecord(subscription: Stripe.Subscription) {
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
      .collection('subscriptions')
      .doc(subscription.id)
      .set(subscription, { merge: true });
  }

  /**
   * Insert an invoice record into Firestore under the customer's stripe id.
   */
  async insertInvoiceRecord(invoice: Stripe.Invoice) {
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
      .collection('subscriptions')
      .doc(invoice.subscription)
      .collection('invoices')
      .doc(invoice.id)
      .set(invoice, { merge: true });
  }

  /**
   * Retrieve the customer from Firestore by either FxA uid or Stripe customer id.
   */
  async retrieveCustomer(
    options:
      | { uid: string; customerId: undefined }
      | { uid: undefined; customerId: string }
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
      .collection('subscriptions')
      .get();
    return subscriptionSnap.docs.map(
      (doc) => doc.data() as Stripe.Subscription
    );
  }

  /**
   * Retrieve a subscription from Firestore by Stripe subscription id.
   */
  async retrieveSubscription(subscriptionId: string) {
    const subscriptionSnap = await this.firestore
      .collectionGroup('stripe-subscriptions')
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
      .collectionGroup('stripe-invoices')
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
}
