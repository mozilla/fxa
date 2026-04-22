/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');
const { AppError: error } = require('@fxa/accounts/errors');
const getRoute = require('../../test/routes_helpers').getRoute;
const knownIpLocation = require('../../test/known-ip-location');
const mocks = require('../../test/mocks');
const nock = require('nock');
const uuid = require('uuid');
const { normalizeEmail } = require('fxa-shared').email.helpers;
const { gleanMetrics } = require('../metrics/glean');
const gleanConfig = {
  enabled: false,
  applicationId: 'accounts_backend_test',
  channel: 'test',
  loggerAppName: 'auth-server-tests',
};

const CUSTOMER_1 = require('../../test/local/payments/fixtures/stripe/customer1.json');
const CUSTOMER_1_UPDATED = require('../../test/local/payments/fixtures/stripe/customer1_new_email.json');
const TEST_EMAIL = 'foo@gmail.com';
const TEST_EMAIL_ADDITIONAL = 'foo2@gmail.com';
const TEST_EMAIL_INVALID = 'example@dotless-domain';
const MS_IN_DAY = 1000 * 60 * 60 * 24;
// This is slightly less than 2 months ago, regardless of which
// months are in question (I'm looking at you, February...)
const MS_IN_ALMOST_TWO_MONTHS = MS_IN_DAY * 58;

const SUBDOMAIN = 'test';
const ZENDESK_USER_ID = 391245052392;
const IDENTITY_ID = 374348876392;
const MOCK_SEARCH_USERS_SUCESS = [
  {
    id: ZENDESK_USER_ID,
    url: `https://${SUBDOMAIN}.zendesk.com/api/v2/users/391245052392.json`,
    name: 'test@example.com',
    email: 'test@example.com',
    created_at: '2019-12-18T23:22:49Z',
    updated_at: '2019-12-19T23:43:40Z',
    time_zone: 'Central America',
    iana_time_zone: 'America/Guatemala',
    phone: null,
    shared_phone_number: null,
    photo: null,
    locale_id: 1,
    locale: 'en-US',
    organization_id: null,
    role: 'end-user',
    verified: false,
    external_id: null,
    tags: [],
    alias: '',
    active: true,
    shared: false,
    shared_agent: false,
    last_login_at: null,
    two_factor_auth_enabled: false,
    signature: null,
    details: '',
    notes: '',
    role_type: null,
    custom_role_id: null,
    moderator: false,
    ticket_restriction: 'requested',
    only_private_comments: false,
    restricted_agent: true,
    suspended: false,
    chat_only: false,
    default_group_id: null,
    report_csv: false,
    user_fields: {
      user_id: '1234-0000',
    },
    result_type: 'user',
  },
];

const MOCK_SEARCH_USERS_SUCESS_NO_RESULTS: any[] = [];

const MOCK_FETCH_USER_IDENTITIES_SUCCESS = [
  {
    url: `https://${SUBDOMAIN}.zendesk.com/api/v2/users/391245052392/identities/374348876392.json`,
    id: IDENTITY_ID,
    user_id: ZENDESK_USER_ID,
    type: 'email',
    value: 'test@example.com',
    verified: false,
    primary: true,
    created_at: '2019-12-18T23:22:49Z',
    updated_at: '2019-12-18T23:22:49Z',
    undeliverable_count: 0,
    deliverable_state: 'reserved_example',
  },
];

const MOCK_FETCH_USER_IDENTITIES_ALREADY_CHANGED = [
  {
    url: `https://${SUBDOMAIN}.zendesk.com/api/v2/users/391245052392/identities/374348876392.json`,
    id: IDENTITY_ID,
    user_id: ZENDESK_USER_ID,
    type: 'email',
    value: 'updated.email@example.com',
    verified: false,
    primary: true,
    created_at: '2019-12-18T23:22:49Z',
    updated_at: '2019-12-18T23:22:49Z',
    undeliverable_count: 0,
    deliverable_state: 'reserved_example',
  },
];

const MOCK_UPDATE_IDENTITY_SUCCESS = {
  identity: {
    url: `https://${SUBDOMAIN}.zendesk.com/api/v2/users/391245052392/identities/374348876392.json`,
    id: IDENTITY_ID,
    user_id: ZENDESK_USER_ID,
    type: 'email',
    value: 'updated.email@example.com',
    verified: false,
    primary: true,
    created_at: '2019-12-18T23:22:49Z',
    updated_at: '2019-12-20T00:16:56Z',
    undeliverable_count: 0,
    deliverable_state: 'reserved_example',
  },
};

const otpOptions = {
  step: 60,
  window: 1,
  digits: 6,
};

let zendeskClient: any;
let cadReminders: any;
let db: any;
let glean: any;

const updateZendeskPrimaryEmail =
  require('./emails')._updateZendeskPrimaryEmail;
const updateStripeEmail = require('./emails')._updateStripeEmail;

const makeRoutes = function (options: any = {}) {
  const config = options.config || {};
  config.verifierVersion = config.verifierVersion || 0;
  config.smtp = config.smtp || {};
  config.i18n = {
    supportedLanguages: ['en'],
    defaultLanguage: 'en',
  };
  config.lastAccessTimeUpdates = {};
  config.signinConfirmation = config.signinConfirmation || {};
  config.signinUnblock = config.signinUnblock || {};
  config.secondaryEmail = config.secondaryEmail || {};
  config.push = {
    allowedServerRegex:
      /^https:\/\/updates\.push\.services\.mozilla\.com(\/.*)?$/,
  };
  config.otp = otpOptions;
  config.gleanMetrics = gleanConfig;

  const log = options.log || mocks.mockLog();
  db = options.db || mocks.mockDB();
  const customs = options.customs || {
    check: () => Promise.resolve(),
    checkAuthenticated: () => Promise.resolve(),
  };
  const push = options.push || require('../push')(log, db, {});
  const mailer = options.mailer || {};
  const verificationReminders =
    options.verificationReminders || mocks.mockVerificationReminders();
  cadReminders = options.cadReminders || mocks.mockCadReminders();
  glean = gleanMetrics(config);
  const statsd = mocks.mockStatsd();

  const signupUtils =
    options.signupUtils ||
    require('./utils/signup')(
      log,
      db,
      mailer,
      push,
      verificationReminders,
      glean
    );

  const authServerCacheRedis = options.authServerCacheRedis || {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
  };

  const routeModule = require('./emails');

  const routes = routeModule(
    log,
    db,
    mailer,
    config,
    customs,
    push,
    verificationReminders,
    cadReminders,
    signupUtils,
    undefined,
    options.stripeHelper,
    authServerCacheRedis,
    statsd
  );
  (routes as any).__redis = authServerCacheRedis;
  return routes;
};

