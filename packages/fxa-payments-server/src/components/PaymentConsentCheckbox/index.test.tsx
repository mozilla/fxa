import '@testing-library/jest-dom/extend-expect';

import { act, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import TestRenderer from 'react-test-renderer';

import { PaymentConsentCheckbox } from '.';
import {
  MOCK_PLANS,
  renderWithLocalizationProvider,
  withLocalizationProvider,
} from '../../lib/test-utils';
import useValidatorState from '../../lib/validator';
import { Plan } from '../../store/types';
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
    const { findByTestId } = renderWithLocalizationProvider(
      <WrapCheckbox {...props} />
    );
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
    const { findByTestId } = renderWithLocalizationProvider(
      <WrapCheckbox {...props} />
    );
    const checkbox = await findByTestId('confirm');

    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(onClickSpy).toHaveBeenCalled();
  });

  describe('Legal', () => {
    describe('rendering the legal checkbox Localized component', () => {
      async function runTests(plan: Plan, expectedMsgId: string) {
        const props = { plan };

        const testRenderer = TestRenderer.create(
          withLocalizationProvider(<WrapCheckbox {...props} />)
        );
        const testInstance = testRenderer.root;
        const legalCheckbox = await testInstance.findByProps({
          id: expectedMsgId,
        });

        expect(legalCheckbox.props.children.props.children[0]).toBe(
          'I authorize Mozilla to charge my payment method for the amount shown, according to'
        );
        expect(legalCheckbox.props.children.props.children[1]).toBe(' ');
        expect(legalCheckbox.props.children.props.children[2].props.href).toBe(
          'https://www.mozilla.org/about/legal/terms/firefox-private-network'
        );
        expect(
          legalCheckbox.props.children.props.children[2].props.children
        ).toBe('Terms of Service');
        expect(legalCheckbox.props.children.props.children[3]).toBe(' and');
        expect(legalCheckbox.props.children.props.children[4]).toBe(' ');
        expect(legalCheckbox.props.children.props.children[5].props.href).toBe(
          'https://www.mozilla.org/privacy/firefox-private-network'
        );
        expect(
          legalCheckbox.props.children.props.children[5].props.children
        ).toBe('Privacy Notice');
        expect(legalCheckbox.props.children.props.children[6]).toBe(
          ', until I cancel my subscription.'
        );
      }

      it('renders Localized for a plan with correct props and displays correct default string', async () => {
        const plan_id = 'plan_daily';
        const plan = findMockPlan(plan_id);
        const expectedMsgId = 'payment-confirm-with-legal-links-static-3';

        runTests(plan, expectedMsgId);
      });
    });
  });
});
