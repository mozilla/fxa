import React, {
  useState,
  useCallback,
  useEffect,
  Suspense,
  useContext,
} from 'react';
import { Stripe, StripeCardElement, StripeError } from '@stripe/stripe-js';
import classNames from 'classnames';
import { Plan, Profile, Customer } from '../../../store/types';
import { State as ValidatorState } from '../../../lib/validator';

import { useNonce, usePaypalButtonSetup } from '../../../lib/hooks';

import PlanDetails from '../../../components/PlanDetails';
import Header from '../../../components/Header';
import PaymentForm, { PaymentFormProps } from '../../../components/PaymentForm';
import AcceptedCards from '../../Product/AcceptedCards';
import PaymentErrorView from '../../../components/PaymentErrorView';
import PaymentLegalBlurb from '../../../components/PaymentLegalBlurb';
import { SubscriptionTitle } from '../../../components/SubscriptionTitle';
import { TermsAndPrivacy } from '../../../components/TermsAndPrivacy';
import { PaymentProcessing } from '../../../components/PaymentProcessing';
import { ProviderType } from '../../../lib/PaymentProvider';

import * as Amplitude from '../../../lib/amplitude';
import { Localized } from '@fluent/react';
import * as apiClient from '../../../lib/apiClient';

import '../../Product/SubscriptionCreate/index.scss';

import { ButtonBaseProps } from '../../../components/PayPalButton';
import AppContext from 'fxa-payments-server/src/lib/AppContext';
const PaypalButton = React.lazy(() =>
  import('../../../components/PayPalButton')
);

type PaymentError =
  | undefined
  | StripeError
  | { code: string; message?: string };
type RetryStatus = undefined | { invoiceId: string };

export type SubscriptionCreateStripeAPIs = Pick<
  Stripe,
  'createPaymentMethod' | 'confirmCardPayment'
>;

export type SubscriptionCreateAuthServerAPIs = Pick<
  typeof apiClient,
  | 'apiCreateCustomer'
  | 'apiCreateSubscriptionWithPaymentMethod'
  | 'apiRetryInvoice'
  | 'apiDetachFailedPaymentMethod'
>;

export type SubscriptionCreateProps = {
  isMobile: boolean;
  profile: Profile;
  customer: Customer | null;
  selectedPlan: Plan;
  refreshSubscriptions: () => void;
  validatorInitialState?: ValidatorState;
  paymentErrorInitialState?: PaymentError;
  stripeOverride?: SubscriptionCreateStripeAPIs;
  apiClientOverrides?: Partial<SubscriptionCreateAuthServerAPIs>;
  paypalButtonBase?: React.FC<ButtonBaseProps>;
};