function runTest(route: any, request: any, assertions?: any) {
  return route.handler(request).then(assertions);
}

// Called in /recovery_email/set_primary, however the promise is not waited for
// so we test the function independently as it doesn't affect the route success.
describe('update zendesk primary email', () => {
  let searchSpy: any, listSpy: any, updateSpy: any;

  beforeEach(() => {
    const config = {
      zendesk: {
        subdomain: SUBDOMAIN,
        productNameFieldId: '192837465',
      },
    };
    zendeskClient = require('../zendesk-client').createZendeskClient(config);
    searchSpy = jest.spyOn(zendeskClient.search, 'queryAll');
    listSpy = jest.spyOn(zendeskClient.useridentities, 'list');
    updateSpy = jest.spyOn(zendeskClient, 'updateIdentity');
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should update the primary email address', async () => {
    const uid = '1234-0000';
    nock(`https://${SUBDOMAIN}.zendesk.com`)
      .get('/api/v2/search.json')
      .query(true)
      .reply(200, MOCK_SEARCH_USERS_SUCESS);
    nock(`https://${SUBDOMAIN}.zendesk.com`)
      .get(`/api/v2/users/${ZENDESK_USER_ID}/identities.json`)
      .reply(200, MOCK_FETCH_USER_IDENTITIES_SUCCESS);
    nock(`https://${SUBDOMAIN}.zendesk.com`)
      .put(`/api/v2/users/${ZENDESK_USER_ID}/identities/${IDENTITY_ID}.json`)
      .reply(200, MOCK_UPDATE_IDENTITY_SUCCESS);

    try {
      await updateZendeskPrimaryEmail(
        zendeskClient,
        uid,
        'test@example.com',
        'updated.email@example.com'
      );
    } catch (err) {
      throw new Error('should not throw');
    }
    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('should stop if the user wasnt found in zendesk', async () => {
    const uid = '1234-0000';
    nock(`https://${SUBDOMAIN}.zendesk.com`)
      .get('/api/v2/search.json')
      .query(true)
      .reply(200, MOCK_SEARCH_USERS_SUCESS_NO_RESULTS);
    try {
      await updateZendeskPrimaryEmail(
        zendeskClient,
        uid,
        'test@example.com',
        'updated.email@example.com'
      );
    } catch (err) {
      throw new Error('should not throw');
    }
    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).not.toHaveBeenCalled();
  });

  it('should stop if the users email was already updated', async () => {
    const uid = '1234-0000';
    nock(`https://${SUBDOMAIN}.zendesk.com`)
      .get('/api/v2/search.json')
      .query(true)
      .reply(200, MOCK_SEARCH_USERS_SUCESS);
    nock(`https://${SUBDOMAIN}.zendesk.com`)
      .get(`/api/v2/users/${ZENDESK_USER_ID}/identities.json`)
      .reply(200, MOCK_FETCH_USER_IDENTITIES_ALREADY_CHANGED);
    try {
      await updateZendeskPrimaryEmail(
        zendeskClient,
        uid,
        'test@example.com',
        'updated.email@example.com'
      );
    } catch (err) {
      throw new Error('should not throw');
    }
    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).not.toHaveBeenCalled();
  });
});

describe('update stripe primary email', () => {
  let stripeHelper: any;

  beforeEach(() => {
    stripeHelper = {};
  });

  it('should update the primary email address', async () => {
    stripeHelper.fetchCustomer = jest.fn().mockReturnValue(CUSTOMER_1);
    stripeHelper.stripe = {
      customers: { update: jest.fn().mockReturnValue(CUSTOMER_1_UPDATED) },
    };
    const result = await updateStripeEmail(
      stripeHelper,
      'test',
      'test@example.com',
      'updated.email@example.com'
    );
    expect(result).toEqual(CUSTOMER_1_UPDATED);
  });

  it('returns if the email was already updated', async () => {
    stripeHelper.fetchCustomer = jest.fn().mockReturnValue(undefined);
    const result = await updateStripeEmail(
      stripeHelper,
      'test',
      'test@example.com',
      'updated.email@example.com'
    );
    expect(result).toBeUndefined();
  });
});

