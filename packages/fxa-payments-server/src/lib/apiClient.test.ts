import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import {
  FirstInvoicePreview,
  SubsequentInvoicePreview,
} from 'fxa-shared/dto/auth/payments/invoice';
import { CheckoutType } from 'fxa-shared/subscriptions/types';
import noc from 'nock';

import {
  cancelSubscription_FULFILLED,
  cancelSubscription_PENDING,
  cancelSubscription_REJECTED,
  createSubscriptionWithPaymentMethod_FULFILLED,
  createSubscriptionWithPaymentMethod_PENDING,
  createSubscriptionWithPaymentMethod_REJECTED,
  EventProperties,
  updateDefaultPaymentMethod_FULFILLED,
  updateDefaultPaymentMethod_PENDING,
  updateDefaultPaymentMethod_REJECTED,
  updateSubscriptionPlan_FULFILLED,
  updateSubscriptionPlan_PENDING,
  updateSubscriptionPlan_REJECTED,
  getErrorId,
} from './amplitude';
import {
  apiCancelSubscription,
  apiCapturePaypalPayment,
  apiCreateCustomer,
  apiCreatePasswordlessAccount,
  apiCreateSetupIntent,
  apiCreateSubscriptionWithPaymentMethod,
  apiDetachFailedPaymentMethod,
  APIError,
  apiFetchCustomer,
  apiFetchPlanEligibility,
  apiFetchPlans,
  apiFetchProfile,
  apiFetchSubscriptions,
  apiFetchToken,
  apiGetPaypalCheckoutToken,
  apiInvoicePreview,
  apiReactivateSubscription,
  apiRetrieveCouponDetails,
  apiRetryInvoice,
  apiSignupForNewsletter,
  apiSubsequentInvoicePreview,
  apiUpdateBillingAgreement,
  apiUpdateDefaultPaymentMethod,
  apiUpdateSubscriptionPlan,
  FilteredSetupIntent,
  updateAPIClientConfig,
  updateAPIClientToken,
} from './apiClient';
import sentryMetrics from './sentry';
import { Config, defaultConfig } from './config';
import { PaymentProvider } from './PaymentProvider';
import {
  MOCK_ACTIVE_SUBSCRIPTIONS,
  MOCK_CHECKOUT_TOKEN,
  MOCK_CUSTOMER,
  MOCK_PAYPAL_SUBSCRIPTION_RESULT,
  MOCK_PLANS,
  MOCK_PROFILE,
  MOCK_TOKEN,
  mockOptionsResponses,
  PLAN_ID,
} from './test-utils';

function nock(it: any) {
  //@ts-ignore
  return noc(...arguments).defaultReplyHeaders({
    'Access-Control-Allow-Origin': '*',
  });
}

jest.mock('./sentry');
jest.mock('./amplitude');

const OAUTH_TOKEN = 'tok-8675309';
const OAUTH_BASE_URL = 'http://oauth.example.com';
const AUTH_BASE_URL = 'http://auth.example.com';
const PROFILE_BASE_URL = 'http://profile.example.com';

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

describe('Authorization header', () => {
  let config: Config;

  beforeEach(() => {
    jest.spyOn(global, 'fetch');

    config = defaultConfig();
    config.servers.profile.url = PROFILE_BASE_URL;
    updateAPIClientConfig(config);

    nock(PROFILE_BASE_URL).get('/v1/profile').reply(200, MOCK_PROFILE);
    mockOptionsResponses(PROFILE_BASE_URL);
  });

  afterEach(() => {
    noc.cleanAll();
    (global.fetch as jest.Mock).mockRestore();
  });

  it('should be undefined when there is no access token', async () => {
    await apiFetchProfile();
    expect(
      (global.fetch as jest.Mock).mock.calls[0][1]['headers']['Authorization']
    ).toBeUndefined();
  });

  it('should be set when there is an access token', async () => {
    updateAPIClientToken('unlimitedaccess');
    await apiFetchProfile();
    expect(
      (global.fetch as jest.Mock).mock.calls[0][1]['headers']['Authorization']
    ).toBe('Bearer unlimitedaccess');
  });
});

