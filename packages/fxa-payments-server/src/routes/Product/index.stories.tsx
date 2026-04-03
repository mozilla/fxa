import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import MockApp, {
  defaultAppContextValue,
} from '../../../.storybook/components/MockApp';
import { QueryParams } from '../../lib/types';
import { APIError } from '../../lib/apiClient';
import { SignInLayout } from '../../components/AppLayout';
import { Product, ProductProps } from './index';
import { Customer, Plan, Profile } from '../../store/types';
import { PAYPAL_CUSTOMER } from '../../lib/mock-data';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';
import { LatestInvoiceItems } from 'fxa-shared/dto/auth/payments/invoice';

const invoice: LatestInvoiceItems = {
  line_items: [],
  subtotal: 735,
  subtotal_excluding_tax: null,
  total: 735,
  total_excluding_tax: null,
};

type ProductRouteProps = {
  routeProps?: ProductProps;
  queryParams?: QueryParams;
  applyStubsToStripe?: (orig: stripe.Stripe) => stripe.Stripe;
};
const ProductRoute = ({
  routeProps = MOCK_PROPS,
  queryParams = defaultAppContextValue.queryParams,
  applyStubsToStripe,
}: ProductRouteProps) => (
  <MockApp
    applyStubsToStripe={applyStubsToStripe}
    appContextValue={{
      ...defaultAppContextValue,
      queryParams,
    }}
  >
    <SignInLayout>
      <Product {...routeProps} />
    </SignInLayout>
  </MockApp>
);

const PRODUCT_ID = 'product_8675309';

const PROFILE: Profile = {
  amrValues: [],
  avatar: 'http://placekitten.com/256/256',
  avatarDefault: false,
  displayName: 'Foo Barson',
  email: 'foo@example.com',
  locale: 'en',
  twoFactorAuthentication: true,
  uid: '8675309asdf',
  metricsEnabled: true,
};

const PLANS: Plan[] = [
  {
    plan_id: 'plan_123',
    product_id: PRODUCT_ID,
    product_name: 'Example Product',
    currency: 'USD',
    amount: 1050,
    interval: 'month' as const,
    interval_count: 1,
    active: true,
    plan_metadata: null,
    product_metadata: {
      webIconURL: 'http://placekitten.com/512/512',
      webIconBackground: 'linear-gradient(purple,lime)',
      'product:subtitle': 'Really keen product',
      'product:details:1':
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      'product:details:2': 'Sed ut perspiciatis unde omnis iste natus',
      'product:details:3': 'Nemo enim ipsam voluptatem',
      'product:details:4':
        'Ut enim ad minima veniam, quis nostrum exercitationem',
    },
  },
];

const CUSTOMER: Customer = {
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
      created: Date.now(),
      subscription_id: 'sub0.28964929339372136',
      plan_id: '123doneProMonthly',
      product_id: 'prod_123',
      product_name: '123done Pro',
      latest_invoice: '628031D-0002',
      latest_invoice_items: invoice,
      status: 'active',
      cancel_at_period_end: false,
      current_period_end: Date.now() / 1000 + 86400 * 31,
      current_period_start: Date.now() / 1000 - 86400 * 31,
      end_at: null,
      promotion_duration: null,
      promotion_end: null,
    },
  ],
};

const MOCK_PROPS: ProductProps = {
  profile: {
    error: null,
    loading: false,
    result: PROFILE,
  },
  plans: {
    error: null,
    loading: false,
    result: PLANS,
  },
  customer: {
    error: null,
    loading: false,
    result: null,
  },
  subscriptionChangeEligibility: {
    error: null,
    loading: false,
    result: null,
  },
  customerSubscriptions: [],
  plansByProductId: (_: string) => PLANS,
  fetchProductRouteResources: action('fetchProductRouteResources'),
  fetchCustomerAndSubscriptions: action('fetchProductRouteResources'),
  fetchSubscriptionChangeEligibility: action(
    'fetchSubscriptionChangeEligibility'
  ),
  updateSubscriptionPlanAndRefresh: action('updateSubscriptionPlanAndRefresh'),
  resetUpdateSubscriptionPlan: action('resetUpdateSubscriptionPlan'),
  updateSubscriptionPlanStatus: {
    error: null,
    loading: false,
    result: null,
  },
};

const meta: Meta = {
  title: 'routes/Product',
};
export default meta;

type Story = StoryObj;