describe('/recovery_email/status', () => {
  const config: any = {};
  const mockDB = mocks.mockDB();
  let pushCalled: boolean;
  const mockLog = mocks.mockLog({
    info: jest.fn((op: any, data: any) => {
      if (data.name === 'recovery_email_reason.push') {
        pushCalled = true;
      }
    }),
  });
  const stripeHelper = mocks.mockStripeHelper();
  stripeHelper.hasActiveSubscription = jest.fn().mockResolvedValue(false);
  mocks.mockOAuthClientInfo();
  const accountRoutes = makeRoutes({
    config: config,
    db: mockDB,
    log: mockLog,
    stripeHelper,
  });
  const route = getRoute(accountRoutes, '/recovery_email/status');
  const mockRequest = mocks.mockRequest({
    credentials: {
      uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
      email: TEST_EMAIL,
    },
  });

  describe('invalid email', () => {
    let mockRequest: any;
    beforeEach(() => {
      mocks.mockOAuthClientInfo();
      mockRequest = mocks.mockRequest({
        credentials: {
          email: TEST_EMAIL_INVALID,
        },
      });
      mockLog.info.mockClear();
    });

    it('unverified account - no subscription', () => {
      mockRequest.auth.credentials.emailVerified = false;
      return runTest(route, mockRequest)
        .then(
          () => expect(true).toBe(false),
          (response: any) => {
            expect(mockDB.deleteAccount).toHaveBeenCalledTimes(1);
            expect(mockDB.deleteAccount).toHaveBeenNthCalledWith(
              1,
              expect.objectContaining({ email: TEST_EMAIL_INVALID })
            );
            expect(response.errno).toBe(error.ERRNO.INVALID_TOKEN);
            expect(mockLog.info).toHaveBeenCalledTimes(1);
            expect(mockLog.info).toHaveBeenNthCalledWith(
              1,
              'accountDeleted.invalidEmailAddress',
              {
                email: TEST_EMAIL_INVALID,
                emailVerified: false,
              }
            );
          }
        )
        .then(() => {
          mockDB.deleteAccount.mockClear();
        });
    });

    it('unverified account - active subscription', () => {
      stripeHelper.hasActiveSubscription = jest.fn().mockResolvedValue(true);
      mockRequest.auth.credentials.emailVerified = false;
      return runTest(route, mockRequest)
        .then(
          (response: any) => {
            expect(mockDB.deleteAccount).toHaveBeenCalledTimes(0);
            expect(mockLog.info).toHaveBeenCalledTimes(0);
          },
          () => expect(true).toBe(false)
        )
        .then(() => {
          mockDB.deleteAccount.mockClear();
        });
    });

    it('unverified account - stale session token', () => {
      const log = {
        info: jest.fn(),
        begin: jest.fn(),
      };
      const db = mocks.mockDB();
      config.emailStatusPollingTimeout = MS_IN_ALMOST_TWO_MONTHS;
      const routes = makeRoutes({
        config,
        db,
        log,
      });

      mockRequest = mocks.mockRequest({
        credentials: {
          email: TEST_EMAIL_INVALID,
        },
      });
      const route = getRoute(routes, '/recovery_email/status');

      const date = new Date();
      date.setMonth(date.getMonth() - 2);

      mockRequest.auth.credentials.createdAt = date.getTime();
      mockRequest.auth.credentials.hello = 'mytest';
      mockRequest.auth.credentials.emailVerified = false;
      mockRequest.auth.credentials.uaBrowser = 'Firefox';
      mockRequest.auth.credentials.uaBrowserVersion = '57';

      return runTest(route, mockRequest)
        .then(
          () => expect(true).toBe(false),
          (response: any) => {
            const args = log.info.mock.calls[0];
            expect(args[0]).toBe('recovery_email.status.stale');
            expect(args[1].email).toBe(TEST_EMAIL_INVALID);
            expect(args[1].createdAt).toBe(date.getTime());
            expect(args[1].browser).toBe('Firefox 57');
          }
        )
        .then(() => {
          mockDB.deleteAccount.mockClear();
        });
    });

    it('verified account', () => {
      mockRequest.auth.credentials.uid = uuid
        .v4({}, Buffer.alloc(16))
        .toString('hex');
      mockRequest.auth.credentials.emailVerified = true;
      mockRequest.auth.credentials.tokenVerified = true;

      return runTest(route, mockRequest, (response: any) => {
        expect(mockDB.deleteAccount).toHaveBeenCalledTimes(0);
        expect(response).toEqual({
          email: TEST_EMAIL_INVALID,
          verified: true,
          emailVerified: true,
          sessionVerified: true,
        });
      });
    });
  });

  it('valid email, verified account', () => {
    pushCalled = false;
    const mockRequest = mocks.mockRequest({
      credentials: {
        uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
        email: TEST_EMAIL,
        emailVerified: true,
        tokenVerified: true,
      },
      query: {
        reason: 'push',
      },
    });

    return runTest(route, mockRequest, (response: any) => {
      expect(pushCalled).toBe(true);

      expect(response).toEqual({
        email: TEST_EMAIL,
        verified: true,
        emailVerified: true,
        sessionVerified: true,
      });
    });
  });

  it('verified account, verified session', () => {
    mockRequest.auth.credentials.emailVerified = true;
    mockRequest.auth.credentials.tokenVerified = true;

    return runTest(route, mockRequest, (response: any) => {
      expect(response).toEqual({
        email: TEST_EMAIL,
        verified: true,
        sessionVerified: true,
        emailVerified: true,
      });
    });
  });

  it('verified account, unverified session, must verify session', () => {
    mockRequest.auth.credentials.emailVerified = true;
    mockRequest.auth.credentials.tokenVerified = false;
    mockRequest.auth.credentials.mustVerify = true;

    return runTest(route, mockRequest, (response: any) => {
      expect(response).toEqual({
        email: TEST_EMAIL,
        verified: false,
        sessionVerified: false,
        emailVerified: true,
      });
    });
  });

  it('verified account, unverified session, neednt verify session', () => {
    mockRequest.auth.credentials.emailVerified = true;
    mockRequest.auth.credentials.tokenVerified = false;
    mockRequest.auth.credentials.mustVerify = false;

    return runTest(route, mockRequest, (response: any) => {
      expect(response).toEqual({
        email: TEST_EMAIL,
        verified: true,
        sessionVerified: false,
        emailVerified: true,
      });
    });
  });
});

