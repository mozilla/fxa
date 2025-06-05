import React, { ReactNode } from 'react';
import {
  cleanup,
  fireEvent,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import noc from 'nock';
import waitForExpect from 'wait-for-expect';

import {
  manageSubscriptionsMounted,
  manageSubscriptionsEngaged,
  cancelSubscriptionMounted,
  cancelSubscriptionEngaged,
} from '../../lib/amplitude';

import { ProductMetadata } from '../../store/types';

import { AuthServerErrno } from '../../lib/errors';

import { Store } from '../../store';

import {
  defaultAppContextValue,
  MockApp,
  setupMockConfig,
  mockConfig,
  mockServerUrl,
  mockOptionsResponses,
  VALID_CREATE_TOKEN_RESPONSE,
  MOCK_PROFILE,
  MOCK_PLANS,
  MOCK_ACTIVE_SUBSCRIPTIONS,
  MOCK_CUSTOMER,
  MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
  MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
  PLAN_ID,
  PRODUCT_ID,
  MOCK_SUBSEQUENT_INVOICES,
  MOCK_LATEST_INVOICE_ITEMS,
  MOCK_CUSTOMER_ARCHIVED_PLAN,
  MOCK_ACTIVE_SUBSCRIPTIONS_TO_ARCHIVED,
  renderWithLocalizationProvider,
} from '../../lib/test-utils';

import { SettingsLayout } from '../../components/AppLayout';
import Subscriptions from './index';
import { AppContextType } from '../../lib/AppContext';
import {
  IapSubscription,
  MozillaSubscriptionTypes,
  Plan,
  WebSubscription,
} from 'fxa-shared/subscriptions/types';
import {
  IAP_APPLE_SUBSCRIPTION,
  IAP_GOOGLE_SUBSCRIPTION,
} from '../../lib/mock-data';

function nock(it: any) {
  //@ts-ignore
  return noc(...arguments).defaultReplyHeaders({
    'Access-Control-Allow-Origin': '*',
  });
}

jest.mock('../../lib/sentry');
jest.mock('../../lib/amplitude');
jest.mock('../../lib/flow-event');

jest.mock('./PaymentUpdateForm', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <section data-testid="PaymentUpdateForm">{children}</section>
  ),
}));

