import nock from 'nock';

jest.mock('./sentry');

import {
  createSubscription_PENDING,
  createSubscription_FULFILLED,
  createSubscription_REJECTED,
  cancelSubscription_PENDING,
  cancelSubscription_FULFILLED,
  cancelSubscription_REJECTED,
  updateSubscriptionPlan_PENDING,
  updateSubscriptionPlan_FULFILLED,
  updateSubscriptionPlan_REJECTED,
  createSubscriptionWithPaymentMethod_PENDING,
  createSubscriptionWithPaymentMethod_FULFILLED,
  createSubscriptionWithPaymentMethod_REJECTED,
  updateDefaultPaymentMethod_PENDING,
  updateDefaultPaymentMethod_FULFILLED,
  updateDefaultPaymentMethod_REJECTED,
} from './amplitude';
jest.mock('./amplitude');

import { Config, defaultConfig } from './config';

import {
  mockOptionsResponses,
  MOCK_PROFILE,
  MOCK_CUSTOMER,
  MOCK_ACTIVE_SUBSCRIPTIONS,
  MOCK_CHECKOUT_TOKEN,
  MOCK_TOKEN,
  MOCK_PAYPAL_SUBSCRIPTION_RESULT,
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
  apiUpdateSubscriptionPlan,
  apiCancelSubscription,
  apiReactivateSubscription,
  apiCreateCustomer,
  apiCreateSubscriptionWithPaymentMethod,
  FilteredSetupIntent,
  apiCreateSetupIntent,
  apiUpdateDefaultPaymentMethod,
  apiRetryInvoice,
  apiDetachFailedPaymentMethod,
  apiGetPaypalCheckoutToken,
  apiCapturePaypalPayment,
  apiUpdateBillingAgreement,
} from './apiClient';
import { ProviderType } from './PaymentProvider';

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

    [OAUTH_BASE_URL, AUTH_BASE_URL, PROFILE_BASE_URL].forEach((baseUrl) =>
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

  describe('apiUpdateSubscriptionPlan', () => {
    const path = (subscriptionId: string) =>
      `/v1/oauth/subscriptions/active/${subscriptionId}`;
    const params = {
      subscriptionId: 'sub_987675',
      planId: 'plan_2345',
      productId: 'prod_4567',
      paymentProvider: 'paypal' as ProviderType,
    };
    const metricsOptions = {
      planId: params.planId,
      productId: params.productId,
      paymentProvider: params.paymentProvider,
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
      paymentProvider: 'paypal' as ProviderType,
    };
    const metricsOptions = {
      planId: params.planId,
      productId: params.productId,
      paymentProvider: params.paymentProvider,
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

  describe('apiCreateCustomer', () => {
    const path = '/v1/oauth/subscriptions/customer';

    it(`POST {auth-server}${path}`, async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .post(path)
        .reply(200, MOCK_CUSTOMER);

      expect(
        await apiCreateCustomer({
          displayName: 'Bar Fooson',
          idempotencyKey: 'idk-8675309',
        })
      ).toEqual(MOCK_CUSTOMER);
      requestMock.done();
    });
  });

  describe('apiCreateSubscriptionWithPaymentMethod', () => {
    const path = '/v1/oauth/subscriptions/active/new';
    const params = {
      priceId: 'price_12345',
      productId: 'prod_abdce',
      paymentMethodId: 'pm_test',
      idempotencyKey: 'idk-8675309',
    };
    const metricsOptions = {
      planId: params.priceId,
      productId: params.productId,
      paymentProvider: 'stripe',
    };

    it(`POST {auth-server}${path}`, async () => {
      const expected = { sourceCountry: 'US', subscription: { what: 'ever' } };
      const requestMock = nock(AUTH_BASE_URL).post(path).reply(200, expected);

      expect(await apiCreateSubscriptionWithPaymentMethod(params)).toEqual(
        expected.subscription
      );

      expect(
        <jest.Mock>createSubscriptionWithPaymentMethod_PENDING
      ).toBeCalledWith(metricsOptions);
      expect(
        <jest.Mock>createSubscriptionWithPaymentMethod_FULFILLED
      ).toBeCalledWith({
        ...metricsOptions,
        sourceCountry: expected.sourceCountry,
      });
      requestMock.done();
    });

    it('sends amplitude ping on error', async () => {
      const { priceId, paymentMethodId, idempotencyKey } = params;
      const requestMock = nock(AUTH_BASE_URL)
        .post(path, { priceId, paymentMethodId, idempotencyKey })
        .reply(400, { message: 'oops' });
      let error = null;
      try {
        await apiCreateSubscriptionWithPaymentMethod(params);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeNull();
      expect(
        <jest.Mock>createSubscriptionWithPaymentMethod_PENDING
      ).toBeCalledWith(metricsOptions);
      expect(
        <jest.Mock>createSubscriptionWithPaymentMethod_REJECTED
      ).toBeCalledWith({
        ...metricsOptions,
        error,
      });
      requestMock.done();
    });
  });

  describe('apiRetryInvoice', () => {
    const path = '/v1/oauth/subscriptions/invoice/retry';

    it(`POST {auth-server}${path}`, async () => {
      const expected = { what: 'ever' };
      const requestMock = nock(AUTH_BASE_URL).post(path).reply(200, expected);

      expect(
        await apiRetryInvoice({
          invoiceId: 'inv_12345',
          paymentMethodId: 'pm_test',
          idempotencyKey: 'idk-8675309',
        })
      ).toEqual(expected);
      requestMock.done();
    });
  });

  describe('apiCreateSetupIntent', () => {
    const path = '/v1/oauth/subscriptions/setupintent/create';

    it(`POST {auth-server}${path}`, async () => {
      const expectedResponse: FilteredSetupIntent = {
        client_secret: 'secret_squirrel',
        created: 123456789,
        next_action: null,
        payment_method: null,
        status: 'requires_payment_method',
      };

      const requestMock = nock(AUTH_BASE_URL)
        .post(path)
        .reply(200, expectedResponse);

      expect(await apiCreateSetupIntent()).toEqual(expectedResponse);
      requestMock.done();
    });
  });

  describe('apiUpdateDefaultPaymentMethod', () => {
    const path = '/v1/oauth/subscriptions/paymentmethod/default';
    const params = {
      paymentMethodId: 'pm_test',
    };
    const metricsOptions = {
      paymentProvider: 'stripe',
    };

    it(`POST {auth-server}${path}`, async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .post(path)
        .reply(200, MOCK_CUSTOMER);

      expect(await apiUpdateDefaultPaymentMethod(params)).toEqual(
        MOCK_CUSTOMER
      );

      expect(<jest.Mock>updateDefaultPaymentMethod_PENDING).toBeCalledWith(
        metricsOptions
      );
      expect(<jest.Mock>updateDefaultPaymentMethod_FULFILLED).toBeCalledWith(
        metricsOptions
      );
      requestMock.done();
    });

    it('sends amplitude ping on error', async () => {
      const { paymentMethodId } = params;
      const requestMock = nock(AUTH_BASE_URL)
        .post(path, { paymentMethodId })
        .reply(400, { message: 'oops' });
      let error = null;
      try {
        await apiUpdateDefaultPaymentMethod(params);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeNull();
      expect(<jest.Mock>updateDefaultPaymentMethod_PENDING).toBeCalledWith(
        metricsOptions
      );
      expect(<jest.Mock>updateDefaultPaymentMethod_REJECTED).toBeCalledWith({
        ...metricsOptions,
        error,
      });
      requestMock.done();
    });
  });

  describe('apiDetachFailedPaymentMethod', () => {
    it('POST correctly', async () => {
      const resp = { id: 'pm_503541' };
      const requestMock = nock(AUTH_BASE_URL)
        .post('/v1/oauth/subscriptions/paymentmethod/failed/detach')
        .reply(200, resp);
      const actual = await apiDetachFailedPaymentMethod({
        paymentMethodId: '???',
      });
      expect(actual).toEqual(resp);
      requestMock.done();
    });
  });

  describe('apiGetPaypalCheckoutToken', () => {
    it('POST /v1/oauth/subscriptions/paypal-checkout', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .post('/v1/oauth/subscriptions/paypal-checkout')
        .reply(200, MOCK_CHECKOUT_TOKEN);
      const currencyCode = 'USD';
      expect(await apiGetPaypalCheckoutToken({ currencyCode })).toEqual(
        MOCK_CHECKOUT_TOKEN
      );
      requestMock.done();
    });
  });

  describe('apiCapturePaypalPayment', () => {
    const path = '/v1/oauth/subscriptions/active/new-paypal';
    const params = {
      idempotencyKey: 'idk-8675309',
      priceId: 'price_12345',
      ...MOCK_CHECKOUT_TOKEN,
    };
    const metricsOptions = {
      planId: params.priceId,
      paymentProvider: 'paypal',
    };

    it('POST {auth-server}/v1/oauth/subscriptions/active/new-paypal', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .post(path, params)
        .reply(200, MOCK_PAYPAL_SUBSCRIPTION_RESULT);
      expect(await apiCapturePaypalPayment(params)).toEqual(
        MOCK_PAYPAL_SUBSCRIPTION_RESULT
      );

      expect(
        <jest.Mock>createSubscriptionWithPaymentMethod_PENDING
      ).toBeCalledWith(metricsOptions);
      expect(
        <jest.Mock>createSubscriptionWithPaymentMethod_FULFILLED
      ).toBeCalledWith({
        ...metricsOptions,
        sourceCountry: 'FR',
      });

      requestMock.done();
    });

    it('sends amplitude ping on error', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .post(path, params)
        .reply(400, { message: 'oops' });
      let error = null;
      try {
        await apiCapturePaypalPayment(params);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeNull();
      expect(
        <jest.Mock>createSubscriptionWithPaymentMethod_PENDING
      ).toBeCalledWith(metricsOptions);
      expect(
        <jest.Mock>createSubscriptionWithPaymentMethod_REJECTED
      ).toBeCalledWith({
        ...metricsOptions,
        error,
      });
      requestMock.done();
    });
  });

  describe('apiUpdateBillingAgreement', () => {
    const path = '/v1/oauth/subscriptions/paymentmethod/billing-agreement';
    const params = {
      token: MOCK_CHECKOUT_TOKEN.token,
    };
    const metricsOptions = {
      paymentProvider: 'paypal',
    };

    it(`POST {auth-server}${path}`, async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .post(path)
        .reply(200, MOCK_CUSTOMER);

      expect(await apiUpdateBillingAgreement(params)).toEqual(MOCK_CUSTOMER);

      expect(<jest.Mock>updateDefaultPaymentMethod_PENDING).toBeCalledWith(
        metricsOptions
      );
      expect(<jest.Mock>updateDefaultPaymentMethod_FULFILLED).toBeCalledWith(
        metricsOptions
      );
      requestMock.done();
    });

    it('sends amplitude ping on error', async () => {
      const { token } = params;
      const requestMock = nock(AUTH_BASE_URL)
        .post(path, { token })
        .reply(400, { message: 'oops' });
      let error = null;
      try {
        await apiUpdateBillingAgreement(params);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeNull();
      expect(<jest.Mock>updateDefaultPaymentMethod_PENDING).toBeCalledWith(
        metricsOptions
      );
      expect(<jest.Mock>updateDefaultPaymentMethod_REJECTED).toBeCalledWith({
        ...metricsOptions,
        error,
      });
      requestMock.done();
    });
  });
});
