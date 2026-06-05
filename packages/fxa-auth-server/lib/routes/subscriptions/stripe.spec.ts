/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createMock } from '@golevelup/ts-jest';
import { AuthLogger } from '../../types';

const { Container } = require('typedi');
const uuid = require('uuid');
const mocks = require('../../../test/mocks');
const { AppError: error } = require('@fxa/accounts/errors');
const { StripeHelper } = require('../../payments/stripe');
const { CurrencyHelper } = require('../../payments/currencies');
const { PromotionCodeManager } = require('@fxa/payments/customer');

const { sanitizePlans, handleAuth } = require('.');

// Import the real buildTaxAddress for direct tests (not through the mock)
const { buildTaxAddress: realBuildTaxAddress } = jest.requireActual('./utils');

jest.mock('fxa-shared/db/models/auth', () => ({
  getAccountCustomerByUid: jest.fn(),
}));

jest.mock('../utils/account', () => ({
  deleteAccountIfUnverified: jest.fn(),
}));

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  buildTaxAddress: jest.fn(),
}));

const { StripeHandler: DirectStripeRoutes } = require('./stripe');

const { buildTaxAddress: buildTaxAddressStub } = require('./utils');
const { AppConfig } = require('../../types');
const { CapabilityService } = require('../../payments/capability');
const { PlayBilling } = require('../../payments/iap/google-play');
const subscription2 = require('../../../test/local/payments/fixtures/stripe/subscription2.json');
const cancelledSubscription = require('../../../test/local/payments/fixtures/stripe/subscription_cancelled.json');
const trialSubscription = require('../../../test/local/payments/fixtures/stripe/subscription_trialing.json');
const pastDueSubscription = require('../../../test/local/payments/fixtures/stripe/subscription_past_due.json');
const customerFixture = require('../../../test/local/payments/fixtures/stripe/customer1.json');
const emptyCustomer = require('../../../test/local/payments/fixtures/stripe/customer_new.json');

const currencyHelper = new CurrencyHelper({
  currenciesToCountries: { USD: ['US', 'GB', 'CA'] },
});
const mockCapabilityService: any = {};
const mockPromotionCodeManager: any = {};

let config: any,
  log: any,
  db: any,
  customs: any,
  push: any,
  mailer: any,
  profile: any;

const { OAUTH_SCOPE_SUBSCRIPTIONS } = require('fxa-shared/oauth/constants');
const {
  SubscriptionEligibilityResult,
} = require('fxa-shared/subscriptions/types');

const ACCOUNT_LOCALE = 'en-US';
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const NOW = Date.now();
const PLAN_ID_1 = 'plan_G93lTs8hfK7NNG';
const PLANS = mocks.mockPlans;
const SUBSCRIPTION_ID_1 = 'sub-8675309';
const ACTIVE_SUBSCRIPTIONS = [
  {
    uid: UID,
    subscriptionId: SUBSCRIPTION_ID_1,
    productId: PLANS[0].product_id,
    createdAt: NOW,
    cancelledAt: null,
  },
];
const MOCK_CLIENT_ID = '3c49430b43dfba77';
const MOCK_TTL = 3600;
const MOCK_SCOPES = ['profile:email', OAUTH_SCOPE_SUBSCRIPTIONS];
const mockCMSClients = mocks.mockCMSClients;

/**
 * To prevent the modification of the test objects loaded, which can impact other tests referencing the object,
 * a deep copy of the object can be created which uses the test object as a template
 *
 * @param {Object} object
 */
function deepCopy(object: any) {
  return JSON.parse(JSON.stringify(object));
}

describe('sanitizePlans', () => {
  it('removes capabilities from product & plan metadata', () => {
    const expected = [
      {
        plan_id: 'firefox_pro_basic_823',
        product_id: 'firefox_pro_basic',
        product_name: 'Firefox Pro Basic',
        interval: 'week',
        amount: '123',
        currency: 'usd',
        plan_metadata: {},
        product_metadata: {
          emailIconURL: 'http://example.com/image.jpg',
          successActionButtonURL: 'http://getfirefox.com',
        },
      },
      {
        plan_id: 'firefox_pro_basic_999',
        product_id: 'firefox_pro_pro',
        product_name: 'Firefox Pro Pro',
        interval: 'month',
        amount: '456',
        currency: 'usd',
        plan_metadata: {},
        product_metadata: {},
      },
      {
        plan_id: PLAN_ID_1,
        product_id: 'prod_G93l8Yn7XJHYUs',
        product_name: 'FN Tier 1',
        interval: 'month',
        amount: 499,
        current: 'usd',
        plan_metadata: {},
        product_metadata: {},
      },
    ];

    expect(sanitizePlans(PLANS)).toEqual(expected);
  });
});

