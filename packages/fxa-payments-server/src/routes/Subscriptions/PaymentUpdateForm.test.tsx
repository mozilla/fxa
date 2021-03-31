import React from 'react';
import {
  screen,
  render,
  cleanup,
  act,
  fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import waitForExpect from 'wait-for-expect';

import PaymentUpdateForm, { PaymentUpdateFormProps } from './PaymentUpdateForm';
import {
  mockStripeElementOnChangeFns,
  elementChangeResponse,
} from '../../lib/test-utils';
import { CUSTOMER, FILTERED_SETUP_INTENT } from '../../lib/mock-data';

import { PickPartial } from '../../lib/types';

describe('routes/Subscriptions/PaymentUpdateFormV2', () => {
  type SubjectProps = PickPartial<
    PaymentUpdateFormProps,
    | 'customer'
    | 'refreshSubscriptions'
    | 'setUpdatePaymentIsSuccess'
    | 'resetUpdatePaymentIsSuccess'
  >;

  const Subject = ({
    customer = CUSTOMER,
    paymentErrorInitialState,
    apiClientOverrides = defaultApiClientOverrides(),
    stripeOverride = defaultStripeOverride(),
    refreshSubscriptions = jest.fn(),
    setUpdatePaymentIsSuccess = jest.fn(),
    resetUpdatePaymentIsSuccess = jest.fn(),
  }: SubjectProps) => {
    return (
      <PaymentUpdateForm
        {...{
          customer,
          refreshSubscriptions,
          setUpdatePaymentIsSuccess,
          resetUpdatePaymentIsSuccess,
          paymentErrorInitialState,
          stripeOverride,
          apiClientOverrides,
        }}
      />
    );
  };

  const defaultApiClientOverrides = () => ({
    apiCreateSetupIntent: jest.fn().mockResolvedValue(FILTERED_SETUP_INTENT),
    apiUpdateDefaultPaymentMethod: jest.fn().mockResolvedValue(CUSTOMER),
  });

  const DISPLAY_NAME = 'Foo Barson';

  const CONFIRM_CARD_SETUP_RESULT = {
    setupIntent: {
      payment_method: 'pm_test',
    },
    error: null,
  };

  const defaultStripeOverride = () => ({
    confirmCardSetup: jest.fn().mockResolvedValue(CONFIRM_CARD_SETUP_RESULT),
  });

  let consoleSpy: jest.SpyInstance<void, [any?, ...any[]]>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    if (consoleSpy) consoleSpy.mockRestore();
    return cleanup();
  });

  it('renders with payment update form hidden initially', async () => {
    render(<Subject />);
    expect(screen.queryByTestId('payment-update')).toBeInTheDocument();
    expect(screen.queryByTestId('paymentForm')).not.toBeInTheDocument();
  });

  it('reveals the payment update form on clicking Change button', async () => {
    render(<Subject />);
    expect(screen.queryByTestId('payment-update')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('change-button'));
    expect(screen.queryByTestId('paymentForm')).toBeInTheDocument();
  });

  async function commonSubmitSetup({
    apiClientOverrides = defaultApiClientOverrides(),
    stripeOverride = defaultStripeOverride(),
    refreshSubscriptions = jest.fn(),
    ...props
  } = {}) {
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

    expect(screen.queryByTestId('payment-update')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('change-button'));

    await act(async () => {
      mockStripeElementOnChangeFns.cardElement(
        elementChangeResponse({ complete: true, value: 'test' })
      );
    });

    fireEvent.change(screen.getByTestId('name'), {
      target: { value: DISPLAY_NAME },
    });
    fireEvent.blur(screen.getByTestId('name'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('submit'));
    });

    return {
      apiClientOverrides,
      stripeOverride,
      refreshSubscriptions,
    };
  }

  const EXPECTED_CONFIRM_CARD_SETUP_ARGS = [
    FILTERED_SETUP_INTENT.client_secret,
    {
      payment_method: {
        card: { isMockElement: true, testid: 'cardElement' },
        billing_details: { name: DISPLAY_NAME },
      },
    },
  ];

  it('updates payment method as expected', async () => {
    const {
      apiClientOverrides,
      stripeOverride,
      refreshSubscriptions,
    } = await commonSubmitSetup();

    expect(
      screen.queryByTestId('error-message-container')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('paymentForm')).not.toBeInTheDocument();
    expect(apiClientOverrides.apiCreateSetupIntent).toHaveBeenCalledTimes(1);
    expect(stripeOverride.confirmCardSetup).toHaveBeenCalledWith(
      ...EXPECTED_CONFIRM_CARD_SETUP_ARGS
    );
    expect(
      apiClientOverrides.apiUpdateDefaultPaymentMethod
    ).toHaveBeenCalledWith({
      paymentMethodId: CONFIRM_CARD_SETUP_RESULT.setupIntent.payment_method,
    });
    expect(refreshSubscriptions).toBeCalledTimes(1);
  });

  it('clears the displayed error if the form changes', async () => {
    await commonSubmitSetup({
      apiClientOverrides: {
        ...defaultApiClientOverrides(),
        apiCreateSetupIntent: jest
          .fn()
          .mockRejectedValue('barf apiCreateSetupIntent'),
      },
    });

    expect(screen.queryByTestId('error-message-container')).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(screen.getByTestId('name'), {
        target: { value: 'Bar Bar' },
      });
    });

    await waitForExpect(() =>
      expect(
        screen.queryByTestId('error-message-container')
      ).not.toBeInTheDocument()
    );
  });

  it('displays an error if apiCreateSetupIntent throws', async () => {
    const {
      apiClientOverrides,
      stripeOverride,
      refreshSubscriptions,
    } = await commonSubmitSetup({
      apiClientOverrides: {
        ...defaultApiClientOverrides(),
        apiCreateSetupIntent: jest
          .fn()
          .mockRejectedValue('barf apiCreateSetupIntent'),
      },
    });

    expect(screen.queryByTestId('error-message-container')).toBeInTheDocument();
    expect(screen.getByText('basic-error-message')).toBeInTheDocument();
    expect(screen.queryByTestId('paymentForm')).toBeInTheDocument();
    expect(apiClientOverrides.apiCreateSetupIntent).toHaveBeenCalledTimes(1);
    expect(stripeOverride.confirmCardSetup).not.toHaveBeenCalled();
    expect(
      apiClientOverrides.apiUpdateDefaultPaymentMethod
    ).not.toHaveBeenCalled();
    expect(refreshSubscriptions).not.toHaveBeenCalled();
  });

  it('displays an error if confirmCardSetup throws', async () => {
    const {
      apiClientOverrides,
      stripeOverride,
      refreshSubscriptions,
    } = await commonSubmitSetup({
      stripeOverride: {
        ...defaultStripeOverride(),
        confirmCardSetup: jest.fn().mockRejectedValue('barf confirmCardSetup'),
      },
    });

    expect(screen.queryByTestId('error-message-container')).toBeInTheDocument();
    expect(screen.getByText('basic-error-message')).toBeInTheDocument();
    expect(screen.queryByTestId('paymentForm')).toBeInTheDocument();
    expect(apiClientOverrides.apiCreateSetupIntent).toHaveBeenCalledTimes(1);
    expect(stripeOverride.confirmCardSetup).toHaveBeenCalledWith(
      ...EXPECTED_CONFIRM_CARD_SETUP_ARGS
    );
    expect(
      apiClientOverrides.apiUpdateDefaultPaymentMethod
    ).not.toHaveBeenCalled();
    expect(refreshSubscriptions).not.toHaveBeenCalled();
  });

  it('displays an error if confirmCardSetup returns an error', async () => {
    const {
      apiClientOverrides,
      stripeOverride,
      refreshSubscriptions,
    } = await commonSubmitSetup({
      stripeOverride: {
        ...defaultStripeOverride(),
        confirmCardSetup: jest
          .fn()
          .mockResolvedValue({ error: { code: 'expired_card' } }),
      },
    });

    expect(screen.queryByTestId('error-message-container')).toBeInTheDocument();
    expect(screen.getByText('expired-card-error')).toBeInTheDocument();
    expect(screen.queryByTestId('paymentForm')).toBeInTheDocument();
    expect(apiClientOverrides.apiCreateSetupIntent).toHaveBeenCalledTimes(1);
    expect(stripeOverride.confirmCardSetup).toHaveBeenCalledWith(
      ...EXPECTED_CONFIRM_CARD_SETUP_ARGS
    );
    expect(
      apiClientOverrides.apiUpdateDefaultPaymentMethod
    ).not.toHaveBeenCalled();
    expect(refreshSubscriptions).not.toHaveBeenCalled();
  });

  it('displays an error if confirmCardSetup returns an empty setupIntent', async () => {
    const {
      apiClientOverrides,
      stripeOverride,
      refreshSubscriptions,
    } = await commonSubmitSetup({
      stripeOverride: {
        ...defaultStripeOverride(),
        confirmCardSetup: jest.fn().mockResolvedValue({ setupIntent: null }),
      },
    });

    expect(screen.queryByTestId('error-message-container')).toBeInTheDocument();
    expect(screen.getByText('basic-error-message')).toBeInTheDocument();
    expect(screen.queryByTestId('paymentForm')).toBeInTheDocument();
    expect(apiClientOverrides.apiCreateSetupIntent).toHaveBeenCalledTimes(1);
    expect(stripeOverride.confirmCardSetup).toHaveBeenCalledWith(
      ...EXPECTED_CONFIRM_CARD_SETUP_ARGS
    );
    expect(
      apiClientOverrides.apiUpdateDefaultPaymentMethod
    ).not.toHaveBeenCalled();
    expect(refreshSubscriptions).not.toHaveBeenCalled();
  });

  it('displays an error if confirmCardSetup returns a setupIntent without a payment method ID', async () => {
    const {
      apiClientOverrides,
      stripeOverride,
      refreshSubscriptions,
    } = await commonSubmitSetup({
      stripeOverride: {
        ...defaultStripeOverride(),
        confirmCardSetup: jest
          .fn()
          .mockResolvedValue({ setupIntent: { payment_method: false } }),
      },
    });

    expect(screen.queryByTestId('error-message-container')).toBeInTheDocument();
    expect(screen.getByText('basic-error-message')).toBeInTheDocument();
    expect(screen.queryByTestId('paymentForm')).toBeInTheDocument();
    expect(apiClientOverrides.apiCreateSetupIntent).toHaveBeenCalledTimes(1);
    expect(stripeOverride.confirmCardSetup).toHaveBeenCalledWith(
      ...EXPECTED_CONFIRM_CARD_SETUP_ARGS
    );
    expect(
      apiClientOverrides.apiUpdateDefaultPaymentMethod
    ).not.toHaveBeenCalled();
    expect(refreshSubscriptions).not.toHaveBeenCalled();
  });

  it('displays an error if apiUpdateDefaultPaymentMethod throws', async () => {
    const {
      apiClientOverrides,
      stripeOverride,
      refreshSubscriptions,
    } = await commonSubmitSetup({
      apiClientOverrides: {
        ...defaultApiClientOverrides(),
        apiUpdateDefaultPaymentMethod: jest
          .fn()
          .mockRejectedValue('barf apiUpdateDefaultPaymentMethod'),
      },
    });

    expect(screen.queryByTestId('error-message-container')).toBeInTheDocument();
    expect(screen.getByText('basic-error-message')).toBeInTheDocument();
    expect(screen.queryByTestId('paymentForm')).toBeInTheDocument();
    expect(apiClientOverrides.apiCreateSetupIntent).toHaveBeenCalledTimes(1);
    expect(stripeOverride.confirmCardSetup).toHaveBeenCalledWith(
      ...EXPECTED_CONFIRM_CARD_SETUP_ARGS
    );
    expect(
      apiClientOverrides.apiUpdateDefaultPaymentMethod
    ).toHaveBeenCalledWith({
      paymentMethodId: CONFIRM_CARD_SETUP_RESULT.setupIntent.payment_method,
    });
    expect(refreshSubscriptions).not.toHaveBeenCalled();
  });
});
