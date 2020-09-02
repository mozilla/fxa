import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Localized,
  withLocalization,
  WithLocalizationProps,
} from '@fluent/react';
import {
  Stripe,
  StripeElements,
  StripeCardElement,
  StripeElementsOptions,
} from '@stripe/stripe-js';
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
  Checkbox,
  OnValidateFunction,
} from '../fields';
import PaymentLegalBlurb from '../PaymentLegalBlurb';
import {
  State as ValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
  useValidatorState,
} from '../../lib/validator';
import { useCallbackOnce } from '../../lib/hooks';
import {
  getLocalizedCurrency,
  getDefaultPaymentConfirmText,
} from '../../lib/formats';
import { AppContext } from '../../lib/AppContext';
import { Plan, Customer } from '../../store/types';
import { productDetailsFromPlan } from 'fxa-shared/subscriptions/metadata';

import './index.scss';
import { TermsAndPrivacy } from '../TermsAndPrivacy';

export type PaymentSubmitResult = {
  stripe: Stripe;
  elements: StripeElements;
  name: string;
  card: StripeCardElement | null;
  idempotencyKey: string;
};
export type PaymentUpdateResult = PaymentSubmitResult & {
  card: StripeCardElement;
};

export type BasePaymentFormProps = {
  inProgress?: boolean;
  confirm?: boolean;
  plan?: Plan;
  customer?: Customer | null;
  getString?: Function;
  onCancel?: () => void;
  onSubmit: (submitResult: PaymentSubmitResult | PaymentUpdateResult) => void;
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
  onMounted: Function;
  onEngaged: Function;
  onChange: Function;
  submitNonce: string;
} & WithLocalizationProps;

export const PaymentForm = ({
  inProgress = false,
  confirm = true,
  plan,
  customer,
  getString,
  onSubmit: onSubmitForParent,
  onCancel,
  validatorInitialState,
  validatorMiddlewareReducer,
  onMounted,
  onEngaged,
  onChange: onChangeProp,
  submitNonce,
}: BasePaymentFormProps) => {
  const hasExistingCard =
    customer && customer.last4 && customer.subscriptions.length > 0;

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
  const shouldAllowSubmit = !nonceMatch && !inProgress && validator.allValid();
  const showProgressSpinner = nonceMatch || inProgress;

  const onSubmit = useCallback(
    async (ev) => {
      ev.preventDefault();
      if (!stripe || !elements || !shouldAllowSubmit) {
        return;
      }
      setLastSubmitNonce(submitNonce);
      const { name } = validator.getValues();
      const card = elements.getElement(CardElement);
      /* istanbul ignore next - card should exist unless there was an external stripe loading error, handled above */
      if (hasExistingCard || card) {
        onSubmitForParent({
          stripe,
          elements,
          name,
          card,
          idempotencyKey: submitNonce,
        });
      }
    },
    [validator, onSubmitForParent, stripe, submitNonce, shouldAllowSubmit]
  );

  const { navigatorLanguages } = useContext(AppContext);

  const STRIPE_ELEMENT_STYLES = {
    style: {
      base: {
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        fontSize: '16px',
        fontWeight: '500',
      },
      invalid: {
        color: '#0c0c0d',
      },
    },
  };

  let termsOfServiceURL, privacyNoticeURL;
  if (confirm && plan) {
    ({ termsOfServiceURL, privacyNoticeURL } = productDetailsFromPlan(
      plan,
      navigatorLanguages
    ));
  }
  const paymentSource = hasExistingCard ? (
    <div className="card-details" data-testid="card-details">
      <Localized
        id="sub-update-card-ending"
        vars={{
          last: (customer as Customer).last4!,
        }}
      >
        <div
          className={`new-sub c-card unbranded ${customer?.brand?.toLowerCase()}`}
        >
          Card ending {customer?.last4}
        </div>
      </Localized>
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
          autoFocus
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

  return (
    <Form
      data-testid="paymentForm"
      validator={validator}
      onSubmit={onSubmit}
      className="payment"
      {...{ onChange }}
    >
      {paymentSource}

      <hr />

      {confirm && plan && (
        <>
          <Localized
            id={`payment-confirm-with-legal-links-${plan.interval}`}
            vars={{
              intervalCount: plan.interval_count,
              amount: getLocalizedCurrency(plan.amount, plan.currency),
            }}
            elems={{
              strong: <strong></strong>,
              termsOfServiceLink: <a href={termsOfServiceURL}></a>,
              privacyNoticeLink: <a href={privacyNoticeURL}></a>,
            }}
          >
            <Checkbox data-testid="confirm" name="confirm" required>
              {getDefaultPaymentConfirmText(
                plan.amount,
                plan.currency,
                plan.interval,
                plan.interval_count
              )}
            </Checkbox>
          </Localized>
          <hr />
        </>
      )}

      {onCancel ? (
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

          <Localized id="payment-update-btn">
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
              disabled={!shouldAllowSubmit}
            >
              {showProgressSpinner ? (
                <span data-testid="spinner-submit" className="spinner">
                  &nbsp;
                </span>
              ) : (
                <Localized id="payment-pay-btn">
                  <span className="lock">Pay now</span>
                </Localized>
              )}
            </SubmitButton>
          </Localized>
        </div>
      )}

      <PaymentLegalBlurb />
      {plan && <TermsAndPrivacy plan={plan} />}
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

/**
 * Stripe locales do not exactly match FxA locales. Mostly language tags
 * without subtags. This function should convert / normalize as necessary.
 */
type StripeLocale = StripeElementsOptions['locale'];
export const localeToStripeLocale = (locale?: string): StripeLocale => {
  if (locale) {
    if (locale in stripeLocales) {
      return locale as StripeLocale;
    }
    const lang = locale.split('-').shift();
    if (lang && lang in stripeLocales) {
      return lang as StripeLocale;
    }
  }
  return 'auto';
};

// TODO: Move to fxa-shared/l10n?
// see also: https://stripe.com/docs/js/appendix/supported_locales
enum stripeLocales {
  'ar',
  'bg',
  'cs',
  'da',
  'de',
  'el',
  'et',
  'en',
  'es',
  'fi',
  'fr',
  'he',
  'hu',
  'id',
  'it',
  'ja',
  'lt',
  'lv',
  'ms',
  'mt',
  'nb',
  'nl',
  'pl',
  'pt-BR',
  'pt',
  'ro',
  'ru',
  'sk',
  'sl',
  'sv',
  'tk',
  'zh',
}

export default withLocalization(WrappedPaymentForm);