export const SubscriptionCreate = ({
  isMobile,
  profile,
  customer,
  selectedPlan,
  refreshSubscriptions,
  validatorInitialState,
  paymentErrorInitialState,
  stripeOverride,
  apiClientOverrides = {},
  paypalButtonBase,
}: SubscriptionCreateProps) => {
  const [submitNonce, refreshSubmitNonce] = useNonce();
  const [transactionInProgress, setTransactionInProgress] = useState(false);

  const onFormMounted = useCallback(
    () => Amplitude.createSubscriptionMounted(selectedPlan),
    [selectedPlan]
  );

  const onFormEngaged = useCallback(
    () => Amplitude.createSubscriptionEngaged(selectedPlan),
    [selectedPlan]
  );

  const [paypalScriptLoaded, setPaypalScriptLoaded] = useState(false);

  // The Stripe customer isn't created until payment is submitted, so
  // customer can be null and customer.payment_provider can be undefined.
  const paymentProvider: ProviderType | undefined = customer?.payment_provider;

  const { config } = useContext(AppContext);

  usePaypalButtonSetup(config, setPaypalScriptLoaded, paypalButtonBase);

  const [inProgress, setInProgress] = useState(false);

  const [paymentError, setPaymentError] = useState<PaymentError>(
    paymentErrorInitialState
  );
  const [retryStatus, setRetryStatus] = useState<RetryStatus>();

  useEffect(() => {
    // Avoid infinite loop by ignoring changes to paymentError from this hook
    if (
      isExistingPaypalCustomer(customer) &&
      paymentError?.code !== 'returning_paypal_customer_error'
    ) {
      setPaymentError({ code: 'returning_paypal_customer_error' });
    }
  }, [paymentError]);

  // clear any error rendered with `ErrorMessage` on form change
  const onChange = useCallback(() => {
    if (paymentError) {
      setPaymentError(undefined);
    }
  }, [paymentError, setPaymentError]);

  const onSubmit: PaymentFormProps['onSubmit'] = useCallback(
    async ({ stripe: stripeFromParams, ...params }) => {
      setInProgress(true);
      try {
        await handleSubscriptionPayment({
          ...params,
          ...apiClient,
          ...apiClientOverrides,
          stripe:
            stripeOverride /* istanbul ignore next - used for testing */ ||
            stripeFromParams,
          selectedPlan,
          customer,
          retryStatus,
          onSuccess: refreshSubscriptions,
          onFailure: setPaymentError,
          onRetry: (status: RetryStatus) => {
            setRetryStatus(status);
            setPaymentError({ type: 'card_error', code: 'card_declined' });
          },
        });
      } catch (error) {
        console.error('handleSubscriptionPayment failed', error);
        setPaymentError(error);
      }
      setInProgress(false);
      refreshSubmitNonce();
    },
    [
      selectedPlan,
      customer,
      retryStatus,
      apiClientOverrides,
      stripeOverride,
      setInProgress,
      refreshSubscriptions,
      refreshSubmitNonce,
      setPaymentError,
      setRetryStatus,
    ]
  );

  return (
    <>
      <Header {...{ profile }} />
      <div className="main-content">
        <PaymentErrorView
          error={paymentError}
          onRetry={() => {
            setPaymentError(undefined);
            setTransactionInProgress(false);
          }}
          className={classNames({
            hidden: !paymentError,
          })}
        />
        <PaymentProcessing
          provider="paypal"
          className={classNames({
            hidden: !transactionInProgress || paymentError,
          })}
        />
        <SubscriptionTitle
          screenType="create"
          className={classNames({
            hidden: transactionInProgress || paymentError,
          })}
        />
        <div
          className={classNames('product-payment', {
            hidden: transactionInProgress || paymentError,
          })}
          data-testid="subscription-create"
        >
          {isNewCustomer(customer) && paypalScriptLoaded && (
            <div
              className="subscription-create-pay-with-other"
              data-testid="pay-with-other"
            >
              <Suspense fallback={<div>Loading...</div>}>
                <Localized id="pay-with-heading-other">
                  <p className="pay-with-heading">Select payment option</p>
                </Localized>
                <div className="paypal-button">
                  <PaypalButton
                    apiClientOverrides={apiClientOverrides}
                    currencyCode={selectedPlan.currency}
                    customer={customer}
                    idempotencyKey={submitNonce}
                    priceId={selectedPlan.plan_id}
                    newPaypalAgreement={true}
                    refreshSubscriptions={refreshSubscriptions}
                    setPaymentError={setPaymentError}
                    ButtonBase={paypalButtonBase}
                    setTransactionInProgress={setTransactionInProgress}
                  />
                </div>
              </Suspense>
            </div>
          )}

          <div className="subscription-create-pay-with-card">
            {isNewCustomer(customer) && !paypalScriptLoaded && (
              <div>
                <Localized id="pay-with-heading-card-only">
                  <p className="pay-with-heading">Pay with card</p>
                </Localized>
                <AcceptedCards />
              </div>
            )}

            {isNewCustomer(customer) && paypalScriptLoaded && (
              <div>
                <Localized id="pay-with-heading-card-or">
                  <p className="pay-with-heading">Or pay with card</p>
                </Localized>
                <AcceptedCards />
              </div>
            )}

            {!isExistingPaypalCustomer(customer) && (
              <>
                <h3 className="billing-title">
                  <Localized id="sub-update-payment-title">
                    <span className="title">Payment information</span>
                  </Localized>
                </h3>

                <PaymentForm
                  {...{
                    customer,
                    submitNonce,
                    onSubmit,
                    onChange,
                    inProgress,
                    validatorInitialState,
                    confirm: true,
                    plan: selectedPlan,
                    onMounted: onFormMounted,
                    onEngaged: onFormEngaged,
                  }}
                />
              </>
            )}
          </div>
          <div className="subscription-create-footer">
            <PaymentLegalBlurb provider={paymentProvider} />
            {selectedPlan && <TermsAndPrivacy plan={selectedPlan} />}
          </div>
        </div>
        <PlanDetails
          {...{
            className: classNames('default', {
              hidden: transactionInProgress && isMobile,
            }),
            profile,
            selectedPlan,
            isMobile,
            showExpandButton: isMobile,
          }}
        />
      </div>
    </>
  );
};