describe('routes/Subscriptions', () => {
  let contentServer = '';
  let authServer = '';
  let profileServer = '';

  beforeEach(() => {
    setupMockConfig(mockConfig);
    jest.clearAllMocks();

    contentServer = mockServerUrl('content');
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
    store,
    matchMedia = jest.fn(() => false),
    navigateToUrl = jest.fn(),
    createToken = jest.fn().mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE),
    appContext = undefined,
  }: {
    store?: Store;
    matchMedia?: (query: string) => boolean;
    navigateToUrl?: (url: string) => void;
    createToken?: jest.Mock<any, any>;
    useSCAPaymentFlow?: boolean;
    appContext?: Partial<AppContextType>;
  }) => {
    const props = {};
    const mockStripe = {
      createToken,
    };
    const appContextValue: AppContextType = {
      ...defaultAppContextValue(),
      matchMedia,
      navigateToUrl: navigateToUrl || jest.fn(),
      queryParams: {
        device_id: 'quux',
        flow_begin_time: Date.now(),
        flow_id: 'thisisanid',
      },
      ...(appContext ?? {}),
    };

    return (
      <MockApp {...{ mockStripe, appContextValue, store }}>
        <SettingsLayout>
          <Subscriptions {...props} />
        </SettingsLayout>
      </MockApp>
    );
  };

  const initApiMocks = ({
    displayName = undefined,
    mockCustomer = MOCK_CUSTOMER,
    mockActiveSubscriptions = MOCK_ACTIVE_SUBSCRIPTIONS,
    mockPlans = MOCK_PLANS,
    mockSubsequentInvoices = MOCK_SUBSEQUENT_INVOICES,
  }: {
    displayName?: string | undefined;
    mockCustomer?: typeof MOCK_CUSTOMER;
    mockActiveSubscriptions?: typeof MOCK_ACTIVE_SUBSCRIPTIONS;
    mockPlans?: typeof MOCK_PLANS;
    mockSubsequentInvoices?: typeof MOCK_SUBSEQUENT_INVOICES;
  } = {}) => [
    nock(profileServer)
      .get('/v1/profile')
      .reply(200, { ...MOCK_PROFILE, displayName }),
    nock(authServer).get('/v1/oauth/subscriptions/plans').reply(200, mockPlans),
    nock(authServer)
      .get('/v1/oauth/subscriptions/active')
      .reply(200, mockActiveSubscriptions),
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(200, mockCustomer),
    nock(authServer)
      .get('/v1/oauth/subscriptions/invoice/preview-subsequent')
      .reply(200, mockSubsequentInvoices),
  ];

  it('uses PaymentUpdateForm', async () => {
    initApiMocks({
      mockCustomer: MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
      mockActiveSubscriptions: MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
    });
    renderWithLocalizationProvider(<Subject />);
    await screen.findByTestId('subscription-management-loaded');
    await waitForExpect(() => {
      expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
    });
    expect(screen.queryAllByTestId('PaymentUpdateForm').length).not.toEqual(0);
  });

  it('lists all subscriptions', async () => {
    // Use mocks for subscription lists that exercise multiple plans
    initApiMocks({
      mockActiveSubscriptions: MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
      mockPlans: MOCK_PLANS,
      mockSubsequentInvoices: MOCK_SUBSEQUENT_INVOICES,
      mockCustomer: MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
    });

    const { findByTestId, queryAllByTestId, queryByTestId } =
      renderWithLocalizationProvider(<Subject />);
    if (window.onload) {
      dispatchEvent(new Event('load'));
    }
    await findByTestId('subscription-management-loaded');
    const items = queryAllByTestId('subscription-item');
    expect(items.length).toBe(2);
    const ctas = queryAllByTestId('upgrade-cta');
    expect(ctas.length).toBe(0);
    expect(queryByTestId('no-subscriptions-available')).not.toBeInTheDocument();
  });

  it('displays upgrade CTA when available for a subscription', async () => {
    // Use mocks for subscription lists that exercise multiple plans
    initApiMocks({
      mockCustomer: MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
      mockActiveSubscriptions: MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
      mockSubsequentInvoices: MOCK_SUBSEQUENT_INVOICES,
      mockPlans: MOCK_PLANS.map((plan) => ({
        ...plan,
        product_metadata: {
          upgradeCTA: `
            example upgrade CTA for
            <a data-testid="upgrade-link" href="http://example.org">${plan.product_name}</a>
          `,
        },
      })),
    });
    const { findByTestId, queryAllByTestId } = renderWithLocalizationProvider(
      <Subject />
    );
    await findByTestId('subscription-management-loaded');
    expect(queryAllByTestId('upgrade-cta').length).toBe(2);
    // Ensure that our HTML in upgradeCTA got rendered as markup
    expect(queryAllByTestId('upgrade-link').length).toBe(2);
  });

  it('offers a button for support', async () => {
    initApiMocks();
    const navigateToUrl = jest.fn();
    const { getByTestId, findByTestId } = renderWithLocalizationProvider(
      <Subject navigateToUrl={navigateToUrl} />
    );
    await findByTestId('subscription-management-loaded');
    fireEvent.click(getByTestId('contact-support-button'));
    await waitForExpect(() => expect(navigateToUrl).toBeCalled());
    expect(navigateToUrl).toBeCalledWith(`${contentServer}/support`);
  });

  it('calls manageSubscriptionsMounted and manageSubscriptionsEngaged', async () => {
    initApiMocks({
      mockCustomer: MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
      mockActiveSubscriptions: MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
    });
    const { getAllByTestId, findByTestId } = renderWithLocalizationProvider(
      <Subject />
    );
    await findByTestId('subscription-management-loaded');
    fireEvent.click(getAllByTestId('reveal-cancel-subscription-button')[0]);
    expect(manageSubscriptionsMounted).toBeCalledTimes(1);
    expect(manageSubscriptionsEngaged).toBeCalledTimes(1);
  });

  it('displays profile displayName if available', async () => {
    initApiMocks({ displayName: 'Foo Barson' });
    const { findByText } = renderWithLocalizationProvider(<Subject />);
    await findByText('Foo Barson');
  });

  it('redirects to settings if no subscriptions are available', async () => {
    initApiMocks({
      mockActiveSubscriptions: [],
      mockCustomer: { ...MOCK_CUSTOMER, subscriptions: [] },
    });

    const navigateToUrl = jest.fn();
    renderWithLocalizationProvider(<Subject navigateToUrl={navigateToUrl} />);

    await waitForExpect(() => expect(navigateToUrl).toBeCalled());
    expect(navigateToUrl).toBeCalledWith(`${contentServer}/settings`);
  });

  it('displays an error if profile fetch fails', async () => {
    nock(profileServer).get('/v1/profile').reply(500, MOCK_PROFILE);
    nock(authServer)
      .get('/v1/oauth/subscriptions/plans')
      .reply(200, MOCK_PLANS);
    nock(authServer)
      .get('/v1/oauth/subscriptions/active')
      .reply(500, MOCK_ACTIVE_SUBSCRIPTIONS);
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(403, MOCK_CUSTOMER);
    nock(authServer)
      .get('/v1/oauth/subscriptions/invoice/preview-subsequent')
      .reply(200, MOCK_SUBSEQUENT_INVOICES);
    const { findByTestId } = renderWithLocalizationProvider(<Subject />);
    await findByTestId('error-loading-profile');
  });

  it('displays an error if plans fetch fails', async () => {
    nock(profileServer).get('/v1/profile').reply(200, MOCK_PROFILE);
    nock(authServer)
      .get('/v1/oauth/subscriptions/plans')
      .reply(500, MOCK_PLANS);
    nock(authServer)
      .get('/v1/oauth/subscriptions/active')
      .reply(500, MOCK_ACTIVE_SUBSCRIPTIONS);
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(403, MOCK_CUSTOMER);
    nock(authServer)
      .get('/v1/oauth/subscriptions/invoice/preview-subsequent')
      .reply(200, MOCK_SUBSEQUENT_INVOICES);
    const { findByTestId } = renderWithLocalizationProvider(<Subject />);
    await findByTestId('error-loading-plans');
  });

  it('displays an error if customer fetch fails', async () => {
    nock(profileServer).get('/v1/profile').reply(200, MOCK_PROFILE);
    nock(authServer)
      .get('/v1/oauth/subscriptions/plans')
      .reply(200, MOCK_PLANS);
    nock(authServer)
      .get('/v1/oauth/subscriptions/active')
      .reply(200, MOCK_ACTIVE_SUBSCRIPTIONS);
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(403, {});
    nock(authServer)
      .get('/v1/oauth/subscriptions/invoice/preview-subsequent')
      .reply(200, MOCK_SUBSEQUENT_INVOICES);
    const { findByTestId } = renderWithLocalizationProvider(<Subject />);
    await findByTestId('error-loading-customer');
  });

  it('displays an error if subsequent invoice fetch fails', async () => {
    nock(profileServer).get('/v1/profile').reply(200, MOCK_PROFILE);
    nock(authServer)
      .get('/v1/oauth/subscriptions/plans')
      .reply(200, MOCK_PLANS);
    nock(authServer)
      .get('/v1/oauth/subscriptions/active')
      .reply(200, MOCK_ACTIVE_SUBSCRIPTIONS);
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(200, MOCK_CUSTOMER);
    nock(authServer)
      .get('/v1/oauth/subscriptions/invoice/preview-subsequent')
      .reply(500, MOCK_SUBSEQUENT_INVOICES);
    const { findByTestId } = renderWithLocalizationProvider(<Subject />);
    await findByTestId('error-loading-invoice');
  });

  it('displays an error if subsequent invoice response is an empty array', async () => {
    nock(profileServer).get('/v1/profile').reply(200, MOCK_PROFILE);
    nock(authServer)
      .get('/v1/oauth/subscriptions/plans')
      .reply(200, MOCK_PLANS);
    nock(authServer)
      .get('/v1/oauth/subscriptions/active')
      .reply(200, MOCK_ACTIVE_SUBSCRIPTIONS);
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(200, MOCK_CUSTOMER);
    nock(authServer)
      .get('/v1/oauth/subscriptions/invoice/preview-subsequent')
      .reply(200, []);
    const { findByTestId } = renderWithLocalizationProvider(<Subject />);
    await findByTestId('error-subhub-missing-subsequent-invoice');
  });

  it('redirects to settings if customer fetch fails with 404', async () => {
    nock(profileServer).get('/v1/profile').reply(200, MOCK_PROFILE);
    nock(authServer)
      .get('/v1/oauth/subscriptions/plans')
      .reply(200, MOCK_PLANS);
    nock(authServer)
      .get('/v1/oauth/subscriptions/active')
      .reply(200, MOCK_ACTIVE_SUBSCRIPTIONS);
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(404, {
        errno: AuthServerErrno.UNKNOWN_SUBSCRIPTION_CUSTOMER,
      });
    nock(authServer)
      .get('/v1/oauth/subscriptions/invoice/preview-subsequent')
      .reply(200, MOCK_SUBSEQUENT_INVOICES);

    const navigateToUrl = jest.fn();
    renderWithLocalizationProvider(<Subject navigateToUrl={navigateToUrl} />);

    await waitForExpect(() => expect(navigateToUrl).toBeCalled());
    expect(navigateToUrl).toBeCalledWith(`${contentServer}/settings`);
  });

  it('displays an error if subscription cancellation fails', async () => {
    initApiMocks();

    nock(authServer)
      .delete('/v1/oauth/subscriptions/active/sub0.28964929339372136')
      .reply(400, {});

    const { findByTestId, queryAllByTestId, getByTestId } =
      renderWithLocalizationProvider(<Subject />);

    // Wait for the page to load with one subscription
    await findByTestId('subscription-management-loaded');
    const items = queryAllByTestId('subscription-item');
    expect(items.length).toBe(1);

    // Click the button to reveal the cancellation panel
    fireEvent.click(getByTestId('reveal-cancel-subscription-button'));
    await findByTestId('cancel-subscription-button');

    // Click the confirmation checkbox, wait for the button to be enabled
    const cancelButton = getByTestId('cancel-subscription-button');
    fireEvent.click(getByTestId('confirm-cancel-subscription-checkbox'));
    await waitForExpect(() =>
      expect(cancelButton).not.toHaveAttribute('disabled')
    );

    // Click the cancellation button
    fireEvent.click(cancelButton);
    await findByTestId('error-cancellation');
  });

  async function cancellationSuccessCommonSteps() {
    const {
      findByTestId,
      queryAllByTestId,
      queryByTestId,
      getByTestId,
      getAllByTestId,
    } = renderWithLocalizationProvider(<Subject />);

    // Wait for the page to load with one subscription
    await findByTestId('subscription-management-loaded');
    const items = queryAllByTestId('subscription-item');
    expect(items.length).toBe(1);

    // Click the button to reveal the cancellation panel
    fireEvent.click(getByTestId('reveal-cancel-subscription-button'));

    await findByTestId('cancel-subscription-button');

    expect(cancelSubscriptionMounted).toBeCalledTimes(1);

    // Click the confirmation checkbox, wait for the button to be enabled
    const cancelButton = getByTestId('cancel-subscription-button');
    fireEvent.click(getByTestId('confirm-cancel-subscription-checkbox'));

    await waitForExpect(() =>
      expect(cancelButton).not.toHaveAttribute('disabled')
    );

    expect(cancelSubscriptionEngaged).toBeCalledTimes(1);

    fireEvent.click(cancelButton);

    await waitFor(() =>
      expect(getAllByTestId('spinner-update').length).toEqual(1)
    );

    // The spinner being removed is a side effect of the cancel subscription
    // callback.  We need to wait for it so we can be somewhat confident that
    // the callback has finished.  Other, cleanup() in beforeEach will unmount
    // the component before a state update is performed, and not to mention the
    // post-cancel customer fetch's effect on the next test's nock setup.
    // tl;dr 🤷‍♀️
    await waitFor(() =>
      expect(queryByTestId('spinner-update')).not.toBeInTheDocument()
    );
    await waitFor(() =>
      expect(getAllByTestId('loading-overlay').length).toEqual(1)
    );
    await waitFor(() =>
      expect(queryByTestId('loading-overlay')).not.toBeInTheDocument()
    );
    // A farewell dialog should appear
    await findByTestId('cancellation-message-title');
  }

  it('supports cancelling a subscription', async () => {
    initApiMocks();

    nock(authServer)
      .delete('/v1/oauth/subscriptions/active/sub0.28964929339372136')
      .reply(200, {});
    nock(authServer)
      .get('/v1/oauth/subscriptions/active')
      .reply(200, [
        {
          uid: 'a90fef48240b49b2b6a33d333aee9b13',
          subscriptionId: 'sub0.28964929339372136',
          productId: '123doneProProduct',
          createdAt: 1565816388815,
          cancelledAt: 1566252991684,
        },
      ]);
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(200, MOCK_CUSTOMER_AFTER_SUBSCRIPTION);

    await cancellationSuccessCommonSteps();
  });

  it('supports cancelling a subscription to an archived plan', async () => {
    initApiMocks({
      mockCustomer: MOCK_CUSTOMER_ARCHIVED_PLAN,
      mockActiveSubscriptions: MOCK_ACTIVE_SUBSCRIPTIONS_TO_ARCHIVED,
    });

    nock(authServer)
      .delete(
        `/v1/oauth/subscriptions/active/${MOCK_ACTIVE_SUBSCRIPTIONS_TO_ARCHIVED[0].subscriptionId}`
      )
      .reply(200, {});
    nock(authServer)
      .get('/v1/oauth/subscriptions/active')
      .reply(200, [
        {
          uid: 'a90fef48240b49b2b6a33d333aee9b13',
          subscriptionId:
            MOCK_ACTIVE_SUBSCRIPTIONS_TO_ARCHIVED[0].subscriptionId,
          productId: MOCK_ACTIVE_SUBSCRIPTIONS_TO_ARCHIVED[0].productId,
          createdAt: 1565816388815,
          cancelledAt: 1566252991684,
        },
      ]);
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(200, MOCK_CUSTOMER_ARCHIVED_PLAN);

    await cancellationSuccessCommonSteps();
  });

  it('cancelling one subscription disables other subscription cancel buttons', async () => {
    initApiMocks({
      mockCustomer: MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
      mockActiveSubscriptions: MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
    });

    nock(authServer)
      .delete('/v1/oauth/subscriptions/active/sub0.28964929339372136')
      .reply(200, {});
    nock(authServer)
      .get('/v1/oauth/subscriptions/active')
      .reply(200, [
        {
          uid: 'a90fef48240b49b2b6a33d333aee9b13',
          subscriptionId: 'sub0.28964929339372136',
          productId: '123doneProProduct',
          createdAt: 1565816388815,
          cancelledAt: 1566252991684,
        },
      ]);
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(200, {
        ...MOCK_CUSTOMER,
        subscriptions: [
          {
            _subscription_type: MozillaSubscriptionTypes.WEB,
            subscription_id: 'sub0.21234123424',
            plan_id: PLAN_ID,
            product_id: PRODUCT_ID,
            latest_invoice: '628031D-0002',
            latest_invoice_items: MOCK_LATEST_INVOICE_ITEMS,
            status: 'active',
            cancel_at_period_end: false,
            current_period_start: 1565816388.815,
            current_period_end: 1568408388.815,
          },
          {
            _subscription_type: MozillaSubscriptionTypes.WEB,
            subscription_id: 'sub0.28964929339372136',
            plan_id: '123doneProMonthly',
            product_id: 'prod_123',
            product_name: '123done Pro',
            latest_invoice: '628031D-0002',
            latest_invoice_items: MOCK_LATEST_INVOICE_ITEMS,
            status: 'active',
            cancel_at_period_end: true,
            current_period_start: 1565816388.815,
            current_period_end: 1568408388.815,
          },
        ],
      });

    const { findByTestId, queryAllByTestId, queryByTestId, getAllByTestId } =
      renderWithLocalizationProvider(<Subject />);

    // Wait for the page to load with one subscription
    await findByTestId('subscription-management-loaded');
    const items = queryAllByTestId('subscription-item');
    expect(items.length).toBe(2);

    // Click the button to reveal the cancellation panel
    const revealButtons = getAllByTestId('reveal-cancel-subscription-button');
    for (const revealButton of revealButtons) {
      fireEvent.click(revealButton);
    }

    await waitForExpect(() =>
      expect(cancelSubscriptionMounted).toBeCalledTimes(2)
    );

    const confirmBoxes = getAllByTestId('confirm-cancel-subscription-checkbox');
    for (const confirmBox of confirmBoxes) {
      fireEvent.click(confirmBox);
    }

    const cancelButtons = getAllByTestId('cancel-subscription-button');
    await waitForExpect(() =>
      expect(cancelButtons[0]).not.toHaveAttribute('disabled')
    );
    await waitForExpect(() =>
      expect(cancelButtons[1]).not.toHaveAttribute('disabled')
    );

    expect(cancelSubscriptionEngaged).toBeCalledTimes(2);

    fireEvent.click(cancelButtons[0]);

    await waitFor(() =>
      expect(getAllByTestId('spinner-update').length).toEqual(1)
    );
    await waitFor(() => expect(cancelButtons[0]).toHaveAttribute('disabled'));
    await waitFor(() => expect(cancelButtons[1]).toHaveAttribute('disabled'));

    // await findByTestId('subscription-management-loaded');

    await waitFor(() =>
      expect(queryByTestId('spinner-update')).not.toBeInTheDocument()
    );

    await waitFor(() =>
      expect(getAllByTestId('loading-overlay').length).toEqual(1)
    );
    await waitFor(() =>
      expect(queryByTestId('loading-overlay')).not.toBeInTheDocument()
    );

    // A farewell dialog should appear
    await waitFor(() => {
      expect(queryByTestId('cancellation-message-title')).toBeInTheDocument();
    });
  });

  async function commonReactivationSetup({
    useDefaultIcon = false,
    cancelledAtIsUnavailable = false,
    discount = 'NONE',
    paymentProvider = 'stripe',
  }: {
    useDefaultIcon?: boolean;
    cancelledAtIsUnavailable?: boolean;
    discount?: 'NONE' | 'ENDS_NEXT_INTERVAL' | 'ONGOING';
    paymentProvider?: 'stripe' | 'paypal' | 'not_chosen';
  }) {
    // To exercise the default icon fallback, delete webIconURL from the second plan.
    const plans: Plan[] = !useDefaultIcon
      ? MOCK_PLANS
      : [
          MOCK_PLANS[0],
          {
            ...MOCK_PLANS[1],
            product_metadata: {
              ...MOCK_PLANS[1].product_metadata,
              webIconURL: null,
              webIconBackground: null,
            },
          },
          ...MOCK_PLANS.slice(2),
        ];

    let latest_invoice_items;
    let mockSubsequentInvoices;
    switch (discount) {
      case 'ENDS_NEXT_INTERVAL':
        latest_invoice_items = {
          ...MOCK_LATEST_INVOICE_ITEMS,
          total: 735,
        };
        mockSubsequentInvoices = [
          { ...MOCK_SUBSEQUENT_INVOICES[0], total: 735 },
        ];
        break;
      case 'ONGOING':
        latest_invoice_items = {
          ...MOCK_LATEST_INVOICE_ITEMS,
          total: 685,
        };
        mockSubsequentInvoices = [
          { ...MOCK_SUBSEQUENT_INVOICES[0], total: 685 },
        ];
        break;
      case 'NONE':
      default:
        latest_invoice_items = MOCK_LATEST_INVOICE_ITEMS;
        mockSubsequentInvoices = [
          { ...MOCK_SUBSEQUENT_INVOICES[0], total: 735 },
        ];
        break;
    }

    nock(profileServer).get('/v1/profile').reply(200, MOCK_PROFILE);
    nock(authServer).get('/v1/oauth/subscriptions/plans').reply(200, plans);
    nock(authServer)
      .get('/v1/oauth/subscriptions/active')
      .reply(200, [
        {
          uid: 'a90fef48240b49b2b6a33d333aee9b13',
          subscriptionId: 'sub0.28964929339372136',
          productId: '123doneProProduct',
          createdAt: 1565816388815,
          cancelledAt: cancelledAtIsUnavailable ? null : 1566252991684,
        },
      ]);
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(200, {
        ...MOCK_CUSTOMER,
        payment_provider: paymentProvider,
        subscriptions: [
          {
            _subscription_type: MozillaSubscriptionTypes.WEB,
            subscription_id: 'sub0.28964929339372136',
            plan_id: '123doneProMonthly',
            product_id: 'prod_123',
            product_name: '123done Pro',
            latest_invoice: '628031D-0002',
            latest_invoice_items,
            status: 'active',
            cancel_at_period_end: true,
            current_period_start: 1565816388.815,
            current_period_end: 1568408388.815,
          },
        ],
      });
    nock(authServer)
      .get('/v1/oauth/subscriptions/active')
      .reply(200, [
        {
          uid: 'a90fef48240b49b2b6a33d333aee9b13',
          subscriptionId: 'sub0.28964929339372136',
          productId: '123doneProProduct',
          createdAt: 1565816388815,
          cancelledAt: null,
        },
      ]);
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(200, {
        ...MOCK_CUSTOMER,
        payment_provider: paymentProvider,
        subscriptions: [
          {
            _subscription_type: MozillaSubscriptionTypes.WEB,
            subscription_id: 'sub0.28964929339372136',
            plan_id: '123doneProMonthly',
            product_id: 'prod_123',
            product_name: '123done Pro',
            latest_invoice: '628031D-0002',
            latest_invoice_items,
            status: 'active',
            cancel_at_period_end: false,
            current_period_start: 1565816388.815,
            current_period_end: 1568408388.815,
          },
        ],
      });
    nock(authServer)
      .get('/v1/oauth/subscriptions/invoice/preview-subsequent')
      .reply(200, mockSubsequentInvoices);
  }

  const expectProductImage = ({
    getByAltText,
    useDefaultIcon = false,
  }: {
    getByAltText: RenderResult['getByAltText'];
    useDefaultIcon?: boolean;
  }) => {
    const productName = MOCK_PLANS[1].product_name;
    const plan = MOCK_PLANS[1];
    const productMetadata = plan.product_metadata as ProductMetadata;
    const productImg = getByAltText(productName);
    const imgSrc = productImg.getAttribute('src');
    if (useDefaultIcon) {
      // Default icon will be inlined, but let's just look for the data:image prefix
      expect(imgSrc).toMatch(/^data:image/);
    } else {
      expect(imgSrc).toEqual(productMetadata.webIconURL);
    }
  };

  const reactivationTests = (
    useDefaultIcon = true,
    discount: 'NONE' | 'ENDS_NEXT_INTERVAL' | 'ONGOING' = 'NONE'
  ) => {
    let amountString: string = '';
    switch (discount) {
      case 'ONGOING':
        amountString = '$6.85';
        break;
      case 'ENDS_NEXT_INTERVAL':
      case 'NONE':
      default:
        amountString = '$7.35';
    }
    it('supports reactivating a subscription through the confirmation flow', async () => {
      commonReactivationSetup({ useDefaultIcon, discount });
      nock(authServer)
        .post('/v1/oauth/subscriptions/reactivate')
        .reply(200, {});
      nock(authServer)
        .get('/v1/oauth/subscriptions/invoice/preview-subsequent')
        .reply(200, MOCK_SUBSEQUENT_INVOICES);
      const { findByTestId, getByTestId, getByAltText, queryByTestId } =
        renderWithLocalizationProvider(<Subject />);

      // Wait for the page to load with one subscription
      await findByTestId('subscription-management-loaded');

      const reactivateButton = getByTestId('reactivate-subscription-button');
      fireEvent.click(reactivateButton);

      // Product image should appear in the reactivation confirm dialog.
      expectProductImage({ getByAltText, useDefaultIcon });

      const reactivateModalCopy = getByTestId('reactivate-modal-copy');
      expect(reactivateModalCopy.textContent).toContain(amountString);
      expect(
        queryByTestId('reactivate-modal-copy-paypal')
      ).not.toBeInTheDocument();

      const reactivateConfirmButton = getByTestId(
        'reactivate-subscription-confirm-button'
      );
      fireEvent.click(reactivateConfirmButton);

      await findByTestId('reactivate-subscription-success-dialog');

      await waitForExpect(() =>
        expect(queryByTestId('loading-overlay')).not.toBeInTheDocument()
      );

      // Product image should appear in the reactivation success dialog.
      expectProductImage({ getByAltText, useDefaultIcon });

      const successButton = getByTestId(
        'reactivate-subscription-success-button'
      );
      fireEvent.click(successButton);

      await findByTestId('reveal-cancel-subscription-button');
    });

    it('should display alternative copy when payment provider is not Stripe', async () => {
      commonReactivationSetup({
        useDefaultIcon,
        discount,
        paymentProvider: 'paypal',
      });
      nock(authServer)
        .post('/v1/oauth/subscriptions/reactivate')
        .reply(200, {});
      nock(authServer)
        .get('/v1/oauth/subscriptions/invoice/preview-subsequent')
        .reply(200, MOCK_SUBSEQUENT_INVOICES);
      const { findByTestId, getByTestId, getByAltText, queryByTestId } =
        renderWithLocalizationProvider(<Subject />);

      // Wait for the page to load with one subscription
      await findByTestId('subscription-management-loaded');

      const reactivateButton = getByTestId('reactivate-subscription-button');
      fireEvent.click(reactivateButton);

      // Product image should appear in the reactivation confirm dialog.
      expectProductImage({ getByAltText, useDefaultIcon });

      const reactivateModalCopy = getByTestId('reactivate-modal-copy-paypal');
      expect(reactivateModalCopy.textContent).toContain(amountString);
      expect(queryByTestId('reactivate-modal-copy')).not.toBeInTheDocument();

      const reactivateConfirmButton = getByTestId(
        'reactivate-subscription-confirm-button'
      );
      fireEvent.click(reactivateConfirmButton);

      await findByTestId('reactivate-subscription-success-dialog');

      await waitForExpect(() =>
        expect(queryByTestId('loading-overlay')).not.toBeInTheDocument()
      );

      // Product image should appear in the reactivation success dialog.
      expectProductImage({ getByAltText, useDefaultIcon });

      const successButton = getByTestId(
        'reactivate-subscription-success-button'
      );
      fireEvent.click(successButton);

      await findByTestId('reveal-cancel-subscription-button');
    });

    it('should display an error message if reactivation fails', async () => {
      commonReactivationSetup({ useDefaultIcon });
      nock(authServer)
        .post('/v1/oauth/subscriptions/reactivate')
        .reply(500, {});
      nock(authServer)
        .get('/v1/oauth/subscriptions/invoice/preview-subsequent')
        .reply(200, MOCK_SUBSEQUENT_INVOICES);

      const { findByTestId, getByTestId } = renderWithLocalizationProvider(
        <Subject />
      );

      // Wait for the page to load with one subscription
      await findByTestId('subscription-management-loaded');

      const reactivateButton = getByTestId('reactivate-subscription-button');
      fireEvent.click(reactivateButton);

      const reactivateConfirmButton = getByTestId(
        'reactivate-subscription-confirm-button'
      );
      fireEvent.click(reactivateConfirmButton);

      await findByTestId('error-reactivation');
    });
  };

  describe('reactivation with defined webIconURL', () => {
    reactivationTests(false);
  });

  describe('reactivation with default icon', () => {
    reactivationTests(true);
  });

  describe('reactivation with ongoing discount', () => {
    reactivationTests(true, 'ONGOING');
  });

  describe('reactivation with discount ending next interval', () => {
    reactivationTests(true, 'ENDS_NEXT_INTERVAL');
  });

  it('should display an error message for a plan found in auth-server but not subhub', async () => {
    nock(profileServer).get('/v1/profile').reply(200, MOCK_PROFILE);
    nock(authServer).get('/v1/oauth/subscriptions/plans').reply(200, []);
    nock(authServer)
      .get('/v1/oauth/subscriptions/active')
      .reply(200, MOCK_ACTIVE_SUBSCRIPTIONS);
    nock(authServer)
      .get('/v1/oauth/mozilla-subscriptions/customer/billing-and-subscriptions')
      .reply(200, MOCK_CUSTOMER);
    nock(authServer)
      .get('/v1/oauth/subscriptions/invoice/preview-subsequent')
      .reply(200, MOCK_SUBSEQUENT_INVOICES);
    const { findByTestId } = renderWithLocalizationProvider(<Subject />);
    await findByTestId('error-subhub-missing-plan');
  });

  it('redirects to content server when there is no access token', async () => {
    const originalWindow = window.location;
    // @ts-ignore
    delete window.location;
    window.location = { ...originalWindow, href: '' };

    const setSpy = jest.fn();
    Object.defineProperty(window.location, 'href', { set: setSpy });

    const appContext = { accessToken: undefined };
    renderWithLocalizationProvider(<Subject appContext={appContext} />);

    expect(setSpy).toHaveBeenCalledWith(
      'https://content.example/subscriptions'
    );

    window.location = originalWindow;
  });

  describe('IAP subscriptions', () => {
    const webSubscription: WebSubscription = {
      _subscription_type: MozillaSubscriptionTypes.WEB,
      subscription_id: 'sub0.28964929339372136',
      created: 1565816388.815,
      end_at: 1568408388.815,
      plan_id: PLAN_ID,
      product_id: PRODUCT_ID,
      product_name: '123done Pro',
      latest_invoice: '628031D-0002',
      latest_invoice_items: MOCK_LATEST_INVOICE_ITEMS,
      status: 'active',
      cancel_at_period_end: false,
      current_period_start: 1565816388.815,
      current_period_end: 1568408388.815,
      promotion_duration: null,
      promotion_end: null,
    };

    const appleIapSubscription: IapSubscription = {
      ...IAP_APPLE_SUBSCRIPTION,
      product_id: PRODUCT_ID,
    };

    const googleIapSubscription: IapSubscription = {
      ...IAP_GOOGLE_SUBSCRIPTION,
      product_id: PRODUCT_ID,
    };

    it('does not render the PaymentUpdateForm if only IAP subscriptions are present', async () => {
      initApiMocks({
        mockCustomer: {
          ...MOCK_CUSTOMER,
          subscriptions: [appleIapSubscription, googleIapSubscription],
        },
      });
      initApiMocks({
        mockCustomer: {
          ...MOCK_CUSTOMER,
          subscriptions: [appleIapSubscription, googleIapSubscription],
        },
      });

      const { findByTestId, queryAllByTestId, queryByTestId } =
        renderWithLocalizationProvider(<Subject />);

      await findByTestId('subscription-management-loaded');

      const paymentUpdateForm = queryByTestId('PaymentUpdateForm');
      expect(paymentUpdateForm).toBeNull();

      const items = queryAllByTestId('subscription-item');
      expect(items.length).toBe(2);
    });

    it('renders the PaymentUpdateForm if both Web and IAP subscriptions are present', async () => {
      initApiMocks({
        mockCustomer: {
          ...MOCK_CUSTOMER,
          subscriptions: [
            appleIapSubscription,
            googleIapSubscription,
            webSubscription,
          ],
        },
        mockPlans: MOCK_PLANS,
        mockSubsequentInvoices: MOCK_SUBSEQUENT_INVOICES,
      });

      const { findByTestId, queryAllByTestId } = renderWithLocalizationProvider(
        <Subject />
      );

      await findByTestId('subscription-management-loaded');

      const paymentUpdateForm = await findByTestId('PaymentUpdateForm');
      expect(paymentUpdateForm).toBeInTheDocument();

      const items = queryAllByTestId('subscription-item');
      expect(items.length).toBe(3);
    });
  });
});
