/**
 * @jest-environment jsdom
 */
import { cleanup, fireEvent, act, screen } from '@testing-library/react';
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
  renderWithLocalizationProvider,
} from '../../lib/test-utils';

import Checkout, { CheckoutProps } from './index';
import { AppContextType } from '../../lib/AppContext';
import {
  CONFIRM_CARD_RESULT,
  CUSTOMER,
  INACTIVE_PLAN_ID,
  MOCK_CURRENCY_ERROR,
  MOCK_EVENTS,
  MOCK_FXA_POST_PASSWORDLESS_SUB_ERROR,
  MOCK_GENERAL_PAYPAL_ERROR,
  MOCK_STRIPE_CARD_ERROR,
  MOCK_UNSUPPORTED_LOCATION_ERROR,
  NEW_CUSTOMER,
  PAYMENT_METHOD_RESULT,
  PLANS,
  PROFILE,
  STUB_ACCOUNT_RESULT,
  SUBSCRIPTION_RESULT,
} from '../../lib/mock-data';

import { FXA_NEWSLETTER_SIGNUP_ERROR } from '../../lib/newsletter';
import { FXA_SIGNUP_ERROR } from '../../lib/account';
import { getErrorMessageId, getFallbackTextByFluentId } from '../../lib/errors';

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
  apiSignupForNewsletter,
} from '../../lib/apiClient';
import { ButtonBaseProps } from '../../components/PayPalButton';
import { ReactGALog } from '../../lib/reactga-event';
import { createSubscriptionEngaged } from '../../lib/amplitude';

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
    apiSignupForNewsletter: jest.fn(),
  };
});

const stripeOverride = {
  createPaymentMethod: jest.fn(),
  confirmCardPayment: jest.fn(),
};

const newAccountEmail = 'testo@example.gd';

let mockProductId: string;
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    productId: mockProductId,
  }),
}));

jest.mock('../../lib/reactga-event.ts');

