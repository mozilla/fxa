import React from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import PaymentConfirmation from './index';
import { Customer, Profile, Plan } from '../../store/types';

const userProfile: Profile = {
  avatar: 'http://placekitten.com/256/256',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en-US',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
};

const selectedPlan: Plan = {
  plan_id: 'planId',
  product_id: 'fpnID',
  product_name: 'Firefox Private Network Pro',
  currency: 'usd',
  amount: 935,
  interval: 'month',
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
      plan_id: '123doneProMonthly',
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

const productUrl = 'https://mozilla.org';

storiesOf('components/PaymentConfirmation', module).add('default', () => (
  <MockApp>
    <PaymentConfirmation
      {...{ profile: userProfile, selectedPlan, customer, productUrl }}
    />
  </MockApp>
));