describe('/recovery_email/resend_code', () => {
  const config = {};
  const secondEmailCode = crypto.randomBytes(16);
  const mockDB = mocks.mockDB({
    secondEmailCode: secondEmailCode,
    email: TEST_EMAIL,
  });
  const mockLog = mocks.mockLog();
  mockLog.flowEvent = jest.fn(() => {
    return Promise.resolve();
  });
  const mockMailer = mocks.mockMailer();
  mocks.mockOAuthClientInfo({
    fetch: jest.fn().mockResolvedValue({ name: 'Firefox' }),
  });
  const mockFxaMailer = mocks.mockFxaMailer();
  const mockMetricsContext = mocks.mockMetricsContext();
  const accountRoutes = makeRoutes({
    config: config,
    db: mockDB,
    log: mockLog,
    mailer: mockMailer,
  });
  const route = getRoute(accountRoutes, '/recovery_email/resend_code');

  it('verification', () => {
    const mockRequest = mocks.mockRequest({
      log: mockLog,
      metricsContext: mockMetricsContext,
      uaBrowser: 'Firefox',
      uaBrowserVersion: 52,
      uaOS: 'Mac OS X',
      uaOSVersion: '10.10',
      credentials: {
        uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
        deviceId: 'wibble',
        email: TEST_EMAIL,
        emailVerified: false,
        tokenVerified: false,
        uaBrowser: 'Firefox',
        uaBrowserVersion: 52,
        uaOS: 'Mac OS X',
        uaOSVersion: '10.10',
      },
      query: {},
      payload: {
        service: 'sync',
        metricsContext: {
          deviceId: 'wibble',
          flowBeginTime: Date.now(),
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        },
        style: 'trailhead',
      },
    });

    return runTest(route, mockRequest, (response: any) => {
      expect(mockLog.flowEvent).toHaveBeenCalledTimes(1);
      expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ event: 'email.verification.resent' })
      );

      expect(mockFxaMailer.sendVerifyEmail).toHaveBeenCalledTimes(1);
      const args = mockFxaMailer.sendVerifyEmail.mock.calls[0];
      expect(args[0].device.uaBrowser).toBe('Firefox');
      expect(args[0].device.uaOS).toBe('Mac OS X');
      expect(args[0].device.uaOSVersion).toBe('10.10');
      expect(
        knownIpLocation.location.city.has(args[0].location.city)
      ).toBeTruthy();
      expect(args[0].location.country).toBe(knownIpLocation.location.country);
      expect(args[0].timeZone).toBe('America/Los_Angeles');
      expect(args[0].deviceId).toBe('wibble');
      expect(args[0].flowId).toBe(mockRequest.payload.metricsContext.flowId);
      expect(args[0].flowBeginTime).toBe(
        mockRequest.payload.metricsContext.flowBeginTime
      );
      expect(args[0].sync).toBe(mockRequest.payload.service === 'sync');
      expect(args[0].uid).toBe(mockRequest.auth.credentials.uid);
      expect(args[0].resume).toBe(mockRequest.payload.resume);
    }).then(() => {
      mockFxaMailer.sendVerifyEmail.mockClear();
      mockLog.flowEvent.mockClear();
    });
  });

  it('confirmation', () => {
    const deviceId = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const mockRequest = mocks.mockRequest({
      log: mockLog,
      metricsContext: mockMetricsContext,
      uaBrowser: 'Firefox',
      uaBrowserVersion: '50',
      uaOS: 'Android',
      uaOSVersion: '6',
      uaDeviceType: 'tablet',
      credentials: {
        uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
        deviceId: deviceId,
        email: TEST_EMAIL,
        emailVerified: true,
        tokenVerified: false,
        uaBrowser: 'Firefox',
        uaBrowserVersion: '50',
        uaOS: 'Android',
        uaOSVersion: '6',
        uaDeviceType: 'tablet',
      },
      query: {},
      payload: {
        service: 'foo',
        metricsContext: {
          deviceId: deviceId,
          flowBeginTime: Date.now(),
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        },
      },
    });
    mockLog.flowEvent.mockClear();

    return runTest(route, mockRequest, (response: any) => {
      expect(mockLog.flowEvent).toHaveBeenCalledTimes(1);
      expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ event: 'email.confirmation.resent' })
      );

      expect(mockFxaMailer.sendVerifyLoginEmail).toHaveBeenCalledTimes(1);
      const args = mockFxaMailer.sendVerifyLoginEmail.mock.calls[0];
      expect(args[0].device.uaBrowser).toBe('Firefox');
      expect(args[0].device.uaOS).toBe('Android');
      expect(args[0].device.uaOSVersion).toBe('6');
      expect(args[0].deviceId).toBe(mockRequest.auth.credentials.deviceId);
      expect(args[0].flowId).toBe(mockRequest.payload.metricsContext.flowId);
      expect(args[0].flowBeginTime).toBe(
        mockRequest.payload.metricsContext.flowBeginTime
      );
      expect(args[0].sync).toBe(mockRequest.payload.service === 'sync');
      expect(args[0].uid).toBe(mockRequest.auth.credentials.uid);
      expect(args[0].clientName).toBe('Firefox');
    });
  });
});

