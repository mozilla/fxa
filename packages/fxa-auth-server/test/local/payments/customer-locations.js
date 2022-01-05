/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');

const STATES_LONG_NAME_TO_SHORT_NAME_MAP = require('../../../lib/payments/states-long-name-to-short-name-map.json');
const { deepCopy } = require('./util');
const { mockLog } = require('../../mocks');
const {
  CustomerLocations,
} = require('../../../lib/payments/customer-locations');

const sandbox = sinon.createSandbox();

const mockPayPalCustomer = {
  id: 'cus_123',
  address: {
    country: 'CA',
  },
};
const mockUid = 'abc123';

describe('CustomerLocations', () => {
  let mockStripeHelper;
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
  mockLog.debug = sandbox.fake.returns({});

  beforeEach(() => {
    mockStripeHelper = {
      fetchCustomer: () => mockPayPalCustomer,
    };
    customerLocations = new CustomerLocations(mockLog, mockStripeHelper);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('constructor', () => {
    it('sets log and Stripe helper', () => {
      assert.strictEqual(customerLocations.log, mockLog);
      assert.strictEqual(customerLocations.stripeHelper, mockStripeHelper);
    });
  });

  describe('getBestLocationForPayPalUser', () => {
    it('returns unknown country and state when no country is found in Stripe', async () => {
      mockStripeHelper.fetchCustomer = sandbox.fake.resolves({
        ...deepCopy(mockPayPalCustomer),
        address: null,
      });
      const expected = {
        uid: mockUid,
        state: 'unknown',
        country: 'unknown',
        count: 1,
      };
      const result = await customerLocations.getBestLocationForPayPalUser(
        mockUid,
        mockLocationResults
      );
      assert.deepEqual(result, expected);
    });
    it('returns Stripe country and unknown state when no inferred locations are provided', async () => {
      const expected = {
        uid: mockUid,
        state: 'unknown',
        country: mockPayPalCustomer.address.country,
        count: 1,
      };
      const result = await customerLocations.getBestLocationForPayPalUser(
        mockUid,
        []
      );
      assert.deepEqual(result, expected);
    });
    it('returns null when the location for the Stripe country is not needed', async () => {
      mockStripeHelper.fetchCustomer = sandbox.fake.resolves({
        ...deepCopy(mockPayPalCustomer),
        address: {
          country: 'DE',
        },
      });
      const result = await customerLocations.getBestLocationForPayPalUser(
        mockUid,
        mockLocationResults
      );
      assert.deepEqual(result, null);
    });
    it('returns Stripe country and unknown state when no matching country is found', async () => {
      const nonmatchingCountry = 'US';
      mockStripeHelper.fetchCustomer = sandbox.fake.resolves({
        ...deepCopy(mockPayPalCustomer),
        address: {
          country: nonmatchingCountry,
        },
      });
      const expected = {
        uid: mockUid,
        state: 'unknown',
        country: nonmatchingCountry,
        count: 1,
      };
      const result = await customerLocations.getBestLocationForPayPalUser(
        mockUid,
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
        mockUid,
        mockLocationResults
      );
      assert.deepEqual(result, expected);
    });
    it('returns Stripe country and the mode state when a matching country is found', async () => {
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
        mockUid,
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
        mockLog.debug,
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
      const expected = 'US-PA';
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
        mockLog.debug,
        'customerLocations.mapLongToShortStateName',
        {
          message: 'State not found in long name to short name map.',
          state: expected,
        }
      );
      assert.deepEqual(result, expected);
    });
  });

  describe('getPayPalCustomerCountry', () => {
    it('returns null if the customer is not found in Stripe', async () => {
      mockStripeHelper.fetchCustomer = sandbox.fake.resolves(undefined);
      const result = await customerLocations.getPayPalCustomerCountry(mockUid);
      assert.equal(result, null);
    });
    it('returns null if the country is not found for the Stripe customer', async () => {
      mockStripeHelper.fetchCustomer = sandbox.fake.resolves({
        address: null,
      });
      const result = await customerLocations.getPayPalCustomerCountry(mockUid);
      assert.equal(result, null);
    });
    it('returns the Stripe country if found', async () => {
      const expected = mockPayPalCustomer.address.country;
      const result = await customerLocations.getPayPalCustomerCountry(mockUid);
      assert.deepEqual(result, expected);
    });
  });
});
