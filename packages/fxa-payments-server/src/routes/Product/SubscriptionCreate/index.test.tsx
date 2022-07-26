/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';

import { PaymentMethod } from '@stripe/stripe-js';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import waitForExpect from 'wait-for-expect';

import SubscriptionCreate, { SubscriptionCreateProps } from '.';
import { SignInLayout } from '../../../components/AppLayout';
import { ButtonBaseProps } from '../../../components/PayPalButton';
import { useNonce } from '../../../lib/hooks';
import {
  CONFIRM_CARD_RESULT,
  CUSTOMER,
  DETACH_PAYMENT_METHOD_RESULT,
  IAP_CUSTOMER,
  NEW_CUSTOMER,
  PAYMENT_METHOD_RESULT,
  PAYPAL_CUSTOMER,
  PLAN,
  PROFILE,
  RETRY_INVOICE_RESULT,
  SUBSCRIPTION_RESULT,
} from '../../../lib/mock-data';
import {
  defaultAppContextValue,
  elementChangeResponse,
  MOCK_CHECKOUT_TOKEN,
  MOCK_PAYPAL_SUBSCRIPTION_RESULT,
  MockApp,
  mockStripeElementOnChangeFns,
} from '../../../lib/test-utils';
import { PickPartial } from '../../../lib/types';

jest.mock('../../../lib/hooks', () => {
  const refreshNonceMock = jest.fn().mockImplementation(Math.random);
  return {
    ...jest.requireActual('../../../lib/hooks'),
    useNonce: () => [Math.random(), refreshNonceMock],
  };
});

// TODO: Move to some shared lib?
const deepCopy = (object: Object) => JSON.parse(JSON.stringify(object));

type SubjectProps = PickPartial<
  SubscriptionCreateProps,
  | 'isMobile'
  | 'profile'
  | 'customer'
  | 'selectedPlan'
  | 'refreshSubscriptions'
  | 'paypalButtonBase'
>;

const Subject = ({
  isMobile = false,
  customer = NEW_CUSTOMER,
  profile = PROFILE,
  selectedPlan = PLAN,
  apiClientOverrides = defaultApiClientOverrides(),
  stripeOverride = defaultStripeOverride(),
  refreshSubscriptions = jest.fn(),
  ...props
}: SubjectProps) => {
  return (
    <MockApp
      appContextValue={{
        ...defaultAppContextValue(),
      }}
    >
      <SignInLayout>
        <SubscriptionCreate
          {...{
            isMobile,
            profile,
            customer,
            selectedPlan,
            refreshSubscriptions,
            apiClientOverrides,
            stripeOverride,
            ...props,
          }}
        />
      </SignInLayout>
    </MockApp>
  );
};

const defaultApiClientOverrides = () => ({
  apiCreateCustomer: jest.fn().mockResolvedValue(NEW_CUSTOMER),
  apiCreateSubscriptionWithPaymentMethod: jest
    .fn()
    .mockResolvedValue(SUBSCRIPTION_RESULT),
  apiRetryInvoice: jest.fn().mockResolvedValue(RETRY_INVOICE_RESULT),
  apiDetachFailedPaymentMethod: jest
    .fn()
    .mockResolvedValue(DETACH_PAYMENT_METHOD_RESULT),
  apiGetPaypalCheckoutToken: jest.fn().mockResolvedValue(MOCK_CHECKOUT_TOKEN),
});

const defaultStripeOverride = () => ({
  createPaymentMethod: jest.fn().mockResolvedValue(PAYMENT_METHOD_RESULT),
  confirmCardPayment: jest.fn().mockResolvedValue(CONFIRM_CARD_RESULT),
});

