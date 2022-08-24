import React from 'react';
import { action } from '@storybook/addon-actions';
import MockApp, {
  defaultAppContextValue,
} from '../../../.storybook/components/MockApp';
import { SignInLayout } from '../../components/AppLayout';
import { APIError } from '../../lib/apiClient';
import { PLANS } from '../../lib/mock-data';
import { QueryParams } from '../../lib/types';
import { Checkout, CheckoutProps } from './index';
import { Meta } from '@storybook/react';

export default {
  title: 'routes/Checkout',
  component: Checkout,
} as Meta;

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

const storyWithProps = (routeProps: CheckoutProps) => {
  const story = () => (
    <CheckoutRoute routeProps={routeProps} />
  )
  return story;
};

export const SubscribingWithANewAccount = storyWithProps({...MOCK_PROPS});

export const PlansLoading = storyWithProps({
  ...MOCK_PROPS,
  plans: { loading: true, error: null, result: null },
});

export const PlansError = storyWithProps({
  ...MOCK_PROPS,
  plans: {
    loading: false,
    result: null,
    error: new APIError({
      statusCode: 500,
      message: 'Internal Server Error',
    }),
  },
});
