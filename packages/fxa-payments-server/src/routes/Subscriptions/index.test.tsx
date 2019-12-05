import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  act,
  RenderResult,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import waitForExpect from 'wait-for-expect';

jest.mock('../../lib/sentry');

import {
  apiCancelSubscription,
  apiUpdatePayment,
  apiReactivateSubscription,
} from '../../lib/apiClient';
jest.mock('../../lib/apiClient');

import {
  manageSubscriptionsMounted,
  manageSubscriptionsEngaged,
  cancelSubscriptionMounted,
  cancelSubscriptionEngaged,
} from '../../lib/amplitude';
jest.mock('../../lib/amplitude');

import {
  ProductMetadata,
  Plan,
  Profile,
  Subscription,
  Customer,
} from '../../lib/types';

import { AuthServerErrno } from '../../lib/errors';

import { PAYMENT_ERROR_1 } from '../../lib/errors';
import {
  wait,
  defaultAppContextValue,
  MockApp,
  setupMockConfig,
  mockConfig,
  mockServerUrl,
  mockOptionsResponses,
  mockStripeElementOnChangeFns,
  elementChangeResponse,
  STRIPE_FIELDS,
  VALID_CREATE_TOKEN_RESPONSE,
  PRODUCT_NAME,
  MOCK_PROFILE,
  MOCK_PLANS,
  MOCK_ACTIVE_SUBSCRIPTIONS,
  MOCK_CUSTOMER,
  MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
  MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
} from '../../lib/test-utils';

import FlowEvent from '../../lib/flow-event';
jest.mock('../../lib/flow-event');

import { SettingsLayout } from '../../components/AppLayout';
import Subscriptions from './index';

const mockApiCancelSubscription = apiCancelSubscription as jest.Mock;
const mockApiUpdatePayment = apiUpdatePayment as jest.Mock;
const mockApiReactivateSubscription = apiReactivateSubscription as jest.Mock;
const mockManageSubscriptionsMounted = manageSubscriptionsMounted as jest.Mock;
const mockManageSubscriptionsEngaged = manageSubscriptionsEngaged as jest.Mock;
const mockCancelSubscriptionMounted = cancelSubscriptionMounted as jest.Mock;
const mockCancelSubscriptionEngaged = cancelSubscriptionEngaged as jest.Mock;

