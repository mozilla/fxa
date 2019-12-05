import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import MockApp, {
  defaultAppContextValue,
} from '../../../.storybook/components/MockApp';
import { SettingsLayout } from '../../components/AppLayout';
import { Subscriptions, SubscriptionsProps } from './index';
import {
  QueryParams,
  Plan,
  Profile,
  Customer,
  Subscription,
} from '../../lib/types';
import { APIError } from '../../lib/apiClient';
import { linkTo } from '@storybook/addon-links';
import { PromiseState } from '../../lib/hooks';

function init() {
  storiesOf('routes/Subscriptions', module)
    .add('no subscription', () => <SubscriptionsRoute />)
    .add('subscribed', () => <SubscriptionsRoute {...subscribedProps} />)
    .add('subscribed with upgrade offer', () => (
      <SubscriptionsRoute
        {...subscribedProps}
        plans={[
          {
            ...PLANS[0],
            product_name: 'Upgradable Product',
            product_metadata: {
              upgradeCTA: `
                Interested in better features?
                Upgrade to <a href="http://mozilla.org">the Upgrade Product</a>!
              `,
            },
          },
        ]}
      />
    ))
    .add('updated payment', () => (
      <SubscriptionsRoute
        {...subscribedProps}
        routeProps={{
          ...baseRouteProps,
          initialUpdatePaymentStatus: {
            pending: false,
            error: undefined,
            result: true,
          },
        }}
      />
    ))
    .add('cancelled', () => (
      <SubscriptionsRoute
        {...cancelledProps}
        routeProps={{
          ...baseRouteProps,
          initialCancelSubscriptionStatus: {
            pending: false,
            error: undefined,
            result: {
              subscriptionId: 'sub_5551212',
              productId: 'product_123',
              createdAt: Date.now() - 86400000,
              cancelledAt: Date.now(),
            },
          },
        }}
      />
    ))
    .add('reactivation', () => <SubscriptionsRoute {...cancelledProps} />)
    .add('reactivation confirmation', () => (
      <SubscriptionsRoute
        {...subscribedProps}
        routeProps={{
          ...baseRouteProps,
          initialReactivateSubscriptionStatus: {
            pending: false,
            error: undefined,
            result: {
              subscriptionId: 'sub_5551212',
              plan: PLANS[0],
            },
          },
        }}
      />
    ));
  storiesOf('routes/Subscriptions/errors', module)
    .add('payment update', () => (
      <SubscriptionsRoute
        {...subscribedProps}
        routeProps={{
          ...baseRouteProps,
          initialUpdatePaymentStatus: {
            pending: false,
            result: undefined,
            error: new APIError({
              // Copy / paste of error content from API
              code: 'expired_card',
              message: 'Your card has expired.',
              errno: 181,
              error: 'Bad Request',
              info:
                'https://github.com/mozilla/fxa/blob/master/packages/fxa-auth-server/docs/api.md#response-format',
            }),
          },
        }}
      />
    ))
    .add('reactivation', () => (
      <SubscriptionsRoute
        {...cancelledProps}
        routeProps={{
          ...baseRouteProps,
          initialReactivateSubscriptionStatus: {
            pending: false,
            result: undefined,
            error: new APIError({
              statusCode: 500,
              message: 'Internal Server Error',
            }),
          },
        }}
      />
    ));
}

type SubscriptionsRouteProps = {
  routeProps?: SubscriptionsProps;
  queryParams?: QueryParams;
  applyStubsToStripe?: (orig: stripe.Stripe) => stripe.Stripe;
  plans?: Plan[];
  profile?: Profile;
  customer?: Customer;
  subscriptions?: Subscription[];
};
const SubscriptionsRoute = ({
  routeProps = baseRouteProps,
  queryParams = defaultAppContextValue.queryParams,
  applyStubsToStripe,
  plans = PLANS,
  profile = PROFILE,
  customer,
  subscriptions,
}: SubscriptionsRouteProps) => (
  <MockApp
    applyStubsToStripe={applyStubsToStripe}
    appContextValue={{
      ...defaultAppContextValue,
      queryParams,
      plans,
      profile,
      customer,
      subscriptions,
    }}
  >
    <SettingsLayout>
      <Subscriptions {...routeProps} />
    </SettingsLayout>
  </MockApp>
);

const PRODUCT_ID = 'product_8675309';
const PLAN_ID = 'plan_123';

const PROFILE = {
  amrValues: [],
  avatar: 'http://placekitten.com/256/256',
  avatarDefault: false,
  displayName: 'Foo Barson',
  email: 'foo@example.com',
  locale: 'en-US',
  twoFactorAuthentication: true,
  uid: '8675309asdf',
};

const PLANS = [
  {
    plan_id: PLAN_ID,
    plan_name: 'Example Plan',
    product_id: PRODUCT_ID,
    product_name: 'Example Product',
    currency: 'USD',
    amount: 1099,
    interval: 'month',
    product_metadata: {
      webIconURL: 'http://placekitten.com/512/512',
    },
  },
];

const baseRouteProps = { match: { params: {} } };

const subscribedProps = {
  customer: {
    payment_type: 'card',
    last4: '8675',
    exp_month: '12',
    exp_year: '2028',
    subscriptions: [
      {
        current_period_end: (Date.now() + 86400) / 1000,
        current_period_start: (Date.now() - 86400) / 1000,
        cancel_at_period_end: false,
        end_at: null,
        nickname: 'Example Plan',
        plan_id: PLAN_ID,
        status: 'active',
        subscription_id: 'sub_5551212',
      },
    ],
  },
  subscriptions: [
    {
      subscriptionId: 'sub_5551212',
      productId: 'product_123',
      createdAt: Date.now(),
      cancelledAt: null,
    },
  ],
};

const cancelledProps = {
  customer: {
    payment_type: 'card',
    last4: '8675',
    exp_month: '12',
    exp_year: '2028',
    subscriptions: [
      {
        current_period_end: (Date.now() + 86400) / 1000,
        current_period_start: (Date.now() - 86400) / 1000,
        cancel_at_period_end: true,
        end_at: null,
        nickname: 'Example Plan',
        plan_id: PLAN_ID,
        status: 'active',
        subscription_id: 'sub_5551212',
      },
    ],
  },
  subscriptions: [
    {
      subscriptionId: 'sub_5551212',
      productId: 'product_123',
      createdAt: Date.now() - 400000000,
      cancelledAt: Date.now() - 200000000,
    },
  ],
};

init();
