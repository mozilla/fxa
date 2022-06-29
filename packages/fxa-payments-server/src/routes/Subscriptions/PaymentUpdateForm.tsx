/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { Suspense, useCallback, useContext, useState } from 'react';
import { Localized } from '@fluent/react';
import dayjs from 'dayjs';
import { Stripe, StripeCardElement, StripeError } from '@stripe/stripe-js';

import { useBooleanState } from 'fxa-react/lib/hooks';

import { useNonce, usePaypalButtonSetup } from '../../lib/hooks';
import { getErrorMessage } from '../../lib/errors';
import { AppContext } from '../../lib/AppContext';
import { Customer, Plan } from '../../store/types';

import * as Amplitude from '../../lib/amplitude';
import * as apiClient from '../../lib/apiClient';
import * as Provider from '../../lib/PaymentProvider';

import errorIcon from '../../images/error.svg';

import AlertBar from '../../components/AlertBar';
import PaymentForm from '../../components/PaymentForm';
import ErrorMessage from '../../components/ErrorMessage';
import { DialogMessage } from '../../components/DialogMessage';
import { ButtonBaseProps } from '../../components/PayPalButton';
import PaymentProviderDetails from '../../components/PaymentProviderDetails';

import { ActionButton } from './ActionButton';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import {
  PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE,
  PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT,
} from 'fxa-shared/subscriptions/types';

const PaypalButton = React.lazy(() => import('../../components/PayPalButton'));

type PaymentUpdateError = undefined | StripeError;

export type PaymentUpdateStripeAPIs = Pick<Stripe, 'confirmCardSetup'>;

export type PaymentUpdateAuthServerAPIs = Pick<
  typeof apiClient,
  'apiCreateSetupIntent' | 'apiUpdateDefaultPaymentMethod'
>;

export type PaymentUpdateFormProps = {
  plan: Plan | null;
  customer: Customer;
  refreshSubscriptions: () => void;
  setUpdatePaymentIsSuccess: () => void;
  resetUpdatePaymentIsSuccess: () => void;
  paymentErrorInitialState?: PaymentUpdateError;
  stripeOverride?: PaymentUpdateStripeAPIs;
  apiClientOverrides?: Partial<PaymentUpdateAuthServerAPIs>;
  paypalButtonBase?: React.FC<ButtonBaseProps>;
};

