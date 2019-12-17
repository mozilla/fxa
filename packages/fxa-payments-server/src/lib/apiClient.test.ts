import nock from 'nock';

jest.mock('./sentry');

import {
  createSubscription_PENDING,
  createSubscription_FULFILLED,
  createSubscription_REJECTED,
  cancelSubscription_PENDING,
  cancelSubscription_FULFILLED,
  cancelSubscription_REJECTED,
  updatePayment_PENDING,
  updatePayment_FULFILLED,
  updatePayment_REJECTED,
  updateSubscriptionPlan_PENDING,
  updateSubscriptionPlan_FULFILLED,
  updateSubscriptionPlan_REJECTED,
} from './amplitude';
jest.mock('./amplitude');

import { Config, defaultConfig } from './config';

import {
  mockOptionsResponses,
  MOCK_PROFILE,
  MOCK_CUSTOMER,
  MOCK_ACTIVE_SUBSCRIPTIONS,
  MOCK_TOKEN,
  MOCK_PLANS,
} from './test-utils';

import {
  APIError,
  updateAPIClientConfig,
  updateAPIClientToken,
  apiFetchProfile,
  apiFetchPlans,
  apiFetchSubscriptions,
  apiFetchToken,
  apiFetchCustomer,
  apiCreateSubscription,
  apiUpdateSubscriptionPlan,
  apiCancelSubscription,
  apiReactivateSubscription,
  apiUpdatePayment,
} from './apiClient';

describe('APIError', () => {
  it('can be created without params', () => {
    const subject = new APIError();
    expect(subject).toMatchObject({
      body: null,
      code: null,
      statusCode: null,
      errno: null,
      error: null,
    });
  });

  it('sets properties from body data', () => {
    const body = {
      code: '867',
      statusCode: 404,
      errno: 123,
      error: 'boofed it',
      message: 'alert: boofed it',
    };
    const subject = new APIError(body);
    expect(subject).toMatchObject({
      body,
      code: body.code,
      statusCode: body.statusCode,
      errno: body.errno,
      error: body.error,
      message: body.message,
    });
  });
});

