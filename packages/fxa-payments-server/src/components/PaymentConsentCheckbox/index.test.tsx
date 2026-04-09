import '@testing-library/jest-dom/extend-expect';

import { act, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';

import { PaymentConsentCheckbox } from '.';
import {
  MOCK_PLANS,
  renderWithLocalizationProvider,
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
      function runTests(plan: Plan, _expectedMsgId: string) {
        const props = { plan };

        const { getByTestId } = renderWithLocalizationProvider(
          <WrapCheckbox {...props} />
        );
        const confirmEl = getByTestId('confirm');
        const labelEl = confirmEl.closest('label') || confirmEl.parentElement;
        expect(labelEl).toBeTruthy();
        const labelText = labelEl!.textContent;

        expect(labelText).toContain(
          'I authorize Mozilla to charge my payment method for the amount shown, according to'
        );
        expect(labelText).toContain('Terms of Service');
        expect(labelText).toContain('Privacy Notice');
        expect(labelText).toContain(', until I cancel my subscription.');

        const tosLink = labelEl!.querySelector(
          'a[href="https://www.mozilla.org/about/legal/terms/subscription-services"]'
        );
        expect(tosLink).toBeTruthy();
        expect(tosLink!.textContent).toBe('Terms of Service');

        const privacyLink = labelEl!.querySelector(
          'a[href="https://www.mozilla.org/privacy/subscription-services"]'
        );
        expect(privacyLink).toBeTruthy();
        expect(privacyLink!.textContent).toBe('Privacy Notice');
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
