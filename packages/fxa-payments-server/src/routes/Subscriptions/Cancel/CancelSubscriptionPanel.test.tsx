/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, render, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import waitForExpect from 'wait-for-expect';
import * as Amplitude from '../../../lib/amplitude';
jest.mock('../../../lib/amplitude');
import CancelSubscriptionPanel, {
  CancelSubscriptionPanelProps,
} from './CancelSubscriptionPanel';

import { MOCK_PLANS, MOCK_CUSTOMER } from '../../../lib/test-utils';
import { Plan } from 'fxa-payments-server/src/store/types';
import {
  formatPlanPricing,
  getLocalizedDateString,
} from 'fxa-payments-server/src/lib/formats';
import { defaultState } from 'fxa-payments-server/src/store/state';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { LocalizationProvider } from '@fluent/react';

const { queryByTestId, queryByText, queryAllByText, getByTestId } = screen;

const findMockPlan = (planId: string): Plan => {
  const plan = MOCK_PLANS.find((x) => x.plan_id === planId);
  if (plan) {
    return plan;
  }
  throw new Error('unable to find suitable Plan object for test execution.');
};

describe('CancelSubscriptionPanel', () => {
  const subscription = MOCK_CUSTOMER.subscriptions[0];
  const baseProps = {
    customerSubscription: subscription,
    cancelSubscription: jest.fn().mockResolvedValue(null),
    cancelSubscriptionStatus: defaultState.cancelSubscription,
  };

  afterEach(() => {
    baseProps.cancelSubscription.mockClear();
  });

  describe('renders', () => {
    for (const [k, v] of Object.entries({
      day: 'daily',
      week: 'weekly',
      month: 'monthly',
      year: 'yearly',
    })) {
      describe(`when plan has ${k} interval`, () => {
        const runTests = (props: CancelSubscriptionPanelProps) => {
          render(<CancelSubscriptionPanel {...props} />);

          const planPrice = formatPlanPricing(
            props.plan.amount,
            props.plan.currency,
            props.plan.interval,
            props.plan.interval_count
          );
          const nextBillDate = getLocalizedDateString(
            subscription.current_period_end,
            true
          );
          const nextBill = `Next billed on ${nextBillDate}`;

          expect(queryByTestId('price-details')).toBeInTheDocument();
          expect(queryByText(planPrice)).toBeInTheDocument();
          expect(queryByText(nextBill)).toBeInTheDocument();
          expect(
            queryByTestId('reveal-cancel-subscription-button')
          ).toBeInTheDocument();
        };

        it('handles an interval count of 1', () => {
          const plan_id = `plan_${v}`;
          const plan = findMockPlan(plan_id);
          runTests({ plan, ...baseProps });
        });

        it('handles an interval count that is not 1', () => {
          const plan_id = `plan_6${k}s`;
          const plan = findMockPlan(plan_id);
          runTests({ plan, ...baseProps });
        });
      });
    }

    describe('upgrade CTA', () => {
      it('should not be displayed when upgradeCTA is not in the plan', () => {
        const plan = findMockPlan('plan_daily');
        render(<CancelSubscriptionPanel {...baseProps} plan={plan} />);
        expect(queryByTestId('upgrade-cta')).not.toBeInTheDocument();
      });

      it('should be displayed when upgradeCTA is in the plan', () => {
        const plan = findMockPlan('plan_daily');
        const upgradeablePlan = {
          ...plan,
          plan_metadata: {
            upgradeCTA: 'Upgrade to the ultra super premium plus plan!',
          },
        };
        render(
          <CancelSubscriptionPanel {...baseProps} plan={upgradeablePlan} />
        );
        expect(queryByTestId('upgrade-cta')).toBeInTheDocument();
        expect(
          queryByText(upgradeablePlan.plan_metadata.upgradeCTA)
        ).toBeInTheDocument();
      });
    });

    describe('with l10n', () => {
      it('displays the correct pricing info with interval of 1', () => {
        const bundle = new FluentBundle('gd', { useIsolating: false });
        [
          `sub-plan-price-day = { $intervalCount ->
            [one] { $amount } fooly
            *[other] { $amount } barly { $intervalCount } 24hrs
          }`,
          'sub-next-bill = quuz { $date }',
          'payment-cancel-btn = blee',
        ].forEach((x) => bundle.addResource(new FluentResource(x)));
        const plan = findMockPlan('plan_daily');
        render(
          <LocalizationProvider bundles={[bundle]}>
            <CancelSubscriptionPanel {...baseProps} plan={plan} />
          </LocalizationProvider>
        );
        expect(queryByText('$5.00 fooly')).toBeInTheDocument();
        expect(queryByText('quuz 09/13/2019')).toBeInTheDocument();
        expect(queryByText('blee')).toBeInTheDocument();
      });

      it('displays the correct pricing info with interval > 1', () => {
        const bundle = new FluentBundle('gd', { useIsolating: false });
        [
          `sub-plan-price-day = { $intervalCount ->
            [one] { $amount } fooly
            *[other] { $amount } barly { $intervalCount } 24hrs
          }`,
        ].forEach((x) => bundle.addResource(new FluentResource(x)));
        const plan = { ...findMockPlan('plan_daily'), interval_count: 8 };

        render(
          <LocalizationProvider bundles={[bundle]}>
            <CancelSubscriptionPanel {...baseProps} plan={plan} />
          </LocalizationProvider>
        );
        expect(queryByText('$5.00 barly 8 24hrs')).toBeInTheDocument();
      });

      it('displays the correct cancellation info', () => {
        const bundle = new FluentBundle('gd', { useIsolating: false });
        [
          'sub-item-cancel-sub = no more',
          `sub-item-cancel-msg =
            Fromage pecorino blue castello { $name } after { $period }, sorry dude.`,
          `sub-item-cancel-confirm =
            Stilton when everybody's { $name } on { $period }.`,
          'sub-item-stay-sub = haha never mind',
        ].forEach((x) => bundle.addResource(new FluentResource(x)));
        const plan = findMockPlan('plan_daily');
        render(
          <LocalizationProvider bundles={[bundle]}>
            <CancelSubscriptionPanel {...baseProps} plan={plan} />
          </LocalizationProvider>
        );
        fireEvent.click(getByTestId('reveal-cancel-subscription-button'));
        expect(queryAllByText('no more').length).toBe(2);
        expect(
          queryByText(
            'Fromage pecorino blue castello FPN after September 13, 2019, sorry dude.'
          )
        ).toBeInTheDocument();
        expect(
          queryByText("Stilton when everybody's FPN on September 13, 2019.")
        ).toBeInTheDocument();
        expect(queryByText('haha never mind')).toBeInTheDocument();
      });
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      const plan = findMockPlan('plan_daily');
      render(<CancelSubscriptionPanel {...baseProps} plan={plan} />);
    });

    it('closes the cancellation confirmation on Stay Subscribed', () => {
      fireEvent.click(getByTestId('reveal-cancel-subscription-button'));
      expect(getByTestId('stay-subscribed-button')).toBeVisible();
      fireEvent.click(getByTestId('stay-subscribed-button'));
      expect(getByTestId('reveal-cancel-subscription-button')).toBeVisible();
    });

    it('enables Cancel Subscription button and confirms cancellation on click', async () => {
      fireEvent.click(getByTestId('reveal-cancel-subscription-button'));
      fireEvent.click(getByTestId('confirm-cancel-subscription-checkbox'));
      expect(getByTestId('cancel-subscription-button')).toBeVisible();
      expect(getByTestId('cancel-subscription-button')).toBeEnabled();
      await act(async () => {
        fireEvent.click(getByTestId('cancel-subscription-button'));
      });
      await waitForExpect(() => {
        expect(baseProps.cancelSubscription).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Amplitude', () => {
    it('logs metric events', async () => {
      (Amplitude.cancelSubscriptionMounted as jest.Mock).mockClear();
      (Amplitude.cancelSubscriptionEngaged as jest.Mock).mockClear();
      const plan = findMockPlan('plan_daily');
      render(<CancelSubscriptionPanel {...baseProps} plan={plan} />);
      fireEvent.click(getByTestId('reveal-cancel-subscription-button'));
      expect(Amplitude.cancelSubscriptionMounted).toHaveBeenCalledTimes(1);
      fireEvent.click(getByTestId('confirm-cancel-subscription-checkbox'));
      expect(Amplitude.cancelSubscriptionEngaged).toHaveBeenCalledTimes(1);
    });
  });
});
