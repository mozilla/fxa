/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const chai = require('chai');
const assert = { ...sinon.assert, ...chai.assert };
const uuid = require('uuid');
const sandbox = sinon.createSandbox();
const { getRoute } = require('../../../routes_helpers');
const { OAUTH_SCOPE_SUBSCRIPTIONS } = require('fxa-shared/oauth/constants');
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';
import { ERRNO } from '../../../../lib/error';

const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const TEST_EMAIL = 'testo@example.gg';
const ACCOUNT_LOCALE = 'en-US';

const MOCK_SCOPES = ['profile:email', OAUTH_SCOPE_SUBSCRIPTIONS];
const VALID_REQUEST = {
  auth: {
    credentials: {
      scope: MOCK_SCOPES,
      user: `${UID}`,
      email: `${TEST_EMAIL}`,
    },
  },
  query: {
    uid: `${UID}`,
  },
};
const mockCustomer = { id: 'cus_testo', subscriptions: { data: {} } };
const mockSubsAndBillingDetails = {
  subscriptions: [
    {
      _subscription_type: 'web',
      subscription_id: 'sub_1JhyIYBVqmGyQTMa3XMF6ADj',
    },
  ],
  payment_provider: 'dinersclub',
};
const mockFormattedWebSubscription = {
  created: 1588972390,
  current_period_end: 1591650790,
  current_period_start: 1588972390,
  plan_changed: null,
  previous_product: null,
  product_name: 'Amazing Product',
  status: 'active',
  subscription_id: 'sub_12345',
};
const mockAbbrevPlayPurchase = {
  auto_renewing: true,
  expiry_time_millis: Date.now(),
  package_name: 'org.mozilla.cooking.with.foxkeh',
  sku: 'org.mozilla.foxkeh.yearly',
};
const iap_product_id = 'iap_prod_lol';
const iap_product_name = 'LOL Daily';
const mocks = require('../../../mocks');
const log = mocks.mockLog();
const db = mocks.mockDB({
  uid: UID,
  email: TEST_EMAIL,
  locale: ACCOUNT_LOCALE,
});
const customs = mocks.mockCustoms();
let stripeHelper;
const {
  mozillaSubscriptionRoutes,
} = require('../../../../lib/routes/subscriptions/mozilla');

async function runTest(routePath, routeDependencies = {}) {
  const playSubscriptions = {
    getSubscriptions: sandbox.stub().resolves([mockAbbrevPlayPurchase]),
  };
  const routes = mozillaSubscriptionRoutes({
    log,
    db,
    customs,
    stripeHelper,
    playSubscriptions,
    ...routeDependencies,
  });
  const route = getRoute(routes, routePath, 'GET');
  const request = mocks.mockRequest(VALID_REQUEST);
  return route.handler(request);
}

describe('mozilla-subscriptions', () => {
  beforeEach(() => {
    stripeHelper = {
      getBillingDetailsAndSubscriptions: sandbox
        .stub()
        .resolves(mockSubsAndBillingDetails),
      addProductInfoToAbbrevPlayPurchases: sandbox.stub().resolves([
        {
          ...mockAbbrevPlayPurchase,
          product_id: iap_product_id,
          product_name: iap_product_name,
        },
      ]),
      fetchCustomer: sandbox.stub().resolves(mockCustomer),
      formatSubscriptionsForSupport: sandbox
        .stub()
        .resolves([mockFormattedWebSubscription]),
    };
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('GET /customer/billing-and-subscriptions', () => {
    it('gets customer billing details and Stripe and Google Play subscriptions', async () => {
      const resp = await runTest(
        '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
      );
      assert.deepEqual(resp, {
        ...mockSubsAndBillingDetails,
        subscriptions: [
          ...mockSubsAndBillingDetails.subscriptions,
          {
            _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
            product_id: iap_product_id,
            product_name: iap_product_name,
            ...mockAbbrevPlayPurchase,
          },
        ],
      });
    });

    it('gets customer billing details and only Stripe subscriptions', async () => {
      const playSubscriptions = {
        getSubscriptions: sandbox.stub().resolves([]),
      };
      stripeHelper.addProductInfoToAbbrevPlayPurchases = sandbox
        .stub()
        .resolves([]);
      const resp = await runTest(
        '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions',
        {
          playSubscriptions,
        }
      );
      assert.deepEqual(resp, {
        ...mockSubsAndBillingDetails,
        subscriptions: [...mockSubsAndBillingDetails.subscriptions],
      });
    });

    it('gets customer billing details and only Google Play subscriptions', async () => {
      const stripeHelper = {
        getBillingDetailsAndSubscriptions: sandbox.stub().resolves(null),
        addProductInfoToAbbrevPlayPurchases: sandbox.stub().resolves([
          {
            ...mockAbbrevPlayPurchase,
            product_id: iap_product_id,
            product_name: iap_product_name,
          },
        ]),
      };
      const resp = await runTest(
        '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions',
        {
          stripeHelper,
        }
      );
      assert.deepEqual(resp, {
        subscriptions: [
          {
            _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
            product_id: iap_product_id,
            product_name: iap_product_name,
            ...mockAbbrevPlayPurchase,
          },
        ],
      });
    });

    it('throws an error when there are no subsriptions', async () => {
      const playSubscriptions = {
        getSubscriptions: sandbox.stub().resolves([]),
      };
      const stripeHelper = {
        getBillingDetailsAndSubscriptions: sandbox.stub().resolves(null),
        addProductInfoToAbbrevPlayPurchases: sandbox.stub().resolves([]),
      };
      try {
        await runTest(
          '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions',
          {
            playSubscriptions,
            stripeHelper,
          }
        );
        assert.fail('an error should have been thrown');
      } catch (e) {
        assert.strictEqual(e.errno, ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });
  });

  describe('GET /oauth/mozilla-subscriptions/support-panel/subscriptions', () => {
    it('gets the expected subscriptions', async () => {
      const resp = await runTest(
        '/oauth/mozilla-subscriptions/support-panel/subscriptions',
        {
          stripeHelper,
        }
      );
      assert.deepEqual(resp, {
        [MozillaSubscriptionTypes.WEB]: [mockFormattedWebSubscription],
        [MozillaSubscriptionTypes.IAP_GOOGLE]: [
          {
            ...mockAbbrevPlayPurchase,
            product_id: iap_product_id,
            product_name: iap_product_name,
          },
        ],
      });
      assert.calledOnceWithExactly(stripeHelper.fetchCustomer, UID);
      assert.calledOnceWithExactly(
        stripeHelper.formatSubscriptionsForSupport,
        mockCustomer.subscriptions
      );
    });
  });
});
