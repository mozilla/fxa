/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError, BaseMultiError } from '@fxa/shared/error';
import { CollectionReference, Firestore } from '@google-cloud/firestore';
import { StripeFirestore as StripeFirestoreBase } from 'fxa-shared/payments/stripe-firestore';
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

export class StripeFirestoreError extends BaseError {
  documentPath?: string;
  constructor(cause: Error, docPath?: string, message?: string) {
    super(message || cause.message, {
      name: 'StripeFirestoreError',
      cause,
      info: {
        documentPath: docPath,
      },
    });
    this.documentPath = docPath;
  }
}

export class StripeFirestoreMultiError extends BaseMultiError {
  constructor(errors: StripeFirestoreError[]) {
    super(errors);
    this.name = 'StripeFirestoreMultiError';
  }

  getPrimaryError(): StripeFirestoreError {
    // TS is not picking up the type otherwise, so have to cast.
    return this.errors()[0] as StripeFirestoreError;
  }

  getSummary(): string {
    return (this.errors() as StripeFirestoreError[])
      .map((error) => `${String(error.cause())}: ${error.documentPath}`)
      .join('; ');
  }

  static hasStripeFirestoreError(
    err: Error | StripeFirestoreMultiError
  ): boolean {
    return (
      err instanceof StripeFirestoreMultiError &&
      err.getPrimaryError() instanceof StripeFirestoreError
    );
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
export class StripeFirestore extends StripeFirestoreBase {
  constructor(
    firestore: Firestore,
    customerCollectionDbRef: CollectionReference,
    stripe: Stripe,
    prefix: string
  ) {
    super(firestore, customerCollectionDbRef, stripe, prefix);
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
        if (!customer.id) throw new Error('Customer ID must be provided');
        return this.fetchAndInsertCustomer(customer.id);
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

    if (!subscription.id) throw new Error('Subscription ID must be provided');

    return customerSnap.docs[0].ref
      .collection(this.subscriptionCollection)
      .doc(subscription.id)
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
   * Remove the specified customer document and all subcollections. Returns with all
   * deleted document and subcollection paths.
   *
   * If a customer document for the  given uid does not exist, or no subcollections are
   * found, firestore.recursiveDelete() returns successfully with the expected documentPath
   * as if the document has been deleted.
   *
   * If no subcollections are found for the customer document, the customer document
   * will be deleted, and the method returns successfully with the deleted documentPath.
   *
   * @param uid - Mozilla Account uid
   */
  async removeCustomerRecursive(uid: string) {
    const bulkWriterResults: string[] = [];
    const bulkWriterErrors: StripeFirestoreError[] = [];
    const bulkWriter = this.firestore.bulkWriter();
    bulkWriter.onWriteResult((doc) => bulkWriterResults.push(doc.path));
    bulkWriter.onWriteError((error) => {
      if (error.failedAttempts < this.MAX_RETRY_ATTEMPTS) {
        return true;
      } else {
        bulkWriterErrors.push(
          new StripeFirestoreError(error, error.documentRef.path)
        );
        return false;
      }
    });
    try {
      await this.firestore.recursiveDelete(
        this.customerCollectionDbRef.doc(uid),
        bulkWriter
      );
      return bulkWriterResults;
    } catch (error) {
      if (bulkWriterErrors.length) {
        throw new StripeFirestoreMultiError([
          new StripeFirestoreError(error, error?.documentRef?.path),
          ...bulkWriterErrors,
        ]);
      } else {
        throw error;
      }
    }
  }
}
