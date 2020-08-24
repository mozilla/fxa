/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { Localized } from '@fluent/react';
import dayjs from 'dayjs';
import { useNonce } from '../../lib/hooks';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { getErrorMessage } from '../../lib/errors';
import { Stripe, StripeCardElement, StripeError } from '@stripe/stripe-js';
import { Customer } from '../../store/types';
import AlertBar from '../../components/AlertBar';
import PaymentForm from '../../components/PaymentFormV2';
import ErrorMessage from '../../components/ErrorMessage';
import * as Amplitude from '../../lib/amplitude';
import * as apiClient from 'fxa-payments-server/src/lib/apiClient';

type PaymentUpdateError = undefined | StripeError;

export type PaymentUpdateStripeAPIs = Pick<Stripe, 'confirmCardSetup'>;

export type PaymentUpdateAuthServerAPIs = Pick<
  typeof apiClient,
  'apiCreateSetupIntent' | 'apiUpdateDefaultPaymentMethod'
>;

export type PaymentUpdateFormProps = {
  customer: Customer;
  refreshSubscriptions: () => void;
  setUpdatePaymentIsSuccess: () => void;
  resetUpdatePaymentIsSuccess: () => void;
  paymentErrorInitialState?: PaymentUpdateError;
  stripeOverride?: PaymentUpdateStripeAPIs;
  apiClientOverrides?: Partial<PaymentUpdateAuthServerAPIs>;
};

export const PaymentUpdateForm = ({
  customer,
  refreshSubscriptions,
  setUpdatePaymentIsSuccess,
  resetUpdatePaymentIsSuccess,
  paymentErrorInitialState,
  stripeOverride,
  apiClientOverrides,
}: PaymentUpdateFormProps) => {
  const [submitNonce, refreshSubmitNonce] = useNonce();
  const [updateRevealed, revealUpdate, hideUpdate] = useBooleanState();
  const [inProgress, setInProgress, resetInProgress] = useBooleanState(false);
  const [paymentError, setPaymentError] = useState<PaymentUpdateError>(
    paymentErrorInitialState
  );

  const onRevealUpdateClick = useCallback(() => {
    refreshSubmitNonce();
    revealUpdate();
    resetInProgress();
    resetUpdatePaymentIsSuccess();
  }, [
    refreshSubmitNonce,
    revealUpdate,
    resetInProgress,
    resetUpdatePaymentIsSuccess,
  ]);

  const onSubmit = useCallback(
    async ({ stripe: stripeFromParams, ...params }) => {
      setInProgress();
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
      resetInProgress();
      refreshSubmitNonce();
    },
    []
  );

  // clear any error rendered with `ErrorMessage`
  const onChange = useCallback(() => {
    if (paymentError) {
      setPaymentError(undefined);
    }
  }, [paymentError, setPaymentError]);

  const onFormMounted = useCallback(() => Amplitude.updatePaymentMounted(), []);

  const onFormEngaged = useCallback(() => Amplitude.updatePaymentEngaged(), []);

  const { last4, exp_month, exp_year } = customer;

  // https://github.com/iamkun/dayjs/issues/639
  const expirationDate = dayjs()
    .set('month', Number(exp_month) - 1)
    .set('year', Number(exp_year))
    .format('MMMM YYYY');

  return (
    <div className="settings-unit">
      <div className="payment-update" data-testid="payment-update">
        {inProgress && (
          <AlertBar className="alert alertPending">
            <Localized id="sub-route-idx-updating">
              <span>Updating billing information...</span>
            </Localized>
          </AlertBar>
        )}

        <header>
          <h2 className="billing-title">
            <Localized id="sub-update-title">
              <span className="title">Billing Information</span>
            </Localized>
          </h2>
        </header>
        {!updateRevealed ? (
          <div className="with-settings-button">
            <div className="card-details">
              {last4 && expirationDate && (
                <>
                  {/* TODO: Need to find a way to display a card icon here? */}
                  <Localized id="sub-update-card-ending" vars={{ last: last4 }}>
                    <div className="last-four">Card ending {last4}</div>
                  </Localized>
                  <Localized id="pay-update-card-exp" vars={{ expirationDate }}>
                    <div data-testid="card-expiration-date" className="expiry">
                      Expires {expirationDate}
                    </div>
                  </Localized>
                </>
              )}
            </div>
            <div className="action">
              <button
                data-testid="reveal-payment-update-button"
                className="settings-button"
                onClick={onRevealUpdateClick}
              >
                <Localized id="pay-update-change-btn">
                  <span className="change-button" data-testid="change-button">
                    Change
                  </span>
                </Localized>
              </button>
            </div>
          </div>
        ) : (
          <>
            <ErrorMessage isVisible={!!paymentError}>
              {paymentError && (
                <Localized id={getErrorMessage(paymentError.code || 'UNKNOWN')}>
                  <p data-testid="error-payment-submission">
                    {getErrorMessage(paymentError.code || 'UNKNOWN')}
                  </p>
                </Localized>
              )}
            </ErrorMessage>
            <PaymentForm
              {...{
                submitNonce,
                onSubmit,
                inProgress,
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
    </div>
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
