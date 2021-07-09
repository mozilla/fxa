import React, { useState, useCallback, Suspense, useContext } from 'react';
import { Stripe } from '@stripe/stripe-js';
import classNames from 'classnames';
import { Plan, Profile, Customer } from '../../../store/types';
import { State as ValidatorState } from '../../../lib/validator';

import { useNonce, usePaypalButtonSetup } from '../../../lib/hooks';

import PlanDetails from '../../../components/PlanDetails';
import Header from '../../../components/Header';
import PaymentForm, {
  BasePaymentFormProps,
  StripePaymentSubmitResult,
  StripePaymentUpdateResult,
  PaypalPaymentSubmitResult,
  StripeSubmitHandler,
  StripeUpdateHandler,
} from '../../../components/PaymentForm';
import AcceptedCards from '../../Product/AcceptedCards';
import PaymentErrorView from '../../../components/PaymentErrorView';
import PaymentLegalBlurb from '../../../components/PaymentLegalBlurb';
import { SubscriptionTitle } from '../../../components/SubscriptionTitle';
import { TermsAndPrivacy } from '../../../components/TermsAndPrivacy';
import { PaymentProcessing } from '../../../components/PaymentProcessing';
import {
  getPaymentProviderMappedVal,
  PaymentProvider,
  PaymentProviders,
} from '../../../lib/PaymentProvider';
import { hasPaymentProvider } from '../../../lib/customer';
import {
  handleSubscriptionPayment,
  PaymentError,
  RetryStatus,
} from '../../../lib/stripe';

import * as Amplitude from '../../../lib/amplitude';
import { Localized } from '@fluent/react';
import * as apiClient from '../../../lib/apiClient';

import '../../Product/SubscriptionCreate/index.scss';

import AppContext from '../../../lib/AppContext';
import { ButtonBaseProps } from '../../../components/PayPalButton';
import { apiCapturePaypalPayment } from '../../../lib/apiClient';
const PaypalButton = React.lazy(
  () => import('../../../components/PayPalButton')
);

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
  const paymentProvider: PaymentProvider | undefined =
    customer?.payment_provider;

  const { config } = useContext(AppContext);

  usePaypalButtonSetup(config, setPaypalScriptLoaded, paypalButtonBase);

  const [inProgress, setInProgress] = useState(false);

  const [paymentError, setPaymentError] = useState<PaymentError>(
    paymentErrorInitialState
  );
  const [retryStatus, setRetryStatus] = useState<RetryStatus>();

  // clear any error rendered with `ErrorMessage` on form change
  const onChange = useCallback(() => {
    if (paymentError) {
      setPaymentError(undefined);
    }
  }, [paymentError, setPaymentError]);

  const onStripeFormSubmit: StripeSubmitHandler | StripeUpdateHandler =
    useCallback(
      async ({
        stripe: stripeFromParams,
        ...params
      }: StripePaymentSubmitResult | StripePaymentUpdateResult) => {
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

  const onPaypalFormSubmit: (x: PaypalPaymentSubmitResult) => void =
    useCallback(
      async ({ priceId, idempotencyKey }: PaypalPaymentSubmitResult) => {
        setInProgress(true);
        try {
          await apiCapturePaypalPayment({
            idempotencyKey,
            priceId,
          });
          refreshSubscriptions();
        } catch (error) {
          setPaymentError(error);
        }
        setInProgress(false);
        refreshSubmitNonce();
      },
      [setInProgress, refreshSubmitNonce, refreshSubscriptions]
    );

  const onSubmit = getPaymentProviderMappedVal<
    BasePaymentFormProps['onSubmit']
  >(customer, {
    [PaymentProviders.stripe]: onStripeFormSubmit,
    [PaymentProviders.paypal]: onPaypalFormSubmit,
  });

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
          plan={selectedPlan}
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
          {!hasPaymentProvider(customer) && (
            <>
              {paypalScriptLoaded && (
                <>
                  <div
                    className="subscription-create-pay-with-other"
                    data-testid="pay-with-other"
                  >
                    <Suspense fallback={<div>Loading...</div>}>
                      <Localized id="pay-with-heading-other">
                        <p className="pay-with-heading">
                          Select payment option
                        </p>
                      </Localized>
                      <div className="paypal-button">
                        <PaypalButton
                          apiClientOverrides={apiClientOverrides}
                          currencyCode={selectedPlan.currency}
                          customer={customer}
                          idempotencyKey={submitNonce}
                          refreshSubmitNonce={refreshSubmitNonce}
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
                  <div>
                    <Localized id="pay-with-heading-card-or">
                      <p className="pay-with-heading">Or pay with card</p>
                    </Localized>
                    <AcceptedCards />
                  </div>
                </>
              )}
              {!paypalScriptLoaded && (
                <div>
                  <Localized id="pay-with-heading-card-only">
                    <p className="pay-with-heading">Pay with card</p>
                  </Localized>
                  <AcceptedCards />
                </div>
              )}
            </>
          )}

          {hasPaymentProvider(customer) && (
            <Localized id="pay-with-heading-saved">
              <p className="pay-with-heading">Use saved payment option</p>
            </Localized>
          )}

          <div>
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

export default SubscriptionCreate;
