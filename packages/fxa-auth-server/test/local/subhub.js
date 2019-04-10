/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');
const error = require('../../lib/error');
const { mockLog } = require('../mocks');

const subhubModule = require('../../lib/subhub');

const mockConfig = {
  publicUrl: 'https://accounts.example.com',
  subhub: {
    enabled: true,
    url: 'https://foo.bar',
    key: 'foo',
  }
};

const mockServer = nock(mockConfig.subhub.url, {
  reqheaders: {
    Authorization: `Bearer ${mockConfig.subhub.key}`
  }
}).defaultReplyHeaders({
  'Content-Type': 'application/json'
});

describe('subscriptions', () => {
  const UID = '8675309';
  const EMAIL = 'foo@example.com';
  const PLAN_ID = 'plan12345';
  const SUBSCRIPTION_ID = 'sub12345';
  const PAYMENT_TOKEN_GOOD = 'foobarbaz';
  const PAYMENT_TOKEN_NEW = 'quuxxyzzy';
  const PAYMENT_TOKEN_BAD = 'badf00d';

  const makeSubject = (subhubConfig = {}) => {
    const log = mockLog();
    const subhub = subhubModule(log, {
      ...mockConfig,
      subhub: {
        ...mockConfig.subhub,
        ...subhubConfig
      }
    });
    return { log, subhub };
  };

  afterEach(() => {
    assert.ok(nock.isDone(), 'there should be no pending request mocks at the end of a test');
  });

  it('should build stub API when configured to do so', async () => {
    const { subhub } = makeSubject();
    assert.equal(subhub.isStubAPI, false);

    const { subhub: subhubWithStubs } = makeSubject({ useStubs: true });
    assert.equal(subhubWithStubs.isStubAPI, true);
  });

  it('should throw errors when feature not enabled', async () => {
    const { subhub } = makeSubject({ enabled: false });
    const names = [
      'listPlans',
      'listSubscriptions',
      'createSubscription',
      'getCustomer',
      'updateCustomer',
      'cancelSubscription',
    ];
    for (const name of names) {
      try {
        await subhub[name]();
        assert.fail();
      } catch (err) {
        assert.equal(err.message, 'Feature not enabled');
      }
    }
  });

  describe('listPlans', () => {
    it('should list plans', async () => {
      const expected = [
        {
          'plan_id': 'firefox_pro_basic_823',
          'product_id': 'firefox_pro_basic',
          'interval': 'month',
          'amount': 500,
          'currency': 'usd'
        }
      ];
      mockServer.get('/plans').reply(200, expected);
      const { subhub } = makeSubject();
      const resp = await subhub.listPlans();
      assert.deepEqual(resp, expected);
    });

    it('should throw on backend service failure', async () => {
      mockServer.get('/plans').reply(500, 'Internal Server Error');
      const { log, subhub } = makeSubject();
      try {
        await subhub.listPlans();
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.listPlans.1');
      }
    });
  });

  describe('listSubscriptions', () => {
    it('should list subscriptions for account', async () => {
      const expected = [
        {
          'plan_id': 'firefox_pro_basic_823',
          'product_id': 'firefox_pro_basic',
          'current_period_end': 1557361022,
          'end_at': 1557361022
        }
      ];
      mockServer.get(`/customer/${UID}/subscriptions`).reply(200, expected);
      const { subhub } = makeSubject();
      const resp = await subhub.listSubscriptions(UID);
      assert.deepEqual(resp, expected);
    });

    it('should throw on unknown user', async () => {
      mockServer.get(`/customer/${UID}/subscriptions`)
        .reply(404, { message: 'invalid uid' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.listSubscriptions(UID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.listSubscriptions.1');
      }
    });

    it('should throw on invalid response', async () => {
      const expected = { 'this is not right': true };
      mockServer.get(`/customer/${UID}/subscriptions`).reply(200, expected);
      const { log, subhub } = makeSubject();
      try {
        await subhub.listSubscriptions(UID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.listSubscriptions');
        assert.equal(log.error.getCall(0).args[1].error, 'response schema validation failed');
      }
    });

    it('should throw on backend service failure', async () => {
      mockServer.get(`/customer/${UID}/subscriptions`)
        .reply(500, 'Internal Server Error');
      const { log, subhub } = makeSubject();
      try {
        await subhub.listSubscriptions(UID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.listSubscriptions.1');
      }
    });
  });

  describe('createSubscription', () => {
    it('should subscribe to a plan with valid payment token', async () => {
      const expected = {
        sub_id: SUBSCRIPTION_ID
      };
      const expectedBody = {
        pmt_token: PAYMENT_TOKEN_GOOD,
        plan_id: PLAN_ID,
        email: EMAIL
      };
      let requestBody;
      mockServer
        .post(`/customer/${UID}/subscriptions`, body => requestBody = body)
        .reply(201, expected);
      const { subhub } = makeSubject();
      const resp =
        await subhub.createSubscription(UID, PAYMENT_TOKEN_GOOD, PLAN_ID, EMAIL);
      assert.deepEqual(requestBody, expectedBody);
      assert.deepEqual(resp, expected);
    });

    it('should throw on unknown plan ID', async () => {
      mockServer
        .post(`/customer/${UID}/subscriptions`)
        // TODO: update with subhub createSubscription error response for invalid plan ID
        .reply(400, { message: 'invalid plan id' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.createSubscription(UID, PAYMENT_TOKEN_BAD, PLAN_ID, EMAIL);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.createSubscription.1');
      }
    });

    it('should throw on invalid payment token', async () => {
      mockServer
        .post(`/customer/${UID}/subscriptions`)
        // TODO: update with subhub createSubscription error response for invalid payment token
        .reply(400, { message: 'invalid payment token' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.createSubscription(UID, PAYMENT_TOKEN_BAD, PLAN_ID, EMAIL);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.REJECTED_SUBSCRIPTION_PAYMENT_TOKEN);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.createSubscription.1');
      }
    });

    it('should throw on backend service failure', async () => {
      mockServer.post(`/customer/${UID}/subscriptions`)
        .reply(500, 'Internal Server Error');
      const { log, subhub } = makeSubject();
      try {
        await subhub.createSubscription(UID, PAYMENT_TOKEN_GOOD, PLAN_ID, EMAIL);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.createSubscription.1');
      }
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel an existing subscription', async () => {
      // TODO: update with subhub cancelSubscription response format
      const expected = {};
      mockServer
        .delete(`/customer/${UID}/subscriptions/${SUBSCRIPTION_ID}`)
        // TODO: subhub specifies 201 for cancelSubscription success - maybe 204 would be better?
        .reply(201, expected);
      const { subhub } = makeSubject();
      const result = await subhub.cancelSubscription(UID, SUBSCRIPTION_ID);
      assert.deepEqual(result, expected);
    });

    it('should throw on unknown user', async () => {
      mockServer
        .delete(`/customer/${UID}/subscriptions/${SUBSCRIPTION_ID}`)
        .reply(404, { message: 'invalid uid' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.cancelSubscription(UID, SUBSCRIPTION_ID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.cancelSubscription.1');
      }
    });

    it('should throw on unknown subscription', async () => {
      mockServer
        .delete(`/customer/${UID}/subscriptions/${SUBSCRIPTION_ID}`)
        .reply(400, { message: 'invalid subscription id' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.cancelSubscription(UID, SUBSCRIPTION_ID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.cancelSubscription.1');
      }
    });

    it('should throw on backend service failure', async () => {
      mockServer
        .delete(`/customer/${UID}/subscriptions/${SUBSCRIPTION_ID}`)
        .reply(500, 'Internal Server Error');
      const { log, subhub } = makeSubject();
      try {
        await subhub.cancelSubscription(UID, SUBSCRIPTION_ID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.cancelSubscription.1');
      }
    });
  });

  describe('getCustomer', () => {
    it('should yield customer details', async () => {
      // TODO: update with final customer schema from subhub
      const expected = {
        this_is_a_customer: true
      };
      mockServer.get(`/customer/${UID}`).reply(200, expected);
      const { subhub } = makeSubject();
      const resp = await subhub.getCustomer(UID);
      assert.deepEqual(resp, expected);
    });

    it('should throw on unknown user', async () => {
      mockServer.get(`/customer/${UID}`)
        .reply(404, { message: 'invalid uid' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.getCustomer(UID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.getCustomer.1');
      }
    });

    it('should throw on backend service failure', async () => {
      mockServer.get(`/customer/${UID}`).reply(500, 'Internal Server Error');
      const { log, subhub } = makeSubject();
      try {
        await subhub.getCustomer(UID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.getCustomer.1');
      }
    });
  });

  describe('updateCustomer', () => {
    it('should update payment method', async () => {
      // TODO: update with final customer schema from subhub
      const expected = {};
      const expectedBody = {
        pmt_token: PAYMENT_TOKEN_NEW
      };
      let requestBody;
      mockServer
        .post(`/customer/${UID}`, body => requestBody = body)
        .reply(201, expected);
      const { subhub } = makeSubject();
      const resp = await subhub.updateCustomer(UID, PAYMENT_TOKEN_NEW);
      assert.deepEqual(requestBody, expectedBody);
      assert.deepEqual(resp, expected);
    });

    it('should throw on unknown user', async () => {
      mockServer.post(`/customer/${UID}`)
        .reply(404, { message: 'invalid uid' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.updateCustomer(UID, PAYMENT_TOKEN_NEW);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.updateCustomer.1');
      }
    });

    it('should throw on invalid payment token', async () => {
      mockServer.post(`/customer/${UID}`)
        .reply(400, { message: 'invalid payment token' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.updateCustomer(UID, PAYMENT_TOKEN_NEW);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.REJECTED_SUBSCRIPTION_PAYMENT_TOKEN);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.updateCustomer.1');
      }
    });

    it('should throw on backend service failure', async () => {
      mockServer.post(`/customer/${UID}`).reply(500, 'Internal Server Error');
      const { log, subhub } = makeSubject();
      try {
        await subhub.updateCustomer(UID, PAYMENT_TOKEN_NEW);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.updateCustomer.1');
      }
    });
  });
});
