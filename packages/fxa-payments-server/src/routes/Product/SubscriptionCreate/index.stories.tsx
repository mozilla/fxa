import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import MockApp, {
  defaultAppContextValue,
} from '../../../../.storybook/components/MockApp';
import { Subscription } from '../../../lib/types';
import { SignInLayout } from '../../../components/AppLayout';
import { State as ValidatorState } from '../../../lib/validator';
import { SubscriptionCreate, SubscriptionCreateProps } from './index';
import { Customer, Plan, Profile } from '../../../lib/types';

import '../index.scss';

function init() {
  storiesOf('routes/Product', module)
    .add('subscribing with existing account', () => (
      <Subject selectedPlan={PLANS[0]} />
    ))
    .add('subscribing with new account', () => (
      <Subject accountActivated={true} selectedPlan={PLANS[0]} />
    ))
    .add('success', () => (
      <Subject
        selectedPlan={PLANS[0]}
        customer={{
          ...CUSTOMER,
          subscriptions: [
            {
              current_period_end: Date.now() / 1000 + 86400,
              current_period_start: Date.now() / 1000 - 86400,
              cancel_at_period_end: false,
              end_at: null,
              nickname: 'Example Plan',
              plan_id: 'plan_123',
              status: 'active',
              subscription_id: 'sk_78987',
            },
          ],
        }}
      />
    ));

  storiesOf('routes/Product/payment failures', module)
    .add('card declined', () => (
      <Subject
        selectedPlan={PLANS[0]}
        initialCreateSubscriptionStatus={{
          result: undefined,
          pending: false,
          error: {
            // Copy / paste of error content from API
            code: 'expired_card',
            message: 'Your card has expired.',
            errno: 181,
            error: 'Bad Request',
            info:
              'https://github.com/mozilla/fxa/blob/master/packages/fxa-auth-server/docs/api.md#response-format',
            statusCode: 402,
          },
        }}
      />
    ))
    .add('miscellaneous', () => (
      <Subject
        selectedPlan={PLANS[0]}
        initialCreateSubscriptionStatus={{
          result: undefined,
          pending: false,
          error: {
            code: '',
            message: 'Payment server request failed.',
          },
        }}
      />
    ))
    .add('stripe.createToken() fails on submit', () => {
      const validatorInitialState = mkValidPaymentFormState();
      const applyStubsToStripe = (stripe: stripe.Stripe) => {
        stripe.createToken = (element: stripe.elements.Element | string) => {
          return Promise.reject({
            type: 'api_error',
            message: 'The Stripe system is down.',
          });
        };
        return stripe;
      };
      return (
        <Subject
          selectedPlan={PLANS[0]}
          applyStubsToStripe={applyStubsToStripe}
          {...{
            validatorInitialState,
          }}
        />
      );
    });
}

type SubjectProps = SubscriptionCreateProps & {
  applyStubsToStripe?: (orig: stripe.Stripe) => stripe.Stripe;
  plans?: Plan[];
  profile?: Profile;
  customer?: Customer;
  subscriptions?: Subscription[];
};
const Subject = ({
  applyStubsToStripe,
  plans = PLANS,
  profile = PROFILE,
  customer = CUSTOMER,
  subscriptions = undefined,
  ...subjectProps
}: SubjectProps) => (
  <MockApp
    applyStubsToStripe={applyStubsToStripe}
    appContextValue={{
      ...defaultAppContextValue,
      plans,
      profile,
      customer,
      subscriptions,
    }}
  >
    <SignInLayout>
      <SubscriptionCreate {...subjectProps} />
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
  locale: 'en-US',
  twoFactorAuthentication: true,
  uid: '8675309asdf',
};

const PLANS: Plan[] = [
  {
    plan_id: 'plan_123',
    plan_name: 'Example Plan',
    product_id: PRODUCT_ID,
    product_name: 'Example Product',
    currency: 'USD',
    amount: 1050,
    interval: 'month',
    product_metadata: {
      webIconURL: 'http://placekitten.com/512/512',
    },
  },
];

const CUSTOMER: Customer = {
  payment_type: 'credit',
  last4: '5309',
  exp_month: '02',
  exp_year: '2099',
  subscriptions: [
    {
      subscription_id: 'sub0.28964929339372136',
      plan_id: '123doneProMonthly',
      nickname: '123done Pro Monthly',
      status: 'active',
      cancel_at_period_end: false,
      current_period_end: Date.now() / 1000 + 86400 * 31,
      current_period_start: Date.now() / 1000 - 86400 * 31,
      end_at: null,
    },
  ],
};

const mkValidPaymentFormState = (): ValidatorState => ({
  error: null,
  fields: {
    name: {
      value: 'Foo Barson',
      valid: true,
      error: null,
      fieldType: 'input',
      required: true,
    },
    zip: {
      value: '90210',
      valid: true,
      error: null,
      fieldType: 'input',
      required: true,
    },
    creditCardNumber: {
      value: true,
      valid: null,
      error: null,
      fieldType: 'stripe',
      required: true,
    },
    expDate: {
      value: true,
      valid: null,
      error: null,
      fieldType: 'stripe',
      required: true,
    },
    cvc: {
      value: true,
      valid: null,
      error: null,
      fieldType: 'stripe',
      required: true,
    },
    confirm: {
      value: true,
      valid: true,
      error: null,
      fieldType: 'input',
      required: true,
    },
    submit: {
      value: null,
      valid: null,
      error: null,
      fieldType: 'input',
      required: false,
    },
  },
});

init();
