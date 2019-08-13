import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Subscriptions, SubscriptionsProps } from './index';
import {
  AppContext,
  AppContextType,
  defaultAppContext,
} from '../../lib/AppContext';
import { defaultConfig } from '../../lib/config';
import { Customer, Profile, Subscription } from '../../store/types';

beforeEach(() => {});

afterEach(cleanup);

const mockProfile: Profile = {
  amrValues: [],
  avatar: 'avatar',
  avatarDefault: true,
  displayName: null,
  email: 'email',
  locale: 'locale',
  twoFactorAuthentication: false,
  uid: 'uid',
};
const mockCustomer: Customer = {
  payment_type: 'cc',
  last4: '4444',
  exp_month: '12',
  exp_year: '22',
  subscriptions: [],
};
const mockSubscription: Subscription = {
  subscriptionId: 'abc',
  cancelledAt: null,
  createdAt: Date.now(),
  productName: 'pro jest',
};
const mockPlan = {
  plan_id: 'abc',
  plan_name: 'abc',
  product_id: 'abc',
  product_name: 'abc',
  currency: 'abc',
  amount: 100,
  interval: 'abc',
};
const mockCustomerSubscription = {
  cancel_at_period_end: false,
  current_period_end: 99,
  current_period_start: 9,
  end_at: null,
  nickname: 'abc',
  plan_id: 'abc',
  status: 'abc',
  subscription_id: 'abc',
};
const mockedSubscriptionsProps = {
  profile: { error: null, loading: false, result: mockProfile },
  plans: { error: null, loading: false, result: [mockPlan] },
  customer: { error: null, loading: false, result: mockCustomer },
  subscriptions: { error: null, loading: false, result: [mockSubscription] },
  customerSubscriptions: [mockCustomerSubscription],
  fetchSubscriptionsRouteResources: jest.fn(),
  cancelSubscription: jest.fn(),
  cancelSubscriptionStatus: {
    error: null,
    loading: false,
    result: mockSubscription,
  },
  resetCancelSubscription: jest.fn(),
  reactivateSubscription: jest.fn(),
  reactivateSubscriptionStatus: { error: null, loading: false, result: null },
  resetReactivateSubscription: jest.fn(),
  updatePayment: jest.fn(),
  updatePaymentStatus: { error: null, loading: false, result: null },
  resetUpdatePayment: jest.fn(),
};
const Subject = (props: SubscriptionsProps) => {
  const config = defaultConfig();
  const appContextValue = {
    ...defaultAppContext,
    config: {
      ...config,
      servers: {
        ...config.servers,
        content: {
          url: 'http://127.0.0.1:3030'
        }
      }
    },
    queryParams: { successfulSupportTicketSubmission: 'quux' },
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <Subscriptions {...props} />
    </AppContext.Provider>
  );
};

it('renders successful support ticket submission messsage when query param exists', () => {
  const { getByTestId } = render(<Subject {...mockedSubscriptionsProps} />);
  expect(getByTestId('supportFormSuccess')).toBeInTheDocument();
});
