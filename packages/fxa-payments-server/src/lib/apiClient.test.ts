import {
  APIError,
  updateAPIClientConfig,
  updateAPIClientToken,
  apiFetchToken,
  apiUpdateSubscriptionPlan,
} from './apiClient';
import { Config, defaultConfig } from './config';
import { mockOptionsResponses } from './test-utils';
import nock from 'nock';

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

describe('apiFetchToken', () => {
  const BASE_URL = 'http://oauth.example.com';
  const OAUTH_TOKEN = 'tok-8675309';
  const MOCK_RESPONSE = { ok: true };

  it('POST oauth-server/v1/introspect for token validity', async () => {
    const config = defaultConfig();

    config.servers.oauth.url = BASE_URL;
    updateAPIClientConfig(config);
    updateAPIClientToken(OAUTH_TOKEN);

    const optionsMock = mockOptionsResponses(BASE_URL);

    const requestMock = nock(BASE_URL)
      .post('/v1/introspect', { token: OAUTH_TOKEN })
      .reply(200, MOCK_RESPONSE);

    const result = await apiFetchToken();
    expect(result).toEqual(MOCK_RESPONSE);

    requestMock.done();
    optionsMock.done();
  });
});

describe('apiUpdateSubscriptionPlan', () => {
  const BASE_URL = 'http://auth.example.com';
  const MOCK_RESPONSE = { ok: true };

  it('PUT auth-server/v1/oauth/subscriptions/active', async () => {
    const subscriptionId = 'sub-867';
    const planId = 'plan-5309';

    const config = defaultConfig();

    config.servers.auth.url = BASE_URL;
    updateAPIClientConfig(config);

    const optionsMock = mockOptionsResponses(BASE_URL);

    const requestMock = nock(BASE_URL)
      .put(`/v1/oauth/subscriptions/active/${subscriptionId}`, { planId })
      .reply(200, MOCK_RESPONSE);

    const result = await apiUpdateSubscriptionPlan({ subscriptionId, planId });
    expect(result).toEqual(MOCK_RESPONSE);

    requestMock.done();
    optionsMock.done();
  });
});