describe('/recovery_email/verify_code', () => {
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const mockLog = mocks.mockLog();
  const mockRequest = mocks.mockRequest({
    log: mockLog,
    metricsContext: mocks.mockMetricsContext({
      gather(data: any) {
        return Promise.resolve(
          Object.assign(data, {
            flowCompleteSignal: 'account.signed',
            flow_time: 10000,
            flow_id:
              'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
            time: Date.now() - 10000,
          })
        );
      },
    }),
    query: {},
    payload: {
      code: 'e3c5b0e3f5391e134596c27519979b93',
      service: 'sync',
      uid: uid,
    },
  });
  const dbData: any = {
    email: TEST_EMAIL,
    emailCode: Buffer.from(mockRequest.payload.code, 'hex'),
    emailVerified: false,
    secondEmail: 'test@email.com',
    secondEmailCode: crypto.randomBytes(16).toString('hex'),
    uid: uid,
  };
  const dbErrors: any = {
    verifyTokens: error.invalidVerificationCode({}),
  };
  const mockDB = mocks.mockDB(dbData, dbErrors);
  const mockMailer = mocks.mockMailer();
  mocks.mockOAuthClientInfo();
  const mockFxaMailer = mocks.mockFxaMailer();
  const mockPush = mocks.mockPush();
  const mockCustoms = mocks.mockCustoms();
  const verificationReminders = mocks.mockVerificationReminders();
  const accountRoutes = makeRoutes({
    checkPassword: function () {
      return Promise.resolve(true);
    },
    config: {},
    customs: mockCustoms,
    db: mockDB,
    log: mockLog,
    mailer: mockMailer,
    push: mockPush,
    verificationReminders,
  });
  const route = getRoute(accountRoutes, '/recovery_email/verify_code');

  afterEach(() => {
    mockDB.verifyTokens.mockClear();
    mockDB.verifyEmail.mockClear();
    mockLog.activityEvent.mockClear();
    mockLog.flowEvent.mockClear();
    mockLog.notifyAttachedServices.mockClear();
    mockMailer.sendPostVerifyEmail.mockClear();
    mockMailer.sendVerifySecondaryCodeEmail.mockClear();
    mockFxaMailer.sendPostVerifyEmail.mockClear();
    mockFxaMailer.sendVerifySecondaryCodeEmail.mockClear();
    mockPush.notifyAccountUpdated.mockClear();
    verificationReminders.delete.mockClear();
  });

  describe('verifyTokens rejects with INVALID_VERIFICATION_CODE', () => {
    it('without a reminder payload', () => {
      return runTest(route, mockRequest, (response: any) => {
        expect(mockDB.verifyTokens).toHaveBeenCalledTimes(1);
        expect(mockDB.verifyEmail).toHaveBeenCalledTimes(1);
        expect(mockCustoms.checkAuthenticated).toHaveBeenCalledTimes(1);

        expect(mockLog.notifyAttachedServices).toHaveBeenCalledTimes(1);
        let args = mockLog.notifyAttachedServices.mock.calls[0];
        expect(args[0]).toBe('verified');
        expect(args[2].uid).toBe(uid);
        expect(args[2].service).toBe('sync');
        expect(args[2].country).toBe('United States');
        expect(args[2].countryCode).toBe('US');
        expect(args[2].userAgent).toBe('test user-agent');

        expect(mockFxaMailer.sendPostVerifyEmail).toHaveBeenCalledTimes(1);
        expect(mockFxaMailer.sendPostVerifyEmail).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            sync: mockRequest.payload.service === 'sync',
            uid,
          })
        );

        expect(mockLog.activityEvent).toHaveBeenCalledTimes(1);
        expect(mockLog.activityEvent).toHaveBeenNthCalledWith(1, {
          country: 'United States',
          event: 'account.verified',
          newsletters: undefined,
          region: 'California',
          service: 'sync',
          uid: uid.toString('hex'),
          userAgent: 'test user-agent',
          sigsciRequestId: 'test-sigsci-id',
          clientJa4: 'test-ja4',
          productId: undefined,
          planId: undefined,
          deviceId: undefined,
          flowBeginTime: undefined,
          flowId: undefined,
        });

        expect(mockLog.amplitudeEvent).toHaveBeenCalledTimes(1);
        args = mockLog.amplitudeEvent.mock.calls[0];
        expect(args[0].event_type).toBe('fxa_reg - email_confirmed');

        expect(mockLog.flowEvent).toHaveBeenCalledTimes(2);
        expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({ event: 'email.verify_code.clicked' })
        );
        expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({ event: 'account.verified' })
        );

        expect(mockPush.notifyAccountUpdated).toHaveBeenCalledTimes(1);
        args = mockPush.notifyAccountUpdated.mock.calls[0];
        expect(args).toHaveLength(3);
        expect(args[0].toString('hex')).toBe(uid);
        expect(Array.isArray(args[1])).toBeTruthy();
        expect(args[2]).toBe('accountVerify');

        expect(verificationReminders.delete).toHaveBeenCalledTimes(1);
        expect(verificationReminders.delete).toHaveBeenNthCalledWith(1, uid);

        expect(JSON.stringify(response)).toBe('{}');
      });
    });

    it('with newsletters', () => {
      mockRequest.payload.newsletters = ['test-pilot', 'firefox-pilot'];
      return runTest(route, mockRequest, (response: any) => {
        expect(mockLog.notifyAttachedServices).toHaveBeenCalledTimes(1);
        let args = mockLog.notifyAttachedServices.mock.calls[0];
        expect(args[0]).toBe('verified');
        expect(args[2].uid).toBe(uid);
        expect(args[2].newsletters).toEqual(['test-pilot', 'firefox-pilot']);
        expect(args[2].service).toBe('sync');

        expect(mockLog.amplitudeEvent).toHaveBeenCalledTimes(1);
        args = mockLog.amplitudeEvent.mock.calls[0];
        expect(args[0].event_type).toBe('fxa_reg - email_confirmed');

        expect(JSON.stringify(response)).toBe('{}');
      });
    });

    it('with a reminder payload', () => {
      mockRequest.payload.reminder = 'second';

      return runTest(route, mockRequest, (response: any) => {
        expect(mockLog.activityEvent).toHaveBeenCalledTimes(1);

        expect(mockLog.flowEvent).toHaveBeenCalledTimes(3);
        expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({ event: 'email.verify_code.clicked' })
        );
        expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({ event: 'account.verified' })
        );
        expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
          3,
          expect.objectContaining({ event: 'account.reminder.second' })
        );

        expect(verificationReminders.delete).toHaveBeenCalledTimes(1);
        expect(mockFxaMailer.sendPostVerifyEmail).toHaveBeenCalledTimes(1);
        expect(mockPush.notifyAccountUpdated).toHaveBeenCalledTimes(1);

        expect(JSON.stringify(response)).toBe('{}');
      });
    });
  });

  describe('verifyTokens resolves', () => {
    beforeAll(() => {
      dbData.emailVerified = true;
      dbErrors.verifyTokens = undefined;
    });

    it('email verification', () => {
      return runTest(route, mockRequest, (response: any) => {
        expect(mockDB.verifyTokens).toHaveBeenCalledTimes(1);
        expect(mockDB.verifyEmail).toHaveBeenCalledTimes(0);
        expect(mockLog.notifyAttachedServices).toHaveBeenCalledTimes(0);
        expect(mockLog.activityEvent).toHaveBeenCalledTimes(0);
        expect(mockPush.notifyAccountUpdated).toHaveBeenCalledTimes(0);
        expect(mockPush.notifyDeviceConnected).toHaveBeenCalledTimes(0);
      });
    });

    it('email verification with associated device', () => {
      mockDB.deviceFromTokenVerificationId = function (
        uid: any,
        tokenVerificationId: any
      ) {
        return Promise.resolve({
          name: 'my device',
          id: '123456789',
          type: 'desktop',
        });
      };
      return runTest(route, mockRequest, (response: any) => {
        expect(mockDB.verifyTokens).toHaveBeenCalledTimes(1);
        expect(mockDB.verifyEmail).toHaveBeenCalledTimes(0);
        expect(mockLog.notifyAttachedServices).toHaveBeenCalledTimes(0);
        expect(mockLog.activityEvent).toHaveBeenCalledTimes(0);
        expect(mockPush.notifyAccountUpdated).toHaveBeenCalledTimes(0);
        expect(mockPush.notifyDeviceConnected).toHaveBeenCalledTimes(1);
      });
    });

    it('sign-in confirmation', () => {
      dbData.emailCode = crypto.randomBytes(16);

      return runTest(route, mockRequest, (response: any) => {
        expect(mockDB.verifyTokens).toHaveBeenCalledTimes(1);
        expect(mockDB.verifyEmail).toHaveBeenCalledTimes(0);
        expect(mockLog.notifyAttachedServices).toHaveBeenCalledTimes(0);

        expect(mockLog.activityEvent).toHaveBeenCalledTimes(1);
        expect(mockLog.activityEvent).toHaveBeenNthCalledWith(1, {
          country: 'United States',
          event: 'account.confirmed',
          region: 'California',
          service: 'sync',
          userAgent: 'test user-agent',
          sigsciRequestId: 'test-sigsci-id',
          clientJa4: 'test-ja4',
          uid: uid.toString('hex'),
        });

        expect(mockPush.notifyAccountUpdated).toHaveBeenCalledTimes(1);
        const notifyArgs = mockPush.notifyAccountUpdated.mock.calls[0];
        expect(notifyArgs).toHaveLength(3);
        expect(notifyArgs[0].toString('hex')).toBe(uid);
        expect(Array.isArray(notifyArgs[1])).toBeTruthy();
        expect(notifyArgs[2]).toBe('accountConfirm');
      });
    });
  });
});