async function handleSubscriptionPayment({
  stripe,
  name,
  card,
  idempotencyKey,
  selectedPlan,
  customer,
  retryStatus,
  apiCreateCustomer,
  apiCreateSubscriptionWithPaymentMethod,
  apiRetryInvoice,
  apiDetachFailedPaymentMethod,
  onFailure,
  onRetry,
  onSuccess,
}: {
  stripe: Pick<Stripe, 'createPaymentMethod' | 'confirmCardPayment'>;
  name: string;
  card: StripeCardElement | null;
  idempotencyKey: string;
  selectedPlan: Plan;
  customer: Customer | null;
  retryStatus: RetryStatus;
  apiDetachFailedPaymentMethod: SubscriptionCreateAuthServerAPIs['apiDetachFailedPaymentMethod'];
  onFailure: (error: PaymentError) => void;
  onRetry: (status: RetryStatus) => void;
  onSuccess: () => void;
} & SubscriptionCreateAuthServerAPIs) {
  // If there's an existing card on record, GOTO 3

  if (isExistingStripeCustomer(customer)) {
    const createSubscriptionResult = await apiCreateSubscriptionWithPaymentMethod(
      {
        priceId: selectedPlan.plan_id,
        productId: selectedPlan.product_id,
        idempotencyKey,
      }
    );
    return handlePaymentIntent({
      customer,
      invoiceId: createSubscriptionResult.latest_invoice.id,
      paymentIntentStatus:
        createSubscriptionResult.latest_invoice.payment_intent.status,
      paymentIntentClientSecret:
        createSubscriptionResult.latest_invoice.payment_intent.client_secret,
      paymentMethodId:
        createSubscriptionResult.latest_invoice.payment_intent.payment_method,
      stripe,
      apiDetachFailedPaymentMethod,
      onSuccess,
      onFailure,
      onRetry,
    });
  }

  // 1. Create the payment method.
  const {
    paymentMethod,
    error: paymentError,
  } = await stripe.createPaymentMethod({
    type: 'card',
    card: card as StripeCardElement,
  });
  if (paymentError) {
    return onFailure(paymentError);
  }
  if (!paymentMethod) {
    return onFailure({ type: 'card_error' });
  }

  // 2. Create the customer, if necessary.
  if (!customer) {
    // We look up the customer by UID & email on the server.
    // No need to retain the result of this call for later.
    await apiCreateCustomer({
      displayName: name,
      idempotencyKey,
    });
  }

  const commonPaymentIntentParams = {
    paymentMethodId: paymentMethod.id,
    stripe,
    apiDetachFailedPaymentMethod,
    onSuccess,
    onFailure,
    onRetry,
  };

  if (!retryStatus) {
    // 3a. Attempt to create the subscription.
    const createSubscriptionResult = await apiCreateSubscriptionWithPaymentMethod(
      {
        priceId: selectedPlan.plan_id,
        productId: selectedPlan.product_id,
        paymentMethodId: paymentMethod.id,
        idempotencyKey,
      }
    );
    return handlePaymentIntent({
      customer,
      invoiceId: createSubscriptionResult.latest_invoice.id,
      paymentIntentStatus:
        createSubscriptionResult.latest_invoice.payment_intent.status,
      paymentIntentClientSecret:
        createSubscriptionResult.latest_invoice.payment_intent.client_secret,
      ...commonPaymentIntentParams,
    });
  } else {
    // 3b. Retry payment for the subscription invoice created earlier.
    const { invoiceId } = retryStatus;
    const retryInvoiceResult = await apiRetryInvoice({
      invoiceId: retryStatus.invoiceId,
      paymentMethodId: paymentMethod.id,
      idempotencyKey,
    });
    return handlePaymentIntent({
      customer,
      invoiceId,
      paymentIntentStatus: retryInvoiceResult.payment_intent.status,
      paymentIntentClientSecret:
        retryInvoiceResult.payment_intent.client_secret,
      ...commonPaymentIntentParams,
    });
  }
}

