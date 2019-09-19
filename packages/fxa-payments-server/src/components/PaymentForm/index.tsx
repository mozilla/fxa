import React, { useCallback, useContext } from 'react';
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
} from '../fields';
import {
  State as ValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
  useValidatorState,
} from '../../lib/validator';
import { formatCurrencyInCents } from '../../lib/formats';
import { AppContext } from '../../lib/AppContext';

import './index.scss';
import { Plan } from '../../store/types';

export const SMALL_DEVICE_RULE = '(max-width: 480px)';
export const SMALL_DEVICE_LINE_HEIGHT = '37px';
export const DEFAULT_LINE_HEIGHT = '45px';

// ref: https://stripe.com/docs/stripe-js/reference#the-elements-object
let stripeElementStyles = {
  base: {
    //TODO: Figure out what this really should be - I just copied it from computed styles because CSS can't apply through the iframe
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: '13px',
    fontWeight: '500',
    lineHeight: '45px',
  },
};

type StripeElementStyles = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
};

export function checkMedia(
  matched: boolean,
  stripeElementStyles: { base: StripeElementStyles }
) {
  let lh = matched ? SMALL_DEVICE_LINE_HEIGHT : DEFAULT_LINE_HEIGHT;
  return Object.assign(stripeElementStyles, { base: { lineHeight: lh } });
}

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
  onCancel?: () => void;
  onPayment: (tokenResponse: stripe.TokenResponse, name: string) => void;
  onPaymentError: (error: any) => void;
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
  stripe?: PaymentFormStripeProps;
};

export const PaymentForm = ({
  inProgress = false,
  confirm = true,
  plan,
  onCancel,
  onPayment,
  onPaymentError,
  validatorInitialState,
  validatorMiddlewareReducer,
  stripe,
}: PaymentFormProps) => {
  const validator = useValidatorState({
    initialState: validatorInitialState,
    middleware: validatorMiddlewareReducer,
  });

  const { matchMedia } = useContext(AppContext);

  const onSubmit = useCallback(
    ev => {
      ev.preventDefault();
      if (!validator.allValid()) {
        return;
      }
      const { name, zip } = validator.getValues();
      if (stripe) {
        stripe
          .createToken({ name, address_zip: zip })
          .then((tokenResponse: stripe.TokenResponse) =>
            onPayment(tokenResponse, name)
          )
          .catch(onPaymentError);
      }
    },
    [validator, onPayment, onPaymentError, stripe]
  );

  stripeElementStyles = checkMedia(matchMedia(SMALL_DEVICE_RULE), stripeElementStyles);

  return (
    <Form
      data-testid="paymentForm"
      validator={validator}
      onSubmit={onSubmit}
      className="payment"
    >
      <Input
        type="text"
        name="name"
        label="Name as it appears on your card"
        data-testid="name"
        placeholder="Full Name"
        required
        autoFocus
        spellCheck={false}
        onValidate={value => {
          let error = null;
          if (value !== null && !value) {
            error = 'Please enter your name';
          }
          return { value, error };
        }}
      />

      <FieldGroup>
        <StripeElement
          component={CardNumberElement}
          name="creditCardNumber"
          label="Card number"
          style={stripeElementStyles}
          className="input-row input-row--xl"
          required
        />

        <StripeElement
          component={CardExpiryElement}
          name="expDate"
          label="Exp. date"
          style={stripeElementStyles}
          required
        />

        <StripeElement
          component={CardCVCElement}
          name="cvc"
          label="CVC"
          style={stripeElementStyles}
          required
        />

        <Input
          type="text"
          name="zip"
          label="ZIP code"
          maxLength={5}
          minLength={5}
          required
          data-testid="zip"
          placeholder="12345"
          onValidate={value => {
            let error = null;
            value = ('' + value).substr(0, 5);
            if (!value) {
              error = 'Zip code is required';
            } else if (value.length !== 5) {
              error = 'Zip code is too short';
            }
            return { value, error };
          }}
        />
      </FieldGroup>

      {confirm && plan && (
        <Checkbox
          data-testid="confirm"
          name="confirm"
          required
          label={`
          I authorize Mozilla, maker of Firefox products, to charge my
          payment method $${formatCurrencyInCents(plan.amount)} per ${
            plan.interval
          }, according to payment
          terms, until I cancel my subscription.
        `}
        />
      )}

      {onCancel ? (
        <div className="button-row">
          <button
            data-testid="cancel"
            className="settings-button cancel secondary-button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <SubmitButton
            data-testid="submit"
            className="settings-button primary-button"
            name="submit"
            disabled={inProgress}
          >
            {inProgress ? (
              <span data-testid="spinner-update" className="spinner">&nbsp;</span>
            ) : (
              <span>Update</span>
            )}
          </SubmitButton>
        </div>
      ) : (
        <div className="button-row">
          <SubmitButton
            data-testid="submit"
            name="submit"
            disabled={inProgress}
          >
            {inProgress ? (
              <span data-testid="spinner-submit" className="spinner">&nbsp;</span>
            ) : (
              <span>Submit</span>
            )}
          </SubmitButton>
        </div>
      )}

      <div className="legal-blurb">
        Mozilla uses Stripe for secure payment processing.
        <br />
        View the <a href="https://stripe.com/privacy">Stripe privacy policy</a>.
      </div>
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

export default WrappedPaymentForm;
