import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import TestRenderer from 'react-test-renderer';
import dayjs from 'dayjs';
import fs from 'fs';
import path from 'path';
import { FluentBundle } from 'fluent';

import { PaymentUpdateForm } from './PaymentUpdateForm';
import { Plan } from '../../store/types';
import { MOCK_PLANS, MOCK_CUSTOMER } from '../../lib/test-utils';

describe('PaymentUpdateForm', () => {
  const dayBasedId = 'pay-update-billing-description-day';
  const weekBasedId = 'pay-update-billing-description-week';
  const monthBasedId = 'pay-update-billing-description-month';
  const yearBasedId = 'pay-update-billing-description-year';
  const subscription = MOCK_CUSTOMER.subscriptions[0];

  const findMockPlan = (planId: string): Plan => {
    const plan = MOCK_PLANS.find(x => x.plan_id === planId);
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
    function runTests(
      props: any,
      expectedMsgId: string,
      expectedAmount: string,
      expectedDate: string,
      expectedMsg: string
    ) {
      const testRenderer = TestRenderer.create(
        <PaymentUpdateForm {...props} />
      );
      const testInstance = testRenderer.root;
      const BillingDetails = testInstance.findByProps({ id: expectedMsgId });

      expect(BillingDetails.props.$amount).toBe(expectedAmount);
      expect(BillingDetails.props.$intervalCount).toBe(
        props.plan.interval_count
      );
      expect(BillingDetails.props.$name).toBe(props.plan.product_name);
      expect(BillingDetails.props.$date).toBe(expectedDate);
      expect(BillingDetails.props.children.props.children).toBe(expectedMsg);
    }

    describe('When plan has day interval', () => {
      const expectedMsgId = dayBasedId;

      it('Handles an interval count of 1', () => {
        const plan_id = 'plan_daily';
        const plan = findMockPlan(plan_id);
        const periodEndDate = dayjs
          .unix(subscription.current_period_end)
          .format('MM/DD/YYYY');
        const expectedMsg = `You are billed $5.00 daily for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, '5.00', periodEndDate, expectedMsg);
      });

      it('Handles an interval count that is not 1', () => {
        const plan_id = 'plan_6days';
        const plan = findMockPlan(plan_id);
        const periodEndDate = dayjs
          .unix(subscription.current_period_end)
          .format('MM/DD/YYYY');
        const expectedMsg = `You are billed $5.00 every 6 days for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, '5.00', periodEndDate, expectedMsg);
      });
    });

    describe('When plan has week interval', () => {
      const expectedMsgId = weekBasedId;

      it('Handles an interval count of 1', () => {
        const plan_id = 'plan_weekly';
        const plan = findMockPlan(plan_id);
        const periodEndDate = dayjs
          .unix(subscription.current_period_end)
          .format('MM/DD/YYYY');
        const expectedMsg = `You are billed $5.00 weekly for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, '5.00', periodEndDate, expectedMsg);
      });

      it('Handles an interval count that is not 1', () => {
        const plan_id = 'plan_6weeks';
        const plan = findMockPlan(plan_id);
        const periodEndDate = dayjs
          .unix(subscription.current_period_end)
          .format('MM/DD/YYYY');
        const expectedMsg = `You are billed $5.00 every 6 weeks for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, '5.00', periodEndDate, expectedMsg);
      });
    });

    describe('When plan has month interval', () => {
      const expectedMsgId = monthBasedId;

      it('Handles an interval count of 1', () => {
        const plan_id = 'plan_monthly';
        const plan = findMockPlan(plan_id);
        const periodEndDate = dayjs
          .unix(subscription.current_period_end)
          .format('MM/DD/YYYY');
        const expectedMsg = `You are billed $5.00 monthly for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, '5.00', periodEndDate, expectedMsg);
      });

      it('Handles an interval count that is not 1', () => {
        const plan_id = 'plan_6months';
        const plan = findMockPlan(plan_id);
        const periodEndDate = dayjs
          .unix(subscription.current_period_end)
          .format('MM/DD/YYYY');
        const expectedMsg = `You are billed $5.00 every 6 months for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, '5.00', periodEndDate, expectedMsg);
      });
    });

    describe('When plan has year interval', () => {
      const expectedMsgId = yearBasedId;

      it('Handles an interval count of 1', () => {
        const plan_id = 'plan_yearly';
        const plan = findMockPlan(plan_id);
        const periodEndDate = dayjs
          .unix(subscription.current_period_end)
          .format('MM/DD/YYYY');
        const expectedMsg = `You are billed $5.00 yearly for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, '5.00', periodEndDate, expectedMsg);
      });

      it('Handles an interval count that is not 1', () => {
        const plan_id = 'plan_6years';
        const plan = findMockPlan(plan_id);
        const periodEndDate = dayjs
          .unix(subscription.current_period_end)
          .format('MM/DD/YYYY');
        const expectedMsg = `You are billed $5.00 every 6 years for FPN. Your next payment occurs on ${periodEndDate}.`;

        const props = {
          ...baseProps,
          plan: plan,
        };
        runTests(props, expectedMsgId, '5.00', periodEndDate, expectedMsg);
      });
    });
  });

  describe('Fluent Translations for Plan Billing Description', () => {
    let bundle: FluentBundle;
    const args = {
      amount: '5.00',
      name: 'FPN',
      date: '11/22/2020',
    };

    beforeEach(async () => {
      const filepath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'public',
        'locales',
        'en-US',
        'main.ftl'
      );
      const enUS = (await fs.readFileSync(filepath)).toString();
      bundle = new FluentBundle('en-US');
      bundle.addMessages(enUS);
    });

    function runTests(
      bundle: FluentBundle,
      msgId: string,
      intervalCount: number,
      expectedMsg: string
    ) {
      const msg = bundle.getMessage(msgId);
      const actual = bundle.format(msg, {
        ...args,
        intervalCount,
      });

      expect(actual.replace(/(\u2068|\u2069)/gu, '')).toEqual(expectedMsg);
    }

    describe('When message id is pay-update-billing-description-day', () => {
      const msgId = dayBasedId;
      it('Handles an interval count of 1', () => {
        const expected =
          'You are billed $5.00 daily for FPN. Your next payment occurs on 11/22/2020.';
        runTests(bundle, msgId, 1, expected);
      });

      it('Handles an interval count that is not 1', () => {
        const expected =
          'You are billed $5.00 every 6 days for FPN. Your next payment occurs on 11/22/2020.';
        runTests(bundle, msgId, 6, expected);
      });
    });

    describe('When message id is pay-update-billing-description-week', () => {
      const msgId = weekBasedId;
      it('Handles an interval count of 1', () => {
        const expected =
          'You are billed $5.00 weekly for FPN. Your next payment occurs on 11/22/2020.';
        runTests(bundle, msgId, 1, expected);
      });

      it('Handles an interval count that is not 1', () => {
        const expected =
          'You are billed $5.00 every 6 weeks for FPN. Your next payment occurs on 11/22/2020.';
        runTests(bundle, msgId, 6, expected);
      });
    });

    describe('When message id is pay-update-billing-description-month', () => {
      const msgId = monthBasedId;
      it('Handles an interval count of 1', () => {
        const expected =
          'You are billed $5.00 monthly for FPN. Your next payment occurs on 11/22/2020.';
        runTests(bundle, msgId, 1, expected);
      });

      it('Handles an interval count that is not 1', () => {
        const expected =
          'You are billed $5.00 every 6 months for FPN. Your next payment occurs on 11/22/2020.';
        runTests(bundle, msgId, 6, expected);
      });
    });

    describe('When message id is pay-update-billing-description-year', () => {
      const msgId = yearBasedId;
      it('Handles an interval count of 1', () => {
        const expected =
          'You are billed $5.00 yearly for FPN. Your next payment occurs on 11/22/2020.';
        runTests(bundle, msgId, 1, expected);
      });

      it('Handles an interval count that is not 1', () => {
        const expected =
          'You are billed $5.00 every 6 years for FPN. Your next payment occurs on 11/22/2020.';
        runTests(bundle, msgId, 6, expected);
      });
    });
  });
});
