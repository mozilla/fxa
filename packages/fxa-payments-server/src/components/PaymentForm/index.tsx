import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Localized,
  withLocalization,
  WithLocalizationProps,
} from '@fluent/react';
import { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Form,
  Input,
  StripeElement,
  SubmitButton,
  OnValidateFunction,
} from '../fields';
import {
  State as ValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
  useValidatorState,
} from '../../lib/validator';
import { useCallbackOnce } from '../../lib/hooks';
import { getLocalizedCurrency } from '../../lib/formats';
import { AppContext } from '../../lib/AppContext';
import { Plan, Customer } from '../../store/types';

import './index.scss';
import { localeToStripeLocale, STRIPE_ELEMENT_STYLES } from '../../lib/stripe';
import {
  hasPaymentProvider,
  isExistingCustomer,
  isExistingStripeCustomer,
} from '../../lib/customer';
import {
  getPaymentProviderMappedVal,
  isPaypal,
  PaymentProviders,
} from '../../lib/PaymentProvider';
import { PaymentProviderDetails } from '../PaymentProviderDetails';
import { PaymentConsentCheckbox } from '../PaymentConsentCheckbox';

export type StripePaymentSubmitResult = {
  stripe: Stripe;
  elements: StripeElements;
  name: string;
  card: StripeCardElement | null;
  idempotencyKey: string;
  promotionCode?: string;
};
export type StripePaymentUpdateResult = StripePaymentSubmitResult & {
  card: StripeCardElement;
};
export type PaypalPaymentSubmitResult = {
  priceId: string;
  idempotencyKey: string;
  promotionCode?: string;
};

export type StripeSubmitHandler = (x: StripePaymentSubmitResult) => void;
export type StripeUpdateHandler = (x: StripePaymentUpdateResult) => void;
/**
 * Note that this handler is for creating additional subscriptions.  It is
 * _not_ the handler for creating a Billing Agreement & subscription.
 */
export type PaypalSubmitHandler = (x: PaypalPaymentSubmitResult) => void;

export type BasePaymentFormProps = {
  inProgress?: boolean;
  confirm?: boolean;
  plan?: Plan;
  customer?: Customer | null;
  getString?: (id: string) => string;
  onCancel?: () => void;
  submitButtonL10nId?: string;
  submitButtonCopy?: string;
  shouldAllowSubmit?: boolean;
  onSubmit: StripeSubmitHandler | StripeUpdateHandler | PaypalSubmitHandler;
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
  onMounted: Function;
  onEngaged: Function;
  onChange: Function;
  submitNonce: string;
  promotionCode?: string;
} & WithLocalizationProps;

