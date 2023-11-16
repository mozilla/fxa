import '@testing-library/jest-dom/extend-expect';

import { act, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';

import { PaymentMethodHeader, PaymentMethodHeaderType } from '.';
import {
  getLocalizedMessage,
  MOCK_PLANS,
  renderWithLocalizationProvider,
} from '../../lib/test-utils';
import { getFtlBundle } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';

jest.mock('../../lib/sentry');

describe('components/PaymentMethodHeader', () => {
  afterEach(() => {
    jest.clearAllMocks();
    return cleanup();
  });

  it('render header without prefix', async () => {
    const plan = MOCK_PLANS[0];
    const props = { plan, onClick: () => {} };
    const { queryByTestId } = renderWithLocalizationProvider(
      <PaymentMethodHeader {...props} />
    );

    expect(queryByTestId('header')).toBeInTheDocument();
    expect(queryByTestId('header-prefix')).not.toBeInTheDocument();
  });

  it('render header with prefix', async () => {
    const plan = MOCK_PLANS[0];
    const props = {
      plan,
      onClick: () => {},
      type: PaymentMethodHeaderType.SecondStep,
    };
    const { queryByTestId } = renderWithLocalizationProvider(
      <PaymentMethodHeader {...props} />
    );

    expect(queryByTestId('header')).not.toBeInTheDocument();
    expect(queryByTestId('header-prefix')).toBeInTheDocument();
  });

  describe('Fluent localized text', () => {
    let bundle: FluentBundle;
    beforeAll(async () => {
      bundle = await getFtlBundle('payments');
    });

    it('returns correct heading without prefix', async () => {
      const msgId = 'payment-method-header';
      const expected = 'Choose your payment method';
      const actual = getLocalizedMessage(bundle, msgId, {});

      expect(actual).toEqual(expected);
    });

    it('returns correct heading with prefix', async () => {
      const msgId = 'payment-method-header-second-step';
      const expected = '2. Choose your payment method';
      const actual = getLocalizedMessage(bundle, msgId, {});

      expect(actual).toEqual(expected);
    });

    it('returns correct text for required text', async () => {
      const msgId = 'payment-method-first-approve';
      const expected = 'First you’ll need to approve your subscription';
      const actual = getLocalizedMessage(bundle, msgId, {});
      expect(actual).toEqual(expected);
    });
  });

  describe('PaymentConsentCheckbox component - Spot checks', () => {
    it('Checkbox renders as expected', async () => {
      const plan = MOCK_PLANS[0];
      const props = { plan, onClick: () => {} };
      const { findByTestId } = renderWithLocalizationProvider(
        <PaymentMethodHeader {...props} />
      );
      const checkbox = await findByTestId('confirm');

      expect(checkbox).toBeVisible();
    });

    it('onClick works', async () => {
      const plan = MOCK_PLANS[0];
      const onClickSpy = jest.fn();
      const props = { plan, onClick: onClickSpy };
      const { findByTestId } = renderWithLocalizationProvider(
        <PaymentMethodHeader {...props} />
      );
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
        'I authorize Mozilla to charge my payment method for the amount shown, according to Terms of ServiceOpens in new window and Privacy NoticeOpens in new window, until I cancel my subscription.';

      const { findByTestId } = renderWithLocalizationProvider(
        <PaymentMethodHeader {...props} />
      );

      const checkbox = await findByTestId('confirm');

      expect(checkbox.nextSibling?.textContent).toEqual(expectedMsg);
    });
  });
});