describe('/recovery_email', () => {
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const mockLog = mocks.mockLog();
  let dbData: any,
    accountRoutes: any,
    mockDB: any,
    mockRequest: any,
    route: any,
    stripeHelper: any;
  const mockMailer = mocks.mockMailer();
  const mockPush = mocks.mockPush();
  const mockCustoms = mocks.mockCustoms();

  beforeEach(() => {
    mocks.mockOAuthClientInfo();
    mockRequest = mocks.mockRequest({
      credentials: {
        uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
        deviceId: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
        email: TEST_EMAIL,
        emailVerified: true,
        tokenVerified: true,
        normalizedEmail: normalizeEmail(TEST_EMAIL),
      },
      log: mockLog,
      payload: {
        email: TEST_EMAIL_ADDITIONAL,
      },
    });
    dbData = {
      email: TEST_EMAIL,
      uid: uid,
      secondEmail: TEST_EMAIL_ADDITIONAL,
      secondEmailCode: '123123',
    };
    mockDB = mocks.mockDB(dbData);
    stripeHelper = mocks.mockStripeHelper();
    stripeHelper.hasActiveSubscription = jest.fn().mockResolvedValue(false);
    accountRoutes = makeRoutes({
      checkPassword: function () {
        return Promise.resolve(true);
      },
      config: {
        secondaryEmail: {
          minUnverifiedAccountTime: MS_IN_DAY,
        },
      },
      customs: mockCustoms,
      db: mockDB,
      log: mockLog,
      mailer: mockMailer,
      push: mockPush,
      stripeHelper,
    });
  });

  afterEach(() => {
    mocks.unMockAccountEventsManager();
  });

  describe('/recovery_emails', () => {
    it('should get all account emails', () => {
      route = getRoute(accountRoutes, '/recovery_emails');
      return runTest(route, mockRequest, (response: any) => {
        expect(response).toHaveLength(1);
        expect(response[0].email).toBe(dbData.email);
        expect(mockDB.account).toHaveBeenCalledTimes(1);
      });
    });
  });
});