describe('API requests', () => {
  const OAUTH_TOKEN = 'tok-8675309';
  const OAUTH_BASE_URL = 'http://oauth.example.com';
  const AUTH_BASE_URL = 'http://auth.example.com';
  const PROFILE_BASE_URL = 'http://profile.example.com';

  let config: Config;

  beforeEach(() => {
    config = defaultConfig();

    config.servers.oauth.url = OAUTH_BASE_URL;
    config.servers.auth.url = AUTH_BASE_URL;
    config.servers.profile.url = PROFILE_BASE_URL;

    updateAPIClientConfig(config);
    updateAPIClientToken(OAUTH_TOKEN);

    [OAUTH_BASE_URL, AUTH_BASE_URL, PROFILE_BASE_URL].forEach(baseUrl =>
      mockOptionsResponses(baseUrl)
    );
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('apiFetchProfile', () => {
    it('GET {profile-server}/v1/profile', async () => {
      const requestMock = nock(PROFILE_BASE_URL)
        .get('/v1/profile')
        .reply(200, MOCK_PROFILE);
      expect(await apiFetchProfile()).toEqual(MOCK_PROFILE);
      requestMock.done();
    });
  });

  describe('apiFetchPlans', () => {
    it('GET {auth-server}/v1/oauth/subscriptions/plans', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS);
      expect(await apiFetchPlans()).toEqual(MOCK_PLANS);
      requestMock.done();
    });
  });

  describe('apiFetchSubscriptions', () => {
    it('GET {auth-server}/v1/oauth/subscriptions/active', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .get('/v1/oauth/subscriptions/active')
        .reply(200, MOCK_ACTIVE_SUBSCRIPTIONS);
      expect(await apiFetchSubscriptions()).toEqual(MOCK_ACTIVE_SUBSCRIPTIONS);
      requestMock.done();
    });
  });

  describe('apiFetchToken', () => {
    it('POST {oauth-server}/v1/introspect for token validity', async () => {
      const requestMock = nock(OAUTH_BASE_URL)
        .post('/v1/introspect', { token: OAUTH_TOKEN })
        .reply(200, MOCK_TOKEN);
      expect(await apiFetchToken()).toEqual(MOCK_TOKEN);
      requestMock.done();
    });
  });

  describe('apiFetchCustomer', () => {
    it('GET {auth-server}/v1/oauth/subscriptions/customer', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .get('/v1/oauth/subscriptions/customer')
        .reply(200, MOCK_CUSTOMER);
      expect(await apiFetchCustomer()).toEqual(MOCK_CUSTOMER);
      requestMock.done();
    });
  });

  describe('apiCreateSubscription', () => {
    const path = '/v1/oauth/subscriptions/active';
    const params = {
      paymentToken: 'pay_12345',
      planId: 'plan_2345',
      productId: 'prod_4567',
      displayName: 'Foo Q. Barson',
    };
    const metricsOptions = {
      planId: params.planId,
      productId: params.productId,
    };

    it('POST {auth-server}/v1/oauth/subscriptions/active', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .post(path, params)
        .reply(200, {});
      expect(await apiCreateSubscription(params)).toEqual({});
      expect(<jest.Mock>createSubscription_PENDING).toBeCalledWith(
        metricsOptions
      );
      expect(<jest.Mock>createSubscription_FULFILLED).toBeCalledWith(
        metricsOptions
      );
      requestMock.done();
    });

    it('sends amplitude ping on error', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .post(path, params)
        .reply(400, { message: 'oops' });
      let error = null;
      try {
        await apiCreateSubscription(params);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeNull();
      expect(<jest.Mock>createSubscription_PENDING).toBeCalledWith(
        metricsOptions
      );
      expect(<jest.Mock>createSubscription_REJECTED).toBeCalledWith({
        ...metricsOptions,
        error,
      });
      requestMock.done();
    });
  });

  describe('apiUpdateSubscriptionPlan', () => {
    const path = (subscriptionId: string) =>
      `/v1/oauth/subscriptions/active/${subscriptionId}`;
    const params = {
      subscriptionId: 'sub_987675',
      planId: 'plan_2345',
      productId: 'prod_4567',
    };
    const metricsOptions = {
      planId: params.planId,
      productId: params.productId,
    };

    it('PUT {auth-server}/v1/oauth/subscriptions/active', async () => {
      const expectedResponse = { ok: true };
      const requestMock = nock(AUTH_BASE_URL)
        .put(path(params.subscriptionId), { planId: params.planId })
        .reply(200, expectedResponse);
      expect(await apiUpdateSubscriptionPlan(params)).toEqual(expectedResponse);
      expect(<jest.Mock>updateSubscriptionPlan_PENDING).toBeCalledWith(
        metricsOptions
      );
      expect(<jest.Mock>updateSubscriptionPlan_FULFILLED).toBeCalledWith(
        metricsOptions
      );
      requestMock.done();
    });

    it('sends amplitude ping on error', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .put(path(params.subscriptionId), { planId: params.planId })
        .reply(400, { message: 'oops' });
      let error = null;
      try {
        await apiUpdateSubscriptionPlan(params);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeNull();
      expect(<jest.Mock>updateSubscriptionPlan_PENDING).toBeCalledWith(
        metricsOptions
      );
      expect(<jest.Mock>updateSubscriptionPlan_REJECTED).toBeCalledWith({
        ...metricsOptions,
        error,
      });
      requestMock.done();
    });
  });

  describe('apiCancelSubscription', () => {
    const path = (subscriptionId: string) =>
      `/v1/oauth/subscriptions/active/${subscriptionId}`;
    const params = {
      subscriptionId: 'sub_987675',
      planId: 'plan_2345',
      productId: 'prod_4567',
    };
    const metricsOptions = {
      planId: params.planId,
      productId: params.productId,
    };

    it('DELETE {auth-server}/v1/oauth/subscriptions/active/', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .delete(path(params.subscriptionId))
        .reply(200, {});
      expect(await apiCancelSubscription(params)).toEqual({
        subscriptionId: params.subscriptionId,
      });
      expect(<jest.Mock>cancelSubscription_PENDING).toBeCalledWith(
        metricsOptions
      );
      expect(<jest.Mock>cancelSubscription_FULFILLED).toBeCalledWith(
        metricsOptions
      );
      requestMock.done();
    });

    it('sends amplitude ping on error', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .delete(path(params.subscriptionId))
        .reply(400, { message: 'oops' });
      let error = null;
      try {
        await apiCancelSubscription(params);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeNull();
      expect(<jest.Mock>cancelSubscription_PENDING).toBeCalledWith(
        metricsOptions
      );
      expect(<jest.Mock>cancelSubscription_REJECTED).toBeCalledWith({
        ...metricsOptions,
        error,
      });
      requestMock.done();
    });
  });

  describe('apiReactivateSubscription', () => {
    const path = '/v1/oauth/subscriptions/reactivate';
    const params = {
      subscriptionId: 'sub_987675',
      planId: 'plan_2345',
    };

    it('POST {auth-server}/v1/oauth/subscriptions/reactivate', async () => {
      const expectedResponse = params;
      const requestMock = nock(AUTH_BASE_URL)
        .post(path, { subscriptionId: params.subscriptionId })
        .reply(200, expectedResponse);
      expect(await apiReactivateSubscription(params)).toEqual(expectedResponse);
      requestMock.done();
    });
  });

  describe('apiUpdatePayment', () => {
    const path = '/v1/oauth/subscriptions/updatePayment';
    const params = {
      planId: 'plan_2345',
      productId: 'prod_4567',
      paymentToken: 'pmt_234234',
    };
    const metricsOptions = {
      planId: params.planId,
      productId: params.productId,
    };

    it('POST {auth-server}/v1/oauth/subscriptions/updatePayment', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .post(path, { paymentToken: params.paymentToken })
        .reply(200, {});
      expect(await apiUpdatePayment(params)).toEqual({});
      expect(<jest.Mock>updatePayment_PENDING).toBeCalledWith(metricsOptions);
      expect(<jest.Mock>updatePayment_FULFILLED).toBeCalledWith(metricsOptions);
      requestMock.done();
    });

    it('sends amplitude ping on error', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .post(path, { paymentToken: params.paymentToken })
        .reply(400, { message: 'oops' });
      let error = null;
      try {
        await apiUpdatePayment(params);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeNull();
      expect(<jest.Mock>updatePayment_PENDING).toBeCalledWith(metricsOptions);
      expect(<jest.Mock>updatePayment_REJECTED).toBeCalledWith({
        ...metricsOptions,
        error,
      });
      requestMock.done();
    });
  });
});
