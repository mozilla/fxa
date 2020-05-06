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
  billing_name: 'Foo Barson',
  payment_type: 'credit',
  last4: '5309',
  exp_month: '02',
  exp_year: '2099',
  brand: 'Visa',
  subscriptions: [
    {
      subscription_id: 'sub0.28964929339372136',
      plan_id: '123doneProMonthly',
      product_id: 'prod_123',
      product_name: '123done Pro',
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
  product_id: PRODUCT_ID,
  product_name: 'Better Upgrade Product',
  currency: 'USD',
  amount: 2999,
  interval: 'month' as const,
  interval_count: 1,
  product_metadata: {
    webIconURL: 'http://placekitten.com/49/49?image=2',
    'product:subtitle': 'Even more keen product',
    'product:details:1': 'Quis autem vel eum iure reprehenderit',
    'product:details:2': 'Sed ut perspiciatis unde omnis iste natus',
    'product:details:3': 'Nemo enim ipsam voluptatem',
    'product:subtitle:xx-pirate': 'VPN fer land lubbers',
    'product:details:1:xx-pirate': 'Device-level encryption arr',
    'product:details:2:xx-pirate': 'Servers is 30+ countries matey',
    'product:details:3:xx-pirate': "Connects 5 devices wit' one subscription",
  },
};

export const UPGRADE_FROM_PLAN: Plan = {
  plan_id: 'plan_abc',
  product_id: PRODUCT_ID,
  product_name: 'Example Product',
  currency: 'USD',
  amount: 999,
  interval: 'month' as const,
  interval_count: 1,
  product_metadata: {
    webIconURL: 'http://placekitten.com/49/49?image=9',
    'product:subtitle': 'Nifty product',
    'product:details:1':
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    'product:details:2': 'Sed ut perspiciatis unde omnis iste natus',
    'product:details:3': 'Nemo enim ipsam voluptatem',
    'product:details:4':
      'Ut enim ad minima veniam, quis nostrum exercitationem',
    'product:subtitle:xx-pirate': 'VPN fer yer full-device',
    'product:details:1:xx-pirate': 'Device-level encryption arr',
    'product:details:2:xx-pirate': 'Servers is 30+ countries matey',
    'product:details:3:xx-pirate': "Connects 5 devices wit' one subscription",
  },
};
