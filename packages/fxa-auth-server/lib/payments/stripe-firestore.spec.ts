/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripeFirestore,
  FirestoreStripeError,
  newFirestoreStripeError,
  StripeFirestoreMultiError,
} from './stripe-firestore';

const customer1 = require('../../test/local/payments/fixtures/stripe/customer1.json');
const subscription1 = require('../../test/local/payments/fixtures/stripe/subscription1.json');
const paidInvoice = require('../../test/local/payments/fixtures/stripe/invoice_paid.json');
const paymentMethod = require('../../test/local/payments/fixtures/stripe/payment_method.json');

class BulkWriterMock {
  resultCallback: any;
  errorCallback: any;
  onWriteResult(callback: any) {
    this.resultCallback = callback;
  }
  onWriteError(callback: any) {
    this.errorCallback = callback;
  }
}

/**
 * To prevent the modification of the test objects loaded, which can impact other tests referencing the object,
 * a deep copy of the object can be created which uses the test object as a template
 */
function deepCopy(object: any) {
  return JSON.parse(JSON.stringify(object));
}

describe('StripeFirestore', () => {
  let firestore: any;
  let stripe: any;
  let customerCollectionDbRef: any;
  let stripeFirestore: any;
  let customer: any;

  beforeEach(() => {
    firestore = {};
    stripe = {};
    customerCollectionDbRef = {};
    customer = deepCopy(customer1);
    stripeFirestore = new StripeFirestore(
      firestore,
      customerCollectionDbRef,
      stripe
    );
  });

  it('can be instantiated', () => {
    const stripeFirestore = new StripeFirestore(
      firestore,
      customerCollectionDbRef,
      stripe
    );
    expect(stripeFirestore).toBeTruthy();
  });

  describe('retrieveAndFetchCustomer', () => {
    it('fetches a customer that was already retrieved', async () => {
      stripeFirestore.retrieveCustomer = jest.fn().mockResolvedValue(customer);
      stripeFirestore.legacyFetchAndInsertCustomer = jest
        .fn()
        .mockResolvedValue({});
      const result = await stripeFirestore.retrieveAndFetchCustomer(
        customer.id
      );
      expect(result).toEqual(customer);
      expect(stripeFirestore.retrieveCustomer).toHaveBeenCalledTimes(1);
      expect(
        stripeFirestore.legacyFetchAndInsertCustomer
      ).not.toHaveBeenCalled();
    });

    it('fetches a customer that hasnt been retrieved', async () => {
      stripeFirestore.retrieveCustomer = jest
        .fn()
        .mockRejectedValue(
          newFirestoreStripeError(
            'Not found',
            FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
          )
        );
      stripeFirestore.legacyFetchAndInsertCustomer = jest
        .fn()
        .mockResolvedValue(customer);
      const result = await stripeFirestore.retrieveAndFetchCustomer(
        customer.id
      );
      expect(result).toEqual(customer);
      expect(stripeFirestore.retrieveCustomer).toHaveBeenCalledTimes(1);
      expect(
        stripeFirestore.legacyFetchAndInsertCustomer
      ).toHaveBeenCalledTimes(1);
    });

    it('passes ignoreErrors through to legacyFetchAndInsertCustomer', async () => {
      stripeFirestore.retrieveCustomer = jest
        .fn()
        .mockRejectedValue(
          newFirestoreStripeError(
            'Not found',
            FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
          )
        );
      stripeFirestore.legacyFetchAndInsertCustomer = jest
        .fn()
        .mockResolvedValue(customer);
      const result = await stripeFirestore.retrieveAndFetchCustomer(
        customer.id,
        true
      );
      expect(result).toEqual(customer);
      expect(stripeFirestore.retrieveCustomer).toHaveBeenCalledTimes(1);
      expect(
        stripeFirestore.legacyFetchAndInsertCustomer
      ).toHaveBeenCalledTimes(1);
      expect(stripeFirestore.legacyFetchAndInsertCustomer).toHaveBeenCalledWith(
        customer.id,
        true
      );
    });

    it('errors otherwise', async () => {
      stripeFirestore.retrieveCustomer = jest
        .fn()
        .mockRejectedValue(
          newFirestoreStripeError(
            'Not found',
            FirestoreStripeError.STRIPE_CUSTOMER_DELETED
          )
        );
      try {
        await stripeFirestore.retrieveAndFetchCustomer(customer.id);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(FirestoreStripeError.STRIPE_CUSTOMER_DELETED);
      }
    });
  });

  describe('retrieveAndFetchSubscription', () => {
    let subscription: any;

    beforeEach(() => {
      subscription = deepCopy(subscription1);
    });

    it('fetches a subscription that was already retrieved', async () => {
      stripeFirestore.retrieveSubscription = jest
        .fn()
        .mockResolvedValue(subscription);
      stripeFirestore.legacyFetchAndInsertCustomer = jest
        .fn()
        .mockResolvedValue({});
      const result = await stripeFirestore.retrieveAndFetchSubscription(
        subscription.id
      );
      expect(result).toEqual(subscription);
      expect(stripeFirestore.retrieveSubscription).toHaveBeenCalledTimes(1);
      expect(
        stripeFirestore.legacyFetchAndInsertCustomer
      ).not.toHaveBeenCalled();
    });

    it('fetches a subscription that hasnt been retrieved', async () => {
      stripeFirestore.retrieveSubscription = jest
        .fn()
        .mockRejectedValue(
          newFirestoreStripeError(
            'Not found',
            FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND
          )
        );
      stripe.subscriptions = {
        retrieve: jest.fn().mockResolvedValue(subscription),
      };
      stripeFirestore.legacyFetchAndInsertCustomer = jest
        .fn()
        .mockResolvedValue({});
      const result = await stripeFirestore.retrieveAndFetchSubscription(
        subscription.id
      );
      expect(result).toEqual(subscription);
      expect(stripeFirestore.retrieveSubscription).toHaveBeenCalledTimes(1);
      expect(
        stripeFirestore.legacyFetchAndInsertCustomer
      ).toHaveBeenCalledTimes(1);
      expect(stripe.subscriptions.retrieve).toHaveBeenCalledTimes(1);
      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith(
        subscription.id
      );
    });

    it('passes ignoreErrors through to legacyFetchAndInsertCustomer', async () => {
      stripeFirestore.retrieveSubscription = jest
        .fn()
        .mockRejectedValue(
          newFirestoreStripeError(
            'Not found',
            FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND
          )
        );
      stripe.subscriptions = {
        retrieve: jest.fn().mockResolvedValue(subscription),
      };
      stripeFirestore.legacyFetchAndInsertCustomer = jest
        .fn()
        .mockResolvedValue({});
      const result = await stripeFirestore.retrieveAndFetchSubscription(
        subscription.id,
        true
      );
      expect(result).toEqual(subscription);
      expect(stripeFirestore.retrieveSubscription).toHaveBeenCalledTimes(1);
      expect(
        stripeFirestore.legacyFetchAndInsertCustomer
      ).toHaveBeenCalledTimes(1);
      expect(stripeFirestore.legacyFetchAndInsertCustomer).toHaveBeenCalledWith(
        subscription.customer,
        true
      );
      expect(stripe.subscriptions.retrieve).toHaveBeenCalledTimes(1);
      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith(
        subscription.id
      );
    });

    it('errors otherwise', async () => {
      stripeFirestore.retrieveSubscription = jest
        .fn()
        .mockRejectedValue(
          newFirestoreStripeError(
            'Not found',
            FirestoreStripeError.STRIPE_CUSTOMER_DELETED
          )
        );
      try {
        await stripeFirestore.retrieveAndFetchSubscription(subscription.id);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(FirestoreStripeError.STRIPE_CUSTOMER_DELETED);
      }
    });
  });

  describe('fetchAndInsertSubscription', () => {
    let tx: any;

    beforeEach(() => {
      tx = {
        get: jest.fn().mockResolvedValue({}),
        set: jest.fn(),
      };

      firestore.runTransaction = jest
        .fn()
        .mockImplementation((fn: any) => fn(tx));

      stripeFirestore.customerCollectionDbRef = {
        doc: jest.fn().mockImplementation((uid: any) => ({
          collection: jest.fn().mockImplementation(() => ({
            doc: jest.fn().mockImplementation((id: any) => ({
              id,
            })),
          })),
        })),
      };
    });

    it('fetches and inserts the subscription', async () => {
      stripe.subscriptions = {
        retrieve: jest.fn().mockResolvedValue(subscription1),
      };

      const result = await stripeFirestore.fetchAndInsertSubscription(
        subscription1.id,
        customer.metadata.userid
      );

      expect(result).toEqual(subscription1);
      expect(stripe.subscriptions.retrieve).toHaveBeenCalledTimes(1);
      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith(
        subscription1.id
      );
      expect(tx.get).toHaveBeenCalledTimes(1);
      expect(tx.set).toHaveBeenCalledTimes(1);
    });
  });

  describe('legacyFetchAndInsertCustomer', () => {
    let tx: any;

    beforeEach(() => {
      stripe.subscriptions = {
        list: jest.fn().mockReturnValue({
          autoPagingToArray: jest.fn().mockResolvedValue([subscription1]),
        }),
      };

      tx = {
        get: jest.fn().mockResolvedValue({}),
        set: jest.fn(),
      };

      firestore.runTransaction = jest
        .fn()
        .mockImplementation((fn: any) => fn(tx));

      stripeFirestore.customerCollectionDbRef = {
        doc: jest.fn().mockImplementation((uid: any) => ({
          collection: jest.fn().mockImplementation(() => ({
            doc: jest.fn().mockImplementation((id: any) => ({
              id,
            })),
          })),
        })),
      };
    });

    it('fetches and returns a customer', async () => {
      stripe.customers = {
        retrieve: jest
          .fn()
          .mockResolvedValueOnce({
            ...customer,
            subscriptions: { data: [subscription1] },
          })
          .mockResolvedValueOnce(customer),
      };

      const result = await stripeFirestore.legacyFetchAndInsertCustomer(
        customer.id
      );

      expect(result).toEqual(customer);
      expect(stripe.customers.retrieve).toHaveBeenCalledTimes(2);
      expect(stripe.subscriptions.list).toHaveBeenCalledTimes(1);
      expect(stripe.subscriptions.list).toHaveBeenCalledWith({
        customer: customer.id,
        status: 'all',
        limit: 100,
      });
      expect(tx.set).toHaveBeenCalledTimes(2); // customer + subscription
      expect(tx.get).toHaveBeenCalledTimes(2); // customer + subscription
    });

    it('errors on customer deleted', async () => {
      const deletedCustomer = { ...customer, deleted: true };
      stripe.customers = {
        retrieve: jest
          .fn()
          .mockResolvedValueOnce({
            ...deletedCustomer,
            subscriptions: { data: [] },
          })
          .mockResolvedValueOnce(deletedCustomer),
      };

      try {
        await stripeFirestore.legacyFetchAndInsertCustomer(customer.id);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(FirestoreStripeError.STRIPE_CUSTOMER_DELETED);
      }
    });

    it('allows customer deleted when ignoreErrors is true', async () => {
      const deletedCustomer = { ...customer, deleted: true };
      stripe.customers = {
        retrieve: jest.fn().mockResolvedValue(deletedCustomer),
      };

      const result = await stripeFirestore.legacyFetchAndInsertCustomer(
        customer.id,
        true
      );

      expect(result).toEqual(deletedCustomer);
      expect(stripe.customers.retrieve).toHaveBeenCalledTimes(1);
      expect(stripe.customers.retrieve).toHaveBeenCalledWith(customer.id, {
        expand: ['subscriptions'],
      });
    });

    it('allows customer with no uid when ignoreErrors is true', async () => {
      const noMetadataCustomer = { ...customer, metadata: {} };
      stripe.customers = {
        retrieve: jest.fn().mockResolvedValue(noMetadataCustomer),
      };

      const result = await stripeFirestore.legacyFetchAndInsertCustomer(
        customer.id,
        true
      );

      expect(result).toEqual(noMetadataCustomer);
      expect(stripe.customers.retrieve).toHaveBeenCalledTimes(1);
      expect(stripe.customers.retrieve).toHaveBeenCalledWith(customer.id, {
        expand: ['subscriptions'],
      });
    });

    it('errors on missing uid', async () => {
      const missingUidCustomer = { ...customer, metadata: {} };
      stripe.customers = {
        retrieve: jest
          .fn()
          .mockResolvedValueOnce({
            ...missingUidCustomer,
            subscriptions: { data: [] },
          })
          .mockResolvedValueOnce(missingUidCustomer),
      };

      try {
        await stripeFirestore.legacyFetchAndInsertCustomer(customer.id);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID);
      }
    });
  });

  describe('insertCustomerRecordWithBackfill', () => {
    it('retrieves a record', async () => {
      stripeFirestore.retrieveCustomer = jest.fn().mockResolvedValue(customer);
      stripeFirestore.legacyFetchAndInsertCustomer = jest
        .fn()
        .mockResolvedValue(customer);
      await stripeFirestore.insertCustomerRecordWithBackfill(
        'fxauid',
        customer
      );
      expect(stripeFirestore.retrieveCustomer).toHaveBeenCalledTimes(1);
      expect(
        stripeFirestore.legacyFetchAndInsertCustomer
      ).not.toHaveBeenCalled();
    });

    it('backfills on customer not found', async () => {
      stripeFirestore.retrieveCustomer = jest
        .fn()
        .mockRejectedValue(
          newFirestoreStripeError(
            'no customer',
            FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
          )
        );
      stripeFirestore.legacyFetchAndInsertCustomer = jest
        .fn()
        .mockResolvedValue({});
      await stripeFirestore.insertCustomerRecordWithBackfill(
        'fxauid',
        customer
      );
      expect(stripeFirestore.retrieveCustomer).toHaveBeenCalledTimes(1);
      expect(
        stripeFirestore.legacyFetchAndInsertCustomer
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('insertSubscriptionRecord', () => {
    it('inserts a record', async () => {
      const customerSnap = {
        empty: false,
        docs: [
          {
            ref: {
              collection: jest.fn().mockReturnValue({
                doc: jest
                  .fn()
                  .mockReturnValue({ set: jest.fn().mockResolvedValue({}) }),
              }),
            },
          },
        ],
      };
      customerCollectionDbRef.where = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(customerSnap),
      });
      const result = await stripeFirestore.insertSubscriptionRecord(
        deepCopy(subscription1)
      );
      expect(result).toEqual({});
      expect(customerCollectionDbRef.where).toHaveBeenCalledTimes(1);
      expect(customerSnap.docs[0].ref.collection).toHaveBeenCalledTimes(1);
    });

    it('errors on customer not found', async () => {
      customerCollectionDbRef.where = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: true }),
      });
      try {
        await stripeFirestore.insertSubscriptionRecord(deepCopy(subscription1));
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        );
        expect(customerCollectionDbRef.where).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('insertSubscriptionRecordWithBackfill', () => {
    it('inserts a record', async () => {
      stripeFirestore.insertSubscriptionRecord = jest
        .fn()
        .mockResolvedValue({});
      const result = await stripeFirestore.insertSubscriptionRecordWithBackfill(
        deepCopy(subscription1)
      );
      expect(result).toBeUndefined();
      expect(stripeFirestore.insertSubscriptionRecord).toHaveBeenCalledTimes(1);
    });

    it('backfills on customer not found', async () => {
      stripeFirestore.insertSubscriptionRecord = jest
        .fn()
        .mockRejectedValue(
          newFirestoreStripeError(
            'no customer',
            FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
          )
        );
      stripeFirestore.legacyFetchAndInsertCustomer = jest
        .fn()
        .mockResolvedValue({});
      const result = await stripeFirestore.insertSubscriptionRecordWithBackfill(
        deepCopy(subscription1)
      );
      expect(result).toBeUndefined();
      expect(stripeFirestore.insertSubscriptionRecord).toHaveBeenCalledTimes(1);
      expect(
        stripeFirestore.legacyFetchAndInsertCustomer
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('insertInvoiceRecord', () => {
    let invoice: any;

    beforeEach(() => {
      invoice = deepCopy(paidInvoice);
    });

    it('inserts a record', async () => {
      const customerSnap = {
        empty: false,
        docs: [
          {
            ref: {
              // subscriptions call
              collection: jest.fn().mockReturnValue({
                doc: jest.fn().mockReturnValue({
                  // invoice call
                  collection: jest.fn().mockReturnValue({
                    doc: jest.fn().mockReturnValue({
                      set: jest.fn().mockResolvedValue({}),
                    }),
                  }),
                }),
              }),
            },
          },
        ],
      };
      customerCollectionDbRef.where = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(customerSnap),
      });
      const result = await stripeFirestore.insertInvoiceRecord(invoice);
      expect(result).toEqual({});
      expect(customerCollectionDbRef.where).toHaveBeenCalledTimes(1);
      expect(customerSnap.docs[0].ref.collection).toHaveBeenCalledTimes(1);
    });

    it('errors on customer not found', async () => {
      customerCollectionDbRef.where = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: true }),
      });
      try {
        await stripeFirestore.insertInvoiceRecord(invoice);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        );
        expect(customerCollectionDbRef.where).toHaveBeenCalledTimes(1);
      }
    });

    it('ignores customer not found when ignoreErrors is true', async () => {
      customerCollectionDbRef.where = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: true }),
      });
      const result = await stripeFirestore.insertInvoiceRecord(invoice, true);
      expect(result).toEqual(invoice);
    });
  });

  describe('fetchAndInsertInvoice', () => {
    let tx: any;
    const invoiceId = 'in_123';
    const subscriptionId = 'sub_123';
    const customerId = 'cus_123';
    const mockInvoice = {
      id: invoiceId,
      customer: customerId,
      subscription: subscriptionId,
    };
    const eventTime = 123;

    beforeEach(() => {
      tx = {
        get: jest.fn().mockResolvedValue({}),
        set: jest.fn(),
      };

      firestore.runTransaction = jest
        .fn()
        .mockImplementation((fn: any) => fn(tx));

      stripe.invoices = {
        retrieve: jest.fn(),
      };

      stripeFirestore.customerCollectionDbRef = {
        where: jest.fn(),
        doc: jest.fn().mockImplementation((uid: any) => ({
          collection: jest.fn().mockImplementation(() => ({
            doc: jest.fn().mockImplementation(() => ({
              collection: jest.fn().mockImplementation(() => ({
                doc: jest.fn().mockImplementation(() => ({})),
              })),
            })),
          })),
        })),
      };
    });

    it('fetches and inserts an invoice for an existing customer and subscription', async () => {
      stripe.invoices.retrieve.mockResolvedValue(mockInvoice);

      const customerSnap = {
        empty: false,
        docs: [
          {
            data: () => ({ metadata: { userid: 'uid_1' } }),
          },
        ],
      };
      stripeFirestore.customerCollectionDbRef.where.mockReturnValue({
        get: jest.fn().mockResolvedValue(customerSnap),
      });
      tx.get.mockResolvedValue({
        data: () => mockInvoice,
      });

      await stripeFirestore.fetchAndInsertInvoice(invoiceId, eventTime);

      expect(stripe.invoices.retrieve).toHaveBeenCalledTimes(1);
      expect(stripe.invoices.retrieve).toHaveBeenCalledWith(invoiceId);
      expect(
        stripeFirestore.customerCollectionDbRef.where
      ).toHaveBeenCalledTimes(1);
      expect(tx.get).toHaveBeenCalledTimes(1);
      expect(tx.set).toHaveBeenCalledTimes(1);
    });

    it('errors on customer not found', async () => {
      stripe.invoices.retrieve.mockResolvedValue(mockInvoice);

      stripeFirestore.customerCollectionDbRef.where.mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: true }),
      });

      try {
        await stripeFirestore.fetchAndInsertInvoice(invoiceId, eventTime);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        );
        expect(stripe.invoices.retrieve).toHaveBeenCalledTimes(1);
        expect(
          stripeFirestore.customerCollectionDbRef.where
        ).toHaveBeenCalledTimes(1);
        expect(tx.get).toHaveBeenCalledTimes(0);
        expect(tx.set).toHaveBeenCalledTimes(0);
      }
    });

    it('ignores customer not found when ignoreErrors is true', async () => {
      stripe.invoices.retrieve.mockResolvedValue(mockInvoice);

      stripeFirestore.customerCollectionDbRef.where.mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: true }),
      });

      const result = await stripeFirestore.fetchAndInsertInvoice(
        invoiceId,
        eventTime,
        true
      );

      expect(result).toEqual(mockInvoice);
      expect(stripe.invoices.retrieve).toHaveBeenCalledTimes(1);
      expect(stripe.invoices.retrieve).toHaveBeenCalledWith(invoiceId);
      expect(
        stripeFirestore.customerCollectionDbRef.where
      ).toHaveBeenCalledTimes(1);
      expect(tx.get).toHaveBeenCalledTimes(0);
      expect(tx.set).toHaveBeenCalledTimes(0);
    });

    it('returns invoice as-is when it has no subscription', async () => {
      const mockInvoiceWithoutSubscription = {
        ...mockInvoice,
        subscription: null,
      };
      stripe.invoices.retrieve.mockResolvedValue(
        mockInvoiceWithoutSubscription
      );

      const result = await stripeFirestore.fetchAndInsertInvoice(
        invoiceId,
        eventTime
      );

      expect(result).toEqual(mockInvoiceWithoutSubscription);
      expect(stripe.invoices.retrieve).toHaveBeenCalledTimes(1);
      expect(stripe.invoices.retrieve).toHaveBeenCalledWith(invoiceId);
      expect(
        stripeFirestore.customerCollectionDbRef.where
      ).toHaveBeenCalledTimes(0);
      expect(tx.get).toHaveBeenCalledTimes(0);
      expect(tx.set).toHaveBeenCalledTimes(0);
    });

    it('errors on missing uid', async () => {
      stripe.invoices.retrieve.mockResolvedValue(mockInvoice);

      const customerSnap = {
        empty: false,
        docs: [
          {
            data: () => ({ metadata: {} }),
          },
        ],
      };
      stripeFirestore.customerCollectionDbRef.where.mockReturnValue({
        get: jest.fn().mockResolvedValue(customerSnap),
      });

      try {
        await stripeFirestore.fetchAndInsertInvoice(invoiceId, eventTime);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID);
        expect(stripe.invoices.retrieve).toHaveBeenCalledTimes(1);
        expect(
          stripeFirestore.customerCollectionDbRef.where
        ).toHaveBeenCalledTimes(1);
        expect(tx.get).toHaveBeenCalledTimes(0);
        expect(tx.set).toHaveBeenCalledTimes(0);
      }
    });

    it('allows missing uid when ignoreErrors is true', async () => {
      stripe.invoices.retrieve.mockResolvedValue(mockInvoice);

      const customerSnap = {
        empty: false,
        docs: [
          {
            data: () => ({ metadata: {} }),
          },
        ],
      };
      stripeFirestore.customerCollectionDbRef.where.mockReturnValue({
        get: jest.fn().mockResolvedValue(customerSnap),
      });

      const result = await stripeFirestore.fetchAndInsertInvoice(
        invoiceId,
        eventTime,
        true
      );

      expect(result).toEqual(mockInvoice);
      expect(stripe.invoices.retrieve).toHaveBeenCalledTimes(1);
      expect(stripe.invoices.retrieve).toHaveBeenCalledWith(invoiceId);
      expect(
        stripeFirestore.customerCollectionDbRef.where
      ).toHaveBeenCalledTimes(1);
      expect(tx.get).toHaveBeenCalledTimes(0);
      expect(tx.set).toHaveBeenCalledTimes(0);
    });
  });

  describe('insertPaymentMethodRecord', () => {
    it('inserts a record', async () => {
      const customerSnap = {
        empty: false,
        docs: [
          {
            ref: {
              collection: jest.fn().mockReturnValue({
                doc: jest
                  .fn()
                  .mockReturnValue({ set: jest.fn().mockResolvedValue({}) }),
              }),
            },
          },
        ],
      };
      customerCollectionDbRef.where = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(customerSnap),
      });
      const result = await stripeFirestore.insertPaymentMethodRecord(
        deepCopy(paymentMethod)
      );
      expect(result).toEqual({});
      expect(customerCollectionDbRef.where).toHaveBeenCalledTimes(1);
      expect(customerSnap.docs[0].ref.collection).toHaveBeenCalledTimes(1);
    });

    it('ignores customer not found when ignoreErrors is true', async () => {
      customerCollectionDbRef.where = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: true }),
      });
      const result = await stripeFirestore.insertPaymentMethodRecord(
        deepCopy(paymentMethod),
        true
      );
      expect(result).toEqual(paymentMethod);
    });

    it('errors on customer not found', async () => {
      customerCollectionDbRef.where = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: true }),
      });
      try {
        await stripeFirestore.insertPaymentMethodRecord(paymentMethod);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        );
        expect(customerCollectionDbRef.where).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('fetchAndInsertPaymentMethod', () => {
    let tx: any;
    const paymentMethodId = 'pm_123';
    const mockPaymentMethod = {
      customer: 'cus_asdf',
      card: {
        last4: '4321',
        brand: 'Mastercard',
        country: 'US',
      },
      billing_details: {
        address: {
          postal_code: '99999',
        },
      },
    };
    const eventTime = 123;

    beforeEach(() => {
      tx = {
        get: jest.fn().mockResolvedValue({}),
        set: jest.fn(),
      };

      firestore.runTransaction = jest
        .fn()
        .mockImplementation((fn: any) => fn(tx));

      stripe.paymentMethods = {
        retrieve: jest.fn(),
      };

      stripeFirestore.customerCollectionDbRef = {
        where: jest.fn(),
        doc: jest.fn().mockImplementation((uid: any) => ({
          collection: jest.fn().mockImplementation(() => ({
            doc: jest.fn().mockImplementation(() => ({})),
          })),
        })),
      };
    });

    it('fetches and inserts an attached payment method when customer exists and has uid', async () => {
      stripe.paymentMethods.retrieve.mockResolvedValue(mockPaymentMethod);

      const customerSnap = {
        empty: false,
        docs: [
          {
            data: () => ({ metadata: { userid: 'uid_1' } }),
          },
        ],
      };
      stripeFirestore.customerCollectionDbRef.where.mockReturnValue({
        get: jest.fn().mockResolvedValue(customerSnap),
      });
      tx.get.mockResolvedValue({
        data: () => mockPaymentMethod,
      });

      const result = await stripeFirestore.fetchAndInsertPaymentMethod(
        paymentMethodId,
        eventTime
      );

      expect(result).toEqual(mockPaymentMethod);
      expect(stripe.paymentMethods.retrieve).toHaveBeenCalledTimes(1);
      expect(stripe.paymentMethods.retrieve).toHaveBeenCalledWith(
        paymentMethodId
      );
      expect(
        stripeFirestore.customerCollectionDbRef.where
      ).toHaveBeenCalledTimes(1);
      expect(tx.get).toHaveBeenCalledTimes(1);
      expect(tx.set).toHaveBeenCalledTimes(1);
    });

    it('returns payment method when it is not attached to a customer', async () => {
      const mockPaymentMethodWithoutCustomer = {
        ...mockPaymentMethod,
        customer: null,
      };
      stripe.paymentMethods.retrieve.mockResolvedValue(
        mockPaymentMethodWithoutCustomer
      );

      const result = await stripeFirestore.fetchAndInsertPaymentMethod(
        paymentMethodId,
        eventTime
      );

      expect(result).toEqual(mockPaymentMethodWithoutCustomer);
      expect(stripe.paymentMethods.retrieve).toHaveBeenCalledTimes(1);
      expect(stripe.paymentMethods.retrieve).toHaveBeenCalledWith(
        paymentMethodId
      );
      expect(
        stripeFirestore.customerCollectionDbRef.where
      ).toHaveBeenCalledTimes(0);
      expect(tx.get).toHaveBeenCalledTimes(0);
      expect(tx.set).toHaveBeenCalledTimes(0);
    });

    it('errors on customer not found', async () => {
      stripe.paymentMethods.retrieve.mockResolvedValue(mockPaymentMethod);

      stripeFirestore.customerCollectionDbRef.where.mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: true }),
      });

      try {
        await stripeFirestore.fetchAndInsertPaymentMethod(
          paymentMethodId,
          eventTime
        );
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        );
        expect(stripe.paymentMethods.retrieve).toHaveBeenCalledTimes(1);
        expect(stripe.paymentMethods.retrieve).toHaveBeenCalledWith(
          paymentMethodId
        );
        expect(
          stripeFirestore.customerCollectionDbRef.where
        ).toHaveBeenCalledTimes(1);
        expect(tx.get).toHaveBeenCalledTimes(0);
        expect(tx.set).toHaveBeenCalledTimes(0);
      }
    });

    it('ignores customer not found when ignoreErrors is true', async () => {
      stripe.paymentMethods.retrieve.mockResolvedValue(mockPaymentMethod);

      stripeFirestore.customerCollectionDbRef.where.mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: true }),
      });

      const result = await stripeFirestore.fetchAndInsertPaymentMethod(
        paymentMethodId,
        eventTime,
        true
      );

      expect(result).toEqual(mockPaymentMethod);
      expect(stripe.paymentMethods.retrieve).toHaveBeenCalledTimes(1);
      expect(stripe.paymentMethods.retrieve).toHaveBeenCalledWith(
        paymentMethodId
      );
      expect(
        stripeFirestore.customerCollectionDbRef.where
      ).toHaveBeenCalledTimes(1);
      expect(tx.get).toHaveBeenCalledTimes(0);
      expect(tx.set).toHaveBeenCalledTimes(0);
    });

    it('errors on missing uid', async () => {
      stripe.paymentMethods.retrieve.mockResolvedValue(mockPaymentMethod);

      const customerSnap = {
        empty: false,
        docs: [
          {
            data: () => ({ metadata: {} }),
          },
        ],
      };
      stripeFirestore.customerCollectionDbRef.where.mockReturnValue({
        get: jest.fn().mockResolvedValue(customerSnap),
      });

      try {
        await stripeFirestore.fetchAndInsertPaymentMethod(
          paymentMethodId,
          eventTime
        );
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID);
        expect(stripe.paymentMethods.retrieve).toHaveBeenCalledTimes(1);
        expect(stripe.paymentMethods.retrieve).toHaveBeenCalledWith(
          paymentMethodId
        );
        expect(
          stripeFirestore.customerCollectionDbRef.where
        ).toHaveBeenCalledTimes(1);
        expect(tx.get).toHaveBeenCalledTimes(0);
        expect(tx.set).toHaveBeenCalledTimes(0);
      }
    });

    it('allows missing uid when ignoreErrors is true', async () => {
      stripe.paymentMethods.retrieve.mockResolvedValue(mockPaymentMethod);

      const customerSnap = {
        empty: false,
        docs: [
          {
            data: () => ({ metadata: {} }),
          },
        ],
      };
      stripeFirestore.customerCollectionDbRef.where.mockReturnValue({
        get: jest.fn().mockResolvedValue(customerSnap),
      });

      const result = await stripeFirestore.fetchAndInsertPaymentMethod(
        paymentMethodId,
        eventTime,
        true
      );

      expect(result).toEqual(mockPaymentMethod);
      expect(stripe.paymentMethods.retrieve).toHaveBeenCalledTimes(1);
      expect(stripe.paymentMethods.retrieve).toHaveBeenCalledWith(
        paymentMethodId
      );
      expect(
        stripeFirestore.customerCollectionDbRef.where
      ).toHaveBeenCalledTimes(1);
      expect(tx.get).toHaveBeenCalledTimes(0);
      expect(tx.set).toHaveBeenCalledTimes(0);
    });
  });

  describe('insertPaymentMethodRecordWithBackfill', () => {
    it('inserts a record', async () => {
      stripeFirestore.insertPaymentMethodRecord = jest
        .fn()
        .mockResolvedValue({});
      stripeFirestore.legacyFetchAndInsertCustomer = jest
        .fn()
        .mockResolvedValue({});
      const result =
        await stripeFirestore.insertPaymentMethodRecordWithBackfill(
          deepCopy(paymentMethod)
        );
      expect(result).toBeUndefined();
      expect(stripeFirestore.insertPaymentMethodRecord).toHaveBeenCalledTimes(
        1
      );
      expect(
        stripeFirestore.legacyFetchAndInsertCustomer
      ).not.toHaveBeenCalled();
    });

    it('backfills on customer not found', async () => {
      const insertStub = jest.fn();
      stripeFirestore.insertPaymentMethodRecord = insertStub;
      insertStub
        .mockRejectedValueOnce(
          newFirestoreStripeError(
            'no customer',
            FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
          )
        )
        .mockResolvedValueOnce({});
      stripeFirestore.legacyFetchAndInsertCustomer = jest
        .fn()
        .mockResolvedValue({});
      await stripeFirestore.insertPaymentMethodRecordWithBackfill(
        deepCopy(paymentMethod)
      );
      expect(stripeFirestore.insertPaymentMethodRecord).toHaveBeenCalledTimes(
        2
      );
      expect(
        stripeFirestore.legacyFetchAndInsertCustomer
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('removePaymentMethodRecord', () => {
    it('removes a record', async () => {
      const paymentMethodSnap = {
        empty: false,
        docs: [
          {
            ref: {
              delete: jest.fn().mockResolvedValue({}),
            },
          },
        ],
      };
      firestore.collectionGroup = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(paymentMethodSnap),
        }),
      });
      await stripeFirestore.removePaymentMethodRecord(deepCopy(paymentMethod));
      expect(firestore.collectionGroup).toHaveBeenCalledTimes(1);
      expect(paymentMethodSnap.docs[0].ref.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('retrieveCustomer', () => {
    it('fetches a customer by uid', async () => {
      customerCollectionDbRef.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => customer,
        }),
      });
      const result = await stripeFirestore.retrieveCustomer({
        uid: customer1.metadata.userid,
      });
      expect(result).toEqual(customer);
    });

    it('fetches a customer by customerId', async () => {
      customerCollectionDbRef.where = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [
            {
              data: jest.fn().mockReturnValue(customer),
            },
          ],
        }),
      });
      const result = await stripeFirestore.retrieveCustomer({
        customerId: customer.id,
      });
      expect(result).toEqual(customer);
    });

    it('errors when customer is not found', async () => {
      customerCollectionDbRef.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
      });
      try {
        await stripeFirestore.retrieveCustomer({
          uid: customer.metadata.userid,
        });
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        );
      }
    });
  });

  describe('retrieveCustomerSubscriptions', () => {
    describe('retrieves customer subscriptions', () => {
      beforeEach(() => {
        const subscriptionSnap = {
          docs: [{ data: () => ({ ...customer.subscriptions.data[0] }) }],
        };
        customerCollectionDbRef.where = jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            empty: false,
            docs: [
              {
                ref: {
                  collection: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue(subscriptionSnap),
                  }),
                },
              },
            ],
          }),
        });
      });

      it('without status filter', async () => {
        const subscriptions =
          await stripeFirestore.retrieveCustomerSubscriptions(customer.id);
        expect(subscriptions).toEqual([customer.subscriptions.data[0]]);
      });

      it('with status filter', async () => {
        const subscriptions =
          await stripeFirestore.retrieveCustomerSubscriptions(customer.id, [
            'active',
          ]);
        expect(subscriptions).toEqual([customer.subscriptions.data[0]]);
      });

      it('with empty status filter', async () => {
        const subscriptions =
          await stripeFirestore.retrieveCustomerSubscriptions(customer.id, []);
        expect(subscriptions).toEqual([]);
      });
    });

    it('retrieves only active customer subscriptions', async () => {
      const sub1 = deepCopy(customer.subscriptions.data[0]);
      const sub2 = deepCopy(customer.subscriptions.data[0]);
      sub2.status = 'cancelled';
      const subscriptionSnap = {
        docs: [{ data: () => sub1 }, { data: () => sub2 }],
      };
      customerCollectionDbRef.where = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [
            {
              ref: {
                collection: jest.fn().mockReturnValue({
                  get: jest.fn().mockResolvedValue(subscriptionSnap),
                }),
              },
            },
          ],
        }),
      });
      const subscriptions = await stripeFirestore.retrieveCustomerSubscriptions(
        customer.id
      );
      expect(subscriptions).toEqual([sub1]);
    });

    it('errors on customer not found', async () => {
      customerCollectionDbRef.where = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          empty: true,
        }),
      });
      try {
        await stripeFirestore.retrieveCustomerSubscriptions(customer.id);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        );
      }
    });
  });

  describe('retrieveSubscription', () => {
    it('retrieves a subscription', async () => {
      const subscriptionSnap = {
        empty: false,
        docs: [
          {
            data: () => deepCopy(subscription1),
          },
        ],
      };
      firestore.collectionGroup = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(subscriptionSnap),
        }),
      });
      const result = await stripeFirestore.retrieveSubscription(
        subscription1.id
      );
      expect(result).toEqual(subscription1);
    });

    it('errors on subscription not found', async () => {
      firestore.collectionGroup = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ empty: true }),
        }),
      });
      try {
        await stripeFirestore.retrieveSubscription(subscription1.id);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(
          FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND
        );
      }
    });
  });

  describe('retrieveInvoice', () => {
    let invoice: any;

    beforeEach(() => {
      invoice = deepCopy(paidInvoice);
    });

    it('retrieves an invoice', async () => {
      const invoiceSnap = {
        empty: false,
        docs: [
          {
            data: () => invoice,
          },
        ],
      };
      firestore.collectionGroup = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(invoiceSnap),
        }),
      });
      const result = await stripeFirestore.retrieveInvoice(invoice.id);
      expect(result).toEqual(invoice);
    });

    it('errors on invoice not found', async () => {
      firestore.collectionGroup = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ empty: true }),
        }),
      });
      try {
        await stripeFirestore.retrieveInvoice(invoice.id);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(FirestoreStripeError.FIRESTORE_INVOICE_NOT_FOUND);
      }
    });
  });

  describe('retrievePaymentMethod', () => {
    it('retrieves a payment method', async () => {
      const paymentMethodSnap = {
        empty: false,
        docs: [
          {
            data: () => deepCopy(paymentMethod),
          },
        ],
      };
      firestore.collectionGroup = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(paymentMethodSnap),
        }),
      });
      const result = await stripeFirestore.retrievePaymentMethod(
        paymentMethod.id
      );
      expect(result).toEqual(paymentMethod);
    });

    it('errors on payment method not found', async () => {
      firestore.collectionGroup = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ empty: true }),
        }),
      });
      try {
        await stripeFirestore.retrievePaymentMethod(paymentMethod.id);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.name).toBe(
          FirestoreStripeError.FIRESTORE_PAYMENT_METHOD_NOT_FOUND
        );
      }
    });
  });

  describe('removeCustomerRecursive', () => {
    beforeEach(() => {
      const bulkWriterMock = new BulkWriterMock();
      firestore.bulkWriter = jest.fn().mockReturnValue(bulkWriterMock);
      customerCollectionDbRef.doc = jest.fn().mockReturnValue({
        path: '/test/path',
      });
    });

    it('successfully delete documents', async () => {
      firestore.recursiveDelete = async (doc: any, bulk: any) => {
        bulk.resultCallback(doc);
      };
      const result = await stripeFirestore.removeCustomerRecursive('uid');
      expect(result).toEqual(['/test/path']);
    });

    it('single errors on non-bulkWriter failure', async () => {
      const expectedError = new Error('Some non-bulkWriter error');
      firestore.recursiveDelete = async (doc: any, bulk: any) => {
        throw expectedError;
      };
      try {
        await stripeFirestore.removeCustomerRecursive('uid');
        throw new Error('should have thrown');
      } catch (error: any) {
        expect(error).not.toBeInstanceOf(StripeFirestoreMultiError);
        expect(error.message).toBe(expectedError.message);
      }
    });

    it('errors on failure', async () => {
      const failureDocumentPath = '/test/path';
      firestore.recursiveDelete = async (doc: any, bulk: any) => {
        const error: any = new Error('It failed a delete');
        error.failedAttempts = 99;
        error.documentRef = { path: failureDocumentPath };
        bulk.errorCallback(error);
        throw new Error('Something happened in the bulkWriter');
      };
      try {
        await stripeFirestore.removeCustomerRecursive('uid');
        throw new Error('should have thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(StripeFirestoreMultiError);
        expect(error.errors()[1].documentPath).toBe(failureDocumentPath);
      }
    });
  });
});
