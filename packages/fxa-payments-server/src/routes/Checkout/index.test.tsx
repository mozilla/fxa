/**
 * @jest-environment jsdom
 */
import {
  render,
  cleanup,
  fireEvent,
  act,
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import waitForExpect from 'wait-for-expect';

import {
  PRODUCT_ID,
  PRODUCT_REDIRECT_URLS,
  defaultAppContextValue,
  MockApp,
  setupMockConfig,
  mockConfig,
  mockServerUrl,
  mockOptionsResponses,
  mockStripeElementOnChangeFns,
  elementChangeResponse,
  MOCK_CHECKOUT_TOKEN,
  MOCK_PAYPAL_SUBSCRIPTION_RESULT,
} from '../../lib/test-utils';

import Checkout, { CheckoutProps } from './index';
import { AppContextType } from '../../lib/AppContext';
import {
  CONFIRM_CARD_RESULT,
  CUSTOMER,
  NEW_CUSTOMER,
  PAYMENT_METHOD_RESULT,
  PLANS,
  PROFILE,
  STUB_ACCOUNT_RESULT,
  SUBSCRIPTION_RESULT,
} from '../../lib/mock-data';

jest.mock('../../lib/apiClient', () => {
  return {
    ...jest.requireActual('../../lib/apiClient'),
    updateAPIClientConfig: jest.fn(),
    updateAPIClientToken: jest.fn(),
    apiCreatePasswordlessAccount: jest.fn(),
    apiFetchProfile: jest.fn(),
    apiFetchAccountStatus: jest.fn(),
    apiFetchPlans: jest.fn(),
    apiCreateCustomer: jest.fn(),
    apiFetchCustomer: jest.fn(),
    apiCreateSubscriptionWithPaymentMethod: jest.fn(),
    apiGetPaypalCheckoutToken: jest.fn(),
    apiCapturePaypalPayment: jest.fn(),
  };
});

const stripeOverride = {
  createPaymentMethod: jest.fn(),
  confirmCardPayment: jest.fn(),
};

import {
  updateAPIClientToken,
  apiCreateCustomer,
  apiCreatePasswordlessAccount,
  apiFetchCustomer,
  apiFetchPlans,
  apiFetchProfile,
  apiCreateSubscriptionWithPaymentMethod,
  apiFetchAccountStatus,
  apiGetPaypalCheckoutToken,
  apiCapturePaypalPayment,
} from '../../lib/apiClient';
import { ButtonBaseProps } from '../../components/PayPalButton';
import { updateConfig } from '../../lib/config';

const newAccountEmail = 'testo@example.gd';

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

    (updateAPIClientToken as jest.Mock).mockClear();
    (apiFetchPlans as jest.Mock).mockClear().mockResolvedValue(PLANS);
    (apiFetchAccountStatus as jest.Mock)
      .mockClear()
      .mockResolvedValue({ exists: false });
    (apiCreatePasswordlessAccount as jest.Mock)
      .mockClear()
      .mockResolvedValue(STUB_ACCOUNT_RESULT);
    (apiCreateCustomer as jest.Mock)
      .mockClear()
      .mockResolvedValue(NEW_CUSTOMER);

    (apiCreateSubscriptionWithPaymentMethod as jest.Mock)
      .mockClear()
      .mockResolvedValue(SUBSCRIPTION_RESULT);
    (apiFetchProfile as jest.Mock).mockClear().mockResolvedValue(PROFILE);
    (apiFetchCustomer as jest.Mock).mockClear().mockResolvedValue(CUSTOMER);
    (apiGetPaypalCheckoutToken as jest.Mock)
      .mockClear()
      .mockResolvedValue(MOCK_CHECKOUT_TOKEN);
    (apiCapturePaypalPayment as jest.Mock)
      .mockClear()
      .mockResolvedValue(MOCK_PAYPAL_SUBSCRIPTION_RESULT);

    stripeOverride.createPaymentMethod
      .mockClear()
      .mockResolvedValue(PAYMENT_METHOD_RESULT);
    stripeOverride.confirmCardPayment
      .mockClear()
      .mockResolvedValue(CONFIRM_CARD_RESULT);
  });

  afterEach(() => {
    return cleanup();
  });

  const Subject = ({
    productId = PRODUCT_ID,
    planId,
    matchMedia = jest.fn(() => false),
    navigateToUrl = jest.fn(),
    appContext = defaultAppContextValue(),
    ...additionalProps
  }: {
    productId?: string;
    planId?: string;
    matchMedia?: (query: string) => boolean;
    navigateToUrl?: (url: string) => void;
    appContext?: Partial<AppContextType>;
  } & Partial<CheckoutProps>) => {
    const props = {
      match: {
        params: {
          productId,
        },
      },
      plans: PLANS,
      plansByProductId: () => PLANS[0],
      fetchCheckoutRouteResources: () => PLANS,
      stripeOverride,
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
        <Checkout {...{ ...props, ...additionalProps }} />
      </MockApp>
    );
  };

  it('renders as expected', async () => {
    const { findByTestId, getByTestId } = render(<Subject />);

    const formEl = await findByTestId('new-user-email-form');
    expect(formEl).toBeInTheDocument();

    const paymentForm = getByTestId('paymentForm');
    expect(paymentForm).toBeInTheDocument();

    const planDetailsEl = getByTestId('plan-details-component');
    expect(planDetailsEl).toBeInTheDocument();
  });

  it('displays an error with invalid product ID', async () => {
    const { findByTestId, queryByTestId } = render(
      <Subject productId="bad_product" />
    );
    await findByTestId('no-such-plan-error');
    expect(queryByTestId('dialog-dismiss')).not.toBeInTheDocument();
  });

  it('displays an error on failure to load plans', async () => {
    (apiFetchPlans as jest.Mock).mockRejectedValue({});
    const { findByTestId } = render(<Subject />);
    const errorEl = await findByTestId('error-loading-plans');
    expect(errorEl).toBeInTheDocument();
  });

  describe('handling a passwordless Stripe subscription', () => {
    const fillOutZeForm = async () => {
      const { getByTestId } = screen;
      fireEvent.change(getByTestId('new-user-email'), {
        target: { value: newAccountEmail },
      });
      fireEvent.change(getByTestId('new-user-confirm-email'), {
        target: { value: newAccountEmail },
      });
      fireEvent.change(getByTestId('name'), {
        target: { value: 'BMO' },
      });
      fireEvent.click(getByTestId('confirm'));
      await act(async () => {
        mockStripeElementOnChangeFns.cardElement(
          elementChangeResponse({ complete: true, value: 'testo' })
        );
      });
      await act(async () => {
        fireEvent.click(getByTestId('submit'));
      });
    };

    it('creates the account and subscription successfully', async () => {
      await act(async () => {
        render(<Subject />);
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreatePasswordlessAccount).toHaveBeenCalledWith({
          email: newAccountEmail,
          clientId: mockConfig.servers.oauth.clientId,
        });
        expect(updateAPIClientToken).toHaveBeenCalledWith(
          STUB_ACCOUNT_RESULT.access_token
        );
        expect(stripeOverride.createPaymentMethod).toHaveBeenCalledTimes(1);
        expect(apiCreateCustomer).toHaveBeenCalledTimes(1);
        expect(apiCreateSubscriptionWithPaymentMethod).toHaveBeenCalledTimes(1);
        expect(apiFetchProfile).toHaveBeenCalledTimes(1);
        expect(apiFetchCustomer).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByTestId('payment-confirmation')).toBeInTheDocument();
    });

    it('displays an error when account creation failed', async () => {
      (apiCreatePasswordlessAccount as jest.Mock).mockRejectedValue('nope');
      await act(async () => {
        render(<Subject />);
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreatePasswordlessAccount).toHaveBeenCalledWith({
          email: newAccountEmail,
          clientId: mockConfig.servers.oauth.clientId,
        });
        expect(updateAPIClientToken).not.toHaveBeenCalled();
        expect(stripeOverride.createPaymentMethod).not.toHaveBeenCalled();
        expect(apiCreateCustomer).not.toHaveBeenCalled();
        expect(apiCreateSubscriptionWithPaymentMethod).not.toHaveBeenCalled();
        expect(apiFetchProfile).not.toHaveBeenCalled();
        expect(apiFetchCustomer).not.toHaveBeenCalled();
      });

      expect(screen.getByTestId('payment-error')).toBeInTheDocument();
    });

    it('displays an error when payment failed', async () => {
      stripeOverride.createPaymentMethod.mockRejectedValue({
        paymentIntent: undefined,
        error: 'nope',
      });
      await act(async () => {
        render(<Subject />);
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreatePasswordlessAccount).toHaveBeenCalledWith({
          email: newAccountEmail,
          clientId: mockConfig.servers.oauth.clientId,
        });
        expect(updateAPIClientToken).toHaveBeenCalledWith(
          STUB_ACCOUNT_RESULT.access_token
        );
        expect(stripeOverride.createPaymentMethod).toHaveBeenCalledTimes(1);
        expect(apiCreateCustomer).not.toHaveBeenCalled();
        expect(apiCreateSubscriptionWithPaymentMethod).not.toHaveBeenCalled();
        expect(apiFetchProfile).not.toHaveBeenCalled();
        expect(apiFetchCustomer).not.toHaveBeenCalled();
      });

      expect(screen.getByTestId('payment-error')).toBeInTheDocument();
    });

    it('displays a message when fetching user profile failed', async () => {
      (apiFetchProfile as jest.Mock).mockRejectedValue(null);
      await act(async () => {
        render(<Subject />);
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreatePasswordlessAccount).toHaveBeenCalledWith({
          email: newAccountEmail,
          clientId: mockConfig.servers.oauth.clientId,
        });
        expect(updateAPIClientToken).toHaveBeenCalledWith(
          STUB_ACCOUNT_RESULT.access_token
        );
        expect(stripeOverride.createPaymentMethod).toHaveBeenCalledTimes(1);
        expect(apiCreateCustomer).toHaveBeenCalledTimes(1);
        expect(apiCreateSubscriptionWithPaymentMethod).toHaveBeenCalledTimes(1);
        expect(apiFetchProfile).toHaveBeenCalledTimes(1);
        expect(apiFetchCustomer).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByTestId('payment-error')).toBeInTheDocument();
    });

    it('displays a message when fetching customer failed', async () => {
      (apiFetchCustomer as jest.Mock).mockRejectedValue(null);
      await act(async () => {
        render(<Subject />);
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreatePasswordlessAccount).toHaveBeenCalledWith({
          email: newAccountEmail,
          clientId: mockConfig.servers.oauth.clientId,
        });
        expect(updateAPIClientToken).toHaveBeenCalledWith(
          STUB_ACCOUNT_RESULT.access_token
        );
        expect(stripeOverride.createPaymentMethod).toHaveBeenCalledTimes(1);
        expect(apiCreateCustomer).toHaveBeenCalledTimes(1);
        expect(apiCreateSubscriptionWithPaymentMethod).toHaveBeenCalledTimes(1);
        expect(apiFetchProfile).toHaveBeenCalledTimes(1);
        expect(apiFetchCustomer).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByTestId('payment-error')).toBeInTheDocument();
    });
  });

  describe('handling a passwordless PayPal subscription', () => {
    updateConfig({
      featureFlags: {
        usePaypalUIByDefault: true,
      },
    });

    const fillOutZeForm = async () => {
      const { getByTestId } = screen;
      fireEvent.change(getByTestId('new-user-email'), {
        target: { value: newAccountEmail },
      });
      fireEvent.change(getByTestId('new-user-confirm-email'), {
        target: { value: newAccountEmail },
      });
      await act(async () => {
        fireEvent.click(getByTestId('confirm'));
      });
      await act(async () => {
        fireEvent.click(getByTestId('paypal-button'));
      });
    };

    it('creates the account and subscription successfully', async () => {
      const paypalButtonBase = ({
        createOrder,
        onApprove,
      }: ButtonBaseProps) => {
        return (
          <button
            data-testid="paypal-button"
            onClick={async () => {
              await createOrder!();
              await onApprove!({ orderID: 'new-sub' });
            }}
          />
        );
      };
      await act(async () => {
        render(<Subject paypalButtonBase={paypalButtonBase} />);
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreatePasswordlessAccount).toHaveBeenCalledWith({
          email: newAccountEmail,
          clientId: mockConfig.servers.oauth.clientId,
        });
        expect(updateAPIClientToken).toHaveBeenCalledWith(
          STUB_ACCOUNT_RESULT.access_token
        );
        expect(apiGetPaypalCheckoutToken).toHaveBeenCalledTimes(1);
        expect(apiCreateCustomer).toHaveBeenCalledTimes(1);
        expect(apiCapturePaypalPayment).toHaveBeenCalledTimes(1);
        expect(apiFetchProfile).toHaveBeenCalledTimes(1);
        expect(apiFetchCustomer).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByTestId('payment-confirmation')).toBeInTheDocument();
    });

    it('shows an error when account creation failed', async () => {
      (apiCreatePasswordlessAccount as jest.Mock).mockRejectedValue('nope');
      const paypalButtonBase = ({ createOrder }: ButtonBaseProps) => {
        return (
          <button
            data-testid="paypal-button"
            onClick={async () => {
              await createOrder!();
            }}
          />
        );
      };
      await act(async () => {
        render(<Subject paypalButtonBase={paypalButtonBase} />);
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreatePasswordlessAccount).toHaveBeenCalledWith({
          email: newAccountEmail,
          clientId: mockConfig.servers.oauth.clientId,
        });
        expect(updateAPIClientToken).not.toHaveBeenCalled();
        expect(apiGetPaypalCheckoutToken).not.toHaveBeenCalled();
      });

      expect(screen.getByTestId('payment-error')).toBeInTheDocument();
    });

    it('shows an error when failed to get a PayPal checkout token', async () => {
      (apiGetPaypalCheckoutToken as jest.Mock).mockRejectedValue({
        message: 'nogo',
      });
      const paypalButtonBase = ({ createOrder }: ButtonBaseProps) => {
        return (
          <button
            data-testid="paypal-button"
            onClick={async () => {
              await createOrder!();
            }}
          />
        );
      };
      await act(async () => {
        render(<Subject paypalButtonBase={paypalButtonBase} />);
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreatePasswordlessAccount).toHaveBeenCalledWith({
          email: newAccountEmail,
          clientId: mockConfig.servers.oauth.clientId,
        });
        expect(updateAPIClientToken).toHaveBeenCalledWith(
          STUB_ACCOUNT_RESULT.access_token
        );
        expect(apiGetPaypalCheckoutToken).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByTestId('payment-error')).toBeInTheDocument();
    });

    it('shows an error when customer creation failed', async () => {
      (apiCreateCustomer as jest.Mock).mockRejectedValue({});
      const paypalButtonBase = ({ onApprove }: ButtonBaseProps) => {
        return (
          <button
            data-testid="paypal-button"
            onClick={async () => {
              await onApprove!({ orderID: 'new-sub' });
            }}
          />
        );
      };
      await act(async () => {
        render(<Subject paypalButtonBase={paypalButtonBase} />);
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreateCustomer).toHaveBeenCalledTimes(1);
        expect(apiCapturePaypalPayment).not.toHaveBeenCalled();
        expect(apiFetchProfile).not.toHaveBeenCalled();
        expect(apiFetchCustomer).not.toHaveBeenCalled();
      });

      expect(screen.getByTestId('payment-error')).toBeInTheDocument();
    });

    it('shows an error when payment capture failed', async () => {
      (apiCapturePaypalPayment as jest.Mock).mockRejectedValue({});
      const paypalButtonBase = ({ onApprove }: ButtonBaseProps) => {
        return (
          <button
            data-testid="paypal-button"
            onClick={async () => {
              await onApprove!({ orderID: 'new-sub' });
            }}
          />
        );
      };
      await act(async () => {
        render(<Subject paypalButtonBase={paypalButtonBase} />);
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreateCustomer).toHaveBeenCalledTimes(1);
        expect(apiCapturePaypalPayment).toHaveBeenCalledTimes(1);
        expect(apiFetchProfile).not.toHaveBeenCalled();
        expect(apiFetchCustomer).not.toHaveBeenCalled();
      });

      expect(screen.getByTestId('payment-error')).toBeInTheDocument();
    });
  });
});
