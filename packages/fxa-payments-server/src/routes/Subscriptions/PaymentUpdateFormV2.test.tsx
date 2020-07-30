import React from 'react';
import {
  screen,
  render,
  cleanup,
  act,
  fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TestRenderer from 'react-test-renderer';

import waitForExpect from 'wait-for-expect';

import PaymentUpdateForm, {
  PaymentUpdateFormProps,
} from './PaymentUpdateFormV2';
import { Plan } from '../../store/types';
import {
  MOCK_PLANS,
  MOCK_CUSTOMER,
  setupFluentLocalizationTest,
  getLocalizedMessage,
  mockStripeElementOnChangeFns,
  elementChangeResponse,
} from '../../lib/test-utils';
import { CUSTOMER, FILTERED_SETUP_INTENT } from '../../lib/mock-data';
import {
  getLocalizedDateString,
  getLocalizedDate,
  getLocalizedCurrency,
} from '../../lib/formats';

import { PickPartial } from '../../lib/types';

describe('routes/Subscriptions/PaymentUpdateFormV2', () => {
  const dayBasedId = 'pay-update-billing-description-day';
  const weekBasedId = 'pay-update-billing-description-week';
  const monthBasedId = 'pay-update-billing-description-month';
  const yearBasedId = 'pay-update-billing-description-year';
  const subscription = MOCK_CUSTOMER.subscriptions[0];

  const findMockPlan = (planId: string): Plan => {
    const plan = MOCK_PLANS.find((x) => x.plan_id === planId);
    if (plan) {
      return plan;
    }
    throw new Error('unable to find suitable Plan object for test execution.');
  };

  const baseProps = {
    customerSubscription: subscription,
    customer: MOCK_CUSTOMER,
    plan: MOCK_PLANS[0],
    refreshSubscription: jest.fn(),
  };

  type SubjectProps = PickPartial<
    PaymentUpdateFormProps,
    | 'customer'
    | 'customerSubscription'
    | 'plan'
    | 'refreshSubscriptions'
    | 'setUpdatePaymentIsSuccess'
    | 'resetUpdatePaymentIsSuccess'
  >;

  const Subject = ({
    customer = CUSTOMER,
    customerSubscription = CUSTOMER.subscriptions[0],
    plan = MOCK_PLANS[0],
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
          customerSubscription,
          plan,
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
    expect(screen.queryByTestId('upgrade-cta')).not.toBeInTheDocument();
  });

  it('renders with payment update form with upgradeCTA when available', async () => {
    const upgradeCTA = 'Buy the next best thing!';
    render(
      <Subject plan={{ ...MOCK_PLANS[0], product_metadata: { upgradeCTA } }} />
    );
    expect(screen.queryByTestId('payment-update')).toBeInTheDocument();
    expect(screen.queryByTestId('paymentForm')).not.toBeInTheDocument();
    expect(screen.queryByTestId('upgrade-cta')).toBeInTheDocument();
    expect(screen.queryByText(upgradeCTA)).toBeInTheDocument();
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

  describe('Localized Plan Billing Description Component', () => {
    function runTests(props: any, expectedMsgId: string, expectedMsg: string) {
      const testRenderer = TestRenderer.create(
        <PaymentUpdateForm {...props} />
      );
      const testInstance = testRenderer.root;
      const billingDetails = testInstance.findByProps({ id: expectedMsgId });
      const expectedAmount = getLocalizedCurrency(
        props.plan.amount,
        props.plan.currency
      );
      const expectedDate = getLocalizedDate(
        props.customerSubscription.current_period_end,
        true
      );

      expect(billingDetails.props.vars.amount).toStrictEqual(expectedAmount);
      expect(billingDetails.props.vars.intervalCount).toBe(
        props.plan.interval_count
      );
      expect(billingDetails.props.vars.name).toBe(props.plan.product_name);
      expect(billingDetails.props.vars.date).toStrictEqual(expectedDate);
      expect(billingDetails.props.children.props.children).toBe(expectedMsg);
    }

    describe('When plan has day interval', () => {
      const expectedMsgId = dayBasedId;

      it('Handles an interval count of 1', () => {
        const plan_id = 'plan_daily';
        const plan = findMockPlan(plan_id);
        const periodEndDate = getLocalizedDateString(
          subscription.current_period_end,
          true
        );
        const expectedMsg = `You are billed $5.00 daily for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, expectedMsg);
      });

      it('Handles an interval count that is not 1', () => {
        const plan_id = 'plan_6days';
        const plan = findMockPlan(plan_id);
        const periodEndDate = getLocalizedDateString(
          subscription.current_period_end,
          true
        );
        const expectedMsg = `You are billed $5.00 every 6 days for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, expectedMsg);
      });
    });

    describe('When plan has week interval', () => {
      const expectedMsgId = weekBasedId;

      it('Handles an interval count of 1', () => {
        const plan_id = 'plan_weekly';
        const plan = findMockPlan(plan_id);
        const periodEndDate = getLocalizedDateString(
          subscription.current_period_end,
          true
        );
        const expectedMsg = `You are billed $5.00 weekly for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, expectedMsg);
      });

      it('Handles an interval count that is not 1', () => {
        const plan_id = 'plan_6weeks';
        const plan = findMockPlan(plan_id);
        const periodEndDate = getLocalizedDateString(
          subscription.current_period_end,
          true
        );
        const expectedMsg = `You are billed $5.00 every 6 weeks for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, expectedMsg);
      });
    });

    describe('When plan has month interval', () => {
      const expectedMsgId = monthBasedId;

      it('Handles an interval count of 1', () => {
        const plan_id = 'plan_monthly';
        const plan = findMockPlan(plan_id);
        const periodEndDate = getLocalizedDateString(
          subscription.current_period_end,
          true
        );
        const expectedMsg = `You are billed $5.00 monthly for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, expectedMsg);
      });

      it('Handles an interval count that is not 1', () => {
        const plan_id = 'plan_6months';
        const plan = findMockPlan(plan_id);
        const periodEndDate = getLocalizedDateString(
          subscription.current_period_end,
          true
        );
        const expectedMsg = `You are billed $5.00 every 6 months for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, expectedMsg);
      });
    });

    describe('When plan has year interval', () => {
      const expectedMsgId = yearBasedId;

      it('Handles an interval count of 1', () => {
        const plan_id = 'plan_yearly';
        const plan = findMockPlan(plan_id);
        const periodEndDate = getLocalizedDateString(
          subscription.current_period_end,
          true
        );
        const expectedMsg = `You are billed $5.00 yearly for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, expectedMsg);
      });

      it('Handles an interval count that is not 1', () => {
        const plan_id = 'plan_6years';
        const plan = findMockPlan(plan_id);
        const periodEndDate = getLocalizedDateString(
          subscription.current_period_end,
          true
        );
        const expectedMsg = `You are billed $5.00 every 6 years for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, expectedMsg);
      });
    });
  });

  describe('Fluent Translations for Plan Billing Description', () => {
    const bundle = setupFluentLocalizationTest('en-US');
    const amount = getLocalizedCurrency(500, 'USD');
    const stringDate = getLocalizedDateString(1585334292, true);
    const args = {
      amount,
      name: 'FPN',
      date: getLocalizedDate(1585334292, true),
    };

    describe('When message id is pay-update-billing-description-day', () => {
      const msgId = dayBasedId;
      it('Handles an interval count of 1', () => {
        const expected = `You are billed $5.00 daily for FPN. Your next payment occurs on ${stringDate}.`;

        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 1,
        });
        expect(actual).toEqual(expected);
      });

      it('Handles an interval count that is not 1', () => {
        const expected = `You are billed $5.00 every 6 days for FPN. Your next payment occurs on ${stringDate}.`;

        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 6,
        });
        expect(actual).toEqual(expected);
      });
    });

    describe('When message id is pay-update-billing-description-week', () => {
      const msgId = weekBasedId;
      it('Handles an interval count of 1', () => {
        const expected = `You are billed $5.00 weekly for FPN. Your next payment occurs on ${stringDate}.`;

        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 1,
        });
        expect(actual).toEqual(expected);
      });

      it('Handles an interval count that is not 1', () => {
        const expected = `You are billed $5.00 every 6 weeks for FPN. Your next payment occurs on ${stringDate}.`;

        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 6,
        });
        expect(actual).toEqual(expected);
      });
    });

    describe('When message id is pay-update-billing-description-month', () => {
      const msgId = monthBasedId;
      it('Handles an interval count of 1', () => {
        const expected = `You are billed $5.00 monthly for FPN. Your next payment occurs on ${stringDate}.`;

        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 1,
        });
        expect(actual).toEqual(expected);
      });

      it('Handles an interval count that is not 1', () => {
        const expected = `You are billed $5.00 every 6 months for FPN. Your next payment occurs on ${stringDate}.`;

        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 6,
        });
        expect(actual).toEqual(expected);
      });
    });

    describe('When message id is pay-update-billing-description-year', () => {
      const msgId = yearBasedId;
      it('Handles an interval count of 1', () => {
        const expected = `You are billed $5.00 yearly for FPN. Your next payment occurs on ${stringDate}.`;

        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 1,
        });
        expect(actual).toEqual(expected);
      });

      it('Handles an interval count that is not 1', () => {
        const expected = `You are billed $5.00 every 6 years for FPN. Your next payment occurs on ${stringDate}.`;

        const actual = getLocalizedMessage(bundle, msgId, {
          ...args,
          intervalCount: 6,
        });
        expect(actual).toEqual(expected);
      });
    });
  });
});
