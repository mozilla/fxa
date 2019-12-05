import React from 'react';
import {
  render,
  cleanup,
  act,
  fireEvent,
  RenderResult,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import waitForExpect from 'wait-for-expect';

import { getErrorMessage, PAYMENT_ERROR_2 } from '../../lib/errors';
import {
  STRIPE_FIELDS,
  PLAN_ID,
  PRODUCT_NAME,
  PRODUCT_ID,
  PRODUCT_REDIRECT_URLS,
  MOCK_PLANS,
  MOCK_PROFILE,
  MOCK_ACTIVE_SUBSCRIPTIONS,
  MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
  MOCK_CUSTOMER,
  MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
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

jest.mock('../../lib/sentry');

import { apiCreateSubscription } from '../../lib/apiClient';
jest.mock('../../lib/apiClient');

import FlowEvent from '../../lib/flow-event';
jest.mock('../../lib/flow-event');

import { SignInLayout } from '../../components/AppLayout';
import Product from './index';
import { SMALL_DEVICE_RULE } from '../../components/PaymentForm';
import {
  ProductMetadata,
  Subscription,
  Customer,
  Plan,
  Profile,
} from '../../lib/types';

const mockApiCreateSubscription = apiCreateSubscription as jest.Mock;

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
    jest.resetAllMocks();
  });

  afterEach(() => {
    return cleanup();
  });

  const Subject = ({
    productId = PRODUCT_ID,
    planId,
    accountActivated,
    matchMedia = jest.fn(() => false),
    navigateToUrl = jest.fn(),
    createToken = jest.fn().mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE),
    profile = MOCK_PROFILE,
    profileUndefined,
    plans = MOCK_PLANS,
    plansUndefined,
    subscriptions = MOCK_ACTIVE_SUBSCRIPTIONS,
    customer = MOCK_CUSTOMER,
    fetchCustomer = jest.fn(),
    fetchSubscriptions = jest.fn(),
  }: {
    productId?: string;
    planId?: string;
    matchMedia?: (query: string) => boolean;
    navigateToUrl?: (url: string) => void;
    accountActivated?: string;
    createToken?: jest.Mock<any, any>;
    profile?: Profile;
    profileUndefined?: boolean;
    plans?: Plan[];
    plansUndefined?: boolean;
    subscriptions?: Subscription[];
    customer?: Customer;
    fetchCustomer?: () => Promise<any>;
    fetchSubscriptions?: () => Promise<any>;
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
      matchMedia,
      navigateToUrl: navigateToUrl || jest.fn(),
      queryParams: {
        plan: planId,
        activated: accountActivated,
      },
      profile: profileUndefined ? undefined : profile,
      plans: plansUndefined ? undefined : plans,
      subscriptions,
      customer,
      fetchCustomer,
      fetchSubscriptions,
    };
    return (
      <MockApp {...{ mockStripe, appContextValue }}>
        <SignInLayout>
          <Product {...props} />
        </SignInLayout>
      </MockApp>
    );
  };

  // To exercise the default icon fallback, delete webIconURL from the first plan.
  const varyPlansForDefaultIcon = (useDefaultIcon: boolean = false) =>
    !useDefaultIcon
      ? MOCK_PLANS
      : [
          {
            ...MOCK_PLANS[0],
            product_metadata: {
              ...MOCK_PLANS[0].product_metadata,
              webIconURL: null,
            },
          },
          ...MOCK_PLANS.slice(1),
        ];

  const withExistingAccount = (useDisplayName?: boolean) => async () => {
    const displayName = useDisplayName ? 'Foo Barson' : undefined;
    const { findByText, queryByText, queryByTestId } = render(<Subject />);
    if (window.onload) {
      dispatchEvent(new Event('load'));
    }
    await findByText("Let's set up your subscription");
    expect(
      queryByText(`${PRODUCT_NAME} for $5.00 per month`)
    ).toBeInTheDocument();
    expect(queryByTestId('account-activated')).not.toBeInTheDocument();
    expect(queryByTestId('profile-email')).toBeInTheDocument();
    if (displayName) {
      expect(queryByTestId('profile-display-name')).toBeInTheDocument();
    }
  };

  it('renders with valid product ID', withExistingAccount(false));

  it('renders with product ID and display name', withExistingAccount(true));

  const withActivationBanner = (useDisplayName?: boolean) => async () => {
    const { findByText, queryByText, queryByTestId } = render(
      <Subject
        profile={{
          ...MOCK_PROFILE,
          displayName: useDisplayName ? 'Foo Barson' : null,
        }}
        planId={PLAN_ID}
        accountActivated="true"
      />
    );

    await findByText("Let's set up your subscription");
    expect(
      queryByText(`${PRODUCT_NAME} for $5.00 per month`)
    ).toBeInTheDocument();
    expect(queryByTestId('account-activated')).toBeInTheDocument();
    if (useDisplayName) {
      expect(queryByTestId('activated-display-name')).toBeInTheDocument();
      expect(queryByTestId('activated-email')).not.toBeInTheDocument();
    } else {
      expect(queryByTestId('activated-display-name')).not.toBeInTheDocument();
      expect(queryByTestId('activated-email')).toBeInTheDocument();
    }
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
    const { findByTestId } = render(<Subject productId="bad_product" />);
    await findByTestId('no-such-plan-error');
  });

  it('displays nothing on failure to load profile', async () => {
    const { queryByTestId, debug } = render(
      <Subject profileUndefined={true} />
    );
    expect(queryByTestId('subscription-create')).not.toBeInTheDocument();
  });

  it('displays an error on failure to load plans', async () => {
    const { queryByTestId } = render(<Subject plansUndefined={true} />);
    expect(queryByTestId('subscription-create')).not.toBeInTheDocument();
  });

  async function commonSubmitSetup(
    createToken: jest.Mock<any, any>,
    useDefaultIcon: boolean = false
  ) {
    const navigateToUrl = jest.fn();
    const matchMedia = jest.fn(() => false);
    const plans = varyPlansForDefaultIcon(useDefaultIcon);
    const fetchCustomer = jest.fn().mockResolvedValueOnce({});
    const fetchSubscriptions = jest.fn().mockResolvedValueOnce({});

    const renderResult = render(
      <Subject
        {...{
          plans,
          fetchCustomer,
          fetchSubscriptions,
          matchMedia,
          navigateToUrl,
          createToken,
        }}
      />
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
    const paymentFormName = 'Foo Barson';
    fireEvent.change(getByTestId('name'), {
      target: { value: paymentFormName },
    });
    fireEvent.blur(getByTestId('name'));
    fireEvent.change(getByTestId('zip'), { target: { value: '90210' } });
    fireEvent.blur(getByTestId('zip'));
    fireEvent.click(getByTestId('confirm'));

    return {
      ...renderResult,
      matchMedia,
      navigateToUrl,
      paymentFormName,
      plans,
      fetchSubscriptions,
      fetchCustomer,
    };
  }

  it('handles a successful payment submission as expected', async () => {
    mockApiCreateSubscription.mockResolvedValueOnce({});

    const createToken = jest
      .fn()
      .mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE);

    const {
      getByTestId,
      fetchCustomer,
      plans,
      fetchSubscriptions,
      paymentFormName,
    } = await commonSubmitSetup(createToken);

    await act(async () => {
      fireEvent.click(getByTestId('submit'));
    });

    expect(createToken).toBeCalled();
    expect(apiCreateSubscription).toBeCalledWith({
      displayName: paymentFormName,
      paymentToken: (VALID_CREATE_TOKEN_RESPONSE.token as stripe.Token).id,
      planId: plans[0].plan_id,
      productId: plans[0].product_id,
    });

    expect(fetchCustomer).toBeCalled();
    expect(fetchSubscriptions).toBeCalled();
  });

  const expectProductImage = ({
    getByAltText,
    useDefaultIcon = false,
  }: {
    getByAltText: RenderResult['getByAltText'];
    useDefaultIcon?: boolean;
  }) => {
    const productMetadata = MOCK_PLANS[0].product_metadata as ProductMetadata;
    const productImg = getByAltText(PRODUCT_NAME);
    const imgSrc = productImg.getAttribute('src');
    if (useDefaultIcon) {
      // Default icon will be inlined, but let's just look for the data:image prefix
      expect(imgSrc).toMatch(/^data:image/);
    } else {
      expect(imgSrc).toEqual(productMetadata.webIconURL);
    }
  };

  const withProductImageTests = (useDefaultIcon = false) => () => {
    it('redirects to product page if user is subscribed', async () => {
      const navigateToUrl = jest.fn();
      const matchMedia = jest.fn(() => false);
      const createToken = jest
        .fn()
        .mockResolvedValue(VALID_CREATE_TOKEN_RESPONSE);

      const { findByText, queryByText, getByAltText } = render(
        <Subject
          {...{
            matchMedia,
            navigateToUrl,
            createToken,
            plans: varyPlansForDefaultIcon(useDefaultIcon),
            subscriptions: MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
            customer: MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
          }}
        />
      );

      await findByText('Your subscription is ready');
      expectProductImage({ getByAltText, useDefaultIcon });
      expect(createToken).not.toBeCalled();
      expect(queryByText('Firefox Tanooki Suit')).toBeInTheDocument();
      expect(
        queryByText("Click here if you're not automatically redirected")
      ).toBeInTheDocument();
      expect(navigateToUrl).toBeCalledWith('https://example.com/product');
    });
  };

  describe('with product icon defined', withProductImageTests(false));

  describe('with default product icon', withProductImageTests(true));

  it('displays an error if payment submission somehow silently fails', async () => {
    const createToken = jest.fn().mockResolvedValue({});
    const { getByTestId, findByTestId } = await commonSubmitSetup(createToken);
    fireEvent.click(getByTestId('submit'));
    await findByTestId('error-payment-submission');
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
    mockApiCreateSubscription.mockRejectedValueOnce({
      code,
      message,
    });

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

  it('displays error based on `card_error` during subscription creation if card declines', async () => {
    const message = getErrorMessage('card_error');
    const {
      getByTestId,
      queryByText,
      findByTestId,
    } = await commonCreateSubscriptionFailSetup('card_declined', message);
    fireEvent.click(getByTestId('submit'));

    await findByTestId('error-card-rejected');
    expect(queryByText(message)).toBeInTheDocument();

    // hide on form change
    fireEvent.change(getByTestId('zip'), { target: { value: '12345' } });
    await waitForExpect(() =>
      expect(queryByText(message)).not.toBeInTheDocument()
    );
  });

  it('displays error based on `card_error` during subscription creation if card CVC is incorrect', async () => {
    const message = getErrorMessage('card_error');
    const {
      getByTestId,
      queryByText,
      findByTestId,
    } = await commonCreateSubscriptionFailSetup('incorrect_cvc', message);
    fireEvent.click(getByTestId('submit'));

    await findByTestId('error-card-rejected');
    expect(queryByText(message)).toBeInTheDocument();

    // hide on form change
    fireEvent.change(getByTestId('zip'), { target: { value: '12345' } });
    await waitForExpect(() =>
      expect(queryByText(message)).not.toBeInTheDocument()
    );
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

  it('offers upgrade if user is already subscribed to another plan in the same product set', async () => {
    const { findByTestId } = render(
      <Subject
        {...{
          planId: 'plan_upgrade',
          productId: 'prod_upgrade',
          subscriptions: MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION,
          customer: MOCK_CUSTOMER_AFTER_SUBSCRIPTION,
        }}
      />
    );
    await findByTestId('subscription-upgrade');
  });
});