describe('/mfa/recovery_email/secondary/resend_code', () => {
  let fxaMailer: any;
  beforeEach(() => {
    mocks.mockOAuthClientInfo();
    fxaMailer = mocks.mockFxaMailer();
  });
  afterEach(() => {
    fxaMailer.sendVerifySecondaryCodeEmail.mockClear();
  });
  it('resends code when redis reservation exists for this uid', async () => {
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const email = TEST_EMAIL_ADDITIONAL;
    const mockLog = mocks.mockLog();
    const mockMailer = mocks.mockMailer();
    const mockDB = mocks.mockDB({
      uid,
      email: TEST_EMAIL,
      emailVerified: true,
    });
    const secret = 'abcd1234abcd1234abcd1234abcd1234';

    const authServerCacheRedis = {
      get: jest.fn().mockResolvedValue(JSON.stringify({ uid, secret })),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };

    const routes = makeRoutes(
      {
        authServerCacheRedis,
        mailer: mockMailer,
        log: mockLog,
        db: mockDB,
      },
      {}
    );
    const route = getRoute(routes, '/mfa/recovery_email/secondary/resend_code');

    const request = mocks.mockRequest({
      credentials: {
        uid,
        email: TEST_EMAIL,
        deviceId: 'device-xyz',
      },
      payload: { email },
      app: { geo: knownIpLocation },
    });

    const otpUtilsLocal = require('./utils/otp').default(
      {},
      { histogram: () => {} }
    );
    const expectedCode = otpUtilsLocal.generateOtpCode(secret, otpOptions);

    const response = await runTest(route, request);
    expect(response).toBeTruthy();
    expect(fxaMailer.sendVerifySecondaryCodeEmail).toHaveBeenCalledTimes(1);
    const args = fxaMailer.sendVerifySecondaryCodeEmail.mock.calls[0];
    expect(args[0].email).toBe(email);
    expect(args[0].code).toBe(expectedCode);
  });

  it('recreates reservation when expired and resends code', async () => {
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const email = TEST_EMAIL_ADDITIONAL;
    const normalized = normalizeEmail(email);
    const mockMailer = mocks.mockMailer();
    const mockLog = mocks.mockLog();
    const mockDB = mocks.mockDB({
      email: TEST_EMAIL,
      emailVerified: true,
    });
    // Simulate no secondary email found in DB (email is available)
    mockDB.getSecondaryEmail = jest.fn().mockRejectedValue({
      errno: error.ERRNO.SECONDARY_EMAIL_UNKNOWN,
    });
    const authServerCacheRedis = {
      get: jest.fn().mockResolvedValue(null), // No Redis reservation (expired)
      set: jest.fn().mockResolvedValue('OK'), // Will create new reservation
      del: jest.fn().mockResolvedValue(1),
    };
    const routes = makeRoutes(
      {
        authServerCacheRedis,
        mailer: mockMailer,
        log: mockLog,
        db: mockDB,
      },
      {}
    );
    const route = getRoute(routes, '/mfa/recovery_email/secondary/resend_code');
    const request = mocks.mockRequest({
      credentials: { uid, email: TEST_EMAIL },
      payload: { email },
    });

    const response = await runTest(route, request);
    expect(response).toBeTruthy();
    // Verify new reservation was created
    expect(authServerCacheRedis.set).toHaveBeenCalledTimes(1);
    const setArgs = authServerCacheRedis.set.mock.calls[0];
    expect(setArgs[0]).toContain(normalized); // Key includes email
    expect(setArgs[2]).toBe('EX'); // Expiration flag
    expect(setArgs[4]).toBe('NX'); // Only set if not exists
    // Verify email was sent
    expect(fxaMailer.sendVerifySecondaryCodeEmail).toHaveBeenCalledTimes(1);
    expect(mockLog.info).toHaveBeenCalledTimes(1);
    expect(mockLog.info).toHaveBeenNthCalledWith(
      1,
      'secondary_email.reservation_recreated',
      expect.objectContaining({ reason: 'expired' })
    );
  });

  it('errors when reservation belongs to a different uid', async () => {
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const otherUid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const email = TEST_EMAIL_ADDITIONAL;
    const mockMailer = mocks.mockMailer();
    const mockDB = mocks.mockDB({
      uid,
      email: TEST_EMAIL,
      emailVerified: true,
    });
    const authServerCacheRedis = {
      get: jest
        .fn()
        .mockResolvedValue(JSON.stringify({ uid: otherUid, secret: 'abc' })),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };
    const routes = makeRoutes(
      { authServerCacheRedis, mailer: mockMailer, db: mockDB },
      {}
    );
    const route = getRoute(routes, '/mfa/recovery_email/secondary/resend_code');
    const request = mocks.mockRequest({
      credentials: { uid, email: TEST_EMAIL },
      payload: { email },
    });
    await expect(runTest(route, request)).rejects.toMatchObject({
      errno: error.ERRNO.RESEND_EMAIL_CODE_TO_UNOWNED_EMAIL,
    });
  });

  it('cleans corrupted redis record and recreates reservation', async () => {
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const email = TEST_EMAIL_ADDITIONAL;
    const normalized = normalizeEmail(email);
    const mockMailer = mocks.mockMailer();
    const mockLog = mocks.mockLog();
    const mockDB = mocks.mockDB({
      email: TEST_EMAIL,
      emailVerified: true,
    });
    mockDB.getSecondaryEmail = jest.fn().mockRejectedValue({
      errno: error.ERRNO.SECONDARY_EMAIL_UNKNOWN,
    });
    const authServerCacheRedis = {
      get: jest.fn().mockResolvedValue('not-json'), // Corrupted JSON
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };
    const routes = makeRoutes(
      {
        authServerCacheRedis,
        mailer: mockMailer,
        log: mockLog,
        db: mockDB,
      },
      {}
    );
    const route = getRoute(routes, '/mfa/recovery_email/secondary/resend_code');
    const request = mocks.mockRequest({
      credentials: { uid, email: TEST_EMAIL },
      payload: { email },
    });

    const response = await runTest(route, request);
    expect(response).toBeTruthy();
    // Verify corrupted record was deleted
    expect(authServerCacheRedis.del).toHaveBeenCalledTimes(1);
    // Verify warning was logged
    expect(mockLog.warn).toHaveBeenCalled();
    expect(mockLog.warn).toHaveBeenNthCalledWith(
      1,
      'secondary_email.corrupted_redis_record',
      expect.anything()
    );
    // Verify new reservation was created
    expect(authServerCacheRedis.set).toHaveBeenCalledTimes(1);
    // Verify email was sent
    expect(fxaMailer.sendVerifySecondaryCodeEmail).toHaveBeenCalledTimes(1);
    // Verify recreation was logged with correct reason
    expect(mockLog.info).toHaveBeenCalledWith(
      'secondary_email.reservation_recreated',
      {
        uid,
        normalizedEmail: normalized,
        reason: 'corrupted',
      }
    );
  });

  it('errors when trying to resend to primary email', async () => {
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const primaryEmail = TEST_EMAIL;
    const mockMailer = mocks.mockMailer();
    const mockDB = mocks.mockDB({
      email: primaryEmail,
      emailVerified: true,
    });
    const authServerCacheRedis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };
    const routes = makeRoutes(
      {
        authServerCacheRedis,
        mailer: mockMailer,
        db: mockDB,
      },
      {}
    );
    const route = getRoute(routes, '/mfa/recovery_email/secondary/resend_code');
    const request = mocks.mockRequest({
      credentials: { uid, email: primaryEmail },
      payload: { email: primaryEmail }, // Trying to resend to their own primary
    });

    await expect(runTest(route, request)).rejects.toMatchObject({
      errno: error.ERRNO.USER_PRIMARY_EMAIL_EXISTS,
    });
    expect(mockMailer.sendVerifySecondaryCodeEmail).not.toHaveBeenCalled();
  });

  it('errors when trying to resend to already verified secondary', async () => {
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const uidBuffer = Buffer.from(uid, 'hex');
    const email = TEST_EMAIL_ADDITIONAL;
    const mockMailer = mocks.mockMailer();
    const mockDB = mocks.mockDB({
      email: TEST_EMAIL,
      emailVerified: true,
    });
    // Simulate already verified secondary email
    mockDB.getSecondaryEmail = jest.fn().mockResolvedValue({
      uid: uidBuffer,
      email,
      normalizedEmail: normalizeEmail(email),
      isVerified: true,
      isPrimary: false,
    });
    const authServerCacheRedis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };
    const routes = makeRoutes(
      {
        authServerCacheRedis,
        mailer: mockMailer,
        db: mockDB,
      },
      {}
    );
    const route = getRoute(routes, '/mfa/recovery_email/secondary/resend_code');
    const request = mocks.mockRequest({
      credentials: { uid, email: TEST_EMAIL },
      payload: { email },
    });

    await expect(runTest(route, request)).rejects.toMatchObject({
      errno: error.ERRNO.ACCOUNT_OWNS_EMAIL,
    });
    expect(mockMailer.sendVerifySecondaryCodeEmail).not.toHaveBeenCalled();
  });

  it('returns service error when DB fails during recreation', async () => {
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const email = TEST_EMAIL_ADDITIONAL;
    const mockMailer = mocks.mockMailer();
    const mockLog = mocks.mockLog();
    const mockDB = mocks.mockDB({
      email: TEST_EMAIL,
      emailVerified: true,
    });
    // Simulate DB failure
    mockDB.getSecondaryEmail = jest
      .fn()
      .mockRejectedValue(new Error('Database connection failed'));
    const authServerCacheRedis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };
    const routes = makeRoutes(
      {
        authServerCacheRedis,
        mailer: mockMailer,
        log: mockLog,
        db: mockDB,
      },
      {}
    );
    const route = getRoute(routes, '/mfa/recovery_email/secondary/resend_code');
    const request = mocks.mockRequest({
      credentials: { uid, email: TEST_EMAIL },
      payload: { email },
    });

    await expect(runTest(route, request)).rejects.toMatchObject({
      errno: error.ERRNO.BACKEND_SERVICE_FAILURE,
    });
    // Verify error was logged
    expect(mockLog.error).toHaveBeenCalled();
    expect(mockLog.error).toHaveBeenNthCalledWith(
      1,
      'secondary_email.reservation_recreation_failed',
      expect.anything()
    );
    expect(mockMailer.sendVerifySecondaryCodeEmail).not.toHaveBeenCalled();
  });

  it('cleans up new reservation when email send fails', async () => {
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const email = TEST_EMAIL_ADDITIONAL;
    const mockMailer = mocks.mockMailer();
    const mockLog = mocks.mockLog();
    const mockDB = mocks.mockDB({
      uid,
      email: TEST_EMAIL,
      emailVerified: true,
    });
    mockDB.getSecondaryEmail = jest.fn().mockRejectedValue({
      errno: error.ERRNO.SECONDARY_EMAIL_UNKNOWN,
    });
    // Simulate email send failure
    fxaMailer.sendVerifySecondaryCodeEmail.mockRejectedValue(
      new Error('Email service unavailable')
    );
    const authServerCacheRedis = {
      get: jest.fn().mockResolvedValue(null), // No existing reservation
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };
    const routes = makeRoutes(
      {
        authServerCacheRedis,
        mailer: mockMailer,
        log: mockLog,
        db: mockDB,
      },
      {}
    );
    const route = getRoute(routes, '/mfa/recovery_email/secondary/resend_code');
    const request = mocks.mockRequest({
      credentials: { uid, email: TEST_EMAIL },
      payload: { email },
    });

    await expect(runTest(route, request)).rejects.toMatchObject({
      errno: error.ERRNO.FAILED_TO_SEND_EMAIL,
    });
    // Verify new reservation was created
    expect(authServerCacheRedis.set).toHaveBeenCalledTimes(1);
    // Verify it was cleaned up after email failure
    expect(authServerCacheRedis.del).toHaveBeenCalledTimes(1);
    // Verify error was logged
    expect(mockLog.error).toHaveBeenCalled();
    expect(mockLog.error).toHaveBeenNthCalledWith(
      1,
      'secondary_email.resendVerifySecondaryCodeEmail.error',
      expect.anything()
    );
  });

  it('preserves existing reservation when email send fails', async () => {
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const email = TEST_EMAIL_ADDITIONAL;
    const secret = 'existingsecret1234567890123456';
    const mockMailer = mocks.mockMailer();
    const mockLog = mocks.mockLog();
    const mockDB = mocks.mockDB({
      uid,
      email: TEST_EMAIL,
      emailVerified: true,
    });
    // Simulate email send failure
    fxaMailer.sendVerifySecondaryCodeEmail.mockRejectedValue(
      new Error('Email service unavailable')
    );
    const authServerCacheRedis = {
      get: jest.fn().mockResolvedValue(JSON.stringify({ uid, secret })), // Existing reservation
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };
    const routes = makeRoutes(
      {
        authServerCacheRedis,
        mailer: mockMailer,
        log: mockLog,
        db: mockDB,
      },
      {}
    );
    const route = getRoute(routes, '/mfa/recovery_email/secondary/resend_code');
    const request = mocks.mockRequest({
      credentials: { uid, email: TEST_EMAIL },
      payload: { email },
    });

    await expect(runTest(route, request)).rejects.toMatchObject({
      errno: error.ERRNO.FAILED_TO_SEND_EMAIL,
    });
    // Verify no new reservation was created
    expect(authServerCacheRedis.set).not.toHaveBeenCalled();
    // Verify existing reservation was NOT deleted
    expect(authServerCacheRedis.del).not.toHaveBeenCalled();
    // Verify error was logged
    expect(mockLog.error).toHaveBeenCalled();
    expect(mockLog.error).toHaveBeenNthCalledWith(
      1,
      'secondary_email.resendVerifySecondaryCodeEmail.error',
      expect.anything()
    );
  });
});

