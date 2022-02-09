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
} = require('../../../lib/payments/stripe-firestore');

const customer1 = require('./fixtures/stripe/customer1.json');
const subscription1 = require('./fixtures/stripe/subscription1.json');
const paidInvoice = require('./fixtures/stripe/invoice_paid.json');
const paymentMethod = require('./fixtures/stripe/payment_method.json');

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
      stripeFirestore.fetchAndInsertCustomer = sinon.fake.resolves({});
      const result = await stripeFirestore.retrieveAndFetchCustomer(
        customer.id
      );
      assert.deepEqual(result, customer);
      assert.calledOnce(stripeFirestore.retrieveCustomer);
      assert.notCalled(stripeFirestore.fetchAndInsertCustomer);
    });

    it('fetches a customer that hasnt been retrieved', async () => {
      stripeFirestore.retrieveCustomer = sinon.fake.rejects(
        newFirestoreStripeError(
          'Not found',
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        )
      );
      stripeFirestore.fetchAndInsertCustomer = sinon.fake.resolves(customer);
      const result = await stripeFirestore.retrieveAndFetchCustomer(
        customer.id
      );
      assert.deepEqual(result, customer);
      assert.calledOnce(stripeFirestore.retrieveCustomer);
      assert.calledOnce(stripeFirestore.fetchAndInsertCustomer);
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
      stripeFirestore.fetchAndInsertCustomer = sinon.fake.resolves({});
      const result = await stripeFirestore.retrieveAndFetchSubscription(
        subscription.id
      );
      assert.deepEqual(result, subscription);
      assert.calledOnce(stripeFirestore.retrieveSubscription);
      assert.notCalled(stripeFirestore.fetchAndInsertCustomer);
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
      stripeFirestore.fetchAndInsertCustomer = sinon.fake.resolves({});
      const result = await stripeFirestore.retrieveAndFetchSubscription(
        subscription.id
      );
      assert.deepEqual(result, subscription);
      assert.calledOnce(stripeFirestore.retrieveSubscription);
      assert.calledOnce(stripeFirestore.fetchAndInsertCustomer);
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

  describe('fetchAndInsertCustomer', () => {
    beforeEach(() => {
      stripe.subscriptions = {
        list: sinon.fake.returns({
          autoPagingToArray: sinon.fake.resolves([subscription1]),
        }),
      };
    });

    it('fetches and returns a customer', async () => {
      stripe.customers = {
        retrieve: sinon.fake.resolves(customer),
      };
      stripeFirestore.insertCustomerRecord = sinon.fake.resolves({});
      customerCollectionDbRef.doc = sinon.fake.returns({
        collection: sinon.fake.returns({
          doc: sinon.fake.returns({
            set: sinon.fake.resolves({}),
          }),
        }),
      });
      const result = await stripeFirestore.fetchAndInsertCustomer(customer.id);
      assert.deepEqual(result, customer);
      assert.calledOnce(stripe.customers.retrieve);
      assert.calledOnceWithExactly(stripe.subscriptions.list, {
        customer: customer.id,
      });
      assert.calledOnce(stripeFirestore.insertCustomerRecord);
      assert.calledOnce(customerCollectionDbRef.doc);
    });

    it('errors on customer deleted', async () => {
      const deletedCustomer = { ...customer, deleted: true };
      stripe.customers = {
        retrieve: sinon.fake.resolves(deletedCustomer),
      };

      try {
        await stripeFirestore.fetchAndInsertCustomer(customer.id);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, FirestoreStripeError.STRIPE_CUSTOMER_DELETED);
      }
    });

    it('errors on missing uid', async () => {
      const missingUidCustomer = { ...customer, metadata: {} };
      stripe.customers = {
        retrieve: sinon.fake.resolves(missingUidCustomer),
      };

      try {
        await stripeFirestore.fetchAndInsertCustomer(customer.id);
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
    it('inserts a record', async () => {
      stripeFirestore.retrieveCustomer = sinon.fake.resolves(customer);
      stripeFirestore.insertCustomerRecord = sinon.fake.resolves({});
      await stripeFirestore.insertCustomerRecordWithBackfill(
        'fxauid',
        customer
      );
      assert.calledOnce(stripeFirestore.retrieveCustomer);
      assert.calledOnce(stripeFirestore.insertCustomerRecord);
    });

    it('backfills on customer not found', async () => {
      stripeFirestore.retrieveCustomer = sinon.fake.rejects(
        newFirestoreStripeError(
          'no customer',
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND
        )
      );
      stripeFirestore.fetchAndInsertCustomer = sinon.fake.resolves({});
      await stripeFirestore.insertCustomerRecordWithBackfill(
        'fxauid',
        customer
      );
      assert.calledOnce(stripeFirestore.retrieveCustomer);
      assert.calledOnce(stripeFirestore.fetchAndInsertCustomer);
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
      stripeFirestore.fetchAndInsertCustomer = sinon.fake.resolves({});
      const result = await stripeFirestore.insertSubscriptionRecordWithBackfill(
        deepCopy(subscription1)
      );
      assert.isUndefined(result, {});
      assert.calledOnce(stripeFirestore.insertSubscriptionRecord);
      assert.calledOnce(stripeFirestore.fetchAndInsertCustomer);
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

  describe('insertPaymentMethodRecordWithBackfill', () => {
    it('inserts a record', async () => {
      stripeFirestore.insertPaymentMethodRecord = sinon.fake.resolves({});
      stripeFirestore.fetchAndInsertCustomer = sinon.fake.resolves({});
      const result =
        await stripeFirestore.insertPaymentMethodRecordWithBackfill(
          deepCopy(paymentMethod)
        );
      assert.isUndefined(result, {});
      assert.calledOnce(stripeFirestore.insertPaymentMethodRecord);
      assert.notCalled(stripeFirestore.fetchAndInsertCustomer);
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
      stripeFirestore.fetchAndInsertCustomer = sinon.fake.resolves({});
      await stripeFirestore.insertPaymentMethodRecordWithBackfill(
        deepCopy(paymentMethod)
      );
      assert.calledTwice(stripeFirestore.insertPaymentMethodRecord);
      assert.calledOnce(stripeFirestore.fetchAndInsertCustomer);
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
    it('retrieves customer subscriptions', async () => {
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
      const subscriptions = await stripeFirestore.retrieveCustomerSubscriptions(
        customer.id
      );
      assert.deepEqual(subscriptions, [customer.subscriptions.data[0]]);
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
});
