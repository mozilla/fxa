import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TestRenderer from 'react-test-renderer';

import PaymentConfirmation from './index';
import { getLocalizedCurrency } from '../../lib/formats';
import { Customer, Plan } from '../../store/types';
import {
  MOCK_PLANS,
  setupFluentLocalizationTest,
  getLocalizedMessage,
} from '../../lib/test-utils';
import { Localized } from '@fluent/react';

const userProfile = {
  avatar: './avatar.svg',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en-US',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
};

const productUrl = 'https://www.example.com';

const selectedPlan = {
  plan_id: 'planId',
  plan_name: 'Pro level',
  product_id: 'fpnID',
  product_name: 'Firefox Private Network Pro',
  currency: 'usd',
  amount: 935,
  interval: 'month' as const,
  interval_count: 1,
};

const customer: Customer = {
  billing_name: 'Jane Doe',
  payment_type: 'credit',
  last4: '5309',
  exp_month: '02',
  exp_year: '2099',
  brand: 'Visa',
  subscriptions: [
    {
      latest_invoice: '628031D-0002',
      subscription_id: 'sub0.28964929339372136',
      plan_id: 'plan_123',
      product_id: 'prod_123',
      product_name: '123 Done Pro',
      status: 'active',
      cancel_at_period_end: false,
      current_period_end: Date.now() / 1000 + 86400 * 31,
      current_period_start: Date.now() / 1000 - 86400 * 31,
      end_at: null,
    },
  ],
};

afterEach(cleanup);

describe('PaymentConfirmation', () => {
  it('renders as expected', () => {
    const subject = () => {
      return render(
        <PaymentConfirmation
          {...{ profile: userProfile, selectedPlan, customer, productUrl }}
        />
      );
    };

    const { queryByTestId } = subject();
    const footer = queryByTestId('footer');
    expect(footer).toBeVisible();
  });

  describe('Payment Details', () => {
    const dayBasedId = 'payment-confirmation-amount-day';
    const weekBasedId = 'payment-confirmation-amount-week';
    const monthBasedId = 'payment-confirmation-amount-month';
    const yearBasedId = 'payment-confirmation-amount-year';

    const findMockPlan = (planId: string): Plan => {
      const plan = MOCK_PLANS.find((x) => x.plan_id === planId);
      if (plan) {
        return plan;
      }
      throw new Error(
        'unable to find suitable Plan object for test execution.'
      );
    };

    describe('Localized Plan Billing Description Component', () => {
      function runTests(
        plan: Plan,
        expectedMsgId: string,
        expectedMsg: string
      ) {
        const props = {
          ...{ profile: userProfile, selectedPlan: plan, customer, productUrl },
        };

        const testRenderer = TestRenderer.create(
          <PaymentConfirmation {...props} />
        );
        const testInstance = testRenderer.root;

        const planPriceComponent = testInstance.findByProps({
          id: expectedMsgId,
        });
        const expectedAmount = getLocalizedCurrency(plan.amount, plan.currency);

        expect(planPriceComponent.props.$amount).toStrictEqual(expectedAmount);
        expect(planPriceComponent.props.$intervalCount).toBe(
          plan.interval_count
        );
        expect(planPriceComponent.props.children.props.children).toBe(
          expectedMsg
        );
      }

      describe('When plan has day interval', () => {
        const expectedMsgId = dayBasedId;

        it('Handles an interval count of 1', () => {
          const plan_id = 'plan_daily';
          const plan = findMockPlan(plan_id);
          const expectedMsg = '$5.00 daily';

          runTests(plan, expectedMsgId, expectedMsg);
        });

        it('Handles an interval count that is not 1', () => {
          const plan_id = 'plan_6days';
          const plan = findMockPlan(plan_id);
          const expectedMsg = '$5.00 every 6 days';

          runTests(plan, expectedMsgId, expectedMsg);
        });
      });

      describe('When plan has week interval', () => {
        const expectedMsgId = weekBasedId;

        it('Handles an interval count of 1', () => {
          const plan_id = 'plan_weekly';
          const plan = findMockPlan(plan_id);
          const expectedMsg = '$5.00 weekly';

          runTests(plan, expectedMsgId, expectedMsg);
        });

        it('Handles an interval count that is not 1', () => {
          const plan_id = 'plan_6weeks';
          const plan = findMockPlan(plan_id);
          const expectedMsg = '$5.00 every 6 weeks';

          runTests(plan, expectedMsgId, expectedMsg);
        });
      });

      describe('When plan has month interval', () => {
        const expectedMsgId = monthBasedId;

        it('Handles an interval count of 1', () => {
          const plan_id = 'plan_monthly';
          const plan = findMockPlan(plan_id);
          const expectedMsg = '$5.00 monthly';

          runTests(plan, expectedMsgId, expectedMsg);
        });

        it('Handles an interval count that is not 1', () => {
          const plan_id = 'plan_6months';
          const plan = findMockPlan(plan_id);
          const expectedMsg = '$5.00 every 6 months';

          runTests(plan, expectedMsgId, expectedMsg);
        });
      });

      describe('When plan has year interval', () => {
        const expectedMsgId = yearBasedId;

        it('Handles an interval count of 1', () => {
          const plan_id = 'plan_yearly';
          const plan = findMockPlan(plan_id);
          const expectedMsg = '$5.00 yearly';

          runTests(plan, expectedMsgId, expectedMsg);
        });

        it('Handles an interval count that is not 1', () => {
          const plan_id = 'plan_6years';
          const plan = findMockPlan(plan_id);
          const expectedMsg = '$5.00 every 6 years';

          runTests(plan, expectedMsgId, expectedMsg);
        });
      });
    });

    describe('Fluent Translations for Plan Billing Description', () => {
      const bundle = setupFluentLocalizationTest('en-US');
      const amount = getLocalizedCurrency(500, 'USD');
      const args = {
        amount,
      };

      describe('When message id is payment-confirmation-amount-day', () => {
        const msgId = dayBasedId;
        it('Handles an interval count of 1', () => {
          const expected = '$5.00 daily';
          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 1,
          });
          expect(actual).toEqual(expected);
        });

        it('Handles an interval count that is not 1', () => {
          const expected = '$5.00 every 6 days';
          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 6,
          });
          expect(actual).toEqual(expected);
        });
      });

      describe('When message id is payment-confirmation-amount-week', () => {
        const msgId = weekBasedId;
        it('Handles an interval count of 1', () => {
          const expected = '$5.00 weekly';
          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 1,
          });
          expect(actual).toEqual(expected);
        });

        it('Handles an interval count that is not 1', () => {
          const expected = '$5.00 every 6 weeks';
          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 6,
          });
          expect(actual).toEqual(expected);
        });
      });

      describe('When message id is payment-confirmation-amount-month', () => {
        const msgId = monthBasedId;
        it('Handles an interval count of 1', () => {
          const expected = '$5.00 monthly';
          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 1,
          });
          expect(actual).toEqual(expected);
        });

        it('Handles an interval count that is not 1', () => {
          const expected = '$5.00 every 6 months';
          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 6,
          });
          expect(actual).toEqual(expected);
        });
      });

      describe('When message id is payment-confirmation-amount-year', () => {
        const msgId = yearBasedId;
        it('Handles an interval count of 1', () => {
          const expected = '$5.00 yearly';
          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 1,
          });
          expect(actual).toEqual(expected);
        });

        it('Handles an interval count that is not 1', () => {
          const expected = '$5.00 every 6 years';
          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 6,
          });
          expect(actual).toEqual(expected);
        });
      });
    });
  });
});
