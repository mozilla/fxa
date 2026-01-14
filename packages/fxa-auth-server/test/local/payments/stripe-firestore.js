/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };

const {
  StripeFirestore,
  FirestoreStripeError,
  newFirestoreStripeError,
  StripeFirestoreMultiError,
} = require('../../../lib/payments/stripe-firestore');

const customer1 = require('./fixtures/stripe/customer1.json');
const subscription1 = require('./fixtures/stripe/subscription1.json');
const paidInvoice = require('./fixtures/stripe/invoice_paid.json');
const paymentMethod = require('./fixtures/stripe/payment_method.json');

class BulkWriterMock {
  resultCallback;
  errorCallback;
  onWriteResult(callback) {
    this.resultCallback = callback;
  }
  onWriteError(callback) {
    this.errorCallback = callback;
  }
}
/**
 * To prevent the modification of the test objects loaded, which can impact other tests referencing the object,
 * a deep copy of the object can be created which uses the test object as a template
 *
 * @param {Object} object
 */
function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

describe('StripeFirestore', () => {
  let firestore;
  let stripe;
  let customerCollectionDbRef;
  let stripeFirestore;
  let customer;

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
    assert.ok(stripeFirestore);
  });

  describe('retrieveAndFetchCustomer', () => {
    it('fetches a customer that was already retrieved', async () => {
      stripeFirestore.retrieveCustomer = sinon.fake.resolves(customer);
      stripeFirestore.legacyFetchAndInsertCustomer = sinon.fake.resolves({});
      const result = await stripeFirestore.retrieveAndFetchCustomer(
        customer.id
      );
      assert.deepEqual(result, customer);
      assert.calledOnce(stripeFirestore.retrieveCustomer);
      assert.notCalled(stripeFirestore.legacyFetchAndInsertCustomer);
    });

    it('fetches a customer that hasnt been retrieved', async () => {
      stripeFirestore.retrieveCustomer = sinon.fake.rejects(
        newFirestoreStripeError(
          'Not found',
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        )
      );
      stripeFirestore.legacyFetchAndInsertCustomer = sinon.fake.resolves(customer);
      const result = await stripeFirestore.retrieveAndFetchCustomer(
        customer.id
      );
      assert.deepEqual(result, customer);
      assert.calledOnce(stripeFirestore.retrieveCustomer);
      assert.calledOnce(stripeFirestore.legacyFetchAndInsertCustomer);
    });

    it('passes ignoreErrors through to legacyFetchAndInsertCustomer', async () => {
      stripeFirestore.retrieveCustomer = sinon.fake.rejects(
        newFirestoreStripeError(
          'Not found',
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        )
      );
      stripeFirestore.legacyFetchAndInsertCustomer = sinon.fake.resolves(customer);
      const result = await stripeFirestore.retrieveAndFetchCustomer(
        customer.id,
        true
      );
      assert.deepEqual(result, customer);
      assert.calledOnce(stripeFirestore.retrieveCustomer);
      assert.calledOnceWithExactly(
        stripeFirestore.legacyFetchAndInsertCustomer,
        customer.id,
        true
      );
    });

    it('errors otherwise', async () => {
      stripeFirestore.retrieveCustomer = sinon.fake.rejects(
        newFirestoreStripeError(
          'Not found',
          FirestoreStripeError.STRIPE_CUSTOMER_DELETED
        )
      );
      try {
        await stripeFirestore.retrieveAndFetchCustomer(customer.id);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, FirestoreStripeError.STRIPE_CUSTOMER_DELETED);
      }
    });
  });

  describe('retrieveAndFetchSubscription', () => {
    let subscription;

    beforeEach(() => {
      subscription = deepCopy(subscription1);
    });

    it('fetches a subscription that was already retrieved', async () => {
      stripeFirestore.retrieveSubscription = sinon.fake.resolves(subscription);
      stripeFirestore.legacyFetchAndInsertCustomer = sinon.fake.resolves({});
      const result = await stripeFirestore.retrieveAndFetchSubscription(
        subscription.id
      );
      assert.deepEqual(result, subscription);
      assert.calledOnce(stripeFirestore.retrieveSubscription);
      assert.notCalled(stripeFirestore.legacyFetchAndInsertCustomer);
    });

    it('fetches a subscription that hasnt been retrieved', async () => {
      stripeFirestore.retrieveSubscription = sinon.fake.rejects(
        newFirestoreStripeError(
          'Not found',
          FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND
        )
      );
      stripe.subscriptions = {
        retrieve: sinon.fake.resolves(subscription),
      };
      stripeFirestore.legacyFetchAndInsertCustomer = sinon.fake.resolves({});
      const result = await stripeFirestore.retrieveAndFetchSubscription(
        subscription.id
      );
      assert.deepEqual(result, subscription);
      assert.calledOnce(stripeFirestore.retrieveSubscription);
      assert.calledOnce(stripeFirestore.legacyFetchAndInsertCustomer);
      assert.calledOnceWithExactly(
        stripe.subscriptions.retrieve,
        subscription.id
      );
    });

    it('passes ignoreErrors through to legacyFetchAndInsertCustomer', async () => {
      stripeFirestore.retrieveSubscription = sinon.fake.rejects(
        newFirestoreStripeError(
          'Not found',
          FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND
        )
      );
      stripe.subscriptions = {
        retrieve: sinon.fake.resolves(subscription),
      };
      stripeFirestore.legacyFetchAndInsertCustomer = sinon.fake.resolves({});
      const result = await stripeFirestore.retrieveAndFetchSubscription(
        subscription.id,
        true
      );
      assert.deepEqual(result, subscription);
      assert.calledOnce(stripeFirestore.retrieveSubscription);
      assert.calledOnceWithExactly(
        stripeFirestore.legacyFetchAndInsertCustomer,
        subscription.customer,
        true
      );
      assert.calledOnceWithExactly(
        stripe.subscriptions.retrieve,
        subscription.id
      );
    });

    it('errors otherwise', async () => {
      stripeFirestore.retrieveSubscription = sinon.fake.rejects(
        newFirestoreStripeError(
          'Not found',
          FirestoreStripeError.STRIPE_CUSTOMER_DELETED
        )
      );
      try {
        await stripeFirestore.retrieveAndFetchSubscription(subscription.id);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, FirestoreStripeError.STRIPE_CUSTOMER_DELETED);
      }
    });
  });

  describe('fetchAndInsertSubscription', () => {
    let tx;

    beforeEach(() => {
      tx = {
        get: sinon.stub().resolves({}),
        set: sinon.stub(),
      };

      firestore.runTransaction = sinon.stub().callsFake((fn) => fn(tx));

      stripeFirestore.customerCollectionDbRef = {
        doc: sinon.stub().callsFake((uid) => ({
          collection: sinon.stub().callsFake(() => ({
            doc: sinon.stub().callsFake((id) => ({
              id,
            })),
          })),
        })),
      };
    });

    it('fetches and inserts the subscription', async () => {
      stripe.subscriptions = {
        retrieve: sinon.stub().resolves(subscription1),
      };

      const result = await stripeFirestore.fetchAndInsertSubscription(
        subscription1.id,
        customer.metadata.userid
      );

      assert.deepEqual(result, subscription1);
      assert.calledOnceWithExactly(stripe.subscriptions.retrieve, subscription1.id);
      assert.callCount(tx.get, 1);
      assert.callCount(tx.set, 1);
    });
  });

  describe('legacyFetchAndInsertCustomer', () => {
    let tx;

    beforeEach(() => {
      stripe.subscriptions = {
        list: sinon.stub().returns({
          autoPagingToArray: sinon.stub().resolves([subscription1]),
        }),
      };

      tx = {
        get: sinon.stub().resolves({}),
        set: sinon.stub(),
      };

      firestore.runTransaction = sinon.stub().callsFake((fn) => fn(tx));

      stripeFirestore.customerCollectionDbRef = {
        doc: sinon.stub().callsFake((uid) => ({
          collection: sinon.stub().callsFake(() => ({
            doc: sinon.stub().callsFake((id) => ({
              id,
            })),
          })),
        })),
      };
    });

    it('fetches and returns a customer', async () => {
      stripe.customers = {
        retrieve: sinon.stub()
        .onFirstCall()
        .resolves({ ...customer, subscriptions: { data: [subscription1] } })
        .onSecondCall()
        .resolves(customer),
      };

      const result = await stripeFirestore.legacyFetchAndInsertCustomer(customer.id);

      assert.deepEqual(result, customer);
      assert.calledTwice(stripe.customers.retrieve);
      assert.calledOnceWithExactly(stripe.subscriptions.list, {
        customer: customer.id,
        status: "all",
        limit: 100,
      });
      assert.callCount(tx.set, 2); // customer + subscription
      assert.callCount(tx.get, 2); // customer + subscription
    });

    it('errors on customer deleted', async () => {
      const deletedCustomer = { ...customer, deleted: true };
      stripe.customers = {
        retrieve: sinon.stub()
        .onFirstCall()
        .resolves({ ...deletedCustomer, subscriptions: { data: [] } })
        .onSecondCall()
        .resolves(deletedCustomer),
      };

      try {
        await stripeFirestore.legacyFetchAndInsertCustomer(customer.id);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, FirestoreStripeError.STRIPE_CUSTOMER_DELETED);
      }
    });

    it('allows customer deleted when ignoreErrors is true', async () => {
      const deletedCustomer = { ...customer, deleted: true };
      stripe.customers = {
        retrieve: sinon.stub()
        .resolves(deletedCustomer),
      };

      const result = await stripeFirestore.legacyFetchAndInsertCustomer(
        customer.id,
        true
      );

      assert.deepEqual(result, deletedCustomer);
      assert.calledOnceWithExactly(stripe.customers.retrieve, customer.id, {
        expand: ["subscriptions"],
      });
    });

    it('allows customer with no uid when ignoreErrors is true', async () => {
      const noMetadataCustomer = { ...customer, metadata: {} };
      stripe.customers = {
        retrieve: sinon.stub()
        .resolves(noMetadataCustomer),
      };

      const result = await stripeFirestore.legacyFetchAndInsertCustomer(
        customer.id,
        true
      );

      assert.deepEqual(result, noMetadataCustomer);
      assert.calledOnceWithExactly(stripe.customers.retrieve, customer.id, {
        expand: ["subscriptions"],
      });
    });

    it('errors on missing uid', async () => {
      const missingUidCustomer = { ...customer, metadata: {} };
      stripe.customers = {
        retrieve: sinon.stub()
        .onFirstCall()
        .resolves({ ...missingUidCustomer, subscriptions: { data: [] } })
        .onSecondCall()
        .resolves(missingUidCustomer),
      };

      try {
        await stripeFirestore.legacyFetchAndInsertCustomer(customer.id);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(
          err.name,
          FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID
        );
      }
    });
  });

  describe('insertCustomerRecordWithBackfill', () => {
    it('retrieves a record', async () => {
      stripeFirestore.retrieveCustomer = sinon.fake.resolves(customer);
      stripeFirestore.legacyFetchAndInsertCustomer = sinon.fake.resolves(customer);
      await stripeFirestore.insertCustomerRecordWithBackfill(
        'fxauid',
        customer
      );
      assert.calledOnce(stripeFirestore.retrieveCustomer);
      assert.notCalled(stripeFirestore.legacyFetchAndInsertCustomer);
    });

    it('backfills on customer not found', async () => {
      stripeFirestore.retrieveCustomer = sinon.fake.rejects(
        newFirestoreStripeError(
          'no customer',
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        )
      );
      stripeFirestore.legacyFetchAndInsertCustomer = sinon.fake.resolves({});
      await stripeFirestore.insertCustomerRecordWithBackfill(
        'fxauid',
        customer
      );
      assert.calledOnce(stripeFirestore.retrieveCustomer);
      assert.calledOnce(stripeFirestore.legacyFetchAndInsertCustomer);
    });
  });

  describe('insertSubscriptionRecord', () => {
    it('inserts a record', async () => {
      const customerSnap = {
        empty: false,
        docs: [
          {
            ref: {
              collection: sinon.fake.returns({
                doc: sinon.fake.returns({ set: sinon.fake.resolves({}) }),
              }),
            },
          },
        ],
      };
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves(customerSnap),
      });
      const result = await stripeFirestore.insertSubscriptionRecord(
        deepCopy(subscription1)
      );
      assert.deepEqual(result, {});
      assert.calledOnce(customerCollectionDbRef.where);
      assert.calledOnce(customerSnap.docs[0].ref.collection);
    });

    it('errors on customer not found', async () => {
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves({ empty: true }),
      });
      try {
        await stripeFirestore.insertSubscriptionRecord(deepCopy(subscription1));
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(
          err.name,
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        );
        assert.calledOnce(customerCollectionDbRef.where);
      }
    });
  });

  describe('insertSubscriptionRecordWithBackfill', () => {
    it('inserts a record', async () => {
      stripeFirestore.insertSubscriptionRecord = sinon.fake.resolves({});
      const result = await stripeFirestore.insertSubscriptionRecordWithBackfill(
        deepCopy(subscription1)
      );
      assert.isUndefined(result, {});
      assert.calledOnce(stripeFirestore.insertSubscriptionRecord);
    });

    it('backfills on customer not found', async () => {
      stripeFirestore.insertSubscriptionRecord = sinon.fake.rejects(
        newFirestoreStripeError(
          'no customer',
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        )
      );
      stripeFirestore.legacyFetchAndInsertCustomer = sinon.fake.resolves({});
      const result = await stripeFirestore.insertSubscriptionRecordWithBackfill(
        deepCopy(subscription1)
      );
      assert.isUndefined(result, {});
      assert.calledOnce(stripeFirestore.insertSubscriptionRecord);
      assert.calledOnce(stripeFirestore.legacyFetchAndInsertCustomer);
    });
  });

  describe('insertInvoiceRecord', () => {
    let invoice;

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
              collection: sinon.fake.returns({
                doc: sinon.fake.returns({
                  // invoice call
                  collection: sinon.fake.returns({
                    doc: sinon.fake.returns({ set: sinon.fake.resolves({}) }),
                  }),
                }),
              }),
            },
          },
        ],
      };
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves(customerSnap),
      });
      const result = await stripeFirestore.insertInvoiceRecord(invoice);
      assert.deepEqual(result, {});
      assert.calledOnce(customerCollectionDbRef.where);
      assert.calledOnce(customerSnap.docs[0].ref.collection);
    });

    it('errors on customer not found', async () => {
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves({ empty: true }),
      });
      try {
        await stripeFirestore.insertInvoiceRecord(invoice);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(
          err.name,
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        );
        assert.calledOnce(customerCollectionDbRef.where);
      }
    });

    it('ignores customer not found when ignoreErrors is true', async () => {
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves({ empty: true }),
      });
      const result = await stripeFirestore.insertInvoiceRecord(invoice, true);
      assert.deepEqual(result, invoice);
    });
  });

  describe('fetchAndInsertInvoice', () => {
    let tx;
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
        get: sinon.stub().resolves({}),
        set: sinon.stub(),
      };

      firestore.runTransaction = sinon.stub().callsFake((fn) => fn(tx));

      stripe.invoices = {
        retrieve: sinon.stub(),
      };

      stripeFirestore.customerCollectionDbRef = {
        where: sinon.stub(),
        doc: sinon.stub().callsFake((uid) => ({
          collection: sinon.stub().callsFake(() => ({
            doc: sinon.stub().callsFake(() => ({
              collection: sinon.stub().callsFake(() => ({
                doc: sinon.stub().callsFake(() => ({})),
              })),
            })),
          })),
        })),
      };
    });

    it('fetches and inserts an invoice for an existing customer and subscription', async () => {
      stripe.invoices.retrieve.resolves(mockInvoice);

      const customerSnap = {
        empty: false,
        docs: [
          {
            data: () => ({ metadata: { userid: 'uid_1' } }),
          },
        ],
      };
      stripeFirestore.customerCollectionDbRef.where.returns({
        get: sinon.stub().resolves(customerSnap),
      });
      tx.get.resolves({
        data: () => mockInvoice
      });

      await stripeFirestore.fetchAndInsertInvoice(invoiceId, eventTime);

      assert.calledOnce(stripe.invoices.retrieve);
      assert.calledWithExactly(stripe.invoices.retrieve.firstCall, invoiceId);
      assert.calledOnce(stripeFirestore.customerCollectionDbRef.where);
      assert.callCount(tx.get, 1);
      assert.callCount(tx.set, 1);
    });

    it('errors on customer not found', async () => {
      stripe.invoices.retrieve.resolves(mockInvoice);

      stripeFirestore.customerCollectionDbRef.where.returns({
        get: sinon.stub().resolves({ empty: true }),
      });

      try {
        await stripeFirestore.fetchAndInsertInvoice(invoiceId, eventTime);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND);
        assert.calledOnce(stripe.invoices.retrieve);
        assert.calledOnce(stripeFirestore.customerCollectionDbRef.where);
        assert.equal(tx.get.callCount, 0);
        assert.equal(tx.set.callCount, 0);
      }
    });

    it('ignores customer not found when ignoreErrors is true', async () => {
      stripe.invoices.retrieve.resolves(mockInvoice);

      stripeFirestore.customerCollectionDbRef.where.returns({
        get: sinon.stub().resolves({ empty: true }),
      });

      const result = await stripeFirestore.fetchAndInsertInvoice(invoiceId, eventTime, true);

      assert.deepEqual(result, mockInvoice);
      assert.calledOnceWithExactly(stripe.invoices.retrieve, invoiceId);
      assert.calledOnce(stripeFirestore.customerCollectionDbRef.where);
      assert.equal(tx.get.callCount, 0);
      assert.equal(tx.set.callCount, 0);
    });

    it('returns invoice as-is when it has no subscription', async () => {
      const mockInvoiceWithoutSubscription = {
        ...mockInvoice,
        subscription: null
      }
      stripe.invoices.retrieve.resolves(mockInvoiceWithoutSubscription);

      const result = await stripeFirestore.fetchAndInsertInvoice(invoiceId, eventTime);

      assert.deepEqual(result, mockInvoiceWithoutSubscription);
      assert.calledOnceWithExactly(stripe.invoices.retrieve, invoiceId);
      assert.equal(stripeFirestore.customerCollectionDbRef.where.callCount, 0);
      assert.equal(tx.get.callCount, 0);
      assert.equal(tx.set.callCount, 0);
    });

    it('errors on missing uid', async () => {
      stripe.invoices.retrieve.resolves(mockInvoice);

      const customerSnap = {
        empty: false,
        docs: [
          {
            data: () => ({ metadata: {} }),
          },
        ],
      };
      stripeFirestore.customerCollectionDbRef.where.returns({
        get: sinon.stub().resolves(customerSnap),
      });

      try {
        await stripeFirestore.fetchAndInsertInvoice(invoiceId, eventTime);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID);
        assert.calledOnce(stripe.invoices.retrieve);
        assert.calledOnce(stripeFirestore.customerCollectionDbRef.where);
        assert.equal(tx.get.callCount, 0);
        assert.equal(tx.set.callCount, 0);
      }
    });

    it('allows missing uid when ignoreErrors is true', async () => {
      stripe.invoices.retrieve.resolves(mockInvoice);

      const customerSnap = {
        empty: false,
        docs: [
          {
            data: () => ({ metadata: {} }),
          },
        ],
      };
      stripeFirestore.customerCollectionDbRef.where.returns({
        get: sinon.stub().resolves(customerSnap),
      });

      const result = await stripeFirestore.fetchAndInsertInvoice(invoiceId, eventTime, true);

      assert.deepEqual(result, mockInvoice);
      assert.calledOnceWithExactly(stripe.invoices.retrieve, invoiceId);
      assert.calledOnce(stripeFirestore.customerCollectionDbRef.where);
      assert.equal(tx.get.callCount, 0);
      assert.equal(tx.set.callCount, 0);
    });
  });

  describe('insertPaymentMethodRecord', () => {
    it('inserts a record', async () => {
      const customerSnap = {
        empty: false,
        docs: [
          {
            ref: {
              collection: sinon.fake.returns({
                doc: sinon.fake.returns({ set: sinon.fake.resolves({}) }),
              }),
            },
          },
        ],
      };
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves(customerSnap),
      });
      const result = await stripeFirestore.insertPaymentMethodRecord(
        deepCopy(paymentMethod)
      );
      assert.deepEqual(result, {});
      assert.calledOnce(customerCollectionDbRef.where);
      assert.calledOnce(customerSnap.docs[0].ref.collection);
    });

    it('ignores customer not found when ignoreErrors is true', async () => {
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves({ empty: true }),
      });
      const result = await stripeFirestore.insertPaymentMethodRecord(
        deepCopy(paymentMethod),
        true
      );
      assert.deepEqual(result, paymentMethod);
    });

    it('errors on customer not found', async () => {
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves({ empty: true }),
      });
      try {
        await stripeFirestore.insertPaymentMethodRecord(paymentMethod);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(
          err.name,
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        );
        assert.calledOnce(customerCollectionDbRef.where);
      }
    });
  });

  describe('fetchAndInsertPaymentMethod', () => {
    let tx;
    const paymentMethodId = 'pm_123';
    const mockPaymentMethod = {
      customer: "cus_asdf",
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
        get: sinon.stub().resolves({}),
        set: sinon.stub(),
      };

      firestore.runTransaction = sinon.stub().callsFake((fn) => fn(tx));

      stripe.paymentMethods = {
        retrieve: sinon.stub(),
      };

      stripeFirestore.customerCollectionDbRef = {
        where: sinon.stub(),
        doc: sinon.stub().callsFake((uid) => ({
          collection: sinon.stub().callsFake(() => ({
            doc: sinon.stub().callsFake(() => ({})),
          })),
        })),
      };
    });

    it('fetches and inserts an attached payment method when customer exists and has uid', async () => {
      stripe.paymentMethods.retrieve.resolves(mockPaymentMethod);

      const customerSnap = {
        empty: false,
        docs: [
          {
            data: () => ({ metadata: { userid: 'uid_1' } }),
          },
        ],
      };
      stripeFirestore.customerCollectionDbRef.where.returns({
        get: sinon.stub().resolves(customerSnap),
      });
      tx.get.resolves({
        data: () => mockPaymentMethod
      });

      const result = await stripeFirestore.fetchAndInsertPaymentMethod(
        paymentMethodId,
        eventTime,
      );

      assert.deepEqual(result, mockPaymentMethod);
      assert.calledOnce(stripe.paymentMethods.retrieve);
      assert.calledWithExactly(
        stripe.paymentMethods.retrieve.firstCall,
        paymentMethodId
      );
      assert.calledOnce(stripeFirestore.customerCollectionDbRef.where);
      assert.callCount(tx.get, 1);
      assert.callCount(tx.set, 1);
    });

    it('returns payment method when it is not attached to a customer', async () => {
      const mockPaymentMethodWithoutCustomer = {
        ...mockPaymentMethod,
        customer: null
      }
      stripe.paymentMethods.retrieve.resolves(mockPaymentMethodWithoutCustomer);

      const result = await stripeFirestore.fetchAndInsertPaymentMethod(
        paymentMethodId,
        eventTime,
      );

      assert.deepEqual(result, mockPaymentMethodWithoutCustomer);
      assert.calledOnceWithExactly(
        stripe.paymentMethods.retrieve,
        paymentMethodId
      );
      assert.equal(stripeFirestore.customerCollectionDbRef.where.callCount, 0);
      assert.equal(tx.get.callCount, 0);
      assert.equal(tx.set.callCount, 0);
    });

    it('errors on customer not found', async () => {
      stripe.paymentMethods.retrieve.resolves(mockPaymentMethod);

      stripeFirestore.customerCollectionDbRef.where.returns({
        get: sinon.stub().resolves({ empty: true }),
      });

      try {
        await stripeFirestore.fetchAndInsertPaymentMethod(paymentMethodId, eventTime);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND);
        assert.calledOnceWithExactly(
          stripe.paymentMethods.retrieve,
          paymentMethodId
        );
        assert.calledOnce(stripeFirestore.customerCollectionDbRef.where);
        assert.equal(tx.get.callCount, 0);
        assert.equal(tx.set.callCount, 0);
      }
    });

    it('ignores customer not found when ignoreErrors is true', async () => {
      stripe.paymentMethods.retrieve.resolves(mockPaymentMethod);

      stripeFirestore.customerCollectionDbRef.where.returns({
        get: sinon.stub().resolves({ empty: true }),
      });

      const result = await stripeFirestore.fetchAndInsertPaymentMethod(
        paymentMethodId,
        eventTime,
        true
      );

      assert.deepEqual(result, mockPaymentMethod);
      assert.calledOnceWithExactly(
        stripe.paymentMethods.retrieve,
        paymentMethodId
      );
      assert.calledOnce(stripeFirestore.customerCollectionDbRef.where);
      assert.equal(tx.get.callCount, 0);
      assert.equal(tx.set.callCount, 0);
    });

    it('errors on missing uid', async () => {
      stripe.paymentMethods.retrieve.resolves(mockPaymentMethod);

      const customerSnap = {
        empty: false,
        docs: [
          {
            data: () => ({ metadata: {} }),
          },
        ],
      };
      stripeFirestore.customerCollectionDbRef.where.returns({
        get: sinon.stub().resolves(customerSnap),
      });

      try {
        await stripeFirestore.fetchAndInsertPaymentMethod(paymentMethodId, eventTime);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID);
        assert.calledOnceWithExactly(
          stripe.paymentMethods.retrieve,
          paymentMethodId
        );
        assert.calledOnce(stripeFirestore.customerCollectionDbRef.where);
        assert.equal(tx.get.callCount, 0);
        assert.equal(tx.set.callCount, 0);
      }
    });

    it('allows missing uid when ignoreErrors is true', async () => {
      stripe.paymentMethods.retrieve.resolves(mockPaymentMethod);

      const customerSnap = {
        empty: false,
        docs: [
          {
            data: () => ({ metadata: {} }),
          },
        ],
      };
      stripeFirestore.customerCollectionDbRef.where.returns({
        get: sinon.stub().resolves(customerSnap),
      });

      const result = await stripeFirestore.fetchAndInsertPaymentMethod(
        paymentMethodId,
        eventTime,
        true
      );

      assert.deepEqual(result, mockPaymentMethod);
      assert.calledOnceWithExactly(
        stripe.paymentMethods.retrieve,
        paymentMethodId
      );
      assert.calledOnce(stripeFirestore.customerCollectionDbRef.where);
      assert.equal(tx.get.callCount, 0);
      assert.equal(tx.set.callCount, 0);
    });
  });

  describe('insertPaymentMethodRecordWithBackfill', () => {
    it('inserts a record', async () => {
      stripeFirestore.insertPaymentMethodRecord = sinon.fake.resolves({});
      stripeFirestore.legacyFetchAndInsertCustomer = sinon.fake.resolves({});
      const result =
        await stripeFirestore.insertPaymentMethodRecordWithBackfill(
          deepCopy(paymentMethod)
        );
      assert.isUndefined(result, {});
      assert.calledOnce(stripeFirestore.insertPaymentMethodRecord);
      assert.notCalled(stripeFirestore.legacyFetchAndInsertCustomer);
    });

    it('backfills on customer not found', async () => {
      const insertStub = sinon.stub();
      stripeFirestore.insertPaymentMethodRecord = insertStub;
      insertStub
        .onCall(0)
        .rejects(
          newFirestoreStripeError(
            'no customer',
            FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
          )
        );
      insertStub.onCall(1).resolves({});
      stripeFirestore.legacyFetchAndInsertCustomer = sinon.fake.resolves({});
      await stripeFirestore.insertPaymentMethodRecordWithBackfill(
        deepCopy(paymentMethod)
      );
      assert.calledTwice(stripeFirestore.insertPaymentMethodRecord);
      assert.calledOnce(stripeFirestore.legacyFetchAndInsertCustomer);
    });
  });

  describe('removePaymentMethodRecord', () => {
    it('removes a record', async () => {
      const paymentMethodSnap = {
        empty: false,
        docs: [
          {
            ref: {
              delete: sinon.fake.resolves({}),
            },
          },
        ],
      };
      firestore.collectionGroup = sinon.fake.returns({
        where: sinon.fake.returns({
          get: sinon.fake.resolves(paymentMethodSnap),
        }),
      });
      await stripeFirestore.removePaymentMethodRecord(deepCopy(paymentMethod));
      assert.calledOnce(firestore.collectionGroup);
      assert.calledOnce(paymentMethodSnap.docs[0].ref.delete);
    });
  });

  describe('retrieveCustomer', () => {
    it('fetches a customer by uid', async () => {
      customerCollectionDbRef.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: true,
          data: () => customer,
        }),
      });
      const result = await stripeFirestore.retrieveCustomer({
        uid: customer1.metadata.userid,
      });
      assert.deepEqual(result, customer);
    });

    it('fetches a customer by customerId', async () => {
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves({
          empty: false,
          docs: [
            {
              data: sinon.fake.returns(customer),
            },
          ],
        }),
      });
      const result = await stripeFirestore.retrieveCustomer({
        customerId: customer.id,
      });
      assert.deepEqual(result, customer);
    });

    it('errors when customer is not found', async () => {
      customerCollectionDbRef.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: false,
        }),
      });
      try {
        await stripeFirestore.retrieveCustomer({
          uid: customer.metadata.userid,
        });
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(
          err.name,
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
        customerCollectionDbRef.where = sinon.fake.returns({
          get: sinon.fake.resolves({
            empty: false,
            docs: [
              {
                ref: {
                  collection: sinon.fake.returns({
                    get: sinon.fake.resolves(subscriptionSnap),
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
        assert.deepEqual(subscriptions, [customer.subscriptions.data[0]]);
      });

      it('with status filter', async () => {
        const subscriptions =
          await stripeFirestore.retrieveCustomerSubscriptions(customer.id, [
            'active',
          ]);
        assert.deepEqual(subscriptions, [customer.subscriptions.data[0]]);
      });

      it('with empty status filter', async () => {
        const subscriptions =
          await stripeFirestore.retrieveCustomerSubscriptions(customer.id, []);
        assert.deepEqual(subscriptions, []);
      });
    });

    it('retrieves only active customer subscriptions', async () => {
      const sub1 = deepCopy(customer.subscriptions.data[0]);
      const sub2 = deepCopy(customer.subscriptions.data[0]);
      sub2.status = 'cancelled';
      const subscriptionSnap = {
        docs: [{ data: () => sub1 }, { data: () => sub2 }],
      };
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves({
          empty: false,
          docs: [
            {
              ref: {
                collection: sinon.fake.returns({
                  get: sinon.fake.resolves(subscriptionSnap),
                }),
              },
            },
          ],
        }),
      });
      const subscriptions = await stripeFirestore.retrieveCustomerSubscriptions(
        customer.id
      );
      assert.deepEqual(subscriptions, [sub1]);
    });

    it('errors on customer not found', async () => {
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves({
          empty: true,
        }),
      });
      try {
        await stripeFirestore.retrieveCustomerSubscriptions(customer.id);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(
          err.name,
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
      firestore.collectionGroup = sinon.fake.returns({
        where: sinon.fake.returns({
          get: sinon.fake.resolves(subscriptionSnap),
        }),
      });
      const result = await stripeFirestore.retrieveSubscription(
        subscription1.id
      );
      assert.deepEqual(result, subscription1);
    });

    it('errors on subscription not found', async () => {
      firestore.collectionGroup = sinon.fake.returns({
        where: sinon.fake.returns({
          get: sinon.fake.resolves({ empty: true }),
        }),
      });
      try {
        await stripeFirestore.retrieveSubscription(subscription1.id);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(
          err.name,
          FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND
        );
      }
    });
  });

  describe('retrieveInvoice', () => {
    let invoice;

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
      firestore.collectionGroup = sinon.fake.returns({
        where: sinon.fake.returns({
          get: sinon.fake.resolves(invoiceSnap),
        }),
      });
      const result = await stripeFirestore.retrieveInvoice(invoice.id);
      assert.deepEqual(result, invoice);
    });

    it('errors on invoice not found', async () => {
      firestore.collectionGroup = sinon.fake.returns({
        where: sinon.fake.returns({
          get: sinon.fake.resolves({ empty: true }),
        }),
      });
      try {
        await stripeFirestore.retrieveInvoice(invoice.id);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(
          err.name,
          FirestoreStripeError.FIRESTORE_INVOICE_NOT_FOUND
        );
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
      firestore.collectionGroup = sinon.fake.returns({
        where: sinon.fake.returns({
          get: sinon.fake.resolves(paymentMethodSnap),
        }),
      });
      const result = await stripeFirestore.retrievePaymentMethod(
        paymentMethod.id
      );
      assert.deepEqual(result, paymentMethod);
    });

    it('errors on payment method not found', async () => {
      firestore.collectionGroup = sinon.fake.returns({
        where: sinon.fake.returns({
          get: sinon.fake.resolves({ empty: true }),
        }),
      });
      try {
        await stripeFirestore.retrievePaymentMethod(paymentMethod.id);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(
          err.name,
          FirestoreStripeError.FIRESTORE_PAYMENT_METHOD_NOT_FOUND
        );
      }
    });
  });

  describe('removeCustomerRecursive', () => {
    beforeEach(() => {
      const bulkWriterMock = new BulkWriterMock();
      firestore.bulkWriter = sinon.fake.returns(bulkWriterMock);
      customerCollectionDbRef.doc = sinon.fake.returns({ path: '/test/path' });
    });

    it('successfully delete documents', async () => {
      firestore.recursiveDelete = async (doc, bulk) => {
        bulk.resultCallback(doc);
      };
      const result = await stripeFirestore.removeCustomerRecursive('uid');
      assert.deepEqual(result, ['/test/path']);
    });

    it('single errors on non-bulkWriter failure', async () => {
      const expectedError = new Error('Some non-bulkWriter error');
      firestore.recursiveDelete = async (doc, bulk) => {
        throw expectedError;
      };
      try {
        await stripeFirestore.removeCustomerRecursive('uid');
        assert.fail('should have thrown');
      } catch (error) {
        assert.notInstanceOf(error, StripeFirestoreMultiError);
        assert.equal(error.message, expectedError.message);
      }
    });

    it('errors on failure', async () => {
      const failureDocumentPath = '/test/path';
      firestore.recursiveDelete = async (doc, bulk) => {
        const error = new Error('It failed a delete');
        error.failedAttempts = 99;
        error.documentRef = { path: failureDocumentPath };
        bulk.errorCallback(error);
        throw new Error('Something happened in the bulkWriter');
      };
      try {
        await stripeFirestore.removeCustomerRecursive('uid');
        assert.fail('should have thrown');
      } catch (error) {
        assert.instanceOf(error, StripeFirestoreMultiError);
        assert.equal(error.errors()[1].documentPath, failureDocumentPath);
      }
    });
  });
});
