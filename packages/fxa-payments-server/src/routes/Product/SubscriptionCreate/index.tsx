import React, { useState, useCallback, useEffect } from 'react';
import { Plan, Profile } from '../../../store/types';

import { State as ValidatorState } from '../../../lib/validator';

import { getErrorMessage } from '../../../lib/errors';

import PaymentForm from '../../../components/PaymentForm';
import DialogMessage from '../../../components/DialogMessage';
import ErrorMessage from '../../../components/ErrorMessage';
import PlanDetails from '../PlanDetails';
import ProfileBanner from '../ProfileBanner';
import AccountActivatedBanner from './AccountActivatedBanner';

import { ProductProps } from '../index';

export type SubscriptionCreateProps = {
  profile: Profile;
  accountActivated: boolean;
  selectedPlan: Plan;
  createSubscriptionAndRefresh: ProductProps['createSubscriptionAndRefresh'];
  createSubscriptionStatus: ProductProps['createSubscriptionStatus'];
  resetCreateSubscription: ProductProps['resetCreateSubscription'];
  createSubscriptionMounted: ProductProps['createSubscriptionMounted'];
  createSubscriptionEngaged: ProductProps['createSubscriptionEngaged'];
  validatorInitialState?: ValidatorState;
};

export const SubscriptionCreate = ({
  profile,
  accountActivated,
  selectedPlan,
  createSubscriptionAndRefresh,
  createSubscriptionStatus,
  resetCreateSubscription,
  validatorInitialState,
  createSubscriptionMounted,
  createSubscriptionEngaged,
}: SubscriptionCreateProps) => {
  // Reset subscription creation status on initial render.
  useEffect(() => {
    resetCreateSubscription();
  }, [resetCreateSubscription]);

  const [createTokenError, setCreateTokenError] = useState({
    type: '',
    error: false,
  });

  const inProgress = createSubscriptionStatus.loading;

  const isCardError =
    createSubscriptionStatus.error !== null &&
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
    (tokenResponse: stripe.TokenResponse, name: string) => {
      if (tokenResponse && tokenResponse.token) {
        createSubscriptionAndRefresh(
          tokenResponse.token.id,
          selectedPlan,
          name
        );
      } else {
        // This shouldn't happen with a successful createToken() call, but let's
        // display an error in case it does.
        const error: any = { type: 'api_error', error: true };
        setCreateTokenError(error);
      }
    },
    [selectedPlan, createSubscriptionAndRefresh, setCreateTokenError]
  );

  const onPaymentError = useCallback(
    (error: any) => {
      error.error = true;
      setCreateTokenError(error);
    },
    [setCreateTokenError]
  );

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
          onMounted: createSubscriptionMounted,
          onEngaged: createSubscriptionEngaged,
        }}
      />
    </div>
  );
};

export default SubscriptionCreate;
