import React from 'react';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import nock from 'nock';

import { PAYMENT_ERROR_2 } from '../../lib/errors';
import {
  STRIPE_FIELDS,
  PLAN_ID,
  PLAN_NAME,
  PRODUCT_ID,
  PRODUCT_REDIRECT_URLS,
  MOCK_PLANS,
  MOCK_PROFILE,
  MOCK_ACTIVE_SUBSCRIPTIONS,
  MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
  MOCK_CUSTOMER,
  MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
  expectNockScopesDone,
  defaultAppContextValue,
  MockApp,
  setupMockConfig,
  mockConfig,
  mockServerUrl,
  mockOptionsResponses,
  mockStripeElementOnChangeFns,
  elementChangeResponse,
  VALID_CREATE_TOKEN_RESPONSE,
} from '../../lib/test-utils';

import { SignInLayout } from '../../components/AppLayout';
import Product from './index';
import { SMALL_DEVICE_RULE } from '../../components/PaymentForm';

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
    createToken = jest.fn().mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE),
  }: {
    productId?: string;
    planId?: string;
    matchMedia: (query: string) => boolean;
    navigateToUrl?: (url: string) => void;
    accountActivated?: string;
    createToken?: jest.Mock<any, any>;
  }) => {
    const props = {
      match: {
        params: {
          productId,
        },
      },
    };
    const mockStripe = {
      createToken,
    };
    const appContextValue = {
      ...defaultAppContextValue(),
      matchMedia: matchMedia || jest.fn(() => { return { matches: false } }),
      navigateToUrl: navigateToUrl || jest.fn(),
      queryParams: {
        plan: planId,
        activated: accountActivated,
      },
    };
    return (
      <MockApp {...{ mockStripe, appContextValue }}>
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
      .get('/v1/oauth/subscriptions/active')
      .reply(200, MOCK_ACTIVE_SUBSCRIPTIONS),
    nock(authServer)
      .get('/v1/oauth/subscriptions/customer')
      .reply(200, MOCK_CUSTOMER),
  ];

  const withExistingAccount = (useDisplayName?: boolean) => async () => {
    const displayName = useDisplayName ? 'Foo Barson' : undefined;
    const apiMocks = initApiMocks(displayName);
    const { findByText, queryByText, queryByTestId } = render(<Subject />);
    await findByText("Let's set up your subscription");
    expect(queryByText(`${PLAN_NAME} for $5.00 per month`)).toBeInTheDocument();
    expect(queryByTestId('account-activated')).not.toBeInTheDocument();
    expect(queryByTestId('profile-email')).toBeInTheDocument();
    if (displayName) {
      expect(queryByTestId('profile-display-name')).toBeInTheDocument();
    }
    expectNockScopesDone(apiMocks);
  };

  it('renders with valid product ID', withExistingAccount(false));

  it('renders with product ID and display name', withExistingAccount(true));

  const withActivationBanner = (useDisplayName?: boolean) => async () => {
    const displayName = useDisplayName ? 'Foo Barson' : undefined;
    const apiMocks = initApiMocks(displayName);
    const { findByText, queryByText, queryByTestId } = render(
      <Subject planId={PLAN_ID} accountActivated="true" />
    );
    await findByText("Let's set up your subscription");
    expect(queryByText(`${PLAN_NAME} for $5.00 per month`)).toBeInTheDocument();
    expect(queryByTestId('account-activated')).toBeInTheDocument();
    if (displayName) {
      expect(queryByTestId('activated-display-name')).toBeInTheDocument();
      expect(queryByTestId('activated-email')).not.toBeInTheDocument();
    } else {
      expect(queryByTestId('activated-display-name')).not.toBeInTheDocument();
      expect(queryByTestId('activated-email')).toBeInTheDocument();
    }
    expectNockScopesDone(apiMocks);
  };

  it(
    'renders with ?plan={PLAN_ID}&accountActivated given in query string',
    withActivationBanner(false)
  );
  it(
    'renders with display name and ?plan={PLAN_ID}&accountActivated given in query string',
    withActivationBanner(true)
  );

  it('displays an error with invalid product ID', async () => {
    const apiMocks = initApiMocks();
    const { findByTestId } = render(<Subject productId="bad_product" />);
    await findByTestId('no-such-plan-error');
    expectNockScopesDone(apiMocks);
  });

  it('displays an error on failure to load profile', async () => {
    const apiMocks = [
      nock(profileServer)
        .get('/v1/profile')
        .reply(400, MOCK_PROFILE),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS),
      nock(authServer)
        .get('/v1/oauth/subscriptions/active')
        .reply(200, MOCK_ACTIVE_SUBSCRIPTIONS),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(200, MOCK_CUSTOMER),
    ];
    const { findByTestId } = render(<Subject />);
    await findByTestId('error-loading-profile');
  });

  it('displays an error on failure to load plans', async () => {
    const apiMocks = [
      nock(profileServer)
        .get('/v1/profile')
        .reply(200, MOCK_PROFILE),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(400, MOCK_PLANS),
      nock(authServer)
        .get('/v1/oauth/subscriptions/active')
        .reply(200, MOCK_ACTIVE_SUBSCRIPTIONS),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(200, MOCK_CUSTOMER),
    ];
    const { findByTestId } = render(<Subject />);
    await findByTestId('error-loading-plans');
  });

  it('displays an error on failure to load customer', async () => {
    const apiMocks = [
      nock(profileServer)
        .get('/v1/profile')
        .reply(200, MOCK_PROFILE),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS),
      nock(authServer)
        .get('/v1/oauth/subscriptions/active')
        .reply(200, MOCK_ACTIVE_SUBSCRIPTIONS),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(400, MOCK_CUSTOMER),
    ];
    const { findByTestId } = render(<Subject />);
    await findByTestId('error-loading-customer');
  });

  async function commonSubmitSetup(createToken: jest.Mock<any, any>) {
    const apiMocks = [
      ...initApiMocks(),
      nock(authServer)
        .post('/v1/oauth/subscriptions/active')
        .reply(200, {}),
      nock(authServer)
        .get('/v1/oauth/subscriptions/active')
        .reply(200, MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(200, MOCK_CUSTOMER_AFTER_SUBSCRIPTION),
    ];

    const navigateToUrl = jest.fn();
    const matchMedia = jest.fn(() => { return { matches: false } });
    const renderResult = render(
      <Subject {...{ matchMedia, navigateToUrl, createToken }} />
    );
    const { getByTestId, findByText } = renderResult;

    await findByText("Let's set up your subscription");

    act(() => {
      for (const testid of STRIPE_FIELDS) {
        mockStripeElementOnChangeFns[testid](
          elementChangeResponse({ complete: true, value: 'test' })
        );
      }
    });
    fireEvent.change(getByTestId('name'), { target: { value: 'Foo Barson' } });
    fireEvent.blur(getByTestId('name'));
    fireEvent.change(getByTestId('zip'), { target: { value: '90210' } });
    fireEvent.blur(getByTestId('zip'));
    fireEvent.click(getByTestId('confirm'));

    return { ...renderResult, matchMedia, navigateToUrl, apiMocks };
  }

  it('handles a successful payment submission as expected', async () => {
    const createToken = jest
      .fn()
      .mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE);
    const {
      getByTestId,
      findByText,
      queryByText,
      matchMedia,
      navigateToUrl,
      apiMocks,
    } = await commonSubmitSetup(createToken);

    fireEvent.click(getByTestId('submit'));

    await findByText('Your subscription is ready');
    expect(matchMedia).toBeCalledWith(SMALL_DEVICE_RULE);
    expect(createToken).toBeCalled();
    expect(queryByText('Plan 12345')).toBeInTheDocument();
    expect(
      queryByText("Click here if you're not automatically redirected")
    ).toBeInTheDocument();
    expect(navigateToUrl).toBeCalledWith('https://example.com/product');
    expectNockScopesDone(apiMocks);
  });

  it('redirects to product page if user is already subscribed', async () => {
    const apiMocks = [
      nock(profileServer)
        .get('/v1/profile')
        .reply(200, MOCK_PROFILE),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS),
      nock(authServer)
        .get('/v1/oauth/subscriptions/active')
        .reply(200, MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION),
      nock(authServer)
        .get('/v1/oauth/subscriptions/customer')
        .reply(200, MOCK_CUSTOMER_AFTER_SUBSCRIPTION),
    ];

    const navigateToUrl = jest.fn();
    const matchMedia = jest.fn(() => { return { matches: false } });
    const createToken = jest
      .fn()
      .mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE);

    const { findByText, queryByText } = render(
      <Subject {...{ matchMedia, navigateToUrl, createToken }} />
    );

    await findByText('Your subscription is ready');
    expect(createToken).not.toBeCalled();
    expect(queryByText('Plan 12345')).toBeInTheDocument();
    expect(
      queryByText("Click here if you're not automatically redirected")
    ).toBeInTheDocument();
    expect(navigateToUrl).toBeCalledWith('https://example.com/product');
    expectNockScopesDone(apiMocks);
  });

  it('displays an error if payment submission somehow silently fails', async () => {
    const createToken = jest.fn().mockResolvedValue({});
    const {
      container,
      getByTestId,
      findByTestId,
      queryByTestId,
      debug,
    } = await commonSubmitSetup(createToken);
    fireEvent.click(getByTestId('submit'));
    await findByTestId('error-payment-submission');
    fireEvent.click(getByTestId('dialog-dismiss'));
    expect(queryByTestId('error-payment-submission')).not.toBeInTheDocument();
  });

  it('displays an error on failure to submit payment', async () => {
    const createToken = jest.fn().mockRejectedValue({
      type: 'call_issuer',
    });
    const { getByTestId, findByTestId, queryByText } = await commonSubmitSetup(
      createToken
    );
    fireEvent.click(getByTestId('submit'));
    await findByTestId('error-payment-submission');
    expect(queryByText(PAYMENT_ERROR_2)).toBeInTheDocument();
  });

  async function commonCreateSubscriptionFailSetup(
    code: string,
    message: string
  ) {
    const apiMocks = [
      ...initApiMocks(),
      nock(authServer)
        .post('/v1/oauth/subscriptions/active')
        .reply(400, {
          code,
          message,
        }),
    ];
    const renderResult = render(<Subject />);
    const { getByTestId, findByText } = renderResult;

    await findByText("Let's set up your subscription");
    act(() => {
      for (const testid of STRIPE_FIELDS) {
        mockStripeElementOnChangeFns[testid](
          elementChangeResponse({ complete: true, value: 'test' })
        );
      }
    });
    fireEvent.change(getByTestId('name'), { target: { value: 'Foo Barson' } });
    fireEvent.blur(getByTestId('name'));
    fireEvent.change(getByTestId('zip'), { target: { value: '90210' } });
    fireEvent.blur(getByTestId('zip'));
    fireEvent.click(getByTestId('confirm'));

    return renderResult;
  }

  it('displays an error if card declined during subscription creation', async () => {
    const message = 'This is a library card';
    const {
      getByTestId,
      queryByText,
      findByTestId,
    } = await commonCreateSubscriptionFailSetup('card_declined', message);
    fireEvent.click(getByTestId('submit'));

    await findByTestId('error-card-declined');
    expect(queryByText(message)).toBeInTheDocument();
  });

  it('displays an error if subscription creation fails for some other reason', async () => {
    const message = 'We done goofed';
    const {
      getByTestId,
      queryByText,
      findByTestId,
    } = await commonCreateSubscriptionFailSetup('api_error', message);
    fireEvent.click(getByTestId('submit'));
    await findByTestId('error-subscription-failed');
    expect(queryByText(message)).toBeInTheDocument();
  });
});
