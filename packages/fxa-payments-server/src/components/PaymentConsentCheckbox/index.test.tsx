import React from 'react';
import TestRenderer from 'react-test-renderer';
import { render, cleanup, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Plan } from '../../store/types';

import {
  MOCK_PLANS,
  setupFluentLocalizationTest,
  getLocalizedMessage,
} from '../../lib/test-utils';

import { getLocalizedCurrency } from '../../lib/formats';
import { PaymentConsentCheckbox } from './index';
import useValidatorState from '../../lib/validator';
import { Form } from '../fields';

jest.mock('../../lib/sentry');

const findMockPlan = (planId: string): Plan => {
  const plan = MOCK_PLANS.find((x) => x.plan_id === planId);
  if (plan) {
    return plan;
  }
  throw new Error('unable to find suitable Plan object for test execution.');
};

const WrapCheckbox = (props: any) => {
  const validator = useValidatorState();
  return (
    <Form validator={validator}>
      <PaymentConsentCheckbox {...props} />
    </Form>
  );
};

describe('components/PaymentConsentCheckbox', () => {
  afterEach(() => {
    jest.clearAllMocks();
    return cleanup();
  });

  it('renders as expected', async () => {
    const plan_id = 'plan_daily';
    const plan = findMockPlan(plan_id);
    const props = { plan };
    const { findByTestId } = render(<WrapCheckbox {...props} />);
    const checkbox = await findByTestId('confirm');

    expect(checkbox).toBeVisible();
  });

  it('calls onclick function when passed', async () => {
    const plan_id = 'plan_daily';
    const plan = findMockPlan(plan_id);
    const onClickSpy = jest.fn();
    const props = {
      plan,
      onClick: onClickSpy,
    };
    const { findByTestId } = render(<WrapCheckbox {...props} />);
    const checkbox = await findByTestId('confirm');

    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(onClickSpy).toHaveBeenCalled();
  });

  describe('Legal', () => {
    describe('rendering the legal checkbox Localized component', () => {
      function runTests(
        plan: Plan,
        expectedMsgId: string,
        expectedMsg: string
      ) {
        const props = { plan };

        const testRenderer = TestRenderer.create(<WrapCheckbox {...props} />);
        const testInstance = testRenderer.root;
        const legalCheckbox = testInstance.findByProps({ id: expectedMsgId });
        const expectedAmount = getLocalizedCurrency(plan.amount, plan.currency);

        expect(legalCheckbox.props.vars.amount).toStrictEqual(expectedAmount);
        expect(legalCheckbox.props.vars.intervalCount).toBe(
          plan.interval_count
        );
        expect(legalCheckbox.props.children.props.children).toBe(expectedMsg);
      }

      it('renders Localized for daily plan with correct props and displays correct default string', async () => {
        const plan_id = 'plan_daily';
        const plan = findMockPlan(plan_id);
        const expectedMsgId = 'payment-confirm-with-legal-links-day';
        const expectedMsg =
          'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 daily</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

        runTests(plan, expectedMsgId, expectedMsg);
      });

      it('renders Localized for 6 days plan with correct props and displays correct default string', async () => {
        const plan_id = 'plan_6days';
        const plan = findMockPlan(plan_id);
        const expectedMsgId = 'payment-confirm-with-legal-links-day';
        const expectedMsg =
          'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 every 6 days</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

        runTests(plan, expectedMsgId, expectedMsg);
      });

      it('renders Localized for weekly plan with correct props and displays correct default string', async () => {
        const plan_id = 'plan_weekly';
        const plan = findMockPlan(plan_id);
        const expectedMsgId = 'payment-confirm-with-legal-links-week';
        const expectedMsg =
          'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 weekly</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

        runTests(plan, expectedMsgId, expectedMsg);
      });

      it('renders Localized for 6 weeks plan with correct props and displays correct default string', async () => {
        const plan_id = 'plan_6weeks';
        const plan = findMockPlan(plan_id);
        const expectedMsgId = 'payment-confirm-with-legal-links-week';
        const expectedMsg =
          'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 every 6 weeks</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

        runTests(plan, expectedMsgId, expectedMsg);
      });

      it('renders Localized for monthly plan with correct props and displays correct default string', async () => {
        const plan_id = 'plan_monthly';
        const plan = findMockPlan(plan_id);
        const expectedMsgId = 'payment-confirm-with-legal-links-month';
        const expectedMsg =
          'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 monthly</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

        runTests(plan, expectedMsgId, expectedMsg);
      });

      it('renders Localized for 6 months plan with correct props and displays correct default string', async () => {
        const plan_id = 'plan_6months';
        const plan = findMockPlan(plan_id);
        const expectedMsgId = 'payment-confirm-with-legal-links-month';
        const expectedMsg =
          'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 every 6 months</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

        runTests(plan, expectedMsgId, expectedMsg);
      });

      it('renders Localized for yearly plan with correct props and displays correct default string', async () => {
        const plan_id = 'plan_yearly';
        const plan = findMockPlan(plan_id);
        const expectedMsgId = 'payment-confirm-with-legal-links-year';
        const expectedMsg =
          'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 yearly</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

        runTests(plan, expectedMsgId, expectedMsg);
      });

      it('renders Localized for years plan with correct props and displays correct default string', async () => {
        const plan_id = 'plan_6years';
        const plan = findMockPlan(plan_id);
        const expectedMsgId = 'payment-confirm-with-legal-links-year';
        const expectedMsg =
          'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 every 6 years</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

        runTests(plan, expectedMsgId, expectedMsg);
      });
    });

    describe('Fluent Localized Text', () => {
      const bundle = setupFluentLocalizationTest('en-US');
      const amount = getLocalizedCurrency(500, 'USD');
      const args = {
        amount,
      };

      describe('when the localized id is payment-confirm-with-legal-links-day', () => {
        const msgId = 'payment-confirm-with-legal-links-day';

        it('returns the correct string for an interval count of 1', () => {
          const expected =
            'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 daily</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 1,
          });
          expect(actual).toEqual(expected);
        });

        it('returns the correct string for an interval count greater than 1', () => {
          const expected =
            'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 every 6 days</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';
          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 6,
          });
          expect(actual).toEqual(expected);
        });
      });

      describe('when the localized id is payment-confirm-with-legal-links-week', () => {
        const msgId = 'payment-confirm-with-legal-links-week';

        it('returns the correct string for an interval count of 1', () => {
          const expected =
            'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 weekly</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 1,
          });
          expect(actual).toEqual(expected);
        });

        it('returns the correct string for an interval count greater than 1', () => {
          const expected =
            'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 every 6 weeks</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 6,
          });
          expect(actual).toEqual(expected);
        });
      });

      describe('when the localized id is payment-confirm-with-legal-links-month', () => {
        const msgId = 'payment-confirm-with-legal-links-month';

        it('returns the correct string for an interval count of 1', () => {
          const expected =
            'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 monthly</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 1,
          });
          expect(actual).toEqual(expected);
        });

        it('returns the correct string for an interval count greater than 1', () => {
          const expected =
            'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 every 6 months</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 6,
          });
          expect(actual).toEqual(expected);
        });
      });

      describe('when the localized id is payment-confirm-with-legal-links-year', () => {
        const msgId = 'payment-confirm-with-legal-links-year';

        it('returns the correct string for an interval count of 1', () => {
          const expected =
            'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 yearly</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

          const actual = getLocalizedMessage(bundle, msgId, {
            ...args,
            intervalCount: 1,
          });
          expect(actual).toEqual(expected);
        });

        it('returns the correct string for an interval count greater than 1', () => {
          const expected =
            'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 every 6 years</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

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