export const SubscribingWithNewAccount: Story = {
  name: 'subscribing with new account',
  render: () => <ProductRoute />,
};

export const SubscribingWithExistingStripeAccount: Story = {
  name: 'subscribing with existing Stripe account',
  render: () => (
    <ProductRoute
      routeProps={{
        ...MOCK_PROPS,
        customer: {
          loading: false,
          error: null,
          result: CUSTOMER,
        },
      }}
    />
  ),
};

export const SubscribingWithExistingPayPalAccount: Story = {
  name: 'subscribing with existing PayPal account',
  render: () => (
    <ProductRoute
      routeProps={{
        ...MOCK_PROPS,
        customer: {
          loading: false,
          error: null,
          result: PAYPAL_CUSTOMER,
        },
      }}
    />
  ),
};

export const SuccessWithStripe: Story = {
  name: 'success with Stripe',
  render: () => (
    <ProductRoute
      routeProps={{
        ...MOCK_PROPS,
        customer: {
          loading: false,
          error: null,
          result: CUSTOMER,
        },
        customerSubscriptions: [
          {
            _subscription_type: MozillaSubscriptionTypes.WEB,
            created: Date.now(),
            current_period_end: Date.now() / 1000 + 86400,
            current_period_start: Date.now() / 1000 - 86400,
            cancel_at_period_end: false,
            end_at: null,
            product_name: 'Example Product',
            product_id: 'prod_123',
            latest_invoice: '628031D-0002',
            latest_invoice_items: invoice,
            plan_id: 'plan_123',
            status: 'active',
            subscription_id: 'sk_78987',
            promotion_duration: null,
            promotion_end: null,
          },
        ],
      }}
    />
  ),
};

export const SuccessWithPayPal: Story = {
  name: 'success with PayPal',
  render: () => (
    <ProductRoute
      routeProps={{
        ...MOCK_PROPS,
        customer: {
          loading: false,
          error: null,
          result: PAYPAL_CUSTOMER,
        },
        customerSubscriptions: PAYPAL_CUSTOMER.subscriptions,
      }}
    />
  ),
};

export const ProfileLoading: Story = {
  name: 'page load - profile loading',
  render: () => (
    <ProductRoute
      routeProps={{
        ...MOCK_PROPS,
        profile: { loading: true, error: null, result: null },
      }}
    />
  ),
};

export const ProfileError: Story = {
  name: 'page load - profile error',
  render: () => (
    <ProductRoute
      routeProps={{
        ...MOCK_PROPS,
        profile: {
          loading: false,
          result: null,
          error: new APIError({
            statusCode: 500,
            message: 'Internal Server Error',
          }),
        },
      }}
    />
  ),
};

export const CustomerLoading: Story = {
  name: 'page load - customer loading',
  render: () => (
    <ProductRoute
      routeProps={{
        ...MOCK_PROPS,
        customer: { loading: true, error: null, result: null },
      }}
    />
  ),
};

export const CustomerError: Story = {
  name: 'page load - customer error',
  render: () => (
    <ProductRoute
      routeProps={{
        ...MOCK_PROPS,
        customer: {
          loading: false,
          result: null,
          error: new APIError({
            statusCode: 500,
            message: 'Internal Server Error',
          }),
        },
      }}
    />
  ),
};

export const PlansLoading: Story = {
  name: 'page load - plans loading',
  render: () => (
    <ProductRoute
      routeProps={{
        ...MOCK_PROPS,
        plans: { loading: true, error: null, result: null },
      }}
    />
  ),
};

export const PlansError: Story = {
  name: 'page load - plans error',
  render: () => (
    <ProductRoute
      routeProps={{
        ...MOCK_PROPS,
        plans: {
          loading: false,
          result: null,
          error: new APIError({
            statusCode: 500,
            message: 'Internal Server Error',
          }),
        },
      }}
    />
  ),
};

export const PlanChangeEligibilityLoading: Story = {
  name: 'page load - plan change eligibility loading',
  render: () => (
    <ProductRoute
      routeProps={{
        ...MOCK_PROPS,
        subscriptionChangeEligibility: {
          loading: true,
          error: null,
          result: null,
        },
      }}
    />
  ),
};

export const UnsupportedLocation: Story = {
  name: 'page load - unsupported location',
  render: () => (
    <ProductRoute
      routeProps={{
        ...MOCK_PROPS,
        plans: {
          loading: false,
          error: new APIError({ errno: 213 }),
          result: null,
        },
      }}
    />
  ),
};
