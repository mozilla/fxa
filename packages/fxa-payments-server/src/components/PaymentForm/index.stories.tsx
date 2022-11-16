import React from 'react';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import MockApp from '../../../.storybook/components/MockApp';
import PaymentForm, { PaymentFormProps } from './index';
import { State as ValidatorState } from '../../lib/validator';
import { Customer } from '../../store/types';
import { useNonce } from '../../lib/hooks';
import { SignInLayout } from '../AppLayout';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';

export default {
  title: 'components/PaymentFormV2',
  component: PaymentForm,
} as Meta;

const PRODUCT_ID = 'product_8675309';
const PLAN_ID = 'plan_123';
const PLAN = {
  plan_id: PLAN_ID,
  product_id: PRODUCT_ID,
  product_name: 'Example Product',
  currency: 'USD',
  amount: 1099,
  interval: 'month' as const,
  interval_count: 1,
  active: true,
  plan_metadata: null,
  product_metadata: {
    'product:termsOfServiceURL':
      'https://www.mozilla.org/en-US/about/legal/terms/services/',
    'product:termsOfServiceURL:fr':
      'https://www.mozilla.org/fr/about/legal/terms/services/',
    'product:privacyNoticeURL':
      'https://www.mozilla.org/en-US/privacy/websites/',
    'product:privacyNoticeURL:fr':
      'https://www.mozilla.org/fr/privacy/websites/',
  },
};
const CUSTOMER: Customer = {
  billing_name: 'Foo Barson',
  payment_provider: 'stripe',
  payment_type: 'credit',
  last4: '5309',
  exp_month: '02',
  exp_year: '2099',
  brand: 'Visa',
  subscriptions: [
    {
      _subscription_type: MozillaSubscriptionTypes.WEB,
      subscription_id: 'sub0.28964929339372136',
      plan_id: '123doneProMonthly',
      product_id: 'prod_123',
      product_name: '123done Pro',
      latest_invoice: '628031D-0002',
      status: 'active',
      cancel_at_period_end: false,
      created: Date.now(),
      current_period_end: Date.now() / 1000 + 86400 * 31,
      current_period_start: Date.now() / 1000 - 86400 * 31,
      end_at: null,
      promotion_duration: null,
      promotion_end: null,
    },
  ],
};

const mockValidatorState = (): ValidatorState => ({
  error: null,
  fields: {
    name: {
      value: null,
      valid: null,
      error: null,
      fieldType: 'input',
      required: true,
    },
    creditCard: {
      value: null,
      valid: null,
      error: null,
      fieldType: 'stripe',
      required: true,
    },
    confirm: {
      value: null,
      valid: null,
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

type MostPaymentFormProps = Omit<PaymentFormProps, 'submitNonce'>;

const defaultPaymentFormProps: MostPaymentFormProps = {
  locale: 'auto',
  inProgress: false,
  confirm: false,
  customer: undefined,
  plan: PLAN,
  onSubmit: action('onSubmit'),
  onChange: () => {},
  onMounted: () => {},
  onEngaged: () => {},
  getString: (x: string) => x,
};

const storyWithProps = (paymentFormProps: MostPaymentFormProps) => {
  return () => {
    const [submitNonce, refreshSubmitNonce] = useNonce();
    const { locale } = paymentFormProps;
    return (
      <MockApp languages={[locale || 'auto']}>
        <SignInLayout>
          <div className="product-payment">
            <button className="button" onClick={refreshSubmitNonce}>
              Refresh submit nonce
            </button>
            <p>Current nonce: {submitNonce}</p>
            <PaymentForm {...paymentFormProps} submitNonce={submitNonce} />
          </div>
        </SignInLayout>
      </MockApp>
    );
  };
};

export const Default = storyWithProps(defaultPaymentFormProps);

export const WithExistingCard = storyWithProps({
  ...defaultPaymentFormProps,
  customer: CUSTOMER,
});

export const WithoutPlan = storyWithProps({
  ...defaultPaymentFormProps,
  plan: undefined,
});

export const WithoutConfirmation = storyWithProps({
  ...defaultPaymentFormProps,
  confirm: false,
});

export const FrLocale = storyWithProps({
  ...defaultPaymentFormProps,
  locale: 'fr',
});

export const DeLocale = storyWithProps({
  ...defaultPaymentFormProps,
  locale: 'de',
});

export const EsARLocale = storyWithProps({
  ...defaultPaymentFormProps,
  locale: 'es-AR',
});

export const PtBRLocale = storyWithProps({
  ...defaultPaymentFormProps,
  locale: 'pt-BR',
});

export const InProgress = storyWithProps({
  ...defaultPaymentFormProps,
  inProgress: true,
});

const state = mockValidatorState();

// HACK: pre-seed with some error messages for display purposes
state.fields.name.valid = false;
state.fields.name.error = 'Please enter your name';
state.fields.creditCard.valid = false;
state.fields.creditCard.error = 'Your card number is incomplete';

export const AllInvalid = storyWithProps({
  ...defaultPaymentFormProps,
  validatorInitialState: state,
});
