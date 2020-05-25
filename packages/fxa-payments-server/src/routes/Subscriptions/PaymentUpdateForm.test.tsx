import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import TestRenderer from 'react-test-renderer';

import { PaymentUpdateForm } from './PaymentUpdateForm';
import { Plan } from '../../store/types';
import {
  MOCK_PLANS,
  MOCK_CUSTOMER,
  setupFluentLocalizationTest,
  getLocalizedMessage,
} from '../../lib/test-utils';
import {
  getLocalizedDateString,
  getLocalizedDate,
  getLocalizedCurrency,
} from '../../lib/formats';

describe('PaymentUpdateForm', () => {
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
    updatePayment: jest.fn(),
    resetUpdatePayment: jest.fn(),
    updatePaymentStatus: {
      error: null,
      loading: false,
      result: null,
    },
  };

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

      expect(billingDetails.props.$amount).toStrictEqual(expectedAmount);
      expect(billingDetails.props.$intervalCount).toBe(
        props.plan.interval_count
      );
      expect(billingDetails.props.$name).toBe(props.plan.product_name);
      expect(billingDetails.props.$date).toStrictEqual(expectedDate);
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
