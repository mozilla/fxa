/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import noc from 'nock';

const { location } = window;

function nock(it: any) {
  //@ts-ignore
  return noc(...arguments).defaultReplyHeaders({
    'Access-Control-Allow-Origin': '*',
  });
}

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
import { AppContextType, defaultAppContext } from '../../lib/AppContext';
import { defaultConfig } from 'fxa-payments-server/src/lib/config';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';

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
    noc.cleanAll();
    return cleanup();
  });

  const Subject = ({
    productId = PRODUCT_ID,
    planId,
    matchMedia = jest.fn(() => false),
    navigateToUrl = jest.fn(),
    appContext = defaultAppContextValue(),
  }: {
    productId?: string;
    planId?: string;
    matchMedia?: (query: string) => boolean;
    navigateToUrl?: (url: string) => void;
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
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(200, MOCK_CUSTOMER, { 'Access-Control-Allow-Origin': '*' }),
  ];

  const initSubscribedApiMocks = ({
    mockProfile = MOCK_PROFILE,
    mockPlans = MOCK_PLANS,
    mockCustomer = MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
  } = {}) => [
    nock(profileServer)
      .get('/v1/profile')
      .reply(200, mockProfile, { 'Access-Control-Allow-Origin': '*' }),
    nock(authServer)
      .get('/v1/oauth/subscriptions/plans')
      .reply(200, mockPlans, { 'Access-Control-Allow-Origin': '*' }),
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(200, mockCustomer, {
        'Access-Control-Allow-Origin': '*',
      }),
  ];

  it('renders with product ID and display name', async () => {
    const displayName = 'Foo Barson';
    const apiMocks = initApiMocks(displayName);
    const { findAllByText, queryByText, queryAllByText } = render(<Subject />);

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
        .get(
          '/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
        )
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
        .get(
          '/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
        )
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
        .get(
          '/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
        )
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
        .get(
          '/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
        )
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
        .get(
          '/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
        )
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
            },
          },
        }}
      />
    );
    const upgradeEl = await findByTestId('subscription-upgrade');
    expect(upgradeEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('does not offer upgrade if another plan in the same product set does not have product order', async () => {
    const apiMocks = initSubscribedApiMocks();
    const { findAllByText, queryByTestId } = render(
      <Subject
        {...{
          planId: 'plan_no_upgrade',
          productId: 'prod_upgrade',
          appContext: {
            config: {
              ...defaultConfig(),
            },
          },
        }}
      />
    );
    await findAllByText('Set up your subscription');
    expect(queryByTestId('subscription-upgrade')).not.toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('does not allow a downgrade', async () => {
    const apiMocks = initSubscribedApiMocks();
    const { findByTestId } = render(
      <Subject
        {...{
          planId: 'plan_no_downgrade',
          productId: 'prod_upgrade',
          appContext: {
            config: {
              ...defaultConfig(),
            },
          },
        }}
      />
    );
    const errorEl = await findByTestId('subscription-noplanchange-title');
    expect(errorEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('displays roadblock for a different plan of the same product with no upgrade path', async () => {
    const apiMocks = initSubscribedApiMocks();
    const { findByTestId } = render(
      <Subject
        {...{
          planId: 'nextlevel',
          productId: PRODUCT_ID,
          appContext: {
            config: {
              ...defaultConfig(),
            },
          },
        }}
      />
    );
    const errorEl = await findByTestId('subscription-noplanchange-title');
    expect(errorEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('displays roadblock for an IAP subscribed product', async () => {
    const apiMocks = initSubscribedApiMocks({
      mockCustomer: {
        ...MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
        subscriptions: [
          {
            _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
            product_id: PRODUCT_ID,
          },
        ],
      },
    });
    const { findByTestId } = render(
      <Subject
        {...{
          planId: 'nextlevel',
          productId: PRODUCT_ID,
          appContext: {
            config: {
              ...defaultConfig(),
            },
          },
        }}
      />
    );
    const errorEl = await findByTestId('subscription-iapsubscribed-title');
    expect(errorEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('displays payment confirmation if user is already subscribed to the product', async () => {
    const apiMocks = initSubscribedApiMocks();
    const { findByTestId } = render(<Subject />);
    const confirmEl = await findByTestId('payment-confirmation');
    expect(confirmEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('redirects to content server when there is no access token', async () => {
    delete window.location;
    window.location = {};
    const setSpy = jest.fn();
    Object.defineProperty(window.location, 'href', { set: setSpy });

    const appContext = { ...defaultAppContextValue(), accessToken: undefined };
    render(<Subject productId="fizz" planId="quux" appContext={appContext} />);

    expect(setSpy).toHaveBeenCalledWith(
      'https://content.example/subscriptions/products/fizz?plan=quux&signin=yes'
    );

    window.location = location;
  });
});
