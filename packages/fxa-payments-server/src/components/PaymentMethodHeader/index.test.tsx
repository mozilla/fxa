import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import TestRenderer from 'react-test-renderer';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { PaymentMethodHeader } from '.';
import {
  getLocalizedMessage,
  MOCK_PLANS,
  setupFluentLocalizationTest,
} from '../../lib/test-utils';
import { act } from 'react-dom/test-utils';
import { getLocalizedCurrency } from '../../lib/formats';
import waitForExpect from 'wait-for-expect';

jest.mock('../../lib/sentry');

describe('components/PaymentMethodHeader', () => {
  afterEach(() => {
    jest.clearAllMocks();
    return cleanup();
  });

  it('render header without prefix', async () => {
    const plan = MOCK_PLANS[0];
    const props = { plan, onClick: () => {} };
    const { queryByTestId } = render(<PaymentMethodHeader {...props} />);

    expect(queryByTestId('header')).toBeInTheDocument();
    expect(queryByTestId('header-prefix')).not.toBeInTheDocument();
  });

  it('render header with prefix', async () => {
    const plan = MOCK_PLANS[0];
    const props = { plan, onClick: () => {}, prefix: '2.' };
    const { queryByTestId } = render(<PaymentMethodHeader {...props} />);

    expect(queryByTestId('header')).not.toBeInTheDocument();
    expect(queryByTestId('header-prefix')).toBeInTheDocument();
  });

  describe('Fluent localized text', () => {
    const bundle = setupFluentLocalizationTest('en-US');

    it('returns correct heading without prefix', async () => {
      const msgId = 'payment-method-header';
      const expected = 'Choose your payment method';
      const actual = getLocalizedMessage(bundle, msgId, {});

      expect(actual).toEqual(expected);
    });

    it('returns correct heading with prefix', async () => {
      const msgId = 'payment-method-header-prefix';
      const prefix = '2.';
      const expected = '2. Choose your payment method';
      const actual = getLocalizedMessage(bundle, msgId, { prefix });

      expect(actual).toEqual(expected);
    });

    it('returns correct text for required text', async () => {
      const msgId = 'payment-method-required';
      const expected = 'Required';
      const actual = getLocalizedMessage(bundle, msgId, {});
      expect(actual).toEqual(expected);
    });
  });

  describe('PaymentConsentCheckbox component - Spot checks', () => {
    it('Checkbox renders as expected', async () => {
      const plan = MOCK_PLANS[0];
      const props = { plan, onClick: () => {} };
      const { findByTestId } = render(<PaymentMethodHeader {...props} />);
      const checkbox = await findByTestId('confirm');

      expect(checkbox).toBeVisible();
    });

    it('onClick works', async () => {
      const plan = MOCK_PLANS[0];
      const onClickSpy = jest.fn();
      const props = { plan, onClick: onClickSpy };
      const { findByTestId } = render(<PaymentMethodHeader {...props} />);
      const checkbox = await findByTestId('confirm');

      await act(async () => {
        fireEvent.click(checkbox);
      });

      expect(onClickSpy).toHaveBeenCalled();
    });

    it('Legal text displayed correctly for given plan', async () => {
      const plan =
        MOCK_PLANS.find((p) => p.plan_id === 'plan_daily') || MOCK_PLANS[0];
      const props = { plan, onClick: () => {} };
      const expectedMsg =
        'I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>$5.00 daily</strong>, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.';

      const { findByTestId } = render(<PaymentMethodHeader {...props} />);

      const checkbox = await findByTestId('confirm');

      expect(checkbox.nextSibling?.textContent).toEqual(expectedMsg);
    });
  });
});