describe('routes/Product/SubscriptionCreate', () => {
  let consoleSpy: jest.SpyInstance<void, [any?, ...any[]]>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    if (consoleSpy) consoleSpy.mockRestore();
    return cleanup();
  });

  it('renders as expected', async () => {
    render(<Subject />);
    const { queryByTestId, queryByText } = screen;
    const subscriptionCreateTitle = queryByTestId('subscription-create-title');
    expect(subscriptionCreateTitle).toBeInTheDocument();
    expect(subscriptionCreateTitle).not.toHaveClass('hidden');
    const subscriptionProcessingTitle = queryByTestId(
      'subscription-processing-title'
    );
    expect(subscriptionProcessingTitle).toBeInTheDocument();
    expect(subscriptionProcessingTitle).toHaveClass('hidden');
    expect(queryByTestId('subscription-create')).toBeInTheDocument();
    expect(queryByText('Payment information')).toBeInTheDocument();
    expect(queryByTestId('paypal-button')).not.toBeInTheDocument();
    expect(queryByTestId('terms')).toBeInTheDocument();
    expect(queryByTestId('privacy')).toBeInTheDocument();
    expect(
      queryByText(
        'Mozilla uses Stripe and PayPal for secure payment processing.'
      )
    ).toBeInTheDocument();
    expect(queryByTestId('coupon-component')).toBeInTheDocument();
  });

  it('renders as expected with PayPal UI enabled', async () => {
    const { queryByTestId, findByTestId } = screen;
    const MockedButtonBase = () => {
      return <button data-testid="paypal-button" />;
    };
    await act(async () => {
      render(
        <Subject
          {...{
            paypalButtonBase: MockedButtonBase,
          }}
        />
      );
    });
    await waitForExpect(() => {
      expect(queryByTestId('paypal-button')).toBeInTheDocument();
    });

    expect(queryByTestId('paypal-button-container')?.className).toEqual(
      "relative after:absolute after:bg-white after:content-[''] after:opacity-60 after:top-0 after:left-0 after:w-full after:h-full after:z-[1000]"
    );

    const checkbox = await findByTestId('confirm');
    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(queryByTestId('paypal-button-container')?.className).toBeFalsy();
  });

  it('renders as expected with PayPal UI enabled and an existing Stripe customer', async () => {
    const { queryByTestId } = screen;
    const MockedButtonBase = () => {
      return <button data-testid="paypal-button" />;
    };
    await act(async () => {
      render(
        <Subject customer={CUSTOMER} paypalButtonBase={MockedButtonBase} />
      );
    });
    waitForExpect(() =>
      expect(queryByTestId('paypal-button')).not.toBeInTheDocument()
    );
    waitForExpect(() =>
      expect(queryByTestId('paymentForm')).toBeInTheDocument()
    );
  });

  it('renders as expected with PayPal UI enabled and an existing PayPal customer', async () => {
    const { queryByTestId } = screen;
    const MockedButtonBase = () => {
      return <button data-testid="paypal-button" />;
    };
    await act(async () => {
      render(
        <Subject
          customer={PAYPAL_CUSTOMER}
          paypalButtonBase={MockedButtonBase}
        />
      );
    });
    waitForExpect(() =>
      expect(queryByTestId('paypal-button')).not.toBeInTheDocument()
    );
    waitForExpect(() =>
      expect(queryByTestId('paymentForm')).not.toBeInTheDocument()
    );
  });

  it('renders as expected for mobile', async () => {
    render(<Subject isMobile={true} />);
    const { queryByTestId } = screen;
    const subscriptionCreateTitle = queryByTestId('subscription-create-title');
    expect(subscriptionCreateTitle).toBeInTheDocument();
    expect(subscriptionCreateTitle).not.toHaveClass('hidden');
    const subscriptionProcessingTitle = queryByTestId(
      'subscription-processing-title'
    );
    expect(subscriptionProcessingTitle).toBeInTheDocument();
    expect(subscriptionProcessingTitle).toHaveClass('hidden');
    expect(screen.queryByTestId('subscription-create')).toBeInTheDocument();
    expect(screen.queryByTestId('plan-details-component')).toBeInTheDocument();
  });

  async function commonSubmitSetup({
    apiClientOverrides = defaultApiClientOverrides(),
    stripeOverride = defaultStripeOverride(),
    refreshSubscriptions = jest.fn(),
    ...props
  }) {
    render(
      <Subject
        {...{
          apiClientOverrides,
          stripeOverride,
          refreshSubscriptions,
          ...props,
        }}
      />
    );

    expect(screen.queryByTestId('subscription-create')).toBeInTheDocument();
    await screen.findAllByText('Set up your subscription');

    if (props?.customer?.last4) {
      expect(
        screen.queryByTestId('card-logo-and-last-four')
      ).toBeInTheDocument();
    } else {
      await act(async () => {
        mockStripeElementOnChangeFns.cardElement(
          elementChangeResponse({ complete: true, value: 'test' })
        );
      });
      fireEvent.change(screen.getByTestId('name'), {
        target: { value: 'Foo Barson' },
      });
      fireEvent.blur(screen.getByTestId('name'));
    }

    fireEvent.click(screen.getByTestId('confirm'));

    return {
      apiClientOverrides,
      stripeOverride,
      refreshSubscriptions,
    };
  }

  enum CustomerType {
    NoCustomer,
    WithCustomer,
    WithCustomerCard,
    IapCustomerOnly,
  }

  const commonPaymentSubmissionTest =
    ({
      // "Customer" here is one _without_ any subs or CC info.
      // It affects the number of calls to apiClientOverrides.apiCreateCustomer.
      customerType,
    }: {
      customerType: CustomerType;
    }) =>
    async () => {
      let customer;
      switch (customerType) {
        case CustomerType.NoCustomer:
          customer = null;
          break;
        case CustomerType.WithCustomer:
          customer = { customerId: 'cus_123xyz' };
          break;
        case CustomerType.WithCustomerCard:
          customer = CUSTOMER;
          break;
        case CustomerType.IapCustomerOnly:
          customer = IAP_CUSTOMER;
          break;
      }
      const expectedCreateCustomerCalls = [
        CustomerType.NoCustomer,
        CustomerType.IapCustomerOnly,
      ].includes(customerType)
        ? 1
        : 0;
      const expectedCreatePaymentMethodCalls =
        customerType !== CustomerType.WithCustomerCard ? 1 : 0;
      const _expectedCreateSubArgs = {
        // idempotencyKey (ignored)
        priceId: PLAN.plan_id,
        productId: PLAN.product_id,
      };
      const expectedCreateSubArgs =
        customerType === CustomerType.WithCustomerCard
          ? _expectedCreateSubArgs
          : {
              ..._expectedCreateSubArgs,
              paymentMethodId: PAYMENT_METHOD_RESULT.paymentMethod.id,
            };

      const { apiClientOverrides, stripeOverride, refreshSubscriptions } =
        await commonSubmitSetup({
          customer,
        });
      await act(async () => {
        fireEvent.click(screen.getByTestId('submit'));
      });
      await waitForExpect(() =>
        expect(refreshSubscriptions).toHaveBeenCalledTimes(1)
      );
      expect(stripeOverride.createPaymentMethod).toHaveBeenCalledTimes(
        expectedCreatePaymentMethodCalls
      );
      expect(apiClientOverrides.apiCreateCustomer).toHaveBeenCalledTimes(
        expectedCreateCustomerCalls
      );
      expect(
        apiClientOverrides.apiCreateSubscriptionWithPaymentMethod.mock
          .calls[0][0]
      ).toMatchObject(expectedCreateSubArgs);
    };

  const commonRetryPaymentTest =
    ({
      shouldSucceed = true as boolean,
      apiRetryInvoice = defaultApiClientOverrides().apiRetryInvoice,
    } = {}) =>
    async () => {
      const subscriptionResult = deepCopy(SUBSCRIPTION_RESULT);
      subscriptionResult.latest_invoice.payment_intent.status =
        'requires_payment_method';
      const initialPaymentMethod = {
        paymentMethod: { id: 'pm_initial' } as PaymentMethod,
        error: undefined,
      };
      const retryPaymentMethod = {
        paymentMethod: { id: 'pm_retry' } as PaymentMethod,
        error: undefined,
      };

      const apiClientOverrides = {
        ...defaultApiClientOverrides(),
        apiRetryInvoice,
        apiCreateSubscriptionWithPaymentMethod: jest
          .fn()
          .mockResolvedValue(subscriptionResult),
      };

      const stripeOverride = {
        ...defaultStripeOverride(),
        createPaymentMethod: jest
          .fn()
          .mockResolvedValueOnce(initialPaymentMethod)
          .mockResolvedValueOnce(retryPaymentMethod),
      };

      const { refreshSubscriptions } = await commonSubmitSetup({
        apiClientOverrides,
        stripeOverride,
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('submit'));
      });

      await waitForExpect(() =>
        expect(
          apiClientOverrides.apiCreateSubscriptionWithPaymentMethod.mock
            .calls[0][0]
        ).toMatchObject({
          // idempotencyKey (ignored)
          priceId: PLAN.plan_id,
          productId: PLAN.product_id,
          paymentMethodId: initialPaymentMethod.paymentMethod.id,
        })
      );
      await waitForExpect(() =>
        expect(
          apiClientOverrides.apiDetachFailedPaymentMethod.mock.calls[0][0]
        ).toMatchObject({ paymentMethodId: 'pm_initial' })
      );
      expect(
        screen.queryByTestId('error-payment-submission')
      ).toBeInTheDocument();
      expect(refreshSubscriptions).toHaveBeenCalledTimes(0);

      await act(async () => {
        fireEvent.click(screen.getByTestId('submit'));
      });
      expect(apiClientOverrides.apiRetryInvoice.mock.calls[0][0]).toMatchObject(
        {
          // idempotencyKey (ignored)
          invoiceId: subscriptionResult.latest_invoice.id,
          paymentMethodId: retryPaymentMethod.paymentMethod.id,
        }
      );

      if (shouldSucceed) {
        await waitForExpect(() =>
          expect(refreshSubscriptions).toHaveBeenCalledTimes(1)
        );
      } else {
        expect(
          screen.queryByTestId('error-payment-submission')
        ).toBeInTheDocument();
        expect(refreshSubscriptions).toHaveBeenCalledTimes(0);
      }
    };

  const commonConfirmPaymentTest =
    ({
      shouldSucceed = true as boolean,
      confirmCardPayment = defaultStripeOverride().confirmCardPayment,
    } = {}) =>
    async () => {
      const subscriptionResult = deepCopy(SUBSCRIPTION_RESULT);
      subscriptionResult.latest_invoice.payment_intent.status =
        'requires_action';

      const apiClientOverrides = {
        ...defaultApiClientOverrides(),
        apiCreateSubscriptionWithPaymentMethod: jest
          .fn()
          .mockResolvedValue(subscriptionResult),
      };
      const stripeOverride = {
        ...defaultStripeOverride(),
        confirmCardPayment,
      };
      const { refreshSubscriptions } = await commonSubmitSetup({
        apiClientOverrides,
        stripeOverride,
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('submit'));
      });

      await waitForExpect(() =>
        expect(
          apiClientOverrides.apiCreateSubscriptionWithPaymentMethod.mock
            .calls[0][0]
        ).toMatchObject({
          // idempotencyKey (ignored)
          priceId: PLAN.plan_id,
          productId: PLAN.product_id,
          paymentMethodId: PAYMENT_METHOD_RESULT.paymentMethod.id,
        })
      );

      await waitForExpect(() =>
        expect(stripeOverride.confirmCardPayment).toHaveBeenCalledWith(
          subscriptionResult.latest_invoice.payment_intent.client_secret,
          { payment_method: PAYMENT_METHOD_RESULT.paymentMethod.id }
        )
      );

      if (shouldSucceed) {
        await waitForExpect(() =>
          expect(refreshSubscriptions).toHaveBeenCalledTimes(1)
        );
      } else {
        expect(
          screen.queryByTestId('error-payment-submission')
        ).toBeInTheDocument();
        expect(refreshSubscriptions).toHaveBeenCalledTimes(0);
      }
    };

  it(
    'handles a successful payment submission as new customer',
    commonPaymentSubmissionTest({ customerType: CustomerType.NoCustomer })
  );
  it(
    'handles a successful payment submission as existing customer',
    commonPaymentSubmissionTest({ customerType: CustomerType.WithCustomer })
  );
  it(
    'handles a successful subscription submission as an existing subscriber',
    commonPaymentSubmissionTest({ customerType: CustomerType.WithCustomerCard })
  );
  it(
    'handles a successful subscription submission with an existing IAP subscription only',
    commonPaymentSubmissionTest({ customerType: CustomerType.IapCustomerOnly })
  );

  it(
    'handles a payment submission that requires a retry',
    commonRetryPaymentTest()
  );

  it(
    'handles a payment submission that requires user action (confirmed)',
    commonConfirmPaymentTest()
  );

  it(
    'handles a payment submission that requires user action (rejected)',
    commonConfirmPaymentTest({
      shouldSucceed: false,
      confirmCardPayment: jest.fn().mockResolvedValue({
        paymentIntent: undefined,
        error: 'rejected',
      }),
    })
  );

  it(
    'displays an error if card confirmation is missing payment intent',
    commonConfirmPaymentTest({
      shouldSucceed: false,
      confirmCardPayment: jest.fn().mockResolvedValue({
        paymentIntent: undefined,
        error: undefined,
      }),
    })
  );

  it('handles a successful PayPal payment submission as new customer', async () => {
    const MockedButtonBase = ({ onApprove }: ButtonBaseProps) => {
      return (
        <button
          data-testid="paypal-button"
          onClick={async () => onApprove!({ orderID: 'quux' })}
        />
      );
    };
    const apiClientOverrides = {
      ...defaultApiClientOverrides(),
      apiCapturePaypalPayment: jest
        .fn()
        .mockResolvedValue(MOCK_PAYPAL_SUBSCRIPTION_RESULT),
    };
    const refreshSubscriptions = jest.fn();
    await act(async () => {
      render(
        <Subject
          {...{
            apiClientOverrides,
            refreshSubscriptions,
            paypalButtonBase: MockedButtonBase,
          }}
        />
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('paypal-button'));
    });
    const paymentProcessing = screen.queryByTestId('payment-processing');
    expect(paymentProcessing).toBeInTheDocument();
    expect(apiClientOverrides.apiCapturePaypalPayment).toHaveBeenCalledTimes(1);
    expect(refreshSubscriptions).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByTestId('error-payment-submission')
    ).not.toBeInTheDocument();
  });

  it('creates a new customer if needed for PayPal', async () => {
    const MockedButtonBase = ({ onApprove }: ButtonBaseProps) => {
      return (
        <button
          data-testid="paypal-button"
          onClick={async () => onApprove!({ orderID: 'quux' })}
        />
      );
    };
    const apiClientOverrides = {
      ...defaultApiClientOverrides(),
      apiCreateCustomer: jest.fn(),
    };
    await act(async () => {
      render(
        <Subject
          {...{
            customer: null,
            apiClientOverrides,
            paypalButtonBase: MockedButtonBase,
          }}
        />
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('paypal-button'));
    });
    expect(apiClientOverrides.apiCreateCustomer).toHaveBeenCalled();
  });

  const commonCreateSubscriptionFailureTest =
    (error = { code: 'barf apiCreateSubscriptionWithPaymentMethod' } as any) =>
    async () => {
      const apiClientOverrides = {
        ...defaultApiClientOverrides(),
        apiCreateSubscriptionWithPaymentMethod: jest
          .fn()
          .mockRejectedValue(error),
      };
      const { refreshSubscriptions } = await commonSubmitSetup({
        apiClientOverrides,
      });
      await act(async () => {
        fireEvent.click(screen.getByTestId('submit'));
      });
      expect(
        apiClientOverrides.apiCreateSubscriptionWithPaymentMethod
      ).toHaveBeenCalled();
      expect(
        screen.queryByTestId('error-payment-submission')
      ).toBeInTheDocument();
      expect(refreshSubscriptions).toHaveBeenCalledTimes(0);
    };

  it('clears the displayed error if the form changes', async () => {
    const commonSetup = commonCreateSubscriptionFailureTest();
    await commonSetup();
    await act(async () => {
      fireEvent.change(screen.getByTestId('name'), {
        target: { value: 'Bar Bar' },
      });
    });
    await waitForExpect(() =>
      expect(
        screen.queryByTestId('error-payment-submission')
      ).not.toBeInTheDocument()
    );
  });

  describe('failures', () => {
    it('displays confirmCardPayment failure', async () => {
      commonConfirmPaymentTest({
        shouldSucceed: false,
        confirmCardPayment: jest
          .fn()
          .mockRejectedValue('barf confirmCardPayment'),
      });
    });

    it(
      'displays apiRetryInvoice failure',
      commonRetryPaymentTest({
        shouldSucceed: false,
        apiRetryInvoice: jest.fn().mockRejectedValue('barf apiRetryInvoice'),
      })
    );

    it(
      'displays apiCreateSubscriptionWithPaymentMethod failure',
      commonCreateSubscriptionFailureTest()
    );

    const commonCreatePaymentMethodFailureTest =
      ({
        createPaymentMethod = jest
          .fn()
          .mockRejectedValue('barf createPaymentMethod'),
      } = {}) =>
      async () => {
        const stripeOverride = {
          ...defaultStripeOverride(),
          createPaymentMethod,
        };
        const { refreshSubscriptions } = await commonSubmitSetup({
          stripeOverride,
        });
        await act(async () => {
          fireEvent.click(screen.getByTestId('submit'));
        });
        expect(stripeOverride.createPaymentMethod).toHaveBeenCalled();
        expect(
          screen.queryByTestId('error-payment-submission')
        ).toBeInTheDocument();
        expect(refreshSubscriptions).toHaveBeenCalledTimes(0);
      };

    it(
      'displays createPaymentMethod failure (exception)',
      commonCreatePaymentMethodFailureTest()
    );

    it(
      'displays createPaymentMethod failure (error)',
      commonCreatePaymentMethodFailureTest({
        createPaymentMethod: jest.fn().mockResolvedValue({ error: 'barf' }),
      })
    );

    it(
      'displays createPaymentMethod failure (missing PaymentMethod)',
      commonCreatePaymentMethodFailureTest({
        createPaymentMethod: jest
          .fn()
          .mockResolvedValue({ error: false, paymentMethod: null }),
      })
    );

    it('displays apiCreateCustomer failure', async () => {
      const apiClientOverrides = {
        ...defaultApiClientOverrides(),
        apiCreateCustomer: jest
          .fn()
          .mockRejectedValue('barf apiCreateCustomer'),
      };
      const { refreshSubscriptions } = await commonSubmitSetup({
        customer: null,
        apiClientOverrides,
      });
      await act(async () => {
        fireEvent.click(screen.getByTestId('submit'));
      });
      expect(apiClientOverrides.apiCreateCustomer).toHaveBeenCalled();
      expect(
        screen.queryByTestId('error-payment-submission')
      ).toBeInTheDocument();
      expect(refreshSubscriptions).toHaveBeenCalledTimes(0);
    });

    it('displays for unexpected payment intent status', async () => {
      const subscriptionResult = deepCopy(SUBSCRIPTION_RESULT);
      subscriptionResult.latest_invoice.payment_intent.status =
        'banana_deck_chair';
      const apiClientOverrides = {
        ...defaultApiClientOverrides(),
        apiCreateSubscriptionWithPaymentMethod: jest
          .fn()
          .mockResolvedValue(subscriptionResult),
      };
      const { refreshSubscriptions } = await commonSubmitSetup({
        apiClientOverrides,
      });
      await act(async () => {
        fireEvent.click(screen.getByTestId('submit'));
      });
      await waitForExpect(() =>
        expect(
          apiClientOverrides.apiCreateSubscriptionWithPaymentMethod
        ).toHaveBeenCalled()
      );
      expect(
        screen.queryByTestId('error-payment-submission')
      ).toBeInTheDocument();
      expect(refreshSubscriptions).toHaveBeenCalledTimes(0);
    });

    it('displays if client secret is missing from payment intent', async () => {
      const subscriptionResult = deepCopy(SUBSCRIPTION_RESULT);
      subscriptionResult.latest_invoice.payment_intent.status =
        'requires_action';
      subscriptionResult.latest_invoice.payment_intent.client_secret = null;

      const apiClientOverrides = {
        ...defaultApiClientOverrides(),
        apiCreateSubscriptionWithPaymentMethod: jest
          .fn()
          .mockResolvedValue(subscriptionResult),
      };
      const { stripeOverride, refreshSubscriptions } = await commonSubmitSetup({
        apiClientOverrides,
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('submit'));
      });

      await waitForExpect(() =>
        expect(
          apiClientOverrides.apiCreateSubscriptionWithPaymentMethod.mock
            .calls[0][0]
        ).toMatchObject({
          // idempotencyKey (ignored)
          priceId: PLAN.plan_id,
          productId: PLAN.product_id,
          paymentMethodId: PAYMENT_METHOD_RESULT.paymentMethod.id,
        })
      );
      await waitForExpect(() =>
        expect(
          screen.queryByTestId('error-payment-submission')
        ).toBeInTheDocument()
      );
      expect(refreshSubscriptions).toHaveBeenCalledTimes(0);
      expect(stripeOverride.confirmCardPayment).not.toHaveBeenCalled();
    });

    it('displays apiGetPaypalCheckoutToken failure', async () => {
      const MockedButtonBase = ({ createOrder }: ButtonBaseProps) => {
        return <button data-testid="paypal-button" onClick={createOrder} />;
      };
      const apiClientOverrides = {
        ...defaultApiClientOverrides(),
        apiGetPaypalCheckoutToken: jest
          .fn()
          .mockRejectedValue({ code: 'barf apiGetPaypalCheckoutToken' }),
      };

      await act(async () => {
        render(
          <Subject
            {...{
              apiClientOverrides,
              paypalButtonBase: MockedButtonBase,
            }}
          />
        );
      });
      await act(async () => {
        fireEvent.click(screen.getByTestId('paypal-button'));
      });
      expect(apiClientOverrides.apiGetPaypalCheckoutToken).toHaveBeenCalled();
      expect(
        screen.queryByTestId('error-payment-submission')
      ).toBeInTheDocument();
    });
  });

  it('displays PaypalButton onError failure', async () => {
    const MockedButtonBase = ({ onError }: ButtonBaseProps) => {
      return <button data-testid="paypal-button" onClick={onError} />;
    };
    await act(async () => {
      render(
        <Subject
          {...{
            paypalButtonBase: MockedButtonBase,
          }}
        />
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('paypal-button'));
    });
    expect(
      screen.queryByTestId('error-payment-submission')
    ).toBeInTheDocument();
  });

  it('displays apiCapturePaypalPayment failure', async () => {
    const [, refreshSubmitNonce] = useNonce();
    (refreshSubmitNonce as jest.Mock).mockClear();
    const MockedButtonBase = ({ onApprove }: ButtonBaseProps) => {
      return (
        <button
          data-testid="paypal-button"
          onClick={async () => onApprove!({ orderID: 'quux' })}
        />
      );
    };
    const apiClientOverrides = {
      ...defaultApiClientOverrides(),
      apiCapturePaypalPayment: jest
        .fn()
        .mockRejectedValue({ code: 'barf apiCapturePaypalPayment' }),
    };
    await act(async () => {
      render(
        <Subject
          {...{
            apiClientOverrides,
            paypalButtonBase: MockedButtonBase,
          }}
        />
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('paypal-button'));
    });
    expect(apiClientOverrides.apiCapturePaypalPayment).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByTestId('error-payment-submission')
    ).toBeInTheDocument();
    expect(refreshSubmitNonce).toHaveBeenCalledTimes(1);
  });

  describe('errors', () => {
    // We map Stripe error codes to less-specific error message string IDs for display.
    // L10n is disabled for these error messages in testing, so they show up as string IDs.
    // The codes are mapped to IDs in lib/errors.ts and the strings are in public/locales
    it('reports declined card', async () => {
      const commonSetup = commonCreateSubscriptionFailureTest({
        code: 'card_declined',
      });
      await commonSetup();
      expect(screen.getByText('card-error')).toBeInTheDocument();
    });

    it('reports incorrect cvc', async () => {
      const commonSetup = commonCreateSubscriptionFailureTest({
        code: 'incorrect_cvc',
      });
      await commonSetup();
      expect(screen.getByText('card-error')).toBeInTheDocument();
    });

    it('reports expired card', async () => {
      const commonSetup = commonCreateSubscriptionFailureTest({
        code: 'expired_card',
      });
      await commonSetup();
      expect(screen.getByText('expired-card-error')).toBeInTheDocument();
    });

    it('reports processing errors', async () => {
      const commonSetup = commonCreateSubscriptionFailureTest({
        code: 'processing_error',
      });
      await commonSetup();
      expect(screen.getByText('payment-error-1')).toBeInTheDocument();
    });

    it('reports stolen card error', async () => {
      const commonSetup = commonCreateSubscriptionFailureTest({
        code: 'stolen_card',
      });
      await commonSetup();
      expect(screen.getByText('payment-error-2')).toBeInTheDocument();
    });
  });
});
