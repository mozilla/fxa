import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Localized, withLocalization } from 'fluent-react';

import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  Elements,
  ReactStripeElements,
} from 'react-stripe-elements';
import {
  Form,
  FieldGroup,
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
import { formatCurrencyInCents } from '../../lib/formats';
import { AppContext } from '../../lib/AppContext';

import './index.scss';
import { Plan } from '../../store/types';
import { TermsAndPrivacy } from '../TermsAndPrivacy';

// Define a minimal type for what we use from the Stripe API, which makes
// things easier to mock.
export type PaymentFormStripeProps = {
  createToken(
    options?: stripe.TokenOptions
  ): Promise<ReactStripeElements.PatchedTokenResponse>;
};

export type PaymentFormProps = {
  inProgress?: boolean;
  confirm?: boolean;
  plan?: Plan;
  getString?: Function;
  onCancel?: () => void;
  onPayment: (
    tokenResponse: stripe.TokenResponse,
    name: string,
    idempotencyKey: string
  ) => void;
  onPaymentError: (error: any) => void;
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
  stripe?: PaymentFormStripeProps;
  onMounted: Function;
  onEngaged: Function;
  onChange: Function;
  submitNonce: string;
};

export const PaymentForm = ({
  inProgress = false,
  confirm = true,
  plan,
  getString,
  onCancel,
  onPayment,
  onPaymentError,
  validatorInitialState,
  validatorMiddlewareReducer,
  stripe,
  onMounted,
  onEngaged,
  onChange: onChangeProp,
  submitNonce,
}: PaymentFormProps) => {
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
    ev => {
      ev.preventDefault();
      if (!shouldAllowSubmit) {
        return;
      }
      setLastSubmitNonce(submitNonce);
      const { name, zip } = validator.getValues();
      if (stripe) {
        stripe
          .createToken({ name, address_zip: zip })
          .then((tokenResponse: stripe.TokenResponse) => {
            onPayment(tokenResponse, name, submitNonce);
          })
          .catch(err => {
            onPaymentError(err);
          });
      }
    },
    [
      validator,
      onPayment,
      onPaymentError,
      stripe,
      submitNonce,
      shouldAllowSubmit,
    ]
  );

  const { matchMedia } = useContext(AppContext);
  const stripeElementStyles = mkStripeElementStyles(
    matchMedia(SMALL_DEVICE_RULE)
  );

  return (
    <Form
      data-testid="paymentForm"
      validator={validator}
      onSubmit={onSubmit}
      className="payment"
      {...{ onChange }}
    >
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

      <Localized id="payment-ccn" attrs={{ label: true }}>
        <StripeElement
          component={CardNumberElement}
          name="creditCardNumber"
          label="Card number"
          style={stripeElementStyles}
          className="input-row input-row--xl"
          required
        />
      </Localized>

      <FieldGroup>
        <Localized id="payment-exp" attrs={{ label: true }}>
          <StripeElement
            component={CardExpiryElement}
            name="expDate"
            label="Exp. date"
            style={stripeElementStyles}
            required
          />
        </Localized>

        <Localized id="payment-cvc" attrs={{ label: true }}>
          <StripeElement
            component={CardCVCElement}
            name="cvc"
            label="CVC"
            style={stripeElementStyles}
            required
          />
        </Localized>

        <Localized id="payment-zip" attrs={{ label: true }}>
          <Input
            type="text"
            name="zip"
            label="ZIP code"
            maxLength={5}
            minLength={5}
            required
            data-testid="zip"
            placeholder="12345"
            onValidate={(value, focused, props) =>
              validateZip(value, focused, props, getString)
            }
          />
        </Localized>
      </FieldGroup>

      <hr />

      {confirm && plan && (
        <Localized
          id="payment-confirm"
          $interval={plan.interval}
          $amount={formatCurrencyInCents(plan.amount)}
          strong={<strong></strong>}
        >
          <Checkbox data-testid="confirm" name="confirm" required>
            I authorize Mozilla, maker of Firefox products, to charge my payment
            method{' '}
            <strong>
              ${`${formatCurrencyInCents(plan.amount)} per ${plan.interval}`}
            </strong>
            , according to payment terms, until I cancel my subscription.
          </Checkbox>
        </Localized>
      )}

      <hr />

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
      <TermsAndPrivacy />
    </Form>
  );
};

/* istanbul ignore next - skip testing react-stripe-elements plumbing */
const InjectedPaymentForm = injectStripe(PaymentForm);

/* istanbul ignore next - skip testing react-stripe-elements plumbing */
const WrappedPaymentForm = (props: PaymentFormProps) => (
  <Elements>
    <InjectedPaymentForm {...props} />
  </Elements>
);

export const SMALL_DEVICE_RULE = '(max-width: 520px)';
export const SMALL_DEVICE_LINE_HEIGHT = '40px';
export const DEFAULT_LINE_HEIGHT = '48px';

export function mkStripeElementStyles(useSmallDeviceStyles: boolean) {
  // ref: https://stripe.com/docs/stripe-js/reference#the-elements-object
  return {
    base: {
      //TODO: Figure out what this really should be - I just copied it from computed styles because CSS can't apply through the iframe
      fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      fontSize: '14px',
      fontWeight: '500',
    },
    invalid: {
      color: '#0c0c0d',
    },
  };
}

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
    ? getString('payment-validate-name-error')
    : 'Please enter your name';
  return {
    value,
    valid,
    error: !valid && !focused ? errorMsg : null,
  };
};

const validateZip: OnValidateFunction = (value, focused, _props, getString) => {
  let valid = undefined;
  let error = null;
  value = ('' + value).replace(/[^\d]+/g, '').substr(0, 5);
  if (!value) {
    valid = false;
    error = getString
      ? getString('payment-validate-zip-required')
      : 'Zip code is required';
  } else if (value.length !== 5 && !focused) {
    valid = false;
    error = getString
      ? getString('payment-validate-zip-short')
      : 'Zip code is too short';
  } else if (value.length === 5) {
    valid = true;
  }
  return {
    value,
    valid,
    error: !focused ? error : null,
  };
};

export default withLocalization(WrappedPaymentForm);
