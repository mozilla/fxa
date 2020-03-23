import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import MockApp, {
  defaultAppContextValue,
} from '../../../.storybook/components/MockApp';
import { SettingsLayout } from '../../components/AppLayout';
import { Subscriptions, SubscriptionsProps } from './index';
import { QueryParams } from '../../lib/types';
import { APIError } from '../../lib/apiClient';
import { FetchState } from '../../store/types';
import { linkTo } from '@storybook/addon-links';

function init() {
  storiesOf('routes/Subscriptions', module)
    .add('loading', () => (
      <SubscriptionsRoute
        routeProps={{
          ...baseProps,
          subscriptions: {
            loading: true,
            error: null,
            result: null,
          },
        }}
      />
    ))
    .add('no subscription', () => <SubscriptionsRoute />)
    .add('subscribed', () => (
      <SubscriptionsRoute
        routeProps={{
          ...subscribedProps,
        }}
      />
    ))
    .add('subscribed with upgrade offer', () => (
      <SubscriptionsRoute
        routeProps={{
          ...subscribedProps,
          plans: {
            error: null,
            loading: false,
            result: [
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
            ],
          },
        }}
      />
    ))
    .add('updated payment', () => (
      <SubscriptionsRoute
        routeProps={{
          ...subscribedProps,
          updatePaymentStatus: {
            loading: false,
            error: null,
            result: true,
          },
        }}
      />
    ))
    .add('cancelled', () => (
      <SubscriptionsRoute
        routeProps={{
          ...cancelledProps,
          resetCancelSubscription: linkTo(
            'routes/Subscriptions',
            'reactivation'
          ),
          cancelSubscriptionStatus: {
            loading: false,
            error: null,
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
    .add('reactivation', () => (
      <SubscriptionsRoute
        routeProps={{
          ...cancelledProps,
          reactivateSubscription: linkToReactivationConfirmation,
        }}
      />
    ))
    .add('reactivation confirmation', () => (
      <SubscriptionsRoute
        routeProps={{
          ...subscribedProps,
          reactivateSubscriptionStatus: {
            loading: false,
            error: null,
            result: {
              subscriptionId: 'sub_5551212',
              plan: PLANS[0],
            },
          },
          resetReactivateSubscription: linkTo(
            'routes/Subscriptions',
            'subscribed'
          ),
        }}
      />
    ));
  storiesOf('routes/Subscriptions/errors', module)
    .add('profile', () => (
      <SubscriptionsRoute
        routeProps={{
          ...baseProps,
          profile: errorFetchState(),
        }}
      />
    ))
    .add('plans', () => (
      <SubscriptionsRoute
        routeProps={{
          ...baseProps,
          plans: errorFetchState(),
        }}
      />
    ))
    .add('subscriptions', () => (
      <SubscriptionsRoute
        routeProps={{
          ...baseProps,
          subscriptions: errorFetchState(),
        }}
      />
    ))
    .add('payment update', () => (
      <SubscriptionsRoute
        routeProps={{
          ...subscribedProps,
          updatePaymentStatus: {
            loading: false,
            result: null,
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
        routeProps={{
          ...reactivationErrorProps,
          reactivateSubscriptionStatus: errorFetchState(),
          resetReactivateSubscription: linkTo(
            'routes/Subscriptions',
            'reactivation'
          ),
        }}
      />
    ));
}

const linkToReactivationConfirmation = () =>
  linkTo('routes/Subscriptions', 'reactivation confirmation');

const errorFetchState = (): FetchState<any> => ({
  loading: false,
  result: null,
  error: new APIError({
    statusCode: 500,
    message: 'Internal Server Error',
  }),
});

type SubscriptionsRouteProps = {
  routeProps?: SubscriptionsProps;
  queryParams?: QueryParams;
  applyStubsToStripe?: (orig: stripe.Stripe) => stripe.Stripe;
};
const SubscriptionsRoute = ({
  routeProps = baseProps,
  queryParams = defaultAppContextValue.queryParams,
  applyStubsToStripe,
}: SubscriptionsRouteProps) => (
  <MockApp
    applyStubsToStripe={applyStubsToStripe}
    appContextValue={{
      ...defaultAppContextValue,
      queryParams,
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

const baseProps: SubscriptionsProps = {
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
  subscriptions: {
    error: null,
    loading: false,
    result: null,
  },
  customerSubscriptions: [],
  fetchSubscriptionsRouteResources: action('fetchSubscriptionsRouteResources'),
  cancelSubscription: () => linkTo('routes/Subscriptions', 'cancelled')(),
  reactivateSubscription: action('reactivateSubscription'),
  resetUpdatePayment: action('resetUpdatePayment'),
  resetCancelSubscription: action('resetCancelSubscription'),
  resetReactivateSubscription: action('resetReactivateSubscription'),
  updatePayment: () => linkTo('routes/Subscriptions', 'updated payment')(),
  updatePaymentStatus: {
    error: null,
    loading: false,
    result: null,
  },
  cancelSubscriptionStatus: {
    error: null,
    loading: false,
    result: null,
  },
  reactivateSubscriptionStatus: {
    error: null,
    loading: false,
    result: null,
  },
};

const subscribedProps: SubscriptionsProps = {
  ...baseProps,
  customer: {
    loading: false,
    error: null,
    result: {
      billing_name: 'Jane Doe',
      payment_type: 'card',
      last4: '8675',
      exp_month: '12',
      exp_year: '2028',
      brand: 'Visa',
      subscriptions: [],
    },
  },
  customerSubscriptions: [
    {
      current_period_end: (Date.now() + 86400) / 1000,
      current_period_start: (Date.now() - 86400) / 1000,
      cancel_at_period_end: false,
      end_at: null,
      latest_invoice: '628031D-0002',
      nickname: 'Example Plan',
      plan_id: PLAN_ID,
      status: 'active',
      subscription_id: 'sub_5551212',
    },
  ],
  subscriptions: {
    loading: false,
    error: null,
    result: [
      {
        subscriptionId: 'sub_5551212',
        productId: 'product_123',
        createdAt: Date.now(),
        cancelledAt: null,
      },
    ],
  },
};

const cancelledProps: SubscriptionsProps = {
  ...subscribedProps,
  customerSubscriptions: subscribedProps.customerSubscriptions
    ? [
        {
          ...subscribedProps.customerSubscriptions[0],
          cancel_at_period_end: true,
        },
      ]
    : null,
  subscriptions: {
    loading: false,
    error: null,
    result: [
      {
        subscriptionId: 'sub_5551212',
        productId: 'product_123',
        createdAt: Date.now() - 400000000,
        cancelledAt: Date.now() - 200000000,
      },
    ],
  },
};

const reactivationErrorProps = {
  ...cancelledProps,
  reactivateSubscriptionStatus: {
    loading: false,
    result: false,
    error: new APIError({
      statusCode: 500,
      message: 'reactivateSubscription API not implemented',
    }),
  },
};

init();
