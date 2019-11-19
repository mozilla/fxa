import React, { useCallback, useState } from 'react';
import dayjs from 'dayjs';
import { formatCurrencyInCents } from '../../lib/formats';
import { useBooleanState } from '../../lib/hooks';
import { getErrorMessage } from '../../lib/errors';
import {
  APIState,
  Customer,
  CustomerSubscription,
  Plan,
} from '../../store/types';
import { metadataFromPlan } from '../../store/utils';
import PaymentForm from '../../components/PaymentForm';
import ErrorMessage from '../../components/ErrorMessage';
import { SubscriptionsProps } from './index';

type PaymentUpdateFormProps = {
  customer: APIState['customer'];
  customerSubscription: CustomerSubscription;
  resetUpdatePayment: SubscriptionsProps['resetUpdatePayment'];
  updatePayment: SubscriptionsProps['updatePayment'];
  updatePaymentStatus: APIState['updatePayment'];
  plan: Plan;
  updatePaymentMounted: SubscriptionsProps['updatePaymentMounted'];
  updatePaymentEngaged: SubscriptionsProps['updatePaymentEngaged'];
};

export const PaymentUpdateForm = ({
  updatePayment,
  updatePaymentStatus,
  resetUpdatePayment,
  customer,
  customerSubscription,
  plan,
  updatePaymentMounted,
  updatePaymentEngaged,
}: PaymentUpdateFormProps) => {
  const [updateRevealed, revealUpdate, hideUpdate] = useBooleanState();
  const [createTokenError, setCreateTokenError] = useState({
    type: '',
    error: false,
  });
  const onRevealUpdateClick = useCallback(() => {
    resetUpdatePayment();
    revealUpdate();
  }, [resetUpdatePayment, revealUpdate]);

  const onPayment = useCallback(
    (tokenResponse: stripe.TokenResponse) => {
      if (tokenResponse && tokenResponse.token) {
        updatePayment(tokenResponse.token.id, plan);
      } else {
        // This shouldn't happen with a successful createToken() call, but let's
        // display an error in case it does.
        const error: any = { type: 'api_error', error: true };
        setCreateTokenError(error);
      }
    },
    [updatePayment, setCreateTokenError, plan]
  );

  const onPaymentError = useCallback(
    (error: any) => {
      error.error = true;
      setCreateTokenError(error);
    },
    [setCreateTokenError]
  );

  // clear any error rendered with `ErrorMessage`
  const onChange = useCallback(() => {
    setCreateTokenError({ type: '', error: false });
    resetUpdatePayment();
  }, [
    createTokenError,
    updatePaymentStatus,
    setCreateTokenError,
    resetUpdatePayment,
  ]);

  const inProgress = updatePaymentStatus.loading;

  const { upgradeCTA } = metadataFromPlan(plan);

  const { last4, exp_month, exp_year } = customer.result as Customer;

  // TODO: date formats will need i18n someday
  const periodEndDate = dayjs
    .unix(customerSubscription.current_period_end)
    .format('MM/DD/YYYY');

  // https://github.com/iamkun/dayjs/issues/639
  const expirationDate = dayjs()
    .set('month', Number(exp_month))
    .set('year', Number(exp_year))
    .format('MMMM YYYY');

  return (
    <div className="payment-update">
      <h3 className="billing-title">
        <span className="title">Billing Information</span>
      </h3>
      <p className="billing-description">
        You are billed ${formatCurrencyInCents(plan.amount)} per {plan.interval}{' '}
        for {plan.product_name}. Your next payment occurs on {periodEndDate}.
      </p>
      {upgradeCTA && (
        <p
          className="upgrade-cta"
          data-testid="upgrade-cta"
          dangerouslySetInnerHTML={{ __html: upgradeCTA }}
        />
      )}
      {!updateRevealed ? (
        <div className="with-settings-button">
          <div className="card-details">
            <div className="last-four">
              {/* TODO: Need to find a way to display a card icon here? */}
              Card ending {last4}
            </div>
            <div className="expiry">Expires {expirationDate}</div>
          </div>
          <div className="action">
            <button
              data-testid="reveal-payment-update-button"
              className="settings-button"
              onClick={onRevealUpdateClick}
            >
              <span className="change-button">Change</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <ErrorMessage isVisible={!!createTokenError.error}>
            {createTokenError.error && (
              <p data-testid="error-payment-submission">
                {getErrorMessage(createTokenError.type)}
              </p>
            )}
          </ErrorMessage>

          <ErrorMessage isVisible={!!updatePaymentStatus.error}>
            {updatePaymentStatus.error && (
              <p data-testid="error-billing-update">
                {updatePaymentStatus.error.message}
              </p>
            )}
          </ErrorMessage>

          <PaymentForm
            {...{
              plan,
              onPayment,
              onPaymentError,
              inProgress,
              confirm: false,
              onCancel: hideUpdate,
              onChange,
              onMounted: updatePaymentMounted,
              onEngaged: updatePaymentEngaged,
            }}
          />
        </>
      )}
    </div>
  );
};

export default PaymentUpdateForm;
