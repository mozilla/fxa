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
  }: {
    productId?: string;
    planId?: string;
    matchMedia?: (query: string) => boolean;
    navigateToUrl?: (url: string) => void;
    accountActivated?: string;
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
      .reply(200, { ...MOCK_PROFILE, displayName }),
    nock(authServer)
      .get('/v1/oauth/subscriptions/plans')
      .reply(200, MOCK_PLANS),
    nock(authServer)
      .get('/v1/oauth/subscriptions/customer')
      .reply(200, MOCK_CUSTOMER),
  ];

  const initSubscribedApiMocks = (useDefaultIcon: boolean = false) => [
    nock(profileServer).get('/v1/profile').reply(200, MOCK_PROFILE),
    nock(authServer)
      .get('/v1/oauth/subscriptions/plans')
      .reply(200, MOCK_PLANS),
    nock(authServer)
      .get('/v1/oauth/subscriptions/customer')
      .reply(200, MOCK_CUSTOMER_AFTER_SUBSCRIPTION),
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
    expect(queryByText('Billing Information')).toBeInTheDocument();
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
      nock(profileServer).get('/v1/profile').reply(400, MOCK_PROFILE),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(200, MOCK_CUSTOMER),
    ];
    const { findByTestId } = render(<Subject />);
    await findByTestId('error-loading-profile');
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
    await findByTestId('error-loading-plans');
  });

  it('displays an error on failure to load customer', async () => {
    const apiMocks = [
      nock(profileServer).get('/v1/profile').reply(200, MOCK_PROFILE),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(400, MOCK_CUSTOMER),
    ];
    const { findByTestId } = render(<Subject />);
    await findByTestId('error-loading-customer');
  });

  it('does not display an error on missing / new customer', async () => {
    const apiMocks = [
      nock(profileServer).get('/v1/profile').reply(200, MOCK_PROFILE),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(404, { errno: AuthServerErrno.UNKNOWN_SUBSCRIPTION_CUSTOMER }),
    ];
    const { findAllByText } = render(<Subject />);
    await findAllByText('Set up your subscription');
  });

  it('does not display an error on customer with no subscriptions', async () => {
    const apiMocks = [
      nock(profileServer).get('/v1/profile').reply(200, MOCK_PROFILE),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(200, { ...MOCK_CUSTOMER, subscriptions: null }),
    ];
    const { findAllByText } = render(<Subject />);
    await findAllByText('Set up your subscription');
  });

  it('offers upgrade if user is already subscribed to another plan in the same product set', async () => {
    const apiMocks = initSubscribedApiMocks();
    const { findByTestId } = render(
      <Subject
        {...{
          planId: 'plan_upgrade',
          productId: 'prod_upgrade',
        }}
      />
    );
    await findByTestId('subscription-upgrade');
    expectNockScopesDone(apiMocks);
  });

  it('displays payment confirmation if user is already subscribed the product', async () => {
    const apiMocks = initSubscribedApiMocks();
    const { findByTestId } = render(<Subject />);
    await findByTestId('payment-confirmation');
    expectNockScopesDone(apiMocks);
  });
});
