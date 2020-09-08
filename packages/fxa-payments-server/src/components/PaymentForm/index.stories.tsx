import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import MockApp from '../../../.storybook/components/MockApp';
import { SignInLayout } from '../AppLayout';
import PaymentForm, { PaymentFormProps } from './index';
import {
  State as ValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
} from '../../lib/validator';
import { Plan, Customer } from '../../store/types';
import { useNonce } from '../../lib/hooks';

function init() {
  storiesOf('components/PaymentFormV2', module)
    .add('default', () => <Subject />)
    .add('with existing card', () => <Subject customer={CUSTOMER} />)
    .add('without plan', () => <Subject noPlan />)
    .add('without confirmation', () => <Subject confirm={false} />)
    .add('fr locale', () => <Subject locale="fr" />)
    .add('de locale', () => <Subject locale="de" />)
    .add('es-AR locale', () => <Subject locale="es-AR" />)
    .add('pt-BR locale', () => <Subject locale="pt-BR" />)
    .add('in progress', () => <Subject inProgress={true} />)
    .add('all invalid', () => {
      const state = mockValidatorState();

      // HACK: pre-seed with some error messages for display purposes
      state.fields.name.valid = false;
      state.fields.name.error = 'Please enter your name';
      state.fields.creditCard.valid = false;
      state.fields.creditCard.error = 'Your card number is incomplete';

      return <Subject validatorInitialState={state} />;
    });
}

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
const CUSTOMER = {
  billing_name: 'Foo Barson',
  payment_type: 'credit',
  last4: '5309',
  exp_month: '02',
  exp_year: '2099',
  brand: 'Visa',
  subscriptions: [
    {
      subscription_id: 'sub0.28964929339372136',
      plan_id: '123doneProMonthly',
      product_id: 'prod_123',
      product_name: '123done Pro',
      latest_invoice: '628031D-0002',
      status: 'active',
      cancel_at_period_end: false,
      current_period_end: Date.now() / 1000 + 86400 * 31,
      current_period_start: Date.now() / 1000 - 86400 * 31,
      end_at: null,
    },
  ],
};

type SubjectProps = {
  inProgress?: boolean;
  confirm?: boolean;
  noPlan?: boolean;
  plan?: Plan;
  customer?: Customer;
  onSubmit?: PaymentFormProps['onSubmit'];
  onPaymentError?: (error: any) => void;
  onChange?: Function;
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
  locale?: string;
};

const Subject = ({
  inProgress = false,
  confirm = true,
  noPlan = false,
  plan = PLAN,
  customer = undefined,
  onSubmit = action('onSubmit'),
  validatorInitialState,
  validatorMiddlewareReducer,
  onChange = () => {},
  locale = 'auto',
}: SubjectProps) => {
  const [submitNonce, refreshSubmitNonce] = useNonce();

  const paymentFormProps: PaymentFormProps = {
    locale,
    submitNonce,
    inProgress,
    confirm,
    customer,
    plan: noPlan ? undefined : plan,
    onSubmit,
    onChange,
    validatorInitialState,
    validatorMiddlewareReducer,
    onMounted: () => {},
    onEngaged: () => {},
    getString: (x) => x,
  };
  return (
    <MockPage locale={locale}>
      <div className="product-payment">
        <button onClick={refreshSubmitNonce}>Refresh submit nonce</button>
        <p>Current nonce: {submitNonce}</p>
        <PaymentForm {...paymentFormProps} />
      </div>
    </MockPage>
  );
};

type MockPageProps = {
  locale: string;
  children: React.ReactNode;
};

const MockPage = ({ locale, children }: MockPageProps) => {
  return (
    <MockApp languages={[locale]}>
      <SignInLayout>{children}</SignInLayout>
    </MockApp>
  );
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

init();