/**
 * Stripe integration tests
 */
describe('subscriptions stripeRoutes', () => {
  beforeEach(() => {
    Container.reset();
    config = {
      subscriptions: {
        enabled: true,
        managementClientId: MOCK_CLIENT_ID,
        managementTokenTTL: MOCK_TTL,
        stripeApiKey: 'sk_test_1234',
        paypalNvpSigCredentials: {
          enabled: false,
        },
        unsupportedLocations: [],
      },
      currenciesToCountries: { USD: ['US', 'GB', 'CA'] },
      support: {
        ticketPayloadLimit: 131072,
      },
    };
    Container.set(AppConfig, config);

    const currencyHelper = new CurrencyHelper(config);
    Container.set(CurrencyHelper, currencyHelper);

    mockCapabilityService.getClients = jest.fn();
    mockCapabilityService.getClients.mockResolvedValue(mockCMSClients);
    Container.set(CapabilityService, mockCapabilityService);

    log = createMock<AuthLogger>();
    customs = mocks.mockCustoms();

    Container.set(AuthLogger, log);
    Container.set(PlayBilling, {});

    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
    });
    db.createAccountSubscription = jest.fn(async (data: any) => ({}));
    db.deleteAccountSubscription = jest.fn(
      async (uid: any, subscriptionId: any) => ({})
    );
    db.cancelAccountSubscription = jest.fn(async () => ({}));
    db.fetchAccountSubscriptions = jest.fn(async (uid: any) =>
      ACTIVE_SUBSCRIPTIONS.filter((s) => s.uid === uid)
    );
    db.getAccountSubscription = jest.fn(
      async (uid: any, subscriptionId: any) => {
        const subscription = ACTIVE_SUBSCRIPTIONS.filter(
          (s) => s.uid === uid && s.subscriptionId === subscriptionId
        )[0];
        if (typeof subscription === 'undefined') {
          throw { statusCode: 404, errno: 116 };
        }
        return subscription;
      }
    );

    push = mocks.mockPush();
    mailer = mocks.mockMailer();

    profile = mocks.mockProfile({
      deleteCache: jest.fn(async (uid: any) => ({})),
    });
  });

  afterEach(() => {
    Container.reset();
    jest.restoreAllMocks();
  });

  const VALID_REQUEST: any = {
    auth: {
      credentials: {
        scope: MOCK_SCOPES,
        user: `${UID}`,
        email: `${TEST_EMAIL}`,
      },
    },
    headers: {
      'accept-language': 'en',
    },
  };

  describe('Plans', () => {
    it('should list available subscription plans', async () => {
      const stripeHelper = mocks.mockStripeHelper(['allAbbrevPlans']);

      stripeHelper.allAbbrevPlans = jest.fn(async () => {
        return PLANS;
      });

      const directStripeRoutes = new DirectStripeRoutes(
        log,
        db,
        config,
        customs,
        push,
        mailer,
        profile,
        stripeHelper
      );

      const res = await directStripeRoutes.listPlans(VALID_REQUEST);
      expect(res).toEqual(sanitizePlans(PLANS));
    });
  });

  describe('listActive', () => {
    it('should list active subscriptions', async () => {
      const stripeHelper = mocks.mockStripeHelper(['fetchCustomer']);

      stripeHelper.fetchCustomer = jest.fn(async (uid: any, customer: any) => {
        return customerFixture;
      });

      const directStripeRoutes = new DirectStripeRoutes(
        log,
        db,
        config,
        customs,
        push,
        mailer,
        profile,
        stripeHelper
      );

      const expected = [
        {
          cancelledAt: null,
          createdAt: 1582765012000,
          productId: 'prod_test1',
          subscriptionId: 'sub_test1',
          uid: UID,
        },
      ];
      const res = await directStripeRoutes.listActive(VALID_REQUEST);
      expect(res).toEqual(expected);
    });
  });
});

