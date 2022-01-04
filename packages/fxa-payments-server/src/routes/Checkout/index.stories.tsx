import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import MockApp, {
  defaultAppContextValue,
} from '../../../.storybook/components/MockApp';
import { QueryParams } from '../../lib/types';
import { APIError } from '../../lib/apiClient';
import { SignInLayout } from '../../components/AppLayout';
import { Checkout, CheckoutProps } from './index';
import { PLANS, PRODUCT_ID } from '../../lib/mock-data';
import { linkTo } from '@storybook/addon-links';

function init() {
  storiesOf('routes/Checkout', module)
    .add('subscribing with a new account', () => (
      <CheckoutRoute
        routeProps={{
          ...MOCK_PROPS,
        }}
      />
    ))
    .add('plans loading', () => (
      <CheckoutRoute
        routeProps={{
          ...MOCK_PROPS,
          plans: { loading: true, error: null, result: null },
        }}
      />
    ))
    .add('plans error', () => (
      <CheckoutRoute
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
    ));
}

type CheckoutRouteProps = {
  routeProps?: CheckoutProps;
  queryParams?: QueryParams;
  applyStubsToStripe?: (orig: stripe.Stripe) => stripe.Stripe;
};
const CheckoutRoute = ({
  routeProps = MOCK_PROPS,
  queryParams = defaultAppContextValue.queryParams,
  applyStubsToStripe,
}: CheckoutRouteProps) => (
  <MockApp
    applyStubsToStripe={applyStubsToStripe}
    appContextValue={{
      ...defaultAppContextValue,
      queryParams,
    }}
  >
    <SignInLayout>
      <Checkout {...routeProps} />
    </SignInLayout>
  </MockApp>
);

const MOCK_PROPS: CheckoutProps = {
  plans: {
    error: null,
    loading: false,
    result: PLANS,
  },
  plansByProductId: (_: string) => PLANS,
  fetchCheckoutRouteResources: action('fetchCheckoutRouteResources'),
};

init();
