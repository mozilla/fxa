import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import {
  Localized,
  withLocalization,
  WithLocalizationProps,
} from '@fluent/react';
import {
  Stripe,
  StripeCardElement,
  StripeElements,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
  CardElement,
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
import { apiInvoicePreview } from '../../lib/apiClient';
import LoadingSpinner, {
  SpinnerType,
} from 'fxa-react/components/LoadingSpinner';
import { FirstInvoicePreview } from 'fxa-shared/dto/auth/payments/invoice';
import LockImage from './images/lock.svg';

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
  invoicePreview?: FirstInvoicePreview;
  disabled?: boolean;
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
  invoicePreview,
  disabled = false,
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

  const [totalAmount, setTotalAmount] = useState(0);
  const invoice = useRef(invoicePreview);
  const isMounted = useRef(false);

  // for existing customer subscribing to new plan,
  // checks promo code, applicable taxes, and updates total amount
  useEffect(() => {
    isMounted.current = true;

    const getTotalPlanAmount = async () => {
      if (plan && isExistingCustomer(customer)) {
        try {
          if (!invoicePreview) {
            invoice.current = await apiInvoicePreview({
              priceId: plan.plan_id,
              promotionCode: promotionCode,
            });
          }

          if (!invoice.current) {
            throw new Error('Could not retrieve Invoice Preview');
          }

          if (isMounted.current) {
            setTotalAmount(invoice.current.total as number);
          }
        } catch (e: any) {
          // returns the list price as a fallback
          if (isMounted.current) {
            setTotalAmount(plan.amount as number);
          }
        }
      }
    };

    getTotalPlanAmount();

    return () => {
      isMounted.current = false;
    };
  }, [plan, promotionCode, invoicePreview, customer]);

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
    [onSubmitForParent, submitNonce, plan, promotionCode]
  );

  const onStripeFormSubmit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      if (!stripe || !allowSubmit) {
        return;
      }
      setLastSubmitNonce(submitNonce);
      const { name } = validator.getValues();
      const card = (elements as StripeElements).getElement(CardElement);
      /* istanbul ignore next - card should exist unless there was an external stripe loading error, handled above */
      if (isStripeCustomer || elements) {
        (onSubmitForParent as StripeSubmitHandler & StripeUpdateHandler)({
          stripe,
          elements: elements as StripeElements,
          name,
          card,
          idempotencyKey: submitNonce,
          promotionCode: promotionCode,
        });
      }
    },
    [
      validator,
      onSubmitForParent,
      stripe,
      submitNonce,
      allowSubmit,
      elements,
      isStripeCustomer,
      promotionCode,
    ]
  );

  const onSubmit = getPaymentProviderMappedVal(customer, {
    [PaymentProviders.stripe]: onStripeFormSubmit,
    [PaymentProviders.paypal]: onPaypalFormSubmit,
  });

  const paymentSource =
    plan && isExistingCustomer(customer) ? (
      <div className="flex items-center justify-between text-base">
        <Localized
          id={`plan-price-interval-${plan.interval}`}
          vars={{
            amount: getLocalizedCurrency(totalAmount, plan.currency),
            intervalCount: plan.interval_count!,
          }}
        >
          <p></p>
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
            disabled={disabled}
          />
        </Localized>
        <div id="reino-test" className="my-8 py-8">
          <PaymentElement />
        </div>

        {/* <Localized id="payment-cc" attrs={{ label: true }}> */}
        {/* <StripeElement
          component={PaymentElement}
          name="creditCard"
          label="Your card"
          className="input-row input-row--xl"
          options={STRIPE_ELEMENT_STYLES}
          getString={getString}
          required
          disabled={disabled}
        /> */}
        {/* </Localized> */}
      </>
    );

  const buttons = onCancel ? (
    <div className="mt-8 mb-5 flex gap-4 mobileLandscape:gap-6">
      <Localized id="payment-cancel-btn">
        <button
          data-testid="cancel"
          className="payment-button h-10 border-0 bg-grey-900/10 hover:bg-grey-900/20 mobileLandscape:h-12"
          onClick={onCancel}
        >
          Cancel
        </button>
      </Localized>

      <SubmitButton
        data-testid="submit"
        className="payment-button cta-primary h-10 mobileLandscape:h-12 cursor-pointer"
        name="submit"
        aria-disabled={inProgress}
      >
        {inProgress ? (
          <LoadingSpinner
            spinnerType={SpinnerType.White}
            imageClassName="w-8 h-8 animate-spin"
          />
        ) : (
          <Localized
            id={submitButtonL10nId ? submitButtonL10nId : 'payment-update-btn'}
          >
            <span>{submitButtonCopy ? submitButtonCopy : `Update`}</span>
          </Localized>
        )}
      </SubmitButton>
    </div>
  ) : (
    <SubmitButton
      data-testid="submit"
      className="payment-button cta-primary !font-bold w-full mt-8 h-12 cursor-pointer mb-5"
      name="submit"
      aria-disabled={!allowSubmit}
    >
      {showProgressSpinner ? (
        <LoadingSpinner
          spinnerType={SpinnerType.White}
          imageClassName="w-8 h-8 animate-spin"
        />
      ) : (
        <div className="text-center">
          <img
            src={LockImage}
            className="h-4 w-4 my-0 mx-3 relative top-0.5"
            alt=""
          />
          <Localized
            id={
              submitButtonL10nId
                ? submitButtonL10nId
                : payButtonL10nId(customer)
            }
          >
            <span>{submitButtonCopy}</span>
          </Localized>
        </div>
      )}
    </SubmitButton>
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
          <hr className="mt-4 tablet:mt-6" />
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
  const options: StripeElementsOptions = {
    locale: localeToStripeLocale(locale),
    mode: 'subscription',
    amount: 6000,
    currency: 'usd',
    paymentMethodCreation: 'manual',
  };
  return (
    <Elements options={options} stripe={stripePromise}>
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