jest.mock('../../lib/amplitude');

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
      .mockResolvedValue({ exists: false, invalidDomain: false });
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
    (apiSignupForNewsletter as jest.Mock).mockClear().mockResolvedValue({});

    stripeOverride.createPaymentMethod
      .mockClear()
      .mockResolvedValue(PAYMENT_METHOD_RESULT);
    stripeOverride.confirmCardPayment
      .mockClear()
      .mockResolvedValue(CONFIRM_CARD_RESULT);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    mockProductId = productId;
    const props = {
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
        extra: 'goodstuff',
      },
    };
    return (
      <MockApp {...{ appContextValue }}>
        <Checkout {...{ ...props, ...additionalProps }} />
      </MockApp>
    );
  };

  it('renders as expected', async () => {
    await act(async () => {
      renderWithLocalizationProvider(<Subject planId="testo" />);
    });

    const { findByTestId, getByTestId } = screen;

    const signInLink = getByTestId('sign-in-link');
    expect(signInLink).toHaveAttribute(
      'href',
      `${mockConfig.servers.content.url}/subscriptions/products/${PRODUCT_ID}?plan=testo&extra=goodstuff&signin=yes&redirect_to=http%3A%2F%2Flocalhost%2F`
    );

    const formEl = await findByTestId('new-user-email-form');
    expect(formEl).toBeInTheDocument();

    const paymentFormContainer = getByTestId('payment-form-container');
    expect(paymentFormContainer).toBeInTheDocument();
    expect(paymentFormContainer).toHaveClass('payment-form-disabled');
    expect(paymentFormContainer).toHaveAttribute('aria-disabled', 'true');

    const planDetailsEl = getByTestId('plan-details-component');
    expect(planDetailsEl).toBeInTheDocument();

    const paymentLegalBlurbEl = getByTestId('payment-legal-blurb-component');
    expect(paymentLegalBlurbEl).toBeInTheDocument();

    const termsAndPrivacyEl = getByTestId('terms-and-privacy-component');
    expect(termsAndPrivacyEl).toBeInTheDocument();

    const couponEl = getByTestId('coupon-component');
    expect(couponEl).toBeInTheDocument();
  });

  it('records an "engage" funnel event when the consent checkbox is clicked', async () => {
    renderWithLocalizationProvider(<Subject />);
    const { findByTestId } = screen;
    const checkbox = await findByTestId('confirm');
    await act(async () => {
      fireEvent.click(checkbox);
    });
    expect(createSubscriptionEngaged).toBeCalledTimes(1);
  });

  it('displays checkbox tooltip error when unchecking checkbox', async () => {
    await act(async () => {
      renderWithLocalizationProvider(<Subject planId="testo" />);
    });
    const { queryByTestId, findByTestId, queryByText } = screen;
    const paymentFormContainer = queryByTestId('payment-form-container');
    expect(paymentFormContainer).toBeInTheDocument();
    expect(paymentFormContainer).toHaveClass('payment-form-disabled');
    expect(paymentFormContainer).toHaveAttribute('aria-disabled', 'true');

    const checkbox = await findByTestId('confirm');
    await act(async () => {
      fireEvent.click(checkbox);
    });

    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(
      queryByText('You need to complete this before moving forward')
    ).toBeInTheDocument();
  });

  it('displays checkbox tooltip error when unchecked and clicking on disabled form', async () => {
    await act(async () => {
      renderWithLocalizationProvider(<Subject planId="testo" />);
    });
    const { queryByTestId, queryByText } = screen;
    const paymentFormContainer = queryByTestId('payment-form-container');
    expect(paymentFormContainer).toBeInTheDocument();
    expect(paymentFormContainer).toHaveClass('payment-form-disabled');
    expect(paymentFormContainer).toHaveAttribute('aria-disabled', 'true');

    if (paymentFormContainer) {
      await act(async () => {
        fireEvent.click(paymentFormContainer);
      });
    }

    expect(
      queryByText('You need to complete this before moving forward')
    ).toBeInTheDocument();
  });

  it('displays an error with invalid product ID', async () => {
    const { findByTestId, queryByTestId } = renderWithLocalizationProvider(
      <Subject productId="bad_product" />
    );
    await findByTestId('no-such-plan-error');
    expect(queryByTestId('dialog-dismiss')).not.toBeInTheDocument();
  });

  it('displays an error on failure to load plans', async () => {
    (apiFetchPlans as jest.Mock).mockRejectedValue({});
    const { findByTestId } = renderWithLocalizationProvider(<Subject />);
    const errorEl = await findByTestId('error-loading-plans');
    expect(errorEl).toBeInTheDocument();
  });

  it('displays an error when selecting an inactive / archived plan', async () => {
    const { findByTestId } = renderWithLocalizationProvider(
      <Subject planId={INACTIVE_PLAN_ID} />
    );
    const errorEl = await findByTestId('no-such-plan-error');
    expect(errorEl).toBeInTheDocument();
  });

  describe('handling a passwordless Stripe subscription', () => {
    const fillOutZeForm = async (shouldSubscribeToNewsletter = false) => {
      const { getByTestId } = screen;
      fireEvent.change(getByTestId('new-user-enter-email'), {
        target: { value: newAccountEmail },
      });
      fireEvent.change(getByTestId('new-user-confirm-email'), {
        target: { value: newAccountEmail },
      });
      if (shouldSubscribeToNewsletter) {
        const newsletterCheckbox = getByTestId(
          'new-user-subscribe-product-updates'
        );
        fireEvent.click(newsletterCheckbox);
        expect(newsletterCheckbox).toBeChecked();
      }
      fireEvent.change(getByTestId('name'), {
        target: { value: 'BMO' },
      });
      const paymentFormContainer = getByTestId('payment-form-container');
      expect(paymentFormContainer).toHaveClass('payment-form-disabled');
      expect(paymentFormContainer).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(getByTestId('confirm'));
      expect(paymentFormContainer).not.toHaveClass('payment-form-disabled');
      expect(paymentFormContainer).toHaveAttribute('aria-disabled', 'false');
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
        renderWithLocalizationProvider(<Subject />);
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
      expect(ReactGALog.logEvent).toBeCalledTimes(4);
      expect(ReactGALog.logEvent).toBeCalledWith(MOCK_EVENTS.SignUp);
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.AddPaymentInfo(PLANS[0])
      );
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.PurchaseSubmitNew(PLANS[0])
      );
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.PurchaseNew(PLANS[0])
      );
    });

    it('retries apiFetchCustomer', async () => {
      (apiFetchCustomer as jest.Mock)
        .mockClear()
        .mockResolvedValueOnce({ ...CUSTOMER, subscriptions: [] })
        .mockResolvedValueOnce(CUSTOMER);
      await act(async () => {
        renderWithLocalizationProvider(<Subject />);
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiFetchCustomer).toHaveBeenCalledTimes(2);
      });

      expect(screen.getByTestId('payment-confirmation')).toBeInTheDocument();
    });

    it('displays an error when account creation failed', async () => {
      (apiCreatePasswordlessAccount as jest.Mock).mockRejectedValue(
        FXA_SIGNUP_ERROR
      );
      await act(async () => {
        renderWithLocalizationProvider(<Subject />);
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

      const paymentErrorComponent = screen.getByTestId('payment-error');
      expect(paymentErrorComponent).toBeInTheDocument();
      expect(paymentErrorComponent).toHaveTextContent(
        getFallbackTextByFluentId(getErrorMessageId(FXA_SIGNUP_ERROR))
      );
      expect(ReactGALog.logEvent).toBeCalledTimes(2);
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.AddPaymentInfo(PLANS[0])
      );
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.PurchaseSubmitNew(PLANS[0])
      );
    });

    it('displays an error when payment failed', async () => {
      stripeOverride.createPaymentMethod.mockRejectedValue({
        paymentMethod: undefined,
        error: MOCK_STRIPE_CARD_ERROR,
      });
      await act(async () => {
        renderWithLocalizationProvider(<Subject />);
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

      const paymentErrorComponent = screen.getByTestId('payment-error');
      expect(paymentErrorComponent).toBeInTheDocument();
      expect(paymentErrorComponent).toHaveTextContent(
        getFallbackTextByFluentId(getErrorMessageId(MOCK_STRIPE_CARD_ERROR))
      );
      expect(ReactGALog.logEvent).toBeCalledTimes(3);
      expect(ReactGALog.logEvent).toBeCalledWith(MOCK_EVENTS.SignUp);
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.AddPaymentInfo(PLANS[0])
      );
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.PurchaseSubmitNew(PLANS[0])
      );
    });

    it('displays a message when fetching user profile failed', async () => {
      (apiFetchProfile as jest.Mock).mockRejectedValue(
        MOCK_FXA_POST_PASSWORDLESS_SUB_ERROR
      );
      await act(async () => {
        renderWithLocalizationProvider(<Subject />);
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

      const paymentErrorComponent = screen.getByTestId('payment-error');
      expect(paymentErrorComponent).toBeInTheDocument();
      expect(paymentErrorComponent).toHaveTextContent(
        getFallbackTextByFluentId(
          getErrorMessageId(MOCK_FXA_POST_PASSWORDLESS_SUB_ERROR)
        )
      );
      expect(ReactGALog.logEvent).toBeCalledTimes(4);
      expect(ReactGALog.logEvent).toBeCalledWith(MOCK_EVENTS.SignUp);
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.AddPaymentInfo(PLANS[0])
      );
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.PurchaseSubmitNew(PLANS[0])
      );
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.PurchaseNew(PLANS[0])
      );
    });

    it('displays a message when fetching customer failed', async () => {
      (apiFetchCustomer as jest.Mock).mockRejectedValue(
        MOCK_FXA_POST_PASSWORDLESS_SUB_ERROR
      );
      await act(async () => {
        renderWithLocalizationProvider(<Subject />);
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

      const paymentErrorComponent = screen.getByTestId('payment-error');
      expect(paymentErrorComponent).toBeInTheDocument();
      expect(paymentErrorComponent).toHaveTextContent(
        getFallbackTextByFluentId(
          getErrorMessageId(MOCK_FXA_POST_PASSWORDLESS_SUB_ERROR)
        )
      );
      expect(ReactGALog.logEvent).toBeCalledTimes(4);
      expect(ReactGALog.logEvent).toBeCalledWith(MOCK_EVENTS.SignUp);
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.AddPaymentInfo(PLANS[0])
      );
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.PurchaseSubmitNew(PLANS[0])
      );
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.PurchaseNew(PLANS[0])
      );
    });

    it('displays an error about the wrong currency if there is a currency mismatch', async () => {
      (apiCreateSubscriptionWithPaymentMethod as jest.Mock)
        .mockClear()
        .mockRejectedValue(MOCK_CURRENCY_ERROR);

      await act(async () => {
        renderWithLocalizationProvider(<Subject />);
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreatePasswordlessAccount).toHaveBeenCalledWith({
          email: newAccountEmail,
          clientId: mockConfig.servers.oauth.clientId,
        });
      });

      const paymentErrorComponent = screen.getByTestId('payment-error');
      expect(paymentErrorComponent).toBeInTheDocument();
      expect(paymentErrorComponent).toHaveTextContent(
        getFallbackTextByFluentId(getErrorMessageId(MOCK_CURRENCY_ERROR))
      );
    });

    it('displays an error about unsupported location', async () => {
      (apiCreateSubscriptionWithPaymentMethod as jest.Mock)
        .mockClear()
        .mockRejectedValue(MOCK_UNSUPPORTED_LOCATION_ERROR);

      await act(async () => {
        renderWithLocalizationProvider(<Subject />);
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreatePasswordlessAccount).toHaveBeenCalledWith({
          email: newAccountEmail,
          clientId: mockConfig.servers.oauth.clientId,
        });
      });

      const paymentErrorComponent = screen.getByTestId('payment-error');
      expect(paymentErrorComponent).toBeInTheDocument();
      expect(paymentErrorComponent).toHaveTextContent(
        getFallbackTextByFluentId(
          getErrorMessageId(MOCK_UNSUPPORTED_LOCATION_ERROR)
        )
      );
    });

    describe('newsletter', () => {
      it('POSTs to /newsletters if the newsletter checkbox is checked when subscription succeeds', async () => {
        await act(async () => {
          renderWithLocalizationProvider(<Subject />);
        });
        const shouldSubscribeToNewsletter = true;
        await fillOutZeForm(shouldSubscribeToNewsletter);
        await waitForExpect(() => {
          expect(apiSignupForNewsletter).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByTestId('payment-confirmation')).toBeInTheDocument();
      });

      it('Does not POST to /newsletters if the newsletter checkbox is unchecked when subscription succeeds', async () => {
        await act(async () => {
          renderWithLocalizationProvider(<Subject />);
        });
        const shouldSubscribeToNewsletter = false;
        await fillOutZeForm(shouldSubscribeToNewsletter);
        await waitForExpect(() => {
          expect(apiSignupForNewsletter).not.toHaveBeenCalled();
        });
        expect(screen.getByTestId('payment-confirmation')).toBeInTheDocument();
      });

      it('Does not POST to /newsletters when newsletter checkbox is checked when subscription fails', async () => {
        stripeOverride.createPaymentMethod.mockRejectedValue({
          paymentMethod: undefined,
          error: MOCK_STRIPE_CARD_ERROR,
        });
        await act(async () => {
          renderWithLocalizationProvider(<Subject />);
        });
        const shouldSubscribeToNewsletter = true;
        await fillOutZeForm(shouldSubscribeToNewsletter);
        await waitForExpect(() => {
          expect(apiSignupForNewsletter).not.toHaveBeenCalled();
        });
        expect(screen.getByTestId('payment-error')).toBeInTheDocument();
      });

      it('Displays a message if newsletter signup fails when subscription succeeds', async () => {
        (apiSignupForNewsletter as jest.Mock).mockRejectedValue(
          FXA_NEWSLETTER_SIGNUP_ERROR
        );
        await act(async () => {
          renderWithLocalizationProvider(<Subject />);
        });
        const shouldSubscribeToNewsletter = true;
        await fillOutZeForm(shouldSubscribeToNewsletter);
        await waitForExpect(() => {
          expect(apiSignupForNewsletter).toHaveBeenCalled();
        });
        expect(screen.getByTestId('payment-confirmation')).toBeInTheDocument();
        expect(
          screen.getByTestId('newsletter-signup-error-message')
        ).toBeInTheDocument();
      });
    });
  });

  describe('handling a passwordless PayPal subscription', () => {
    const fillOutZeForm = async (shouldSubscribeToNewsletter = false) => {
      const { getByTestId } = screen;
      fireEvent.change(getByTestId('new-user-enter-email'), {
        target: { value: newAccountEmail },
      });
      fireEvent.change(getByTestId('new-user-confirm-email'), {
        target: { value: newAccountEmail },
      });
      if (shouldSubscribeToNewsletter) {
        const newsletterCheckbox = getByTestId(
          'new-user-subscribe-product-updates'
        );
        fireEvent.click(newsletterCheckbox);
      }
      const paymentFormContainer = getByTestId('payment-form-container');
      expect(paymentFormContainer).toHaveClass('payment-form-disabled');
      expect(paymentFormContainer).toHaveAttribute('aria-disabled', 'true');
      await act(async () => {
        fireEvent.click(getByTestId('confirm'));
      });
      expect(paymentFormContainer).not.toHaveClass('payment-form-disabled');
      expect(paymentFormContainer).toHaveAttribute('aria-disabled', 'false');
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
        renderWithLocalizationProvider(
          <Subject paypalButtonBase={paypalButtonBase} />
        );
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
      expect(ReactGALog.logEvent).toBeCalledTimes(4);
      expect(ReactGALog.logEvent).toBeCalledWith(MOCK_EVENTS.SignUp);
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.AddPayPalPaymentInfo(PLANS[0])
      );
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.PurchaseSubmitNew(PLANS[0])
      );
      expect(ReactGALog.logEvent).toBeCalledWith(
        MOCK_EVENTS.PurchaseNew(PLANS[0])
      );
    });

    it('shows an error when account creation failed', async () => {
      (apiCreatePasswordlessAccount as jest.Mock).mockRejectedValue(
        FXA_SIGNUP_ERROR
      );
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
        renderWithLocalizationProvider(
          <Subject paypalButtonBase={paypalButtonBase} />
        );
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

      const paymentErrorComponent = screen.getByTestId('payment-error');
      expect(paymentErrorComponent).toBeInTheDocument();
      expect(paymentErrorComponent).toHaveTextContent(
        getFallbackTextByFluentId(getErrorMessageId(FXA_SIGNUP_ERROR))
      );
      expect(ReactGALog.logEvent).not.toBeCalled();
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
        renderWithLocalizationProvider(
          <Subject paypalButtonBase={paypalButtonBase} />
        );
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreatePasswordlessAccount).toHaveBeenCalledWith({
          email: newAccountEmail,
          clientId: mockConfig.servers.oauth.clientId,
        });
        expect(ReactGALog.logEvent).toBeCalledTimes(1);
        expect(ReactGALog.logEvent).toBeCalledWith(MOCK_EVENTS.SignUp);
        expect(updateAPIClientToken).toHaveBeenCalledWith(
          STUB_ACCOUNT_RESULT.access_token
        );
        expect(apiGetPaypalCheckoutToken).toHaveBeenCalledTimes(1);
      });

      const paymentErrorComponent = screen.getByTestId('payment-error');
      expect(paymentErrorComponent).toBeInTheDocument();
      expect(paymentErrorComponent).toHaveTextContent(
        getFallbackTextByFluentId(getErrorMessageId(MOCK_GENERAL_PAYPAL_ERROR))
      );
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
        renderWithLocalizationProvider(
          <Subject paypalButtonBase={paypalButtonBase} />
        );
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreateCustomer).toHaveBeenCalledTimes(1);
        expect(apiCapturePaypalPayment).not.toHaveBeenCalled();
        expect(apiFetchProfile).not.toHaveBeenCalled();
        expect(apiFetchCustomer).not.toHaveBeenCalled();
      });

      const paymentErrorComponent = screen.getByTestId('payment-error');
      expect(paymentErrorComponent).toBeInTheDocument();
      expect(paymentErrorComponent).toHaveTextContent(
        getFallbackTextByFluentId(getErrorMessageId(MOCK_GENERAL_PAYPAL_ERROR))
      );
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
        renderWithLocalizationProvider(
          <Subject paypalButtonBase={paypalButtonBase} />
        );
      });
      await fillOutZeForm();
      await waitForExpect(() => {
        expect(apiCreateCustomer).toHaveBeenCalledTimes(1);
        expect(apiCapturePaypalPayment).toHaveBeenCalledTimes(1);
        expect(ReactGALog.logEvent).toBeCalledTimes(1);
        expect(ReactGALog.logEvent).toBeCalledWith(
          MOCK_EVENTS.PurchaseSubmitNew(PLANS[0])
        );
        expect(apiFetchProfile).not.toHaveBeenCalled();
        expect(apiFetchCustomer).not.toHaveBeenCalled();
      });

      const paymentErrorComponent = screen.getByTestId('payment-error');
      expect(paymentErrorComponent).toBeInTheDocument();
      expect(paymentErrorComponent).toHaveTextContent(
        getFallbackTextByFluentId(getErrorMessageId(MOCK_GENERAL_PAYPAL_ERROR))
      );
    });

    describe('newsletter', () => {
      it('POSTs to /newsletters if the newsletter checkbox is checked when subscription succeeds', async () => {
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
          renderWithLocalizationProvider(
            <Subject paypalButtonBase={paypalButtonBase} />
          );
        });
        const shouldSubscribeToNewsletter = true;
        await fillOutZeForm(shouldSubscribeToNewsletter);
        await waitForExpect(() => {
          expect(apiSignupForNewsletter).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByTestId('payment-confirmation')).toBeInTheDocument();
      });

      it('Does not POST to /newsletters if the newsletter checkbox is unchecked when subscription succeeds', async () => {
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
          renderWithLocalizationProvider(
            <Subject paypalButtonBase={paypalButtonBase} />
          );
        });
        const shouldSubscribeToNewsletter = false;
        await fillOutZeForm(shouldSubscribeToNewsletter);
        await waitForExpect(() => {
          expect(apiSignupForNewsletter).not.toHaveBeenCalled();
        });
        expect(screen.getByTestId('payment-confirmation')).toBeInTheDocument();
      });

      it('Does not POST to /newsletters when newsletter checkbox is checked when subscription fails', async () => {
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
          renderWithLocalizationProvider(
            <Subject paypalButtonBase={paypalButtonBase} />
          );
        });
        const shouldSubscribeToNewsletter = true;
        await fillOutZeForm(shouldSubscribeToNewsletter);
        await waitForExpect(() => {
          expect(apiSignupForNewsletter).not.toHaveBeenCalled();
        });
        expect(screen.getByTestId('payment-error')).toBeInTheDocument();
      });

      it('Displays a message if newsletter signup fails when subscription succeeds', async () => {
        (apiSignupForNewsletter as jest.Mock).mockRejectedValue(
          FXA_NEWSLETTER_SIGNUP_ERROR
        );
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
          renderWithLocalizationProvider(
            <Subject paypalButtonBase={paypalButtonBase} />
          );
        });
        const shouldSubscribeToNewsletter = true;
        await fillOutZeForm(shouldSubscribeToNewsletter);
        await waitForExpect(() => {
          expect(apiSignupForNewsletter).toHaveBeenCalled();
        });
        expect(screen.getByTestId('payment-confirmation')).toBeInTheDocument();
        expect(
          screen.getByTestId('newsletter-signup-error-message')
        ).toBeInTheDocument();
      });
    });
  });
});
