import React from 'react';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import nock from 'nock';

import { PAYMENT_ERROR_2 } from '../../lib/errors';
import {
  defaultAppContextValue,
  MockApp,
  MockStripeType,
  setupMockConfig,
  mockConfig,
  mockServerUrl,
  mockStripeElementOnChangeFns,
  elementChangeResponse,
} from '../../lib/test-utils';

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
    navigateToUrl = jest.fn(),
    createToken = jest.fn().mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE),
  }: {
    productId?: string;
    planId?: string;
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
    const renderResult = render(
      <Subject {...{ navigateToUrl, createToken }} />
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
    fireEvent.change(getByTestId('zip'), { target: { value: '90210' } });
    fireEvent.click(getByTestId('confirm'));

    return { ...renderResult, navigateToUrl, apiMocks };
  }

  it('handles a successful payment submission as expected', async () => {
    const createToken = jest
      .fn()
      .mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE);
    const {
      getByTestId,
      findByText,
      queryByText,
      navigateToUrl,
      apiMocks,
    } = await commonSubmitSetup(createToken);

    fireEvent.click(getByTestId('submit'));

    await findByText('Your subscription is ready');
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
    const createToken = jest
      .fn()
      .mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE);

    const { findByText, queryByText } = render(
      <Subject {...{ navigateToUrl, createToken }} />
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
    fireEvent.change(getByTestId('zip'), { target: { value: '90210' } });
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

function expectNockScopesDone(scopes: nock.Scope[]) {
  for (const scope of scopes) {
    expect(scope.isDone()).toBeTruthy();
  }
}

function mockOptionsResponses(baseUrl: string) {
  return nock(baseUrl)
    .options(/\/v1/)
    .reply(200, '', CORS_OPTIONS_HEADERS)
    .persist();
}

const STRIPE_FIELDS = [
  'cardNumberElement',
  'cardCVCElement',
  'cardExpiryElement',
];

const VALID_CREATE_TOKEN_RESPONSE: stripe.TokenResponse = {
  token: {
    id: 'tok_8675309',
    object: 'test',
    client_ip: '123.123.123.123',
    created: Date.now(),
    livemode: false,
    type: 'card',
    used: false,
  },
};

const CORS_OPTIONS_HEADERS = {
  'access-control-allow-methods': 'GET,POST',
  'access-control-allow-origin': 'http://localhost',
  'access-control-allow-headers':
    'Accept,Authorization,Content-Type,If-None-Match',
};

const PLAN_ID = 'plan_12345';

const PLAN_NAME = 'Plan 12345';

const PRODUCT_ID = 'product_8675309';

const PRODUCT_REDIRECT_URLS = {
  [PRODUCT_ID]: 'https://example.com/product',
};

const MOCK_PLANS = [
  {
    plan_id: PLAN_ID,
    plan_name: PLAN_NAME,
    product_id: PRODUCT_ID,
    product_name: 'Product 67890',
    interval: 'month',
    amount: '500',
    currency: 'usd',
  },
];

const MOCK_PROFILE = {
  email: 'foo@example.com',
  locale: 'en-US,en;q=0.5',
  amrValues: ['pwd', 'email'],
  twoFactorAuthentication: false,
  uid: 'a90fef48240b49b2b6a33d333aee9b13',
  avatar: 'http://127.0.0.1:1112/a/00000000000000000000000000000000',
  avatarDefault: true,
};

const MOCK_ACTIVE_SUBSCRIPTIONS = [
  {
    uid: 'a90fef48240b49b2b6a33d333aee9b13',
    subscriptionId: 'sub0.28964929339372136',
    productName: '123doneProProduct',
    createdAt: 1565816388815,
    cancelledAt: null,
  },
];

const MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION = [
  {
    uid: 'a90fef48240b49b2b6a33d333aee9b13',
    subscriptionId: 'sub0.28964929339372136',
    productName: '123doneProProduct',
    createdAt: 1565816388815,
    cancelledAt: null,
  },
  {
    uid: 'a90fef48240b49b2b6a33d333aee9b13',
    subscriptionId: 'sub0.21234123424',
    productName: 'prod_67890',
    createdAt: 1565816388815,
    cancelledAt: null,
  },
];

const MOCK_CUSTOMER = {
  payment_type: 'tok_1F7TltEOSeHhIAfQo9u6eqTc',
  last4: '8675',
  exp_month: 8,
  exp_year: 2020,
  subscriptions: [
    {
      subscription_id: 'sub0.28964929339372136',
      plan_id: '123doneProMonthly',
      plan_name: '123done Pro Monthly',
      status: 'active',
      cancel_at_period_end: false,
      current_period_start: 1565816388.815,
      current_period_end: 1568408388.815,
    },
  ],
};

const MOCK_CUSTOMER_AFTER_SUBSCRIPTION = {
  ...MOCK_CUSTOMER,
  subscriptions: [
    ...MOCK_CUSTOMER.subscriptions,
    {
      subscription_id: 'sub0.21234123424',
      plan_id: PLAN_ID,
      plan_name: 'Plan 12345',
      status: 'active',
      cancel_at_period_end: false,
      current_period_start: 1565816388.815,
      current_period_end: 1568408388.815,
    },
  ],
};
