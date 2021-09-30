/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };

const {
  StripeFirestore,
  FirestoreStripeError,
} = require('../../../lib/payments/stripe-firestore');

const customer1 = require('./fixtures/stripe/customer1.json');
const subscription1 = require('./fixtures/stripe/subscription1.json');
const paidInvoice = require('./fixtures/stripe/invoice_paid.json');

describe('StripeFirestore', () => {
  let firestore;
  let stripe;
  let customerCollectionDbRef;
  let stripeFirestore;

  beforeEach(() => {
    firestore = {};
    stripe = {};
    customerCollectionDbRef = {};
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

  describe('fetchAndInsertCustomer', () => {
    it('fetches and returns a customer', async () => {
      stripe.customers = {
        retrieve: sinon.fake.resolves(customer1),
      };
      stripeFirestore.insertCustomerRecord = sinon.fake.resolves({});
      customerCollectionDbRef.doc = sinon.fake.returns({
        collection: sinon.fake.returns({
          doc: sinon.fake.returns({
            set: sinon.fake.resolves({}),
          }),
        }),
      });
      const customer = await stripeFirestore.fetchAndInsertCustomer(
        customer1.id
      );
      assert.deepEqual(customer, customer1);
      assert.calledOnce(stripe.customers.retrieve);
      assert.calledOnce(stripeFirestore.insertCustomerRecord);
      assert.calledOnce(customerCollectionDbRef.doc);
    });

    it('errors on customer deleted', async () => {
      const deletedCustomer = { ...customer1, deleted: true };
      stripe.customers = {
        retrieve: sinon.fake.resolves(deletedCustomer),
      };
      try {
        await stripeFirestore.fetchAndInsertCustomer(customer1.id);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, FirestoreStripeError.STRIPE_CUSTOMER_DELETED);
      }
    });

    it('errors on missing uid', async () => {
      const missingUidCustomer = { ...customer1, metadata: {} };
      stripe.customers = {
        retrieve: sinon.fake.resolves(missingUidCustomer),
      };
      try {
        await stripeFirestore.fetchAndInsertCustomer(customer1.id);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(
          err.name,
          FirestoreStripeError.STRIPE_CUSTOMER_MISSING_UID
        );
      }
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
        subscription1
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
        await stripeFirestore.insertSubscriptionRecord(subscription1);
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

  describe('insertInvoiceRecord', () => {
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
      const result = await stripeFirestore.insertInvoiceRecord(paidInvoice);
      assert.deepEqual(result, {});
      assert.calledOnce(customerCollectionDbRef.where);
      assert.calledOnce(customerSnap.docs[0].ref.collection);
    });

    it('errors on customer not found', async () => {
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves({ empty: true }),
      });
      try {
        await stripeFirestore.insertInvoiceRecord(paidInvoice);
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

  describe('retrieveCustomer', () => {
    it('fetches a customer by uid', async () => {
      customerCollectionDbRef.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: true,
          data: () => customer1,
        }),
      });
      const customer = await stripeFirestore.retrieveCustomer({
        uid: customer1.metadata.userid,
      });
      assert.deepEqual(customer, customer1);
    });

    it('fetches a customer by customerId', async () => {
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves({
          empty: false,
          docs: [
            {
              data: sinon.fake.returns(customer1),
            },
          ],
        }),
      });
      const customer = await stripeFirestore.retrieveCustomer({
        customerId: customer1.id,
      });
      assert.deepEqual(customer, customer1);
    });

    it('errors when customer is not found', async () => {
      customerCollectionDbRef.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: false,
        }),
      });
      try {
        await stripeFirestore.retrieveCustomer({
          uid: customer1.metadata.userid,
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
        docs: [{ data: () => ({ ...customer1.subscriptions.data[0] }) }],
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
        customer1.id
      );
      assert.deepEqual(subscriptions, [
        {
          ...customer1.subscriptions.data[0],
        },
      ]);
    });

    it('errors on customer not found', async () => {
      customerCollectionDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves({
          empty: true,
        }),
      });
      try {
        await stripeFirestore.retrieveCustomerSubscriptions(customer1.id);
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
            data: () => ({ ...subscription1 }),
          },
        ],
      };
      firestore.collectionGroup = sinon.fake.returns({
        where: sinon.fake.returns({
          get: sinon.fake.resolves(subscriptionSnap),
        }),
      });
      const subscription = await stripeFirestore.retrieveSubscription(
        subscription1.id
      );
      assert.deepEqual(subscription, subscription1);
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
    it('retrieves an invoice', async () => {
      const invoiceSnap = {
        empty: false,
        docs: [
          {
            data: () => ({ ...paidInvoice }),
          },
        ],
      };
      firestore.collectionGroup = sinon.fake.returns({
        where: sinon.fake.returns({
          get: sinon.fake.resolves(invoiceSnap),
        }),
      });
      const invoice = await stripeFirestore.retrieveInvoice(paidInvoice.id);
      assert.deepEqual(invoice, paidInvoice);
    });

    it('errors on invoice not found', async () => {
      firestore.collectionGroup = sinon.fake.returns({
        where: sinon.fake.returns({
          get: sinon.fake.resolves({ empty: true }),
        }),
      });
      try {
        await stripeFirestore.retrieveInvoice(paidInvoice.id);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(
          err.name,
          FirestoreStripeError.FIRESTORE_INVOICE_NOT_FOUND
        );
      }
    });
  });
});
