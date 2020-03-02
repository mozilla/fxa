import { Profile, Plan, Customer } from '../../../store/types';

export const PROFILE: Profile = {
  amrValues: [],
  avatar: 'http://placekitten.com/256/256?image=11',
  avatarDefault: false,
  displayName: 'Foo Barson',
  email: 'foo@example.com',
  locale: 'en-US',
  twoFactorAuthentication: true,
  uid: '8675309asdf',
};

export const CUSTOMER: Customer = {
  payment_type: 'credit',
  last4: '5309',
  exp_month: '02',
  exp_year: '2099',
  brand: 'Visa',
  subscriptions: [
    {
      subscription_id: 'sub0.28964929339372136',
      plan_id: '123doneProMonthly',
      nickname: '123done Pro Monthly',
      latest_invoice: '628031D-0002',
      status: 'active',
      cancel_at_period_end: false,
      current_period_end: Date.now() / 1000 + 86400 * 31,
      current_period_start: Date.now() / 1000 - 86400 * 31,
      end_at: null,
    },
  ],
};

export const PRODUCT_ID = 'product_8675309';

export const SELECTED_PLAN: Plan = {
  plan_id: 'plan_123',
  plan_name: 'Better Upgrade Plan',
  product_id: PRODUCT_ID,
  product_name: 'Better Upgrade Product',
  currency: 'USD',
  amount: 2999,
  interval: 'month',
  product_metadata: {
    webIconURL: 'http://placekitten.com/49/49?image=2',
  },
};

export const UPGRADE_FROM_PLAN: Plan = {
  plan_id: 'plan_abc',
  plan_name: 'Example Plan',
  product_id: PRODUCT_ID,
  product_name: 'Example Product',
  currency: 'USD',
  amount: 999,
  interval: 'month',
  product_metadata: {
    webIconURL: 'http://placekitten.com/49/49?image=9',
  },
};