export const PaymentUpdateForm = ({
  plan,
  customer,
  refreshSubscriptions,
  setUpdatePaymentIsSuccess,
  resetUpdatePaymentIsSuccess,
  paymentErrorInitialState,
  stripeOverride,
  apiClientOverrides,
  paypalButtonBase,
}: PaymentUpdateFormProps) => {
  const [submitNonce, refreshSubmitNonce] = useNonce();
  const [updateRevealed, revealUpdate, hideUpdate] = useBooleanState();
  const [
    stripeSubmitInProgress,
    stripeSubmitSetInProgress,
    stripeSubmitResetInProgress,
  ] = useBooleanState(false);
  const [transactionInProgress, setTransactionInProgress] = useState(false);

  const [fixPaymentModalRevealed, revealFixPaymentModal, hideFixPaymentModal] =
    useBooleanState(false);

  const [paymentError, setPaymentError] = useState<PaymentUpdateError>(
    paymentErrorInitialState
  );

  const onRevealUpdateClick = useCallback(() => {
    refreshSubmitNonce();
    revealUpdate();
    stripeSubmitResetInProgress();
    resetUpdatePaymentIsSuccess();
  }, [
    refreshSubmitNonce,
    revealUpdate,
    stripeSubmitResetInProgress,
    resetUpdatePaymentIsSuccess,
  ]);

  const { exp_month, exp_year, payment_provider, paypal_payment_error } =
    customer;

  const actionButton = (
    <ActionButton
      {...{ customer, onRevealUpdateClick, revealFixPaymentModal }}
    />
  );

  const billingAgreementErrorAlertBarContent = () => (
    <Localized
      id="sub-route-missing-billing-agreement-payment-alert"
      elems={{ div: actionButton }}
    >
      <span>
        Invalid payment information; there is an error with your account.{' '}
        {actionButton}
      </span>
    </Localized>
  );

  const fundingSourceErrorAlertBarContent = () => (
    <Localized
      id="sub-route-funding-source-payment-alert"
      elems={{ div: actionButton }}
    >
      <span>
        Invalid payment information; there is an error with your account. This
        alert may take some time to clear after you successfully update your
        information. {actionButton}
      </span>
    </Localized>
  );

  const getPaypalErrorAlertBarContent = () => {
    switch (paypal_payment_error) {
      case PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT: {
        return billingAgreementErrorAlertBarContent();
      }
      case PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE: {
        return fundingSourceErrorAlertBarContent();
      }
      default: {
        return null;
      }
    }
  };

  const { config } = useContext(AppContext);
  const [paypalScriptLoaded, setPaypalScriptLoaded] = useState(false);

  usePaypalButtonSetup(config, setPaypalScriptLoaded, paypalButtonBase);

  const onSubmit = useCallback(
    async ({ stripe: stripeFromParams, ...params }) => {
      stripeSubmitSetInProgress();
      resetUpdatePaymentIsSuccess();
      try {
        await handlePaymentUpdate({
          ...params,
          ...apiClient,
          ...apiClientOverrides,
          stripe:
            stripeOverride /* istanbul ignore next - used for testing */ ||
            stripeFromParams,
          onFailure: setPaymentError,
          onSuccess: () => {
            hideUpdate();
            setUpdatePaymentIsSuccess();
            refreshSubscriptions();
          },
        });
      } catch (error) {
        console.error('handleSubscriptionPayment failed', error);
        setPaymentError(error);
      }
      stripeSubmitResetInProgress();
      refreshSubmitNonce();
    },
    [
      stripeSubmitSetInProgress,
      resetUpdatePaymentIsSuccess,
      setPaymentError,
      apiClientOverrides,
      hideUpdate,
      refreshSubmitNonce,
      refreshSubscriptions,
      setUpdatePaymentIsSuccess,
      stripeOverride,
      stripeSubmitResetInProgress,
    ]
  );

  // clear any error rendered with `ErrorMessage`
  const onChange = useCallback(() => {
    if (paymentError) {
      setPaymentError(undefined);
    }
  }, [paymentError, setPaymentError]);

  const onFormMounted = useCallback(() => Amplitude.updatePaymentMounted(), []);
  const onFormEngaged = useCallback(() => Amplitude.updatePaymentEngaged(), []);

  // https://github.com/iamkun/dayjs/issues/639
  const expirationDate = exp_month && exp_year && dayjs()
    .set('month', Number(exp_month) - 1)
    .set('year', Number(exp_year))
    .format('MMMM YYYY');

  return (
    <section className="settings-unit" aria-labelledby="payment-information">
      <div className="payment-update" data-testid="payment-update">
        {stripeSubmitInProgress && (
          <AlertBar className="alert alertPending">
            <Localized id="sub-route-idx-updating">
              <span>Updating billing information...</span>
            </Localized>
          </AlertBar>
        )}

        {!transactionInProgress && paypal_payment_error && (
          <AlertBar className="alert alertError">
            {getPaypalErrorAlertBarContent()}
          </AlertBar>
        )}

        {transactionInProgress && (
          <LoadingOverlay isLoading={transactionInProgress} />
        )}

        {!transactionInProgress && fixPaymentModalRevealed && (
          <DialogMessage
            data-testid="billing-info-modal"
            onDismiss={hideFixPaymentModal}
            className="billing-info-modal"
          >
            <img id="error-icon" src={errorIcon} alt="error icon" />
            <Localized id="sub-route-payment-modal-heading">
              <h2>Invalid billing information</h2>
            </Localized>
            <Localized id="sub-route-payment-modal-message">
              <p>
                There seems to be an error with your PayPal account, we need you
                to take the necessary steps to resolve this payment issue.
              </p>
            </Localized>
            {paypalScriptLoaded && (
              <Suspense fallback={<div>Loading...</div>}>
                <div className="paypal-button">
                  <PaypalButton
                    disabled={false}
                    customer={customer}
                    idempotencyKey={submitNonce}
                    refreshSubmitNonce={refreshSubmitNonce}
                    selectedPlan={plan!}
                    newPaypalAgreement={false}
                    postSubscriptionAttemptPaypalCallback={refreshSubscriptions}
                    setSubscriptionError={setPaymentError}
                    apiClientOverrides={apiClientOverrides}
                    setTransactionInProgress={setTransactionInProgress}
                    ButtonBase={paypalButtonBase}
                  />
                </div>
              </Suspense>
            )}
          </DialogMessage>
        )}

        <header id="payment-information">
          <h2 className="billing-title">
            <Localized id="sub-update-payment-title">
              <span className="title">Payment information</span>
            </Localized>
          </h2>
        </header>
        {!updateRevealed ? (
          <div className="with-settings-button">
            <div className="card-details stack-card-details">
              <PaymentProviderDetails customer={customer} />
              {expirationDate && Provider.isStripe(payment_provider) && (
                <Localized id="pay-update-card-exp" vars={{ expirationDate }}>
                  <div data-testid="card-expiration-date" className="expiry">
                    Expires {expirationDate}
                  </div>
                </Localized>
              )}
            </div>
            {actionButton}
          </div>
        ) : (
          <>
            <ErrorMessage isVisible={!!paymentError}>
              {paymentError && (
                <Localized id={getErrorMessage(paymentError)}>
                  <p data-testid="error-payment-submission">
                    {getErrorMessage(paymentError)}
                  </p>
                </Localized>
              )}
            </ErrorMessage>
            <PaymentForm
              {...{
                submitNonce,
                onSubmit,
                inProgress: stripeSubmitInProgress,
                confirm: false,
                onCancel: hideUpdate,
                onChange,
                onMounted: onFormMounted,
                onEngaged: onFormEngaged,
              }}
            />
          </>
        )}
      </div>
    </section>
  );
};

async function handlePaymentUpdate({
  stripe,
  name,
  card,
  apiCreateSetupIntent,
  apiUpdateDefaultPaymentMethod,
  onFailure,
  onSuccess,
}: {
  stripe: PaymentUpdateStripeAPIs;
  name: string;
  card: StripeCardElement;
  onFailure: (error: PaymentUpdateError) => void;
  onSuccess: () => void;
} & PaymentUpdateAuthServerAPIs) {
  // 1. Create the setup intent
  const filteredIntent = await apiCreateSetupIntent();

  // 2. Confirm the setup intent with a card from the payment form
  // Note: This client-side Stripe API also handles SCA auth dialogs
  const { setupIntent, error: setupError } = await stripe.confirmCardSetup(
    filteredIntent.client_secret,
    {
      payment_method: {
        card,
        billing_details: { name },
      },
    }
  );
  if (setupError) {
    return onFailure(setupError);
  }
  if (!setupIntent) {
    return onFailure({ type: 'card_error' });
  }

  // 3. Use the payment method ID from the setup intent to update default payment method.
  const { payment_method: paymentMethodId } = setupIntent;
  if (typeof paymentMethodId !== 'string') {
    return onFailure({ type: 'card_error' });
  }
  await apiUpdateDefaultPaymentMethod({ paymentMethodId });

  // Finally, if there are no exceptions, we've succeeded.
  return onSuccess();
}

export default PaymentUpdateForm;
