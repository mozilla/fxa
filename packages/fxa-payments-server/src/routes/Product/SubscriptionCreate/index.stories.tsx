import { linkTo } from '@storybook/addon-links';
import { PaymentIntent, PaymentMethod, Stripe } from '@stripe/stripe-js';
import React from 'react';

import SubscriptionCreate, { SubscriptionCreateProps } from '.';
import MockApp, {
  defaultAppContextValue,
} from '../../../../.storybook/components/MockApp';
import { SignInLayout } from '../../../components/AppLayout';
import { APIError } from '../../../lib/apiClient';
import { CUSTOMER, NEW_CUSTOMER, PLAN, PROFILE } from '../../../lib/mock-data';
import { deepCopy, wait } from '../../../lib/test-utils';
import { PickPartial } from '../../../lib/types';

export default { title: 'routes/Product/SubscriptionCreate' };

export const base = () => <Subject setCoupon={() => {}} />;
export const withRetry = () => (
  <Subject
    setCoupon={() => {}}
    apiClientOverrides={{
      ...defaultApiClientOverrides,
      apiCreateSubscriptionWithPaymentMethod: async () => {
        const result = deepCopy(SUBSCRIPTION_RESULT);
        result.latest_invoice.payment_intent.status = 'requires_payment_method';
        return result;
      },
    }}
  />
);
export const withConfirmation = () => (
  <Subject
    setCoupon={() => {}}
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
);

export const failuresCreatePaymentMethod = () => (
  <Subject
    setCoupon={() => {}}
    stripeOverride={{
      ...defaultStripeOverride,
      createPaymentMethod: async () => {
        throw new Error('barf');
      },
    }}
  />
);
export const failuresConfirmCardPayment = () => (
  <Subject
    setCoupon={() => {}}
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
        throw new Error('barf');
      },
    }}
  />
);
export const failuresApiCreateSubscriptionWithPaymentMethod = () => (
  <Subject
    setCoupon={() => {}}
    apiClientOverrides={{
      apiCreateSubscriptionWithPaymentMethod: async () => {
        throw new APIError({
          statusCode: 500,
          message: 'Internal Server Error: Subscription creation failed',
        });
      },
    }}
  />
);
export const failuresApiCreateCustomer = () => (
  <Subject
    setCoupon={() => {}}
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
);
export const failuresApiRetryInvoice = () => (
  <Subject
    setCoupon={() => {}}
    apiClientOverrides={{
      apiCreateSubscriptionWithPaymentMethod: async () => {
        const result = deepCopy(SUBSCRIPTION_RESULT);
        result.latest_invoice.payment_intent.status = 'requires_payment_method';
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
);

export const errorsCardDeclined = () => (
  <Subject
    setCoupon={() => {}}
    subscriptionErrorInitialState={{
      type: 'card_error',
      code: 'card_declined',
      message: 'Should not be displayed',
    }}
  />
);
export const errorsIncorrectCvc = () => (
  <Subject
    setCoupon={() => {}}
    subscriptionErrorInitialState={{
      type: 'card_error',
      code: 'incorrect_cvc',
      message: 'Should not be displayed',
    }}
  />
);
export const errorsCardExpired = () => (
  <Subject
    setCoupon={() => {}}
    subscriptionErrorInitialState={{
      type: 'card_error',
      code: 'expired_card',
      message: 'Your card has expired.',
    }}
  />
);
export const errorsOtherError = () => (
  <Subject
    setCoupon={() => {}}
    subscriptionErrorInitialState={{
      type: 'api_error',
    }}
  />
);

const Subject = ({
  isMobile = false,
  customer = NEW_CUSTOMER,
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
    status: 'paid',
    payment_intent: {
      id: 'pi_7890',
      client_secret: 'cs_abcd',
      payment_method: 'pm_98765',
      status: 'succeeded',
    },
  },
};

const RETRY_INVOICE_RESULT = {
  id: 'invoice_5678',
  status: 'paid',
  payment_intent: {
    id: 'pi_9876',
    client_secret: 'cs_erty',
    payment_method: 'pm_98765',
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
  'createPaymentMethod' | 'confirmCardPayment'
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
};
