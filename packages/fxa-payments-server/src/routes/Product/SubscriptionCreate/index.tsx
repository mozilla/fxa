import React, { useState, useCallback, useEffect, useContext } from 'react';
import { Plan } from '../../../lib/types';

import { State as ValidatorState } from '../../../lib/validator';

import { getErrorMessage } from '../../../lib/errors';

import { SignInLayoutContext } from '../../../components/AppLayout';
import PaymentForm from '../../../components/PaymentForm';
import DialogMessage from '../../../components/DialogMessage';
import ErrorMessage from '../../../components/ErrorMessage';
import PlanDetails from '../PlanDetails';
import ProfileBanner from '../ProfileBanner';
import AccountActivatedBanner from './AccountActivatedBanner';

import * as Amplitude from '../../../lib/amplitude';

import { useAwait, PromiseState } from '../../../lib/hooks';
import { apiCreateSubscription } from '../../../lib/apiClient';
import { AppContext } from '../../../lib/AppContext';

export type SubscriptionCreateProps = {
  selectedPlan: Plan;
  accountActivated?: boolean;
  validatorInitialState?: ValidatorState;
  initialCreateSubscriptionStatus?: PromiseState;
};

export const SubscriptionCreate = ({
  selectedPlan,
  accountActivated = false,
  validatorInitialState,
  initialCreateSubscriptionStatus,
}: SubscriptionCreateProps) => {
  const { profile, fetchCustomer, fetchSubscriptions } = useContext(AppContext);

  const [
    createSubscriptionStatus,
    createSubscription,
    resetCreateSubscription,
  ] = useAwait(apiCreateSubscription, {
    initialState: initialCreateSubscriptionStatus,
    executeImmediately: false,
  });

  const onFormMounted = useCallback(
    () => Amplitude.createSubscriptionMounted(selectedPlan),
    [selectedPlan]
  );

  const onFormEngaged = useCallback(
    () => Amplitude.createSubscriptionEngaged(selectedPlan),
    [selectedPlan]
  );

  // Hide the Firefox logo in layout if we want to display the avatar
  const { setHideLogo } = useContext(SignInLayoutContext);
  useEffect(() => {
    setHideLogo(!accountActivated);
  }, [setHideLogo, accountActivated]);

  const [createTokenError, setCreateTokenError] = useState({
    type: '',
    error: false,
  });

  const inProgress = createSubscriptionStatus.pending;

  const isCardError =
    createSubscriptionStatus.error &&
    (createSubscriptionStatus.error.code === 'card_declined' ||
      createSubscriptionStatus.error.code === 'incorrect_cvc');

  // clear any error rendered with `ErrorMessage` on form change
  const onChange = useCallback(() => {
    if (createTokenError.error) {
      setCreateTokenError({ type: '', error: false });
    } else if (isCardError) {
      resetCreateSubscription();
    }
  }, [
    createTokenError,
    setCreateTokenError,
    resetCreateSubscription,
    isCardError,
  ]);

  const onPayment = useCallback(
    async (tokenResponse: stripe.TokenResponse, name: string) => {
      if (tokenResponse && tokenResponse.token) {
        await createSubscription({
          paymentToken: tokenResponse.token.id,
          planId: selectedPlan.plan_id,
          productId: selectedPlan.product_id,
          displayName: name,
        });
        await Promise.all([fetchCustomer(), fetchSubscriptions()]);
      } else {
        // This shouldn't happen with a successful createToken() call, but let's
        // display an error in case it does.
        const error: any = { type: 'api_error', error: true };
        setCreateTokenError(error);
      }
    },
    [selectedPlan, createSubscription, fetchCustomer, fetchSubscriptions, setCreateTokenError]
  );

  const onPaymentError = useCallback(
    (error: any) => {
      error.error = true;
      setCreateTokenError(error);
    },
    [setCreateTokenError]
  );

  if (!profile) {
    return null;
  }

  return (
    <div className="product-payment" data-testid="subscription-create">
      {accountActivated ? (
        <AccountActivatedBanner profile={profile} />
      ) : (
        <ProfileBanner profile={profile} />
      )}
      <hr />

      <PlanDetails plan={selectedPlan} />

      <hr />

      <h3 className="billing-title">
        <span className="title">Billing Information</span>
      </h3>

      <ErrorMessage isVisible={!!createTokenError.error}>
        {createTokenError.error && (
          <p data-testid="error-payment-submission">
            {getErrorMessage(createTokenError.type)}
          </p>
        )}
      </ErrorMessage>

      <ErrorMessage isVisible={isCardError}>
        <p data-testid="error-card-rejected">{getErrorMessage('card_error')}</p>
      </ErrorMessage>

      {createSubscriptionStatus.error && !isCardError && (
        <DialogMessage
          className="dialog-error"
          onDismiss={resetCreateSubscription}
        >
          <h4 data-testid="error-subscription-failed">Subscription failed</h4>
          <p>{createSubscriptionStatus.error.message}</p>
        </DialogMessage>
      )}

      <PaymentForm
        {...{
          onPayment,
          onPaymentError,
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
  );
};

export default SubscriptionCreate;
