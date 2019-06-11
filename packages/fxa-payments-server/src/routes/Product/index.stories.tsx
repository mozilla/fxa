import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import MockApp, { defaultAppContextValue } from '../../../.storybook/components/MockApp';
import { QueryParams } from '../../lib/types';
import { SignInLayout } from '../../components/AppLayout';
import { Product, ProductProps } from './index';

function init() {
  storiesOf('routes/Product', module)
    .add('subscribing with existing account', () => (
      <ProductRoute />
    ))
    .add('subscribing with new account', () => (
      <ProductRoute queryParams={{ activated: '1' }} />
    ))
    .add('subscription success', () => (
      <ProductRoute routeProps={{
        ...MOCK_PROPS,
        customerSubscriptions: [
          {
            current_period_end: '123',
            current_period_start: '456',
            ended_at: null,
            nickname: 'Example Plan',
            plan_id: 'plan_123',
            status: 'active',
            subscription_id: 'sk_78987',          
          }
        ]
      }} />
    ))
    ;
}

type ProductRouteProps = {
  routeProps?: ProductProps,
  queryParams?: QueryParams,
}

const ProductRoute = ({
  routeProps = MOCK_PROPS,
  queryParams = defaultAppContextValue.queryParams
}: ProductRouteProps) => (
  <MockApp appContextValue={{
    ...defaultAppContextValue,
    queryParams
  }}>
    <SignInLayout>
      <Product {...routeProps } />
    </SignInLayout>
  </MockApp>
);

const PRODUCT_ID = 'product_8675309';

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
    plan_id: 'plan_123',
    plan_name: 'Example Plan',
    product_id: PRODUCT_ID,
    product_name: 'Example Product',
    currency: 'USD',
    amount: 1099,
    interval: 'month'
  }
];

const createSubscription = action('createSubscription');
const linkToSubscriptionSuccess = linkTo('routes/Product', 'subscription success');
/*
const onSubscriptionSuccess = () => {
  createSubscription();
  linkTo();
}
*/

const MOCK_PROPS: ProductProps = {
  match: {
    params: {
      productId: PRODUCT_ID
    }
  },
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
  createSubscriptionStatus: {
    error: null,
    loading: false,
    result: null,
  },
  customer: {
    error: null,
    loading: false,
    result: null,
  },
  customerSubscriptions: [],
  plansByProductId: (_: string) => PLANS,
  createSubscription: linkToSubscriptionSuccess, // action('createSubscription'),
  resetCreateSubscription: action('resetCreateSubscription'),
  fetchProductRouteResources: action('fetchProductRouteResources'),
};

init();