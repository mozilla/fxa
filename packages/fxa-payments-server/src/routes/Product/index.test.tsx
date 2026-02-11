/**
 * @jest-environment jsdom
 */
import React from 'react';
import {
  cleanup,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import noc from 'nock';

import { AuthServerErrno } from '../../lib/errors';

import {
  PLAN_ID,
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
  INACTIVE_PLAN_ID,
  MOCK_PREVIEW_INVOICE_NO_TAX,
  renderWithLocalizationProvider,
} from '../../lib/test-utils';

import { SignInLayout } from '../../components/AppLayout';
import Product from '.';
import { AppContextType } from '../../lib/AppContext';
import { defaultConfig } from 'fxa-payments-server/src/lib/config';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';
import * as Router from 'react-router-dom';

function nock(it: any) {
  //@ts-ignore
  return noc(...arguments).defaultReplyHeaders({
    'Access-Control-Allow-Origin': '*',
  });
}

jest.mock('../../lib/sentry');
jest.mock('../../lib/flow-event');

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  __esModule: true,
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

const mockPreviewInvoiceResponse = {
  ...MOCK_PREVIEW_INVOICE_NO_TAX,
  line_items: [{ ...MOCK_PREVIEW_INVOICE_NO_TAX.line_items[0], id: PLAN_ID }],
};

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
    jest.clearAllMocks();
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
    jest.spyOn(Router, 'useParams').mockReturnValue({ productId });
    const props = {
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
    const ProductAny = Product as any;
    return (
      <MockApp {...{ appContextValue }}>
        <SignInLayout>
          <ProductAny {...props} />
        </SignInLayout>
      </MockApp>
    );
  };

  const initSubscribedApiMocks = ({
    mockProfile = MOCK_PROFILE,
    mockPlans = MOCK_PLANS,
    mockCustomer = MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
    mockPreviewInvoice = MOCK_PREVIEW_INVOICE_NO_TAX,
    planId = PLAN_ID,
    planEligibility = 'invalid',
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
    nock(authServer)
      .persist()
      .get(
        `/v1/oauth/mozilla-subscriptions/customer/plan-eligibility/${planId}`
      )
      .reply(
        200,
        { eligibility: planEligibility },
        { 'Access-Control-Allow-Origin': '*' }
      ),
    nock(authServer)
      .persist()
      .post('/v1/oauth/subscriptions/invoice/preview')
      .reply(
        200,
        {
          ...mockPreviewInvoice,
          line_items: [{ ...mockPreviewInvoice.line_items[0], id: planId }],
        },
        {
          'Access-Control-Allow-Origin': '*',
        }
      ),
  ];

  it('renders with product ID and display name', async () => {
    const displayName = 'Foo Barson';
    const apiMocks = [
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
        .get(
          '/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
        )
        .reply(200, MOCK_CUSTOMER, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .persist()
        .get(
          `/v1/oauth/mozilla-subscriptions/customer/plan-eligibility/${PLAN_ID}`
        )
        .reply(
          200,
          { eligibility: 'create' },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .persist()
        .post('/v1/oauth/subscriptions/invoice/preview')
        .reply(200, mockPreviewInvoiceResponse, {
          'Access-Control-Allow-Origin': '*',
        }),
    ];
    const { findAllByText, queryByText, queryAllByText } =
      renderWithLocalizationProvider(<Subject />);

    await findAllByText('Set up your subscription');
    expect(
      queryAllByText('30-day money-back guarantee')[0]
    ).toBeInTheDocument();
    expect(queryByText('Payment information')).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('displays an error with invalid product ID', async () => {
    const apiMocks = [
      nock(profileServer)
        .get('/v1/profile')
        .reply(
          200,
          { ...MOCK_PROFILE },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .get(
          '/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
        )
        .reply(200, MOCK_CUSTOMER, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .post('/v1/oauth/subscriptions/invoice/preview')
        .reply(400, mockPreviewInvoiceResponse, {
          'Access-Control-Allow-Origin': '*',
        }),
    ];
    const { findByTestId, queryByTestId } = renderWithLocalizationProvider(
      <Subject productId="bad_product" />
    );
    await waitForElementToBeRemoved(queryByTestId('loading-overlay'));
    await findByTestId('no-such-plan-error');
    expect(queryByTestId('dialog-dismiss')).not.toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('displays an error for unsupported location', async () => {
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
        .reply(200, MOCK_CUSTOMER, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .persist()
        .get(
          `/v1/oauth/mozilla-subscriptions/customer/plan-eligibility/${PLAN_ID}`
        )
        .reply(
          200,
          { eligibility: 'invalid' },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .persist()
        .post('/v1/oauth/subscriptions/invoice/preview')
        .reply(
          400,
          {
            errno: AuthServerErrno.UNSUPPORTED_LOCATION,
          },
          {
            'Access-Control-Allow-Origin': '*',
          }
        ),
    ];
    const { findByTestId } = renderWithLocalizationProvider(<Subject />);
    const errorEl = await findByTestId('product-location-unsupported-error');
    expect(errorEl).toBeInTheDocument();
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
      nock(authServer)
        .persist()
        .get(
          `/v1/oauth/mozilla-subscriptions/customer/plan-eligibility/${PLAN_ID}`
        )
        .reply(
          200,
          { eligibility: 'invalid' },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .persist()
        .post('/v1/oauth/subscriptions/invoice/preview')
        .reply(200, mockPreviewInvoiceResponse, {
          'Access-Control-Allow-Origin': '*',
        }),
    ];
    const { findByTestId } = renderWithLocalizationProvider(<Subject />);
    const errorEl = await findByTestId('error-loading-profile');
    expect(errorEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
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
    const { findByTestId } = renderWithLocalizationProvider(<Subject />);
    const errorEl = await findByTestId('error-loading-plans');
    expect(errorEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('displays an error when attempting to load inactive plan', async () => {
    const apiMocks = [
      nock(profileServer).get('/v1/profile').reply(200, MOCK_PROFILE),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS),
      nock(authServer)
        .get(
          '/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
        )
        .reply(200, MOCK_CUSTOMER),
      nock(authServer)
        .persist()
        .post('/v1/oauth/subscriptions/invoice/preview')
        .reply(200, mockPreviewInvoiceResponse, {
          'Access-Control-Allow-Origin': '*',
        }),
    ];
    const { findByTestId } = renderWithLocalizationProvider(
      <Subject planId={INACTIVE_PLAN_ID} />
    );
    await waitFor(async () => {
      const errorEl = await findByTestId('no-such-plan-error');
      expect(errorEl).toBeInTheDocument();
    });
    expectNockScopesDone(apiMocks);
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
      nock(authServer)
        .persist()
        .get(
          `/v1/oauth/mozilla-subscriptions/customer/plan-eligibility/${PLAN_ID}`
        )
        .reply(
          200,
          { eligibility: 'invalid' },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .persist()
        .post('/v1/oauth/subscriptions/invoice/preview')
        .reply(200, mockPreviewInvoiceResponse, {
          'Access-Control-Allow-Origin': '*',
        }),
    ];
    const { findByTestId } = renderWithLocalizationProvider(<Subject />);
    const errorEl = await findByTestId('error-loading-customer');
    expect(errorEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('displays an error on failure to load invoice preview', async () => {
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
        .reply(200, MOCK_CUSTOMER, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .persist()
        .get(
          `/v1/oauth/mozilla-subscriptions/customer/plan-eligibility/${PLAN_ID}`
        )
        .reply(
          200,
          { eligibility: 'invalid' },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .persist()
        .post('/v1/oauth/subscriptions/invoice/preview')
        .reply(400, mockPreviewInvoiceResponse, {
          'Access-Control-Allow-Origin': '*',
        }),
    ];
    const { findByTestId } = renderWithLocalizationProvider(<Subject />);
    const errorEl = await findByTestId('product-invoice-preview-error');
    expect(errorEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
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
      nock(authServer)
        .persist()
        .get(
          `/v1/oauth/mozilla-subscriptions/customer/plan-eligibility/${PLAN_ID}`
        )
        .reply(
          200,
          { eligibility: 'create' },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .persist()
        .post('/v1/oauth/subscriptions/invoice/preview')
        .reply(200, mockPreviewInvoiceResponse, {
          'Access-Control-Allow-Origin': '*',
        }),
    ];
    const { findAllByText } = renderWithLocalizationProvider(<Subject />);
    const headingEls = await findAllByText('Set up your subscription');
    expect(headingEls.length).toBeGreaterThan(0);
    expectNockScopesDone(apiMocks);
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
      nock(authServer)
        .persist()
        .get(
          `/v1/oauth/mozilla-subscriptions/customer/plan-eligibility/${PLAN_ID}`
        )
        .reply(
          200,
          { eligibility: 'create' },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .persist()
        .post('/v1/oauth/subscriptions/invoice/preview')
        .reply(200, mockPreviewInvoiceResponse, {
          'Access-Control-Allow-Origin': '*',
        }),
    ];
    const { findAllByText } = renderWithLocalizationProvider(<Subject />);
    const headingEls = await findAllByText('Set up your subscription');
    expect(headingEls.length).toBeGreaterThan(0);
    expectNockScopesDone(apiMocks);
  });

  it('offers upgrade if user is already subscribed to another plan in the same product set', async () => {
    const apiMocks = [
      nock(profileServer)
        .get('/v1/profile')
        .reply(
          200,
          { ...MOCK_PROFILE },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .get(
          '/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
        )
        .reply(200, MOCK_CUSTOMER, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .persist()
        .get(
          `/v1/oauth/mozilla-subscriptions/customer/plan-eligibility/plan_upgrade`
        )
        .reply(
          200,
          { eligibility: 'upgrade', currentPlan: MOCK_PLANS[1] },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .persist()
        .post('/v1/oauth/subscriptions/invoice/preview')
        .reply(200, mockPreviewInvoiceResponse, {
          'Access-Control-Allow-Origin': '*',
        }),
    ];
    const { findByTestId } = renderWithLocalizationProvider(
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
    const apiMocks = initSubscribedApiMocks({
      planId: 'plan_no_upgrade',
      planEligibility: 'create',
    });
    const { findAllByText, queryByTestId } = renderWithLocalizationProvider(
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
    const apiMocks = [
      nock(profileServer)
        .get('/v1/profile')
        .reply(
          200,
          { ...MOCK_PROFILE },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .get(
          '/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
        )
        .reply(200, MOCK_CUSTOMER, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .persist()
        .get(
          `/v1/oauth/mozilla-subscriptions/customer/plan-eligibility/plan_no_downgrade`
        )
        .reply(
          200,
          { eligibility: 'downgrade', currentPlan: MOCK_PLANS[0] },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .persist()
        .post('/v1/oauth/subscriptions/invoice/preview')
        .reply(200, mockPreviewInvoiceResponse, {
          'Access-Control-Allow-Origin': '*',
        }),
    ];
    const { findByTestId } = renderWithLocalizationProvider(
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
    const apiMocks = initSubscribedApiMocks({ planId: 'nextlevel' });
    const { findByTestId } = renderWithLocalizationProvider(
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
    const apiMocks = [
      nock(profileServer)
        .get('/v1/profile')
        .reply(
          200,
          { ...MOCK_PROFILE },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .get('/v1/oauth/subscriptions/plans')
        .reply(200, MOCK_PLANS, { 'Access-Control-Allow-Origin': '*' }),
      nock(authServer)
        .get(
          '/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
        )
        .reply(
          200,
          {
            ...MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
            subscriptions: [
              {
                _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
                product_id: PRODUCT_ID,
                auto_renewing: true,
                expiry_time_millis: Date.now(),
                package_name: 'org.mozilla.cooking.with.foxkeh',
                sku: 'org.mozilla.foxkeh.yearly',
                product_name: 'Cooking with Foxkeh',
                price_id: 'nextlevel',
              },
            ],
          },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .persist()
        .get(
          `/v1/oauth/mozilla-subscriptions/customer/plan-eligibility/nextlevel`
        )
        .reply(
          200,
          { eligibility: 'blocked_iap', currentPlan: MOCK_PLANS[1] },
          { 'Access-Control-Allow-Origin': '*' }
        ),
      nock(authServer)
        .persist()
        .post('/v1/oauth/subscriptions/invoice/preview')
        .reply(200, mockPreviewInvoiceResponse, {
          'Access-Control-Allow-Origin': '*',
        }),
    ];
    const { findByTestId } = renderWithLocalizationProvider(
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
    const { findByTestId, queryByTestId } = renderWithLocalizationProvider(
      <Subject />
    );
    await waitForElementToBeRemoved(queryByTestId('loading-overlay'));
    const confirmEl = await findByTestId('payment-confirmation');
    expect(confirmEl).toBeInTheDocument();
    expectNockScopesDone(apiMocks);
  });

  it('redirects to content server when there is no access token', async () => {
    const navigateToUrl = jest.fn();
    const appContext = { ...defaultAppContextValue(), accessToken: undefined };
    renderWithLocalizationProvider(
      <Subject
        productId="fizz"
        planId="quux"
        {...{ appContext }}
        navigateToUrl={navigateToUrl}
      />
    );

    expect(navigateToUrl).toHaveBeenCalledWith(
      'https://content.example/subscriptions/products/fizz?plan=quux&signin=yes'
    );
  });
});
