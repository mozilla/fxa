/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import noc from 'nock';

function nock(it: any) {
  //@ts-ignore
  return noc(...arguments).defaultReplyHeaders({
    'Access-Control-Allow-Origin': '*',
  });
}

import {
  PRODUCT_ID,
  PRODUCT_REDIRECT_URLS,
  MOCK_PLANS,
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

import Checkout from './index';
import { AppContextType } from '../../lib/AppContext';
import { PLANS } from '../../lib/mock-data';

describe('routes/Checkout', () => {
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
      plans: PLANS,
      plansByProductId: () => PLANS[0],
      fetchCheckoutRouteResources: () => PLANS,
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
        <Checkout {...props} />
      </MockApp>
    );
  };

  const initApiMocks = () => [
    nock(authServer)
      .get('/v1/oauth/subscriptions/plans')
      .reply(200, MOCK_PLANS, { 'Access-Control-Allow-Origin': '*' }),
  ];

  it('renders as expected', async () => {
    const apiMocks = initApiMocks();
    const { findByTestId, getByTestId } = render(<Subject />);
    if (window.onload) {
      dispatchEvent(new Event('load'));
    }

    const formEl = await findByTestId('new-user-email-form');
    expect(formEl).toBeInTheDocument();

    const paymentForm = getByTestId('paymentForm');
    expect(paymentForm).toBeInTheDocument();

    const planDetailsEl = getByTestId('plan-details-component');
    expect(planDetailsEl).toBeInTheDocument();

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

  it('displays an error on failure to load plans', async () => {
    const apiMocks = [
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(400, MOCK_PLANS),
    ];
    const { findByTestId } = render(<Subject />);
    const errorEl = await findByTestId('error-loading-plans');
    expect(errorEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });
});
