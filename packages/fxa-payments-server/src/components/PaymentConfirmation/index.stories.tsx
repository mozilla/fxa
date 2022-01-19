import React from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import PaymentConfirmation from './index';
import { Customer, Profile, Plan } from '../../store/types';
import { PAYPAL_CUSTOMER } from '../../lib/mock-data';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';
import { Coupon } from '../../lib/Coupon';

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
  interval: 'month' as const,
  interval_count: 1,
  plan_metadata: null,
  product_metadata: null,
};

const selectedPlanWithMetadata: Plan = {
  ...selectedPlan,
  product_metadata: {
    'product:successActionButtonLabel': 'Do something else',
    'product:successActionButtonLabel:xx-pirate': 'Yarr...',
  },
};

const customer: Customer = {
  billing_name: 'Jane Doe',
  payment_provider: 'stripe',
  payment_type: 'credit',
  last4: '5309',
  exp_month: '02',
  exp_year: '2099',
  brand: 'Visa',
  subscriptions: [
    {
      _subscription_type: MozillaSubscriptionTypes.WEB,
      latest_invoice: '628031D-0002',
      subscription_id: 'sub0.28964929339372136',
      plan_id: '123doneProMonthly',
      product_id: 'prod_123',
      product_name: '123 Done Pro',
      status: 'active',
      cancel_at_period_end: false,
      created: Date.now(),
      current_period_end: Date.now() / 10 + 86400 * 31,
      current_period_start: Date.now() / 1000 - 86400 * 31,
      end_at: null,
    },
  ],
};

const productUrl = 'https://mozilla.org';

const coupon: Coupon = {
  discountAmount: 200,
  promotionCode: 'TEST',
  type: '',
  valid: true,
};

storiesOf('components/PaymentConfirmation', module)
  .add('default', () => (
    <MockApp>
      <PaymentConfirmation
        {...{ profile: userProfile, selectedPlan, customer, productUrl }}
      />
    </MockApp>
  ))
  .add('custom action button label', () => (
    <MockApp>
      <PaymentConfirmation
        {...{
          profile: userProfile,
          selectedPlan: selectedPlanWithMetadata,
          customer,
          productUrl,
        }}
      />
    </MockApp>
  ))
  .add('custom action button label localized to xx-pirate', () => (
    <MockApp languages={['xx-pirate']}>
      <PaymentConfirmation
        {...{
          profile: userProfile,
          selectedPlan: selectedPlanWithMetadata,
          customer,
          productUrl,
        }}
      />
    </MockApp>
  ))
  .add('paypal', () => (
    <MockApp>
      <PaymentConfirmation
        {...{
          profile: userProfile,
          selectedPlan,
          customer: PAYPAL_CUSTOMER,
          productUrl,
        }}
      />
    </MockApp>
  ))
  .add('with passwordless account', () => (
    <MockApp>
      <PaymentConfirmation
        {...{
          profile: userProfile,
          selectedPlan,
          customer: PAYPAL_CUSTOMER,
          productUrl,
          accountExists: false,
        }}
      />
    </MockApp>
  ))
  .add('with coupon', () => (
    <MockApp>
      <PaymentConfirmation
        {...{
          profile: userProfile,
          selectedPlan,
          customer: PAYPAL_CUSTOMER,
          productUrl,
          coupon,
        }}
      />
    </MockApp>
  ));