describe('routes/Subscriptions', () => {
  let contentServer = '';
  let authServer = '';
  let profileServer = '';

  beforeEach(() => {
    setupMockConfig(mockConfig);
    jest.resetAllMocks();

    contentServer = mockServerUrl('content');
    authServer = mockServerUrl('auth');
    profileServer = mockServerUrl('profile');
  });

  afterEach(() => {
    return cleanup();
  });

  const Subject = ({
    matchMedia = jest.fn(() => false),
    navigateToUrl = jest.fn(),
    createToken = jest.fn().mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE),
    displayName = null,
    customer = MOCK_CUSTOMER,
    subscriptions = MOCK_ACTIVE_SUBSCRIPTIONS,
    plans = MOCK_PLANS,
    fetchCustomer = jest.fn(),
    fetchSubscriptions = jest.fn(),
  }: {
    matchMedia?: (query: string) => boolean;
    navigateToUrl?: (url: string) => void;
    createToken?: jest.Mock<any, any>;
    displayName?: string | null;
    plans?: Plan[];
    subscriptions?: Subscription[];
    customer?: Customer;
    fetchCustomer?: () => Promise<any>;
    fetchSubscriptions?: () => Promise<any>;
  }) => {
    const props = {
      match: {
        params: {},
      },
    };
    const mockStripe = {
      createToken,
    };
    const appContextValue = {
      ...defaultAppContextValue(),
      matchMedia,
      navigateToUrl: navigateToUrl || jest.fn(),
      queryParams: {
        deviceId: 'quux',
        flowBeginTime: Date.now(),
        flowId: 'thisisanid',
      },
      profile: { ...MOCK_PROFILE, displayName },
      customer,
      subscriptions,
      plans,
      fetchCustomer,
      fetchSubscriptions,
    };

    return (
      <MockApp {...{ mockStripe, appContextValue }}>
        <SettingsLayout>
          <Subscriptions {...props} />
        </SettingsLayout>
      </MockApp>
    );
  };

  it('lists all subscriptions', async () => {
    const { findByTestId, queryAllByTestId, queryByTestId } = render(
      <Subject
        {...{
          customer: MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
          subscriptions: MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
        }}
      />
    );
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
    const { findByTestId, queryAllByTestId } = render(
      <Subject
        {...{
          customer: MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
          subscriptions: MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
          plans: MOCK_PLANS.map(plan => ({
            ...plan,
            product_metadata: {
              upgradeCTA: `
              example upgrade CTA for
              <a data-testid="upgrade-link" href="http://example.org">${plan.product_name}</a>
            `,
            },
          })),
        }}
      />
    );
    await findByTestId('subscription-management-loaded');
    expect(queryAllByTestId('upgrade-cta').length).toBe(2);
    // Ensure that our HTML in upgradeCTA got rendered as markup
    expect(queryAllByTestId('upgrade-link').length).toBe(2);
  });

  it('offers a button for support', async () => {
    const navigateToUrl = jest.fn();
    const { getByTestId, findByTestId } = render(
      <Subject navigateToUrl={navigateToUrl} />
    );
    await findByTestId('subscription-management-loaded');
    fireEvent.click(getByTestId('contact-support-button'));
    await waitForExpect(() => expect(navigateToUrl).toBeCalled());
    expect(navigateToUrl).toBeCalledWith(`${contentServer}/support`);
  });

  it('calls manageSubscriptionsMounted and manageSubscriptionsEngaged', async () => {
    const { getAllByTestId, findByTestId } = render(
      <Subject
        {...{
          customer: MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
          subscriptions: MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
        }}
      />
    );
    await findByTestId('subscription-management-loaded');
    fireEvent.click(getAllByTestId('reveal-cancel-subscription-button')[0]);
    expect(mockManageSubscriptionsMounted).toBeCalledTimes(1);
    expect(mockManageSubscriptionsEngaged).toBeCalledTimes(1);
  });

  it('displays profile displayName if available', async () => {
    const { findByText } = render(<Subject displayName="Foo Barson" />);
    await findByText('Foo Barson');
  });

  it('redirects to settings if no subscriptions are available', async () => {
    const navigateToUrl = jest.fn();
    render(
      <Subject
        navigateToUrl={navigateToUrl}
        subscriptions={[]}
        customer={{ ...MOCK_CUSTOMER, subscriptions: [] }}
      />
    );

    await waitForExpect(() => expect(navigateToUrl).toBeCalled());
    expect(navigateToUrl).toBeCalledWith(`${contentServer}/settings`);
  });

  it('displays an error if subscription cancellation fails', async () => {
    mockApiCancelSubscription.mockRejectedValueOnce({});

    const { findByTestId, queryAllByTestId, getByTestId } = render(<Subject />);

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

  it('supports cancelling a subscription', async () => {
    const cancelledId = 'sub0.28964929339372136';
    mockApiCancelSubscription.mockResolvedValueOnce({
      subscriptionId: cancelledId,
    });
    const { findByTestId, queryAllByTestId, getByTestId } = render(
      <Subject
        {...{
          subscriptions: [
            {
              uid: 'a90fef48240b49b2b6a33d333aee9b13',
              subscriptionId: cancelledId,
              productId: '123doneProProduct',
              createdAt: 1565816388815,
              cancelledAt: null,
            },
          ],
          customer: {
            ...MOCK_CUSTOMER,
            subscriptions: [
              {
                subscription_id: cancelledId,
                plan_id: '123doneProMonthly',
                nickname: '123done Pro Monthly',
                end_at: null,
                status: 'active',
                cancel_at_period_end: false,
                current_period_start: 1565816388.815,
                current_period_end: 1568408388.815,
              },
            ],
          },
        }}
      />
    );

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

    // A farewell dialog should appear
    await findByTestId('cancellation-message-title');
  });

  function commonReactivationSetup({
    useDefaultIcon = false,
    cancelledAtIsUnavailable = false,
  }) {
    // To exercise the default icon fallback, delete webIconURL from the second plan.
    const plans = !useDefaultIcon
      ? MOCK_PLANS
      : [
          MOCK_PLANS[0],
          {
            ...MOCK_PLANS[1],
            product_metadata: {
              ...MOCK_PLANS[1].product_metadata,
              webIconURL: null,
            },
          },
          ...MOCK_PLANS.slice(2),
        ];
    const subscriptions = [
      {
        uid: 'a90fef48240b49b2b6a33d333aee9b13',
        subscriptionId: 'sub0.28964929339372136',
        productId: '123doneProProduct',
        createdAt: 1565816388815,
        cancelledAt: cancelledAtIsUnavailable ? null : 1566252991684,
      },
    ];
    const customer = {
      ...MOCK_CUSTOMER,
      subscriptions: [
        {
          subscription_id: 'sub0.28964929339372136',
          plan_id: '123doneProMonthly',
          nickname: '123done Pro Monthly',
          end_at: null,
          status: 'active',
          cancel_at_period_end: true,
          current_period_start: 1565816388.815,
          current_period_end: 1568408388.815,
        },
      ],
    };
    return { plans, subscriptions, customer };
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

  it('hides cancellation date message when date is unavailable', async () => {
    const { findByTestId, queryByTestId } = render(
      <Subject
        {...commonReactivationSetup({ cancelledAtIsUnavailable: true })}
      />
    );
    await findByTestId('subscription-management-loaded');
    expect(
      queryByTestId('subscription-cancelled-date')
    ).not.toBeInTheDocument();
  });

  const reactivationTests = (useDefaultIcon = true) => () => {
    it('supports reactivating a subscription through the confirmation flow', async () => {
      mockApiReactivateSubscription.mockResolvedValueOnce({
        subscriptionId: 'sub0.28964929339372136',
        planId: '123doneProMonthly',
      });

      const { findByTestId, queryByTestId, getByTestId, getByAltText } = render(
        <Subject {...commonReactivationSetup({ useDefaultIcon })} />
      );

      // Wait for the page to load with one subscription
      await findByTestId('subscription-management-loaded');

      expect(queryByTestId('subscription-cancelled-date')).toBeInTheDocument();

      const reactivateButton = getByTestId('reactivate-subscription-button');
      fireEvent.click(reactivateButton);

      // Product image should appear in the reactivation confirm dialog.
      expectProductImage({ getByAltText, useDefaultIcon });

      const reactivateConfirmButton = getByTestId(
        'reactivate-subscription-confirm-button'
      );
      await act(async () => {
        fireEvent.click(reactivateConfirmButton);
      });

      await findByTestId('reactivate-subscription-success-dialog');

      // Product image should appear in the reactivation success dialog.
      expectProductImage({ getByAltText, useDefaultIcon });

      const successButton = getByTestId(
        'reactivate-subscription-success-button'
      );
      fireEvent.click(successButton);

      expect(
        queryByTestId('reactivate-subscription-success-dialog')
      ).not.toBeInTheDocument();
    });

    it('should display an error message if reactivation fails', async () => {
      mockApiReactivateSubscription.mockRejectedValueOnce({ message: 'oops' });

      const { debug, findByTestId, getByTestId, getByAltText } = render(
        <Subject {...commonReactivationSetup({ useDefaultIcon })} />
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

  describe('reactivation with defined webIconURL', reactivationTests(false));

  describe('reactivation with default icon', reactivationTests(true));

  it('should display an error message if subhub reports a subscription not found in auth-server', async () => {
    const { findByTestId } = render(<Subject subscriptions={[]} />);
    await findByTestId('error-fxa-missing-subscription');
  });

  it('should display an error message for a plan found in auth-server but not subhub', async () => {
    const { findByTestId } = render(<Subject plans={[]} />);
    await findByTestId('error-subhub-missing-plan');
  });

  it('supports updating billing information', async () => {
    mockApiUpdatePayment.mockResolvedValueOnce({});

    const createToken = jest
      .fn()
      .mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE);
    const { findByTestId, getByTestId } = render(
      <Subject createToken={createToken} />
    );
    await findByTestId('subscription-management-loaded');

    // Click button to reveal the payment update form
    fireEvent.click(getByTestId('reveal-payment-update-button'));
    await findByTestId('paymentForm');

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

    await act(async () => {
      fireEvent.click(getByTestId('submit'));
    });

    expect(createToken).toBeCalled();
    expect(mockApiUpdatePayment).toBeCalled();

    /*    
    await findByTestId('success-billing-update');

    // click outside the payment success dialog to trigger dismiss
    fireEvent.click(getByTestId('clear-success-alert'));

    waitForExpect(() =>
      expect(getByTestId('success-billing-update')).not.toBeInTheDocument()
    );
    */
  });

  it('displays an error message if updating billing information fails', async () => {
    mockApiUpdatePayment.mockRejectedValueOnce({});

    const createToken = jest
      .fn()
      .mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE);
    const { findByTestId, getByTestId } = render(
      <Subject createToken={createToken} />
    );
    await findByTestId('subscription-management-loaded');

    // Click button to reveal the payment update form
    fireEvent.click(getByTestId('reveal-payment-update-button'));
    await findByTestId('paymentForm');

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
    await act(async () => {
      fireEvent.click(getByTestId('submit'));
    });

    await findByTestId('error-billing-update');
  });

  it('displays an error message if createToken resolves to an unexpected value', async () => {
    const createToken = jest.fn().mockResolvedValue({ foo: 'bad value' });
    const { findByTestId, getByTestId } = render(
      <Subject createToken={createToken} />
    );
    await findByTestId('subscription-management-loaded');

    // Click button to reveal the payment update form
    fireEvent.click(getByTestId('reveal-payment-update-button'));
    await findByTestId('paymentForm');

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
    fireEvent.click(getByTestId('submit'));

    await findByTestId('error-payment-submission');
  });

  it('displays an error message if createToken fails', async () => {
    const createToken = jest.fn().mockRejectedValue({
      type: 'try_again_later',
    });

    const { container, findByTestId, getByTestId, queryByText } = render(
      <Subject createToken={createToken} />
    );
    await findByTestId('subscription-management-loaded');

    // Click button to reveal the payment update form
    fireEvent.click(getByTestId('reveal-payment-update-button'));
    await findByTestId('paymentForm');

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
    fireEvent.click(getByTestId('submit'));

    await findByTestId('error-payment-submission');
    expect(queryByText(PAYMENT_ERROR_1)).toBeInTheDocument();

    // click outside the payment error dialog to trigger dismiss
    fireEvent.click(container);
    waitForExpect(() =>
      expect(getByTestId('error-payment-submission')).not.toBeInTheDocument()
    );
  });
});