describe('apiFetch error', () => {
  let config: Config;

  beforeEach(() => {
    config = defaultConfig();
    config.servers.profile.url = PROFILE_BASE_URL;
    updateAPIClientConfig(config);
    mockOptionsResponses(PROFILE_BASE_URL);
  });

  afterEach(() => {
    noc.cleanAll();
  });

  it('throw APIError', async () => {
    let error: any;
    (getErrorId as jest.Mock).mockReturnValue('error-id-123');
    nock(PROFILE_BASE_URL).get('/v1/profile').reply(500, {
      code: '999',
      statusCode: 500,
      errno: 999,
      error: 'boofed it',
      message: 'alert: boofed it',
    });
    try {
      await apiFetchProfile();
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(APIError);
    expect(error.errno).toBe(999);
    expect(sentryMetrics.captureException as jest.Mock).not.toBeCalled();
  });

  it('should throw and report to Sentry for unknown_error', async () => {
    let error: any;
    (getErrorId as jest.Mock).mockReturnValue('unknown_error');
    nock(PROFILE_BASE_URL).get('/v1/profile').reply(500, {});
    try {
      await apiFetchProfile();
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(APIError);
    expect(sentryMetrics.captureException as jest.Mock).toBeCalledWith(error);
  });
});

describe('API requests', () => {
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
    noc.cleanAll();
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

  describe('apiCreatePasswordlessAccount', () => {
    it('POST {auth-server}/v1/account/stub', async () => {
      const arg = { email: 'endlessfur@cats.gd', clientId: 'xyz' };
      const resp = { uid: 'abc123', access_token: 'wibble' };
      const requestMock = nock(AUTH_BASE_URL)
        .post('/v1/account/stub', arg)
        .reply(200, resp);
      expect(await apiCreatePasswordlessAccount(arg)).toEqual(resp);
      requestMock.done();
    });
  });

  describe('apiFetchCustomer', () => {
    it('GET {auth-server}/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .get(
          '/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
        )
        .reply(200, MOCK_CUSTOMER);
      expect(await apiFetchCustomer()).toEqual(MOCK_CUSTOMER);
      requestMock.done();
    });
  });

  describe('apiFetchPlanEligibility', () => {
    const path = (planId: string) =>
      `/v1/oauth/mozilla-subscriptions/customer/plan-eligibility/${planId}`;
    it(`GET {auth-server}${path}`, async () => {
      const planId = 'plan_12345';
      const requestMock = nock(AUTH_BASE_URL)
        .get(
          `/v1/oauth/mozilla-subscriptions/customer/plan-eligibility/${planId}`
        )
        .reply(200, MOCK_PLANS[0]);
      expect(await apiFetchPlanEligibility(PLAN_ID)).toEqual(MOCK_PLANS[0]);
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
      paymentProvider: 'paypal' as PaymentProvider,
      previousPlanId: 'plan_1234',
      previousProductId: 'prod_3456',
    };
    const metricsOptions = {
      planId: params.planId,
      productId: params.productId,
      paymentProvider: params.paymentProvider,
      previousPlanId: params.previousPlanId,
      previousProductId: params.previousProductId,
      subscriptionId: params.subscriptionId,
    };

    it('PUT {auth-server}/v1/oauth/subscriptions/active', async () => {
      const expectedResponse = { ok: true };
      const requestMock = nock(AUTH_BASE_URL)
        .put(path(params.subscriptionId), { planId: params.planId })
        .reply(200, expectedResponse);
      expect(await apiUpdateSubscriptionPlan(params)).toEqual(expectedResponse);
      expect(updateSubscriptionPlan_PENDING as jest.Mock).toBeCalledWith(
        metricsOptions
      );
      expect(updateSubscriptionPlan_FULFILLED as jest.Mock).toBeCalledWith(
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
      expect(updateSubscriptionPlan_PENDING as jest.Mock).toBeCalledWith(
        metricsOptions
      );
      expect(updateSubscriptionPlan_REJECTED as jest.Mock).toBeCalledWith({
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
      paymentProvider: 'paypal' as PaymentProvider,
      promotionCode: 'freecats',
    };
    const metricsOptions = {
      planId: params.planId,
      productId: params.productId,
      paymentProvider: params.paymentProvider,
      promotionCode: params.promotionCode,
    };

    it('DELETE {auth-server}/v1/oauth/subscriptions/active/', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .delete(path(params.subscriptionId))
        .reply(200, {});
      expect(await apiCancelSubscription(params)).toEqual({
        subscriptionId: params.subscriptionId,
      });
      expect(cancelSubscription_PENDING as jest.Mock).toBeCalledWith(
        metricsOptions
      );
      expect(cancelSubscription_FULFILLED as jest.Mock).toBeCalledWith(
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
      expect(cancelSubscription_PENDING as jest.Mock).toBeCalledWith(
        metricsOptions
      );
      expect(cancelSubscription_REJECTED as jest.Mock).toBeCalledWith({
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
      checkoutType: CheckoutType.WITHOUT_ACCOUNT,
    };
    const metricsOptions: EventProperties = {
      checkoutType: CheckoutType.WITHOUT_ACCOUNT,
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
        createSubscriptionWithPaymentMethod_PENDING as jest.Mock
      ).toBeCalledWith(metricsOptions);
      expect(
        createSubscriptionWithPaymentMethod_FULFILLED as jest.Mock
      ).toBeCalledWith({
        ...metricsOptions,
        country_code_source: expected.sourceCountry,
      });
      requestMock.done();
    });

    it('sends amplitude ping on error', async () => {
      const { priceId, paymentMethodId } = params;
      const requestMock = nock(AUTH_BASE_URL)
        .post(path, { priceId, paymentMethodId })
        .reply(400, { message: 'oops' });
      let error = null;
      try {
        await apiCreateSubscriptionWithPaymentMethod(params);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeNull();
      expect(
        createSubscriptionWithPaymentMethod_PENDING as jest.Mock
      ).toBeCalledWith(metricsOptions);
      expect(
        createSubscriptionWithPaymentMethod_REJECTED as jest.Mock
      ).toBeCalledWith({
        ...metricsOptions,
        error,
      });
      requestMock.done();
    });

    it(`POST {auth-server}${path} with coupon`, async () => {
      const expected = { sourceCountry: 'US', subscription: { what: 'ever' } };
      const requestMock = nock(AUTH_BASE_URL).post(path).reply(200, expected);

      const promotionCode = 'TEST';
      const paramsWithPromo = Object.assign(params, { promotionCode });

      expect(
        await apiCreateSubscriptionWithPaymentMethod(paramsWithPromo)
      ).toEqual(expected.subscription);

      expect(
        createSubscriptionWithPaymentMethod_PENDING as jest.Mock
      ).toBeCalledWith({
        ...metricsOptions,
        promotionCode,
      });
      expect(
        createSubscriptionWithPaymentMethod_FULFILLED as jest.Mock
      ).toBeCalledWith({
        ...metricsOptions,
        country_code_source: expected.sourceCountry,
        promotionCode,
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

  describe('apiInvoicePreview', () => {
    const path = '/v1/oauth/subscriptions/invoice/preview';
    const priceId = 'price_kkljasdk32lkjasd';

    it(`POST {auth-server}${path} valid Coupon Code`, async () => {
      const promotionCode = 'VALID';
      const expected: FirstInvoicePreview = {
        subtotal: 200,
        subtotal_excluding_tax: 200,
        total: 170,
        total_excluding_tax: 170,
        line_items: [
          {
            amount: 200,
            currency: 'usd',
            id: priceId,
            name: 'Plan name',
            period: {
              end: 1715457345,
              start: 1715457345,
            },
          },
        ],
        discount: {
          amount: 30,
          amount_off: null,
          percent_off: 15,
        },
      };
      const requestMock = nock(AUTH_BASE_URL).post(path).reply(200, expected);

      expect(
        await apiInvoicePreview({
          priceId,
          promotionCode,
        })
      ).toEqual(expected);

      requestMock.done();
    });
  });

  describe('apiSubsequentInvoicePreview', () => {
    const path = '/v1/oauth/subscriptions/invoice/preview-subsequent';

    it(`GET {auth-server}${path}`, async () => {
      const invoicePreview: SubsequentInvoicePreview = {
        subscriptionId: 'test',
        period_start: 0,
        subtotal: 100,
        subtotal_excluding_tax: null,
        total: 100,
        total_excluding_tax: null,
      };
      const expected = [invoicePreview];
      const requestMock = nock(AUTH_BASE_URL).get(path).reply(200, expected);

      expect(await apiSubsequentInvoicePreview()).toEqual(expected);
      requestMock.done();
    });
  });

  describe('apiRetrieveCouponDetails', () => {
    const path = '/v1/oauth/subscriptions/coupon';
    const priceId = 'price_kkljasdk32lkjasd';

    it(`POST {auth-server}${path} valid Coupon Code`, async () => {
      const promotionCode = 'VALID';
      const expected: CouponDetails = {
        promotionCode,
        type: '',
        valid: true,
        durationInMonths: 1,
        discountAmount: 50,
        expired: false,
        maximallyRedeemed: false,
      };
      const requestMock = nock(AUTH_BASE_URL).post(path).reply(200, expected);

      expect(
        await apiRetrieveCouponDetails({
          priceId,
          promotionCode,
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

      expect(updateDefaultPaymentMethod_PENDING as jest.Mock).toBeCalledWith(
        metricsOptions
      );
      expect(updateDefaultPaymentMethod_FULFILLED as jest.Mock).toBeCalledWith(
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
      expect(updateDefaultPaymentMethod_PENDING as jest.Mock).toBeCalledWith(
        metricsOptions
      );
      expect(updateDefaultPaymentMethod_REJECTED as jest.Mock).toBeCalledWith({
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
      idempotencyKey: '',
      priceId: 'price_12345',
      productId: 'product_2a',
      checkoutType: CheckoutType.WITHOUT_ACCOUNT,
      ...MOCK_CHECKOUT_TOKEN,
    };
    const metricsOptions = {
      planId: params.priceId,
      productId: params.productId,
      paymentProvider: 'paypal',
      checkoutType: CheckoutType.WITHOUT_ACCOUNT,
      promotionCode: undefined,
    };

    it('POST {auth-server}/v1/oauth/subscriptions/active/new-paypal', async () => {
      const requestMock = nock(AUTH_BASE_URL)
        .post(path, params)
        .reply(200, MOCK_PAYPAL_SUBSCRIPTION_RESULT);
      expect(await apiCapturePaypalPayment(params)).toEqual(
        MOCK_PAYPAL_SUBSCRIPTION_RESULT
      );

      expect(
        createSubscriptionWithPaymentMethod_PENDING as jest.Mock
      ).toBeCalledWith(metricsOptions);
      expect(
        createSubscriptionWithPaymentMethod_FULFILLED as jest.Mock
      ).toBeCalledWith({
        ...metricsOptions,
        country_code_source: 'FR',
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
        createSubscriptionWithPaymentMethod_PENDING as jest.Mock
      ).toBeCalledWith(metricsOptions);
      expect(
        createSubscriptionWithPaymentMethod_REJECTED as jest.Mock
      ).toBeCalledWith({
        ...metricsOptions,
        error,
      });
      requestMock.done();
    });

    it('POST {auth-server}/v1/oauth/subscriptions/active/new-paypal with coupon', async () => {
      const promotionCode = 'TEST';
      const paramsWithPromo = Object.assign(params, { promotionCode });

      const requestMock = nock(AUTH_BASE_URL)
        .post(path, paramsWithPromo)
        .reply(200, MOCK_PAYPAL_SUBSCRIPTION_RESULT);
      expect(await apiCapturePaypalPayment(paramsWithPromo)).toEqual(
        MOCK_PAYPAL_SUBSCRIPTION_RESULT
      );

      expect(
        createSubscriptionWithPaymentMethod_PENDING as jest.Mock
      ).toBeCalledWith({
        ...metricsOptions,
        promotionCode,
      });
      expect(
        createSubscriptionWithPaymentMethod_FULFILLED as jest.Mock
      ).toBeCalledWith({
        ...metricsOptions,
        country_code_source: 'FR',
        promotionCode,
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

      expect(updateDefaultPaymentMethod_PENDING as jest.Mock).toBeCalledWith(
        metricsOptions
      );
      expect(updateDefaultPaymentMethod_FULFILLED as jest.Mock).toBeCalledWith(
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
      expect(updateDefaultPaymentMethod_PENDING as jest.Mock).toBeCalledWith(
        metricsOptions
      );
      expect(updateDefaultPaymentMethod_REJECTED as jest.Mock).toBeCalledWith({
        ...metricsOptions,
        error,
      });
      requestMock.done();
    });
  });

  describe('apiSignupForNewsletter', () => {
    it('POST {auth-server}/v1/account/newsletters', async () => {
      const arg = { newsletters: ['cooking-with-foxkeh'] };
      const resp = {};
      const requestMock = nock(AUTH_BASE_URL)
        .post('/v1/newsletters', arg)
        .reply(200, resp);
      expect(await apiSignupForNewsletter(arg)).toEqual(resp);
      requestMock.done();
    });
  });
});
