/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import nock from 'nock';

import { AuthServerErrno } from '../../lib/errors';

import {
  PRODUCT_ID,
  PRODUCT_REDIRECT_URLS,
  MOCK_PLANS,
  MOCK_PROFILE,
  MOCK_CUSTOMER,
  MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
  expectNockScopesDone,
  defaultAppContextValue,
  MockApp,
  setupMockConfig,
  mockConfig,
  mockServerUrl,
  mockOptionsResponses,
} from '../../lib/test-utils';

jest.mock('../../lib/sentry');

jest.mock('../../lib/flow-event');

import { SignInLayout } from '../../components/AppLayout';
import Product from './index';
import { AppContextType } from '../../lib/AppContext';
import { defaultConfig } from 'fxa-payments-server/src/lib/config';

describe('routes/Product', () => {
  let authServer = '';
  let profileServer = '';

  beforeEach(() => {
    setupMockConfig({
      ...mockConfig,
      productRedirectURLs: PRODUCT_REDIRECT_URLS,
    });
    authServer = mockServerUrl('auth');
    mockOptionsResponses(authServer);
    profileServer = mockServerUrl('profile');
    mockOptionsResponses(profileServer);
  });

  afterEach(() => {
    nock.cleanAll();
    return cleanup();
  });

  const Subject = ({
    productId = PRODUCT_ID,
    planId,
    accountActivated,
    matchMedia = jest.fn(() => false),
    navigateToUrl = jest.fn(),
    appContext = defaultAppContextValue(),
  }: {
    productId?: string;
    planId?: string;
    matchMedia?: (query: string) => boolean;
    navigateToUrl?: (url: string) => void;
    accountActivated?: string;
    appContext?: Partial<AppContextType>;
  }) => {
    const props = {
      match: {
        params: {
          productId,
        },
      },
      createSubscriptionMounted: () => {},
      createSubscriptionEngaged: () => {},
    };
    const appContextValue = {
      ...defaultAppContextValue(),
      ...appContext,
      matchMedia,
      navigateToUrl: navigateToUrl || jest.fn(),
      queryParams: {
        plan: planId,
        activated: accountActivated,
      },
    };
    return (
      <MockApp {...{ appContextValue }}>
        <SignInLayout>
          <Product {...props} />
        </SignInLayout>
      </MockApp>
    );
  };

  const initApiMocks = (displayName?: string) => [
    nock(profileServer)
      .get('/v1/profile')
      .reply(
        200,
        { ...MOCK_PROFILE, displayName },
        { 'Access-Control-Allow-Origin': '*' }
      ),
    nock(authServer)
      .get('/v1/oauth/subscriptions/plans')
      .reply(200, MOCK_PLANS, { 'Access-Control-Allow-Origin': '*' }),
    nock(authServer)
      .get('/v1/oauth/subscriptions/customer')
      .reply(200, MOCK_CUSTOMER, { 'Access-Control-Allow-Origin': '*' }),
  ];

  const initSubscribedApiMocks = (useDefaultIcon: boolean = false) => [
    nock(profileServer)
      .get('/v1/profile')
      .reply(200, MOCK_PROFILE, { 'Access-Control-Allow-Origin': '*' }),
    nock(authServer)
      .get('/v1/oauth/subscriptions/plans')
      .reply(200, MOCK_PLANS, { 'Access-Control-Allow-Origin': '*' }),
    nock(authServer)
      .get('/v1/oauth/subscriptions/customer')
      .reply(200, MOCK_CUSTOMER_AFTER_SUBSCRIPTION, {
        'Access-Control-Allow-Origin': '*',
      }),
  ];

  it('renders with product ID and display name', async () => {
    const displayName = 'Foo Barson';
    const apiMocks = initApiMocks(displayName);
    const { findAllByText, queryByText, queryAllByText } = render(<Subject />);
    if (window.onload) {
      dispatchEvent(new Event('load'));
    }

    await findAllByText('Set up your subscription');
    expect(
      queryAllByText('30-day money-back guarantee')[0]
    ).toBeInTheDocument();
    expect(queryByText('Payment information')).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('displays an error with invalid product ID', async () => {
    const apiMocks = initApiMocks();
    const { findByTestId, queryByTestId } = render(
      <Subject productId="bad_product" />
    );
    await findByTestId('no-such-plan-error');
    expect(queryByTestId('dialog-dismiss')).not.toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('displays an error on failure to load profile', async () => {
    const apiMocks = [
      nock(profileServer)
        .get('/v1/profile')
        .reply(400, MOCK_PROFILE, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(200, MOCK_CUSTOMER, { 'Access-Control-Allow-Origin': '*' }),
    ];
    const { findByTestId } = render(<Subject />);
    const errorEl = await findByTestId('error-loading-profile');
    expect(errorEl).toBeInTheDocument();
  });

  it('displays an error on failure to load plans', async () => {
    const apiMocks = [
      nock(profileServer).get('/v1/profile').reply(200, MOCK_PROFILE),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(400, MOCK_PLANS),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(200, MOCK_CUSTOMER),
    ];
    const { findByTestId } = render(<Subject />);
    const errorEl = await findByTestId('error-loading-plans');
    expect(errorEl).toBeInTheDocument();
  });

  it('displays an error on failure to load customer', async () => {
    const apiMocks = [
      nock(profileServer)
        .get('/v1/profile')
        .reply(200, MOCK_PROFILE, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(400, MOCK_CUSTOMER, { 'Access-Control-Allow-Origin': '*' }),
    ];
    const { findByTestId } = render(<Subject />);
    const errorEl = await findByTestId('error-loading-customer');
    expect(errorEl).toBeInTheDocument();
  });

  it('does not display an error on missing / new customer', async () => {
    const apiMocks = [
      nock(profileServer)
        .get('/v1/profile')
        .reply(200, MOCK_PROFILE, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(
          404,
          { errno: AuthServerErrno.UNKNOWN_SUBSCRIPTION_CUSTOMER },
          { 'Access-Control-Allow-Origin': '*' }
        ),
    ];
    const { findAllByText } = render(<Subject />);
    const headingEls = await findAllByText('Set up your subscription');
    expect(headingEls.length).toBeGreaterThan(0);
  });

  it('does not display an error on customer with no subscriptions', async () => {
    const apiMocks = [
      nock(profileServer)
        .get('/v1/profile')
        .reply(200, MOCK_PROFILE, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(
          200,
          { ...MOCK_CUSTOMER, subscriptions: [] },
          { 'Access-Control-Allow-Origin': '*' }
        ),
    ];
    const { findAllByText } = render(<Subject />);
    const headingEls = await findAllByText('Set up your subscription');
    expect(headingEls.length).toBeGreaterThan(0);
  });

  it('offers upgrade if user is already subscribed to another plan in the same product set', async () => {
    const apiMocks = initSubscribedApiMocks();
    const { findByTestId } = render(
      <Subject
        {...{
          planId: 'plan_upgrade',
          productId: 'prod_upgrade',
          appContext: {
            config: {
              ...defaultConfig(),
              featureFlags: { allowSubscriptionUpgrades: true },
            },
          },
        }}
      />
    );
    const upgradeEl = await findByTestId('subscription-upgrade');
    expect(upgradeEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('blocks upgrade when the feature flag disallows it', async () => {
    initSubscribedApiMocks();
    const { findByTestId } = render(
      <Subject
        {...{
          planId: 'plan_upgrade',
          productId: 'prod_upgrade',
          appContext: {
            config: {
              ...defaultConfig(),
              featureFlags: { allowSubscriptionUpgrades: false },
            },
          },
        }}
      />
    );
    const errorEl = await findByTestId('payment-error');
    expect(errorEl).toBeInTheDocument();
  });

  it('blocks upgrade if already subscribed to a different plan of the same product', async () => {
    // This is temporary until we get the upgrade feature figured out.
    // The test above checks to see if a plan is upgradeable by looking at
    // metadata, but we are also explicity checking the plan and product ids
    // even if the plans are not in the same product set.
    const apiMocks = initSubscribedApiMocks();
    const { findByTestId } = render(
      <Subject
        {...{
          planId: 'nextlevel',
          productId: PRODUCT_ID,
          appContext: {
            config: {
              ...defaultConfig(),
              featureFlags: { allowSubscriptionUpgrades: false },
            },
          },
        }}
      />
    );
    const errorEl = await findByTestId('payment-error');
    expect(errorEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('displays payment confirmation if user is already subscribed the product', async () => {
    const apiMocks = initSubscribedApiMocks();
    const { findByTestId } = render(<Subject />);
    const confirmEl = await findByTestId('payment-confirmation');
    expect(confirmEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });
});
