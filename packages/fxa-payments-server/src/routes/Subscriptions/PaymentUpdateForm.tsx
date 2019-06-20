import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useBooleanState } from '../../lib/hooks';
import { Customer, UpdatePaymentFetchState, CustomerFetchState, CustomerSubscription, PlansFetchState, Plan } from '../../store/types';
import dayjs from 'dayjs';

import PaymentForm from '../../components/PaymentForm';
import DialogMessage from '../../components/DialogMessage';
import AppContext from '../../lib/AppContext';

type PaymentUpdateFormProps = {
  accessToken: string,
  customer: CustomerFetchState,
  customerSubscription: CustomerSubscription,
  resetUpdatePayment: Function,
  updatePayment: Function,
  updatePaymentStatus: UpdatePaymentFetchState,
  plan: Plan,
};

export const PaymentUpdateForm = ({
  accessToken,
  updatePayment,
  updatePaymentStatus,
  resetUpdatePayment,
  customer,
  customerSubscription,
  plan,
}: PaymentUpdateFormProps) => {
  const [ updateRevealed, revealUpdate, hideUpdate ] = useBooleanState();  
  const [ createTokenError, setCreateTokenError ] = useState({ message: null });
  const onRevealUpdateClick = useCallback(() => {
    resetUpdatePayment();
    revealUpdate();
  }, [ resetUpdatePayment, revealUpdate ]);

  const onPayment = useCallback((tokenResponse: stripe.TokenResponse) => {
    if (tokenResponse && tokenResponse.token) {
      updatePayment(accessToken, {
        paymentToken: tokenResponse.token.id,
      });
    } else {
      // This shouldn't happen with a successful createToken() call, but let's
      // display an error in case it does.
      const error: any = { message: 'No token response received from Stripe' };
      setCreateTokenError(error);
    }
  }, [ accessToken ]);

  const onPaymentError = useCallback((error: any) => {
    setCreateTokenError(error);
  }, [ setCreateTokenError, accessToken ]);

  const inProgress =
    updatePaymentStatus.loading
      || updatePaymentStatus.error !== null;

  const {
    last4,
    exp_month,
    exp_year
  } = (customer.result as Customer);

  // TODO: date formats will need i18n someday
  const periodEndDate = dayjs
    .unix(customerSubscription.current_period_end)
    .format('MM/DD/YYYY');

  return (
    <div className="payment-update">
      <h3 className="billing-title"><span>Billing information</span></h3>
      <p className="billing-description">
        You'll be billed ${plan.amount / 100} per {plan.interval} for {plan.plan_name}.
        Your next payment occurs on {periodEndDate}.
      </p>
      {! updateRevealed ? (
        <div className="with-settings-button">
          <div className="card-details">
            <div>
              {/* TODO: Need to find a way to display a card icon here? */}
              Card ending {last4}
            </div>
            <div>
              Expires {exp_month}/{exp_year}
            </div>
          </div>
          <div className="action">
            <button className="settings-button" onClick={onRevealUpdateClick}>
              <span className="change-button">Change...</span>
            </button>
          </div>
        </div>
      ) : <>
        <PaymentForm {...{
          onPayment,
          onPaymentError,
          inProgress,
          confirm: false,
          onCancel: hideUpdate
        }} />
      </>}
    </div>
  );
};

export default PaymentUpdateForm;