describe('handleAuth', () => {
  const AUTH_UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const AUTH_EMAIL = 'auth@example.com';
  const DB_EMAIL = 'db@example.com';

  const VALID_AUTH = {
    credentials: {
      scope: MOCK_SCOPES,
      user: `${AUTH_UID}`,
      email: `${AUTH_EMAIL}`,
    },
  };

  const INVALID_AUTH = {
    credentials: {
      scope: 'profile',
      user: `${AUTH_UID}`,
      email: `${AUTH_EMAIL}`,
    },
  };

  let db: any;

  beforeAll(() => {
    db = mocks.mockDB({
      uid: AUTH_UID,
      email: DB_EMAIL,
      locale: ACCOUNT_LOCALE,
    });
  });

  it('throws an error when the scope is invalid', async () => {
    return handleAuth(db, INVALID_AUTH).then(
      () => Promise.reject(new Error('Method expected to reject')),
      (err: any) => {
        expect(err).toBeInstanceOf(error);
        expect(err.message).toBe('Requested scopes are not allowed');
      }
    );
  });

  describe('when fetchEmail is set to false', () => {
    it('returns the uid and the email from the auth header', async () => {
      const actual = await handleAuth(db, VALID_AUTH);
      expect(actual.uid).toBe(AUTH_UID);
      expect(actual.email).toBe(AUTH_EMAIL);
    });
  });

  describe('when fetchEmail is set to true', () => {
    it('returns the uid from the auth credentials and fetches the email from the database', async () => {
      const actual = await handleAuth(db, VALID_AUTH, true);
      expect(actual.uid).toBe(AUTH_UID);
      expect(actual.email).toBe(DB_EMAIL);
      expect(actual.account.email).toBe(DB_EMAIL);
    });

    it('should propogate errors from database', async () => {
      let failed = false;

      db.account = jest.fn(async () => {
        throw error.unknownAccount();
      });

      await handleAuth(db, VALID_AUTH, true).then(
        () => Promise.reject(new Error('Method expected to reject')),
        (err: any) => {
          failed = true;
          expect(err.message).toBe('Unknown account');
        }
      );

      expect(failed).toBe(true);
    });
  });
});