export const PaymentForm = ({
  inProgress = false,
  confirm = true,
  plan,
  customer,
  getString,
  onSubmit: onSubmitForParent,
  onCancel,
  submitButtonL10nId = '',
  submitButtonCopy = 'Pay Now',
  shouldAllowSubmit = true,
  validatorInitialState,
  validatorMiddlewareReducer,
  onMounted,
  onEngaged,
  onChange: onChangeProp,
  submitNonce,
  promotionCode,
}: BasePaymentFormProps) => {
  const isStripeCustomer = isExistingStripeCustomer(customer);

  const stripe = useStripe();
  const elements = useElements();

  const validator = useValidatorState({
    initialState: validatorInitialState,
    middleware: validatorMiddlewareReducer,
  });

  useEffect(() => {
    onMounted(plan);
  }, [onMounted, plan]);

  const engageOnce = useCallbackOnce(() => {
    onEngaged(plan);
  }, [onEngaged, plan]);

  const onChange = useCallback(() => {
    engageOnce();
    onChangeProp();
  }, [engageOnce, onChangeProp]);

  const [lastSubmitNonce, setLastSubmitNonce] = useState('');
  const nonceMatch = submitNonce === lastSubmitNonce;
  const allowSubmit =
    !nonceMatch && !inProgress && validator.allValid() && shouldAllowSubmit;
  const showProgressSpinner = nonceMatch || inProgress;

  const payButtonL10nId = (c?: Customer | null) =>
    hasPaymentProvider(c) && isPaypal(c!.payment_provider)
      ? 'payment-pay-with-paypal-btn'
      : 'payment-pay-btn';

  const onPaypalFormSubmit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      setLastSubmitNonce(submitNonce);
      (onSubmitForParent as PaypalSubmitHandler)({
        priceId: plan!.plan_id,
        idempotencyKey: submitNonce,
        promotionCode: promotionCode,
      });
    },
    [onSubmitForParent, submitNonce]
  );

  const onStripeFormSubmit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      if (!stripe || !elements || !allowSubmit) {
        return;
      }
      setLastSubmitNonce(submitNonce);
      const { name } = validator.getValues();
      const card = elements.getElement(CardElement);
      /* istanbul ignore next - card should exist unless there was an external stripe loading error, handled above */
      if (isStripeCustomer || card) {
        (onSubmitForParent as StripeSubmitHandler & StripeUpdateHandler)({
          stripe,
          elements,
          name,
          card,
          idempotencyKey: submitNonce,
          promotionCode: promotionCode,
        });
      }
    },
    [validator, onSubmitForParent, stripe, submitNonce, allowSubmit]
  );

  const onSubmit = getPaymentProviderMappedVal(customer, {
    [PaymentProviders.stripe]: onStripeFormSubmit,
    [PaymentProviders.paypal]: onPaypalFormSubmit,
  });

  const paymentSource =
    plan && isExistingCustomer(customer) ? (
      <div className="pricing-and-saved-payment">
        <Localized
          id={`plan-price-${plan.interval}`}
          vars={{
            amount: getLocalizedCurrency(plan.amount, plan.currency),
            intervalCount: plan.interval_count!,
          }}
        >
          <div className="pricing"></div>
        </Localized>
        <PaymentProviderDetails customer={customer!} />
      </div>
    ) : (
      <>
        <Localized id="payment-name" attrs={{ placeholder: true, label: true }}>
          <Input
            type="text"
            name="name"
            label="Name as it appears on your card"
            data-testid="name"
            placeholder="Full Name"
            required
            spellCheck={false}
            onValidate={(value, focused, props) =>
              validateName(value, focused, props, getString)
            }
          />
        </Localized>

        <Localized id="payment-cc" attrs={{ label: true }}>
          <StripeElement
            component={CardElement}
            name="creditCard"
            label="Your card"
            className="input-row input-row--xl"
            options={STRIPE_ELEMENT_STYLES}
            getString={getString}
            required
          />
        </Localized>
      </>
    );

  const buttons = onCancel ? (
    <div className="button-row">
      <Localized id="payment-cancel-btn">
        <button
          data-testid="cancel"
          className="settings-button cancel secondary-button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </Localized>

      <Localized
        id={submitButtonL10nId ? submitButtonL10nId : 'payment-update-btn'}
      >
        <SubmitButton
          data-testid="submit"
          className="settings-button primary-button"
          name="submit"
          disabled={inProgress}
        >
          {inProgress ? (
            <span data-testid="spinner-update" className="spinner">
              &nbsp;
            </span>
          ) : submitButtonCopy ? (
            <span>{submitButtonCopy}</span>
          ) : (
            <span>Update</span>
          )}
        </SubmitButton>
      </Localized>
    </div>
  ) : (
    <div className="button-row">
      <Localized id="payment-submit-btn">
        <SubmitButton
          data-testid="submit"
          name="submit"
          disabled={!allowSubmit}
        >
          {showProgressSpinner ? (
            <span data-testid="spinner-submit" className="spinner">
              &nbsp;
            </span>
          ) : (
            <Localized
              id={
                submitButtonL10nId
                  ? submitButtonL10nId
                  : payButtonL10nId(customer)
              }
            >
              <span className="lock">{submitButtonCopy}</span>
            </Localized>
          )}
        </SubmitButton>
      </Localized>
    </div>
  );

  return (
    <Form
      data-testid="paymentForm"
      validator={validator}
      onSubmit={onSubmit}
      className="payment"
      {...{ onChange }}
    >
      {paymentSource}

      {confirm && plan && (
        <>
          <PaymentConsentCheckbox plan={plan} />
          <hr />
        </>
      )}

      {buttons}
    </Form>
  );
};

/* istanbul ignore next - skip testing react-stripe-elements plumbing */
export type PaymentFormProps = {
  locale?: string;
} & BasePaymentFormProps;
const WrappedPaymentForm = (props: PaymentFormProps) => {
  const { locale, ...otherProps } = props;
  const { stripePromise } = useContext(AppContext);
  return (
    <Elements
      options={{ locale: localeToStripeLocale(locale) }}
      stripe={stripePromise}
    >
      <PaymentForm {...otherProps} />
    </Elements>
  );
};

export const SMALL_DEVICE_RULE = '(max-width: 520px)';
export const SMALL_DEVICE_LINE_HEIGHT = '40px';
export const DEFAULT_LINE_HEIGHT = '48px';

const validateName: OnValidateFunction = (
  value,
  focused,
  _props,
  getString
) => {
  let valid = true;
  if (value !== null && !value) {
    valid = false;
  }
  const errorMsg = getString
    ? /* istanbul ignore next - not testing l10n here */
      getString('payment-validate-name-error')
    : 'Please enter your name';
  return {
    value,
    valid,
    error: !valid && !focused ? errorMsg : null,
  };
};

export default withLocalization(WrappedPaymentForm);
