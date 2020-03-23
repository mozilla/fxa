import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import PaymentConfirmation from './index';
import { Customer } from '../../store/types';

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

const selectedPlan = {
  plan_id: 'planId',
  plan_name: 'Pro level',
  product_id: 'fpnID',
  product_name: 'Firefox Private Network Pro',
  currency: 'usd',
  amount: 935,
  interval: 'mos',
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
      invoice_number: '628031D-0002',
      subscription_id: 'sub0.28964929339372136',
      plan_id: '123doneProMonthly',
      nickname: '123done Pro Monthly',
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
          {...{ profile: userProfile, selectedPlan, customer }}
        />
      );
    };

    const { queryByTestId } = subject();
    const footer = queryByTestId('footer');
    expect(footer).toBeVisible();
  });
});