describe('DirectStripeRoutes', () => {
  let directStripeRoutesInstance: any;

  const VALID_REQUEST: any = {
    auth: {
      credentials: {
        scope: MOCK_SCOPES,
        user: `${UID}`,
        email: `${TEST_EMAIL}`,
      },
    },
    app: {
      devices: ['deviceId1', 'deviceId2'],
      clientAddress: '127.0.0.1',
    },
  };

  beforeEach(() => {
    config = {
      subscriptions: {
        enabled: true,
        managementClientId: MOCK_CLIENT_ID,
        managementTokenTTL: MOCK_TTL,
        stripeApiKey: 'sk_test_1234',
        productConfigsFirestore: { enabled: false },
        unsupportedLocations: ['CN'],
      },
    };

    log = createMock<AuthLogger>();
    customs = mocks.mockCustoms();
    profile = mocks.mockProfile({
      deleteCache: jest.fn(async (uid: any) => ({})),
    });
    mailer = mocks.mockMailer();

    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
      verifierSetAt: 0,
    });
    const stripeHelperMock: any = {};
    // Mock all methods from the prototype chain (including parent classes)
    let proto = StripeHelper.prototype;
    while (proto && proto !== Object.prototype) {
      Object.getOwnPropertyNames(proto).forEach((m) => {
        if (m !== 'constructor' && !stripeHelperMock[m]) {
          stripeHelperMock[m] = jest.fn();
        }
      });
      proto = Object.getPrototypeOf(proto);
    }
    stripeHelperMock.currencyHelper = currencyHelper;
    stripeHelperMock.stripe = {
      subscriptions: {
        del: jest.fn(async (uid: any) => undefined),
        cancel: jest.fn(async () => undefined),
      },
    };
    mockCapabilityService.getPlanEligibility = jest.fn();
    mockCapabilityService.getPlanEligibility.mockResolvedValue({
      subscriptionEligibilityResult: SubscriptionEligibilityResult.CREATE,
    });
    mockCapabilityService.getClients = jest.fn();
    mockCapabilityService.getClients.mockResolvedValue(mockCMSClients);
    Container.set(CapabilityService, mockCapabilityService);

    const mockSubscription = deepCopy(subscription2);
    mockPromotionCodeManager.applyPromoCodeToSubscription = jest.fn();
    mockPromotionCodeManager.applyPromoCodeToSubscription.mockResolvedValue(
      mockSubscription
    );
    Container.set(PromotionCodeManager, mockPromotionCodeManager);
    buildTaxAddressStub.mockReset();
    buildTaxAddressStub.mockReturnValue({
      countryCode: 'US',
      postalCode: '92841',
    });

    directStripeRoutesInstance = new DirectStripeRoutes(
      log,
      db,
      config,
      customs,
      push,
      mailer,
      profile,
      stripeHelperMock
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getClients', () => {
    it('returns client capabilities', async () => {
      const expected = await mockCapabilityService.getClients();
      const res = await directStripeRoutesInstance.getClients();
      expect(res).toEqual(expected);
    });
  });

  describe('listPlans', () => {
    it('returns the available plans without auth headers present', async () => {
      const expected = sanitizePlans(PLANS);
      const request = {};

      directStripeRoutesInstance.stripeHelper.allAbbrevPlans.mockResolvedValue(
        PLANS
      );
      const actual = await directStripeRoutesInstance.listPlans(request);

      expect(actual).toEqual(expected);
    });
  });

  describe('listActive', () => {
    describe('customer is found', () => {
      describe('customer has no subscriptions', () => {
        it('returns an empty array', async () => {
          directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
            emptyCustomer
          );
          const expected: any[] = [];
          const actual =
            await directStripeRoutesInstance.listActive(VALID_REQUEST);
          expect(actual).toEqual(expected);
        });
      });
      describe('customer has subscriptions', () => {
        it('returns only subscriptions that are trialing, active, or past_due', async () => {
          const customer = deepCopy(emptyCustomer);
          const setToCancelSubscription = deepCopy(cancelledSubscription);
          setToCancelSubscription.status = 'active';
          setToCancelSubscription.id = 'sub_123456';
          customer.subscriptions.data = [
            subscription2,
            trialSubscription,
            pastDueSubscription,
            cancelledSubscription,
            setToCancelSubscription,
          ];

          directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
            customer
          );

          const activeSubscriptions =
            await directStripeRoutesInstance.listActive(VALID_REQUEST);

          expect(activeSubscriptions).toHaveLength(4);
          expect(
            activeSubscriptions.find(
              (x: any) => x.subscriptionId === subscription2.id
            )
          ).toBeDefined();
          expect(
            activeSubscriptions.find(
              (x: any) => x.subscriptionId === trialSubscription.id
            )
          ).toBeDefined();
          expect(
            activeSubscriptions.find(
              (x: any) => x.subscriptionId === pastDueSubscription.id
            )
          ).toBeDefined();
          expect(
            activeSubscriptions.find(
              (x: any) => x.subscriptionId === setToCancelSubscription.id
            )
          ).toBeDefined();
          expect(
            activeSubscriptions.find(
              (x: any) => x.subscriptionId === cancelledSubscription.id
            )
          ).toBeUndefined();
        });
      });
    });

    describe('customer is not found', () => {
      it('returns an empty array', async () => {
        directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue();
        const expected: any[] = [];
        const actual =
          await directStripeRoutesInstance.listActive(VALID_REQUEST);
        expect(actual).toEqual(expected);
      });
    });
  });

  describe('buildTaxAddress', () => {
    beforeEach(() => {
      log = createMock<AuthLogger>();
    });

    it('returns tax location if complete', () => {
      const location = {
        countryCode: 'US',
        postalCode: '92841',
      };

      const taxAddress = realBuildTaxAddress(log, '127.0.0.1', location);

      expect(taxAddress).toEqual({
        countryCode: 'US',
        postalCode: '92841',
      });
    });

    it('returns undefined tax location incomplete', () => {
      const location = {
        postalCode: '92841',
      };

      const taxAddress = realBuildTaxAddress(log, '127.0.0.1', location);

      expect(taxAddress).toEqual(undefined);
    });
  });
});