describe('/emails/reminders/cad', () => {
  const mockLog = mocks.mockLog();
  let accountRoutes: any, mockRequest: any, route: any, uid: string;

  beforeEach(() => {
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');

    mockRequest = mocks.mockRequest({
      credentials: {
        uid,
        deviceId: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
        email: TEST_EMAIL,
        emailVerified: true,
        normalizedEmail: normalizeEmail(TEST_EMAIL),
      },
      log: mockLog,
    });

    accountRoutes = makeRoutes({
      log: mockLog,
      cadReminders,
    });
  });

  it('invokes cadReminder.create', async () => {
    route = getRoute(accountRoutes, '/emails/reminders/cad');
    const response = await runTest(route, mockRequest);

    expect(cadReminders.get).toHaveBeenCalledTimes(1);
    expect(cadReminders.get).toHaveBeenCalledWith(uid);
    expect(cadReminders.create).toHaveBeenCalledTimes(1);

    expect(response).toBeTruthy();
    expect(Object.keys(response)).toHaveLength(0);
  });

  describe('with existing reminders', () => {
    beforeEach(() => {
      cadReminders = mocks.mockCadReminders({
        get: { first: 1, second: null, third: null },
      });
      accountRoutes = makeRoutes({
        log: mockLog,
        cadReminders,
      });
    });

    it('ignores request if reminders exist for user', async () => {
      route = getRoute(accountRoutes, '/emails/reminders/cad');
      const response = await runTest(route, mockRequest);

      expect(cadReminders.get).toHaveBeenCalledTimes(1);
      expect(cadReminders.get).toHaveBeenCalledWith(uid);
      expect(cadReminders.create).not.toHaveBeenCalled();

      expect(response).toBeTruthy();
      expect(Object.keys(response)).toHaveLength(0);
    });
  });
});
