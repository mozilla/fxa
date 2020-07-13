import React from 'react';
import {
  Stripe,
  PaymentMethod,
  PaymentIntent,
  SetupIntent,
} from '@stripe/stripe-js';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import MockApp, {
  defaultAppContextValue,
} from '../../../../.storybook/components/MockApp';
import { CUSTOMER, PROFILE, PLAN } from '../../../lib/mock-data';
import { APIError } from '../../../lib/apiClient';
import { PickPartial } from '../../../lib/types';
import { SignInLayout } from '../../../components/AppLayout';
import SubscriptionCreate, { SubscriptionCreateProps } from './index';

// TODO: Move to some shared lib?
const deepCopy = (object: Object) => JSON.parse(JSON.stringify(object));

// TODO: Move to some shared lib?
const wait = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

function init() {
  storiesOf('routes/ProductV2/SubscriptionCreate', module)
    .add('default', () => <Subject />)
    .add('with retry', () => (
      <Subject
        apiClientOverrides={{
          ...defaultApiClientOverrides,
          apiCreateSubscriptionWithPaymentMethod: async () => {
            const result = deepCopy(SUBSCRIPTION_RESULT);
            result.latest_invoice.payment_intent.status =
              'requires_payment_method';
            return result;
          },
        }}
      />
    ))
    .add('with confirmation', () => (
      <Subject
        apiClientOverrides={{
          ...defaultApiClientOverrides,
          apiCreateSubscriptionWithPaymentMethod: async () => {
            const result = deepCopy(SUBSCRIPTION_RESULT);
            result.latest_invoice.payment_intent.status = 'requires_action';
            return result;
          },
        }}
        stripeOverride={{
          ...defaultStripeOverride,
          confirmCardPayment: async () => {
            const didConfirm = window.confirm(
              'Pretend to authenticate with bank for payment?'
            );
            return {
              paymentIntent: {
                status: didConfirm ? 'succeeded' : 'requires_payment_method',
              } as PaymentIntent,
            };
          },
        }}
      />
    ));

  storiesOf('routes/ProductV2/SubscriptionCreate/failures', module)
    .add('createPaymentMethod', () => (
      <Subject
        stripeOverride={{
          ...defaultStripeOverride,
          createPaymentMethod: async () => {
            throw 'barf';
          },
        }}
      />
    ))
    .add('confirmCardPayment', () => (
      <Subject
        apiClientOverrides={{
          ...defaultApiClientOverrides,
          apiCreateSubscriptionWithPaymentMethod: async () => {
            const result = deepCopy(SUBSCRIPTION_RESULT);
            result.latest_invoice.payment_intent.status = 'requires_action';
            return result;
          },
        }}
        stripeOverride={{
          ...defaultStripeOverride,
          confirmCardPayment: async () => {
            throw 'barf';
          },
        }}
      />
    ))
    .add('apiCreateSubscriptionWithPaymentMethod', () => (
      <Subject
        apiClientOverrides={{
          apiCreateSubscriptionWithPaymentMethod: async () => {
            throw new APIError({
              statusCode: 500,
              message: 'Internal Server Error: Subscription creation failed',
            });
          },
        }}
      />
    ))
    .add('apiCreateCustomer', () => (
      <Subject
        customer={null}
        apiClientOverrides={{
          apiCreateCustomer: async () => {
            throw new APIError({
              statusCode: 500,
              message: 'Internal Server Error: Customer creation failed',
            });
          },
        }}
      />
    ))
    .add('apiRetryInvoice', () => (
      <Subject
        apiClientOverrides={{
          apiCreateSubscriptionWithPaymentMethod: async () => {
            const result = deepCopy(SUBSCRIPTION_RESULT);
            result.latest_invoice.payment_intent.status =
              'requires_payment_method';
            return result;
          },
          apiRetryInvoice: async () => {
            throw new APIError({
              statusCode: 500,
              message: 'Internal Server Error: Customer creation failed',
            });
          },
        }}
      />
    ));

  storiesOf('routes/ProductV2/SubscriptionCreate/errors', module)
    .add('card declined', () => (
      <Subject
        paymentErrorInitialState={{
          type: 'card_error',
          code: 'card_declined',
          message: 'Done goofed!', // should not be displayed
        }}
      />
    ))
    .add('incorrect cvc', () => (
      <Subject
        paymentErrorInitialState={{
          type: 'card_error',
          code: 'incorrect_cvc',
          message: 'Done goofed!', // should not be displayed
        }}
      />
    ))
    .add('card expired', () => (
      <Subject
        paymentErrorInitialState={{
          type: 'card_error',
          code: 'expired_card',
          message: 'Your card has expired.',
        }}
      />
    ))
    .add('other error', () => (
      <Subject
        paymentErrorInitialState={{
          type: 'api_error',
        }}
      />
    ));
}

const Subject = ({
  isMobile = false,
  customer = CUSTOMER,
  profile = PROFILE,
  selectedPlan = PLAN,
  apiClientOverrides = defaultApiClientOverrides,
  stripeOverride = defaultStripeOverride,
  refreshSubscriptions = linkTo('routes/Product', 'success'),
  ...props
}: PickPartial<
  SubscriptionCreateProps,
  'isMobile' | 'profile' | 'customer' | 'selectedPlan' | 'refreshSubscriptions'
>) => {
  return (
    <MockApp
      appContextValue={{
        ...defaultAppContextValue,
      }}
    >
      <SignInLayout>
        <SubscriptionCreate
          {...{
            isMobile,
            profile,
            customer,
            selectedPlan,
            refreshSubscriptions,
            apiClientOverrides,
            stripeOverride,
            ...props,
          }}
        />
      </SignInLayout>
    </MockApp>
  );
};

const SUBSCRIPTION_RESULT = {
  id: 'sub_1234',
  latest_invoice: {
    id: 'invoice_5678',
    payment_intent: {
      id: 'pi_7890',
      client_secret: 'cs_abcd',
      status: 'succeeded',
    },
  },
};

const RETRY_INVOICE_RESULT = {
  id: 'invoice_5678',
  payment_intent: {
    id: 'pi_9876',
    client_secret: 'cs_erty',
    status: 'succeeded',
  },
};

const defaultApiClientOverrides = {
  apiCreateCustomer: async () => CUSTOMER,
  apiCreateSubscriptionWithPaymentMethod: async () => SUBSCRIPTION_RESULT,
  apiRetryInvoice: async () => RETRY_INVOICE_RESULT,
};

const defaultStripeOverride: Pick<
  Stripe,
  'createPaymentMethod' | 'confirmCardPayment' | 'confirmCardSetup'
> = {
  createPaymentMethod: async () => {
    await wait(500);
    return {
      paymentMethod: { id: 'pm_4567' } as PaymentMethod,
      error: undefined,
    };
  },
  confirmCardPayment: async () => {
    return {
      paymentIntent: { status: 'succeeded' } as PaymentIntent,
      error: undefined,
    };
  },
  confirmCardSetup: async () => {
    await wait(500);
    return {
      setupIntent: { status: 'succeeded' } as SetupIntent,
      error: undefined,
    };
  },
};

init();