async function handlePaymentIntent({
  customer,
  invoiceId,
  paymentIntentStatus,
  paymentIntentClientSecret,
  paymentMethodId,
  stripe,
  apiDetachFailedPaymentMethod,
  onSuccess,
  onFailure,
  onRetry,
}: {
  customer: Customer | null;
  invoiceId: string;
  paymentIntentStatus: string;
  paymentIntentClientSecret: string | null;
  paymentMethodId: string | undefined;
  stripe: Pick<Stripe, 'confirmCardPayment'>;
  apiDetachFailedPaymentMethod: SubscriptionCreateAuthServerAPIs['apiDetachFailedPaymentMethod'];
  onFailure: (error: PaymentError) => void;
  onRetry: (status: RetryStatus) => void;
  onSuccess: () => void;
}): Promise<void> {
  switch (paymentIntentStatus) {
    case 'succeeded': {
      return onSuccess();
    }
    case 'requires_payment_method': {
      // If this happens when a customer is trying to subscribe to their first
      // product, detach the payment method.  The user must enter a working
      // card to move on; we'll get a working payment method from that.
      // This does not affect functionality, thus not blocking.
      if (
        (!customer || (customer && customer.subscriptions.length === 0)) &&
        paymentMethodId
      ) {
        apiDetachFailedPaymentMethod({ paymentMethodId });
      }
      return onRetry({ invoiceId });
    }
    case 'requires_action': {
      if (!paymentIntentClientSecret) {
        return onFailure({ type: 'api_error' });
      }
      const confirmResult = await stripe.confirmCardPayment(
        paymentIntentClientSecret,
        { payment_method: paymentMethodId }
      );
      if (confirmResult.error) {
        return onFailure(confirmResult.error);
      }
      if (!confirmResult.paymentIntent) {
        return onFailure({ type: 'api_error' });
      }
      return handlePaymentIntent({
        customer,
        invoiceId,
        paymentIntentStatus: confirmResult.paymentIntent.status,
        paymentIntentClientSecret: confirmResult.paymentIntent.client_secret,
        paymentMethodId,
        stripe,
        apiDetachFailedPaymentMethod,
        onSuccess,
        onFailure,
        onRetry,
      });
    }
    // Other payment_intent.status cases?
    default: {
      console.error('Unexpected payment intent status', paymentIntentStatus);
      return onFailure({ type: 'api_error' });
    }
  }
}

const isExistingStripeCustomer = (customer: Customer | null) =>
  customer &&
  customer.payment_provider === 'stripe' &&
  customer.subscriptions.length > 0;

const isExistingPaypalCustomer = (customer: Customer | null) =>
  customer &&
  customer.payment_provider === 'paypal' &&
  customer.subscriptions.length > 0;

const isNewCustomer = (customer: Customer | null) =>
  customer?.payment_provider === undefined ||
  customer?.payment_provider === 'not_chosen';

export default SubscriptionCreate;
