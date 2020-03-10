import React, { useState, useCallback, useEffect, useContext } from 'react';
import { Plan, Profile } from '../../../store/types';

import { State as ValidatorState } from '../../../lib/validator';

import { useNonce } from '../../../lib/hooks';
import { getErrorMessage } from '../../../lib/errors';

import { SignInLayoutContext } from '../../../components/AppLayout';
import PaymentForm from '../../../components/PaymentForm';
import DialogMessage from '../../../components/DialogMessage';
import ErrorMessage from '../../../components/ErrorMessage';
import PlanDetails from '../PlanDetails';
import ProfileBanner from '../ProfileBanner';
import AccountActivatedBanner from './AccountActivatedBanner';

import { ProductProps } from '../index';
import * as Amplitude from '../../../lib/amplitude';
import { Localized } from 'fluent-react';

export type SubscriptionCreateProps = {
  profile: Profile;
  accountActivated: boolean;
  selectedPlan: Plan;
  createSubscriptionAndRefresh: ProductProps['createSubscriptionAndRefresh'];
  createSubscriptionStatus: ProductProps['createSubscriptionStatus'];
  resetCreateSubscription: ProductProps['resetCreateSubscription'];
  validatorInitialState?: ValidatorState;
};

export const SubscriptionCreate = ({
  profile,
  accountActivated,
  selectedPlan,
  createSubscriptionAndRefresh: createSubscriptionAndRefreshBase,
  createSubscriptionStatus,
  resetCreateSubscription: resetCreateSubscriptionBase,
  validatorInitialState,
}: SubscriptionCreateProps) => {
  const [submitNonce, refreshSubmitNonce] = useNonce();

  const resetCreateSubscription = useCallback(async () => {
    resetCreateSubscriptionBase();
    refreshSubmitNonce();
  }, [resetCreateSubscriptionBase, refreshSubmitNonce]);

  const createSubscriptionAndRefresh = useCallback(
    async (...args: Parameters<typeof createSubscriptionAndRefreshBase>) => {
      await createSubscriptionAndRefreshBase(...args);
      refreshSubmitNonce();
    },
    [createSubscriptionAndRefreshBase, refreshSubmitNonce]
  );

  // Hide the Firefox logo in layout if we want to display the avatar
  const { setHideLogo } = useContext(SignInLayoutContext);
  useEffect(() => {
    setHideLogo(!accountActivated);
  }, [setHideLogo, accountActivated]);

  const onFormMounted = useCallback(
    () => Amplitude.createSubscriptionMounted(selectedPlan),
    [selectedPlan]
  );

  const onFormEngaged = useCallback(
    () => Amplitude.createSubscriptionEngaged(selectedPlan),
    [selectedPlan]
  );

  // Reset subscription creation status on initial render.
  useEffect(
    () => void resetCreateSubscription(),
    // Prevent an infinite loop, here
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
        <Localized id="sub-update-title">
          <span className="title">Billing Information</span>
        </Localized>
      </h3>

      <ErrorMessage isVisible={!!createTokenError.error}>
        {createTokenError.error && (
          <Localized id={getErrorMessage(createTokenError.type)}>
            <p data-testid="error-payment-submission">
              {getErrorMessage(createTokenError.type)}
            </p>
          </Localized>
        )}
      </ErrorMessage>

      <ErrorMessage isVisible={isCardError}>
        <Localized id={getErrorMessage('card_error')}>
          <p data-testid="error-card-rejected">
            {getErrorMessage('card_error')}
          </p>
        </Localized>
      </ErrorMessage>

      {createSubscriptionStatus.error && !isCardError && (
        <DialogMessage
          className="dialog-error"
          onDismiss={resetCreateSubscription}
        >
          <Localized id="sub-failed">
            <h4 data-testid="error-subscription-failed">Subscription failed</h4>
          </Localized>
          <p>{createSubscriptionStatus.error.message}</p>
        </DialogMessage>
      )}

      <PaymentForm
        {...{
          submitNonce,
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
