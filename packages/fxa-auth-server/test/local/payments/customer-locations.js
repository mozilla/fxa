/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');

const STATES_LONG_NAME_TO_SHORT_NAME_MAP = require('../../../lib/payments/states-long-name-to-short-name-map.json');
const { deepCopy } = require('./util');
const { mockLog, mockStripeHelper } = require('../../mocks');
const {
  CustomerLocations,
} = require('../../../lib/payments/customer-locations');
const { PayPalBillingAgreements } = require('fxa-shared/db/models/auth');

const sandbox = sinon.createSandbox();

const mockUid = 'abc123';
const mockPayPalCustomer = {
  id: 'cus_123',
  address: {
    country: 'CA',
  },
  metadata: {
    userid: mockUid,
  },
};

describe('CustomerLocations', () => {
  let customerLocations;
  const mockLocationResults = [
    {
      uid: mockUid,
      state: 'Saxony-Anhalt',
      country: 'Germany',
      count: 2,
    },
    {
      uid: mockUid,
      state: 'British Columbia',
      country: 'Canada',
      count: 6,
    },
  ];
  mockLog.error = sandbox.fake.returns({});
  mockLog.info = sandbox.fake.returns({});
  mockLog.debug = sandbox.fake.returns({});

  beforeEach(() => {
    customerLocations = new CustomerLocations({
      log: mockLog,
      stripeHelper: mockStripeHelper,
    });
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('constructor', () => {
    it('sets the logger and Stripe helper', () => {
      assert.strictEqual(customerLocations.log, mockLog);
      assert.strictEqual(customerLocations.stripeHelper, mockStripeHelper);
    });
  });

  describe('getBestLocationForPayPalUser', () => {
    it('returns unknown country and state when no country is found in Stripe', async () => {
      const customer = {
        ...deepCopy(mockPayPalCustomer),
        address: null,
      };
      const expected = {
        uid: mockUid,
        state: undefined,
        country: undefined,
        count: 1,
      };
      const result = await customerLocations.getBestLocationForPayPalUser(
        customer,
        mockLocationResults
      );
      assert.deepEqual(result, expected);
    });
    it('returns Stripe country and unknown state when no inferred locations are provided', async () => {
      const expected = {
        uid: mockUid,
        state: undefined,
        country: mockPayPalCustomer.address.country,
        count: 1,
      };
      const result = await customerLocations.getBestLocationForPayPalUser(
        mockPayPalCustomer,
        []
      );
      assert.deepEqual(result, expected);
    });
    it('returns Stripe country and unknown state when no matching country is found', async () => {
      const nonmatchingCountry = 'US';
      const customer = {
        ...deepCopy(mockPayPalCustomer),
        address: {
          country: nonmatchingCountry,
        },
      };
      const expected = {
        uid: mockUid,
        state: undefined,
        country: nonmatchingCountry,
        count: 1,
      };
      const result = await customerLocations.getBestLocationForPayPalUser(
        customer,
        mockLocationResults
      );
      assert.deepEqual(result, expected);
    });
    it('returns Stripe country and the mode state when a matching country is found', async () => {
      const expected = {
        uid: mockUid,
        state:
          STATES_LONG_NAME_TO_SHORT_NAME_MAP['Canada'][
            mockLocationResults[1].state
          ],
        country: mockPayPalCustomer.address.country,
        count: 1,
      };
      const result = await customerLocations.getBestLocationForPayPalUser(
        mockPayPalCustomer,
        mockLocationResults
      );
      assert.deepEqual(result, expected);
    });
    it('returns Stripe country and the state of a matching non-mode country', async () => {
      const mockLocationResultsModeCountryMismatch =
        deepCopy(mockLocationResults);
      mockLocationResultsModeCountryMismatch[0].count = 100;
      const expected = {
        uid: mockUid,
        state:
          STATES_LONG_NAME_TO_SHORT_NAME_MAP['Canada'][
            mockLocationResults[1].state
          ],
        country: mockPayPalCustomer.address.country,
        count: 1,
      };
      const result = await customerLocations.getBestLocationForPayPalUser(
        mockPayPalCustomer,
        mockLocationResultsModeCountryMismatch
      );
      assert.deepEqual(result, expected);
    });
  });

  describe('mapLongToShortCountryName', () => {
    it('returns the country short name when a valid long name is passed', () => {
      let expected = 'US';
      let result = customerLocations.mapLongToShortCountryName('United States');
      assert.deepEqual(result, expected);

      expected = 'CA';
      result = customerLocations.mapLongToShortCountryName('Canada');
      assert.deepEqual(result, expected);
    });
    it('returns the unmodified country long name when an invalid long name is passed', () => {
      const expected = 'Germany';
      const result = customerLocations.mapLongToShortCountryName('Germany');
      sinon.assert.calledOnceWithExactly(
        mockLog.info,
        'customerLocations.mapLongToShortCountryName',
        {
          message: 'Country not found in long name to short name map.',
          country: expected,
        }
      );
      assert.deepEqual(result, expected);
    });
  });

  describe('mapLongToShortStateName', () => {
    it('returns the state short name when a valid country and state long name is passed', () => {
      const expected = 'PA';
      const result = customerLocations.mapLongToShortStateName(
        'United States',
        'Pennsylvania'
      );
      assert.deepEqual(result, expected);
    });
    it('returns the unmodified state long name when an invalid long name is passed', () => {
      const expected = 'Saxony-Anhalt';
      const result = customerLocations.mapLongToShortStateName(
        'Germany',
        'Saxony-Anhalt'
      );
      sinon.assert.calledOnceWithExactly(
        mockLog.info,
        'customerLocations.mapLongToShortStateName',
        {
          message: 'State not found in long name to short name map.',
          state: expected,
        }
      );
      assert.deepEqual(result, expected);
    });
  });

  describe('isPayPalCustomer', () => {
    it('does not check the FxA DB for Stripe customers', async () => {
      const findOneStub = sinon.stub().resolves();
      PayPalBillingAgreements.query = () => ({
        findOne: findOneStub,
      });
      const customer = {
        metadata: {},
        invoice_settings: {
          default_payment_method: {},
        },
      };
      const actual = await customerLocations.isPayPalCustomer(customer);
      const expected = false;
      assert.equal(actual, expected);
      sinon.assert.notCalled(customerLocations.log.debug);
      sinon.assert.notCalled(findOneStub);
    });
  });

  describe('backfillCustomerLocation', () => {
    let customer, backfillArguments;

    beforeEach(() => {
      customer = deepCopy(mockPayPalCustomer);
      customerLocations.stripeHelper.extractCustomerDefaultPaymentDetails =
        sandbox.stub().resolves({});
      backfillArguments = { limit: 5, isDryRun: false, delay: 0 };
      async function* customerGenerator() {
        yield customer;
      }
      customerLocations.stripeHelper.stripe = {
        customers: { list: sandbox.stub().returns(customerGenerator()) },
      };
    });

    it('expands default payment method on customers', async () => {
      sandbox.stub(customerLocations, 'isPayPalCustomer').resolves(true);
      await customerLocations.backfillCustomerLocation(backfillArguments);
      sinon.assert.calledOnceWithExactly(
        customerLocations.stripeHelper.stripe.customers.list,
        {
          expand: ['data.invoice_settings.default_payment_method'],
        }
      );
    });

    it('skips when a customer already has a state in their address', async () => {
      customer.address.state = 'ZE';
      sandbox.stub(customerLocations, 'isPayPalCustomer').resolves(true);
      await customerLocations.backfillCustomerLocation(backfillArguments);
      sinon.assert.calledOnceWithExactly(
        customerLocations.log.info,
        'CustomerLocations.skipHaveState',
        {
          message:
            'Skipping customer as they already have a state in their address.',
          customerId: customer.id,
        }
      );
    });

    it('skips when customer country is not US or CA', async () => {
      customer.address.country = 'ZE';
      sandbox.stub(customerLocations, 'isPayPalCustomer').resolves(true);
      await customerLocations.backfillCustomerLocation(backfillArguments);
      sinon.assert.calledOnceWithExactly(
        customerLocations.log.info,
        'CustomerLocations.skipNotInRequiredCountries',
        {
          messge: 'Skipping customer as they are not in the US or Canada.',
          customerId: customer.id,
        }
      );
    });

    it('skips when a Stripe customer does not have a postal code', async () => {
      sandbox.stub(customerLocations, 'isPayPalCustomer').resolves(false);
      await customerLocations.backfillCustomerLocation(backfillArguments);
      sinon.assert.calledOnceWithExactly(
        customerLocations.log.info,
        'CustomerLocations.noPostalCode',
        {
          message: 'No postal code for Stripe customer.',
          customerId: customer.id,
        }
      );
    });

    it('updates the address for a PayPal customer', async () => {
      sandbox.stub(customerLocations, 'isPayPalCustomer').resolves(true);
      sandbox
        .stub(customerLocations, 'findPayPalUserLocation')
        .resolves({ state: 'BC', country: 'CA' });
      customerLocations.stripeHelper.updateCustomerBillingAddress = sandbox
        .stub()
        .resolves({});
      await customerLocations.backfillCustomerLocation(backfillArguments);
      sinon.assert.calledOnceWithExactly(
        customerLocations.stripeHelper.updateCustomerBillingAddress,
        customer.id,
        {
          line1: '',
          line2: '',
          city: '',
          state: 'BC',
          country: 'CA',
          postalCode: '',
        }
      );
    });

    it('updates the address for a Stripe customer', async () => {
      customerLocations.stripeHelper.extractCustomerDefaultPaymentDetails =
        sandbox.stub().resolves({ country: 'US', postalCode: '12345' });
      sandbox.stub(customerLocations, 'isPayPalCustomer').resolves(false);
      customerLocations.stripeHelper.setCustomerLocation = sandbox
        .stub()
        .resolves({});
      await customerLocations.backfillCustomerLocation(backfillArguments);
      sinon.assert.calledOnceWithExactly(
        customerLocations.stripeHelper.setCustomerLocation,
        {
          customerId: customer.id,
          postalCode: '12345',
          country: 'US',
        }
      );
    });

    it('logs an error on exception', async () => {
      sandbox
        .stub(customerLocations, 'isPayPalCustomer')
        .throws(new Error('catch me'));
      await customerLocations.backfillCustomerLocation(backfillArguments);
      sinon.assert.calledOnceWithExactly(
        customerLocations.log.error,
        'CustomerLocations.failure',
        {
          message: 'catch me',
          customerId: customer.id,
        }
      );
    });

    it('logs an error on exception from setCustomerLocation', async () => {
      customerLocations.stripeHelper.extractCustomerDefaultPaymentDetails =
        sandbox.stub().resolves({ country: 'US', postalCode: '12345' });
      sandbox.stub(customerLocations, 'isPayPalCustomer').resolves(false);
      customerLocations.stripeHelper.setCustomerLocation = sandbox
        .stub()
        .throws(new Error('catch me'));
      await customerLocations.backfillCustomerLocation(backfillArguments);
      sinon.assert.calledOnceWithExactly(
        customerLocations.log.error,
        'CustomerLocations.failure',
        {
          message: 'catch me',
          customerId: customer.id,
        }
      );
    });

    it('does not update the address when it is a dry-run', async () => {
      sandbox.stub(customerLocations, 'isPayPalCustomer').resolves(true);
      sandbox
        .stub(customerLocations, 'findPayPalUserLocation')
        .resolves({ state: 'BC', country: 'CA' });
      customerLocations.stripeHelper.updateCustomerBillingAddress = sandbox
        .stub()
        .resolves({});
      backfillArguments = { ...backfillArguments, isDryRun: true };
      await customerLocations.backfillCustomerLocation(backfillArguments);
      sinon.assert.calledOnceWithExactly(
        customerLocations.log.debug,
        'CustomerLocations.dryRunPayPal',
        {
          message: 'Customer is a PayPal user with a best inferred location.',
          customerId: customer.id,
          state: 'BC',
          country: 'CA',
        }
      );
      sinon.assert.notCalled(
        customerLocations.stripeHelper.updateCustomerBillingAddress
      );
    });
  });
});
