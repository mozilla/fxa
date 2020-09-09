/**
 * @jest-environment jsdom
 */
import React from 'react';
import {
  screen,
  render,
  cleanup,
  act,
  fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { PaymentMethod, PaymentIntent } from '@stripe/stripe-js';
import { SignInLayout } from '../../../components/AppLayout';
import { CUSTOMER, PROFILE, PLAN, NEW_CUSTOMER } from '../../../lib/mock-data';
import { PickPartial } from '../../../lib/types';

import {
  defaultAppContextValue,
  MockApp,
  mockStripeElementOnChangeFns,
  elementChangeResponse,
} from '../../../lib/test-utils';

import waitForExpect from 'wait-for-expect';

import SubscriptionCreate, { SubscriptionCreateProps } from './index';

// TODO: Move to some shared lib?
const deepCopy = (object: Object) => JSON.parse(JSON.stringify(object));

type SubjectProps = PickPartial<
  SubscriptionCreateProps,
  'isMobile' | 'profile' | 'customer' | 'selectedPlan' | 'refreshSubscriptions'
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

const SUBSCRIPTION_RESULT = {
  id: 'sub_1234',
  latest_invoice: {
    id: 'invoice_5678',
    payment_intent: {
      id: 'pi_7890',
      client_secret: 'cs_abcd',
      status: 'succeeded',
    },
  },
};

const RETRY_INVOICE_RESULT = {
  id: 'invoice_5678',
  payment_intent: {
    id: 'pi_9876',
    client_secret: 'cs_erty',
    status: 'succeeded',
  },
};

const DETACH_PAYMENT_METHOD_RESULT = {
  id: 'pm_80808',
  foo: 'quux',
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
});

const PAYMENT_METHOD_RESULT = {
  paymentMethod: { id: 'pm_4567' } as PaymentMethod,
  error: undefined,
};

const CONFIRM_CARD_RESULT = {
  paymentIntent: { status: 'succeeded' } as PaymentIntent,
  error: undefined,
};

const defaultStripeOverride = () => ({
  createPaymentMethod: jest.fn().mockResolvedValue(PAYMENT_METHOD_RESULT),
  confirmCardPayment: jest.fn().mockResolvedValue(CONFIRM_CARD_RESULT),
});

describe('routes/ProductV2/SubscriptionCreate', () => {
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
    const {
      findAllByText,
      queryByTestId,
      queryByText,
      queryAllByText,
    } = screen;
    expect(queryByTestId('subscription-create')).toBeInTheDocument();
    await findAllByText('Set up your subscription');
    expect(
      queryAllByText('30-day money-back guarantee')[0]
    ).toBeInTheDocument();
    expect(queryByText('Billing Information')).toBeInTheDocument();
  });

  it('renders as expected for mobile', async () => {
    render(<Subject isMobile={true} />);
    expect(screen.queryByTestId('subscription-create')).toBeInTheDocument();
    expect(
      screen.queryByTestId('mobile-subscription-create-heading')
    ).toBeInTheDocument();
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
      expect(screen.queryByTestId('card-details')).toBeInTheDocument();
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

  const commonPaymentSubmissionTest = ({
    // "Customer" here is one _without_ any subs or CC info.
    // It affects the number of calls to apiClientOverrides.apiCreateCustomer.
    withCustomer,
    withExistingCard = false,
  }: {
    withCustomer: boolean;
    withExistingCard?: boolean;
  }) => async () => {
    const customer = withExistingCard ? CUSTOMER : withCustomer ? {} : null;
    const expectedCreateCustomerCalls = customer === null ? 1 : 0;
    const expectedCreatePaymentMethodCalls = !withExistingCard ? 1 : 0;
    const _expectedCreateSubArgs = {
      // idempotencyKey (ignored)
      priceId: PLAN.plan_id,
      productId: PLAN.product_id,
    };
    const expectedCreateSubArgs = withExistingCard
      ? _expectedCreateSubArgs
      : {
          ..._expectedCreateSubArgs,
          paymentMethodId: PAYMENT_METHOD_RESULT.paymentMethod.id,
        };

    const {
      apiClientOverrides,
      stripeOverride,
      refreshSubscriptions,
    } = await commonSubmitSetup({
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
      apiClientOverrides.apiCreateSubscriptionWithPaymentMethod.mock.calls[0][0]
    ).toMatchObject(expectedCreateSubArgs);
  };

  const commonRetryPaymentTest = ({
    shouldSucceed = true as boolean,
    apiRetryInvoice = defaultApiClientOverrides().apiRetryInvoice,
  } = {}) => async () => {
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
    expect(apiClientOverrides.apiRetryInvoice.mock.calls[0][0]).toMatchObject({
      // idempotencyKey (ignored)
      invoiceId: subscriptionResult.latest_invoice.id,
      paymentMethodId: retryPaymentMethod.paymentMethod.id,
    });

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

  const commonConfirmPaymentTest = ({
    shouldSucceed = true as boolean,
    confirmCardPayment = defaultStripeOverride().confirmCardPayment,
  } = {}) => async () => {
    const subscriptionResult = deepCopy(SUBSCRIPTION_RESULT);
    subscriptionResult.latest_invoice.payment_intent.status = 'requires_action';

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
      expect(
        stripeOverride.confirmCardPayment
      ).toHaveBeenCalledWith(
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
    commonPaymentSubmissionTest({ withCustomer: false })
  );
  it(
    'handles a successful payment submission as existing customer',
    commonPaymentSubmissionTest({ withCustomer: true })
  );
  it(
    'handles a successful subscription submission as an existing subscriber',
    commonPaymentSubmissionTest({ withCustomer: true, withExistingCard: true })
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

  const commonCreateSubscriptionFailureTest = (
    error = 'barf apiCreateSubscriptionWithPaymentMethod' as any
  ) => async () => {
    const apiClientOverrides = {
      ...defaultApiClientOverrides(),
      apiCreateSubscriptionWithPaymentMethod: jest
        .fn()
        .mockRejectedValue(error),
    };
    const { stripeOverride, refreshSubscriptions } = await commonSubmitSetup({
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
      fireEvent.click(screen.getByTestId('confirm'));
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

    const commonCreatePaymentMethodFailureTest = ({
      createPaymentMethod = jest
        .fn()
        .mockRejectedValue('barf createPaymentMethod'),
    } = {}) => async () => {
      const stripeOverride = {
        ...defaultStripeOverride(),
        createPaymentMethod,
      };
      const {
        apiClientOverrides,
        refreshSubscriptions,
      } = await commonSubmitSetup({
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
