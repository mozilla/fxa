import React, { useCallback, useContext, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { formatCurrencyInCents } from '../../lib/formats';
import { useBooleanState, useCheckboxState } from '../../lib/hooks';
import {
  Customer,
  CustomerSubscription,
  CustomerFetchState,
  UpdatePaymentFetchState,
  Subscription,
  Plan,
  CancelSubscriptionFetchState,
} from '../../store/types';

import PaymentUpdateForm from './PaymentUpdateForm';
import DialogMessage from '../../components/DialogMessage';
import AppContext from '../../lib/AppContext';
import fpnImage from '../../images/fpn';

type SubscriptionItemProps = {
  customerSubscription: CustomerSubscription;
  subscription: Subscription | null;
  plan: Plan | null;
  cancelSubscription: Function;
  reactivateSubscription: Function;
  customer: CustomerFetchState;
  updatePaymentStatus: UpdatePaymentFetchState;
  resetUpdatePayment: Function;
  updatePayment: Function;
  cancelSubscriptionMounted: Function;
  cancelSubscriptionEngaged: Function;
  cancelSubscriptionStatus: CancelSubscriptionFetchState;
  updatePaymentMounted: Function;
  updatePaymentEngaged: Function;
};
export const SubscriptionItem = ({
  subscription,
  cancelSubscription,
  cancelSubscriptionStatus,
  reactivateSubscription,
  customer,
  plan,
  updatePayment,
  resetUpdatePayment,
  updatePaymentStatus,
  customerSubscription,
  cancelSubscriptionMounted,
  cancelSubscriptionEngaged,
  updatePaymentMounted,
  updatePaymentEngaged,
}: SubscriptionItemProps) => {
  const { locationReload } = useContext(AppContext);

  if (!subscription) {
    // TOOD: Maybe need a better message here? This shouldn't happen. But, if it
    // does, it's because subhub reports a subscription that we don't have in
    // the fxa-auth-server database. The two should be kept in eventual sync.
    return (
      <DialogMessage className="dialog-error" onDismiss={locationReload}>
        <h4 data-testid="error-fxa-missing-subscription">
          Problem loading subscriptions
        </h4>
        <p>Please try again later.</p>
      </DialogMessage>
    );
  }

  if (!plan) {
    // TODO: This really shouldn't happen, would mean the user has a
    // subscription to a plan that no longer exists in API results.
    return (
      <DialogMessage className="dialog-error" onDismiss={locationReload}>
        <h4 data-testid="error-subhub-missing-plan">Plan not found</h4>
        <p>No such plan for this subscription.</p>
      </DialogMessage>
    );
  }

  return (
    <div className="settings-unit">
      <div className="subscription" data-testid="subscription-item">
        <header>
          <h2>{plan.product_name}</h2>
        </header>

        {!customerSubscription.cancel_at_period_end ? (
          <>
            <PaymentUpdateForm
              {...{
                plan,
                customerSubscription,
                customer,
                updatePayment,
                resetUpdatePayment,
                updatePaymentStatus,
                updatePaymentMounted,
                updatePaymentEngaged,
              }}
            />
            <CancelSubscriptionPanel
              {...{
                cancelSubscription,
                cancelSubscriptionEngaged,
                cancelSubscriptionMounted,
                cancelSubscriptionStatus,
                customerSubscription,
                plan,
              }}
            />
          </>
        ) : (
          <>
            <ReactivateSubscriptionPanel
              {...{
                plan,
                customer,
                customerSubscription,
                subscription,
                reactivateSubscription,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

type CancelSubscriptionPanelProps = {
  plan: Plan;
  cancelSubscription: Function;
  customerSubscription: CustomerSubscription;
  cancelSubscriptionMounted: Function;
  cancelSubscriptionEngaged: Function;
  cancelSubscriptionStatus: CancelSubscriptionFetchState;
};

const CancelSubscriptionPanel = ({
  plan,
  cancelSubscription,
  customerSubscription: { subscription_id, current_period_end },
  cancelSubscriptionMounted,
  cancelSubscriptionEngaged,
  cancelSubscriptionStatus,
}: CancelSubscriptionPanelProps) => {
  const [cancelRevealed, revealCancel, hideCancel] = useBooleanState();
  const [confirmationChecked, onConfirmationChanged] = useCheckboxState();

  const confirmCancellation = useCallback(() => {
    cancelSubscription(subscription_id, plan);
  }, [cancelSubscription, subscription_id, plan]);

  // TODO: date formats will need i18n someday
  const periodEndDate = dayjs.unix(current_period_end).format('MMMM DD, YYYY');

  const viewed = useRef(false);
  const engaged = useRef(false);

  useEffect(() => {
    if (!viewed.current && cancelRevealed) {
      cancelSubscriptionMounted(plan);
      viewed.current = true;
    }
  }, [cancelRevealed, viewed, plan, cancelSubscriptionMounted]);

  const engage = useCallback(() => {
    if (!engaged.current) {
      cancelSubscriptionEngaged(plan);
      engaged.current = true;
    }
  }, [engaged, plan, cancelSubscriptionEngaged]);

  const engagedOnHideCancel = useCallback(() => {
    engage();
    hideCancel();
  }, [hideCancel, engage]);

  const engagedOnConfirmationChanged = useCallback(
    evt => {
      engage();
      onConfirmationChanged(evt);
    },
    [onConfirmationChanged, engage]
  );

  return (
    <>
      <div className="cancel-subscription">
        {!cancelRevealed ? (
          <>
            <div className="with-settings-button">
              <div className="card-details">
                <h3>Cancel Subscription</h3>
              </div>
              <div className="action">
                <button
                  className="settings-button"
                  onClick={revealCancel}
                  data-testid="reveal-cancel-subscription-button"
                >
                  <span className="change-button">Cancel</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3>Cancel Subscription</h3>
            <p>
              You will no longer be able to use {plan.product_name} after{' '}
              {periodEndDate}, the last day of your billing cycle.
            </p>
            <p>
              <label>
                <input
                  data-testid="confirm-cancel-subscription-checkbox"
                  type="checkbox"
                  defaultChecked={confirmationChecked}
                  onChange={engagedOnConfirmationChanged}
                />
                <span>
                  Cancel my access and my saved information within{' '}
                  {plan.product_name} on {periodEndDate}
                </span>
              </label>
            </p>
            <div className="button-row">
              <button
                className="settings-button primary-button"
                onClick={engagedOnHideCancel}
              >
                Stay Subscribed
              </button>
              <button
                data-testid="cancel-subscription-button"
                className="settings-button secondary-button"
                onClick={confirmCancellation}
                disabled={
                  cancelSubscriptionStatus.loading || !confirmationChecked
                }
              >
                {cancelSubscriptionStatus.loading ? (
                  <span data-testid="spinner-update" className="spinner">
                    &nbsp;
                  </span>
                ) : (
                  <span>Cancel Subscription</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

type ReactivateSubscriptionPanelProps = {
  plan: Plan;
  customerSubscription: CustomerSubscription;
  subscription: Subscription;
  reactivateSubscription: Function;
  customer: CustomerFetchState;
};
const ReactivateSubscriptionPanel = ({
  plan,
  customerSubscription,
  subscription,
  reactivateSubscription,
  customer,
}: ReactivateSubscriptionPanelProps) => {
  const { subscription_id } = customerSubscription;
  const [
    reactivateConfirmationRevealed,
    revealReactivateConfirmation,
    hideReactivateConfirmation,
  ] = useBooleanState();

  const onReactivateClick = useCallback(() => {
    reactivateSubscription(subscription_id);
    hideReactivateConfirmation();
  }, [reactivateSubscription, subscription_id, hideReactivateConfirmation]);

  const { last4 } = customer.result as Customer;

  // TODO: date formats will need i18n someday
  const cancelledAtDate = dayjs
    .unix((subscription.cancelledAt as number) / 1000)
    .format('MMMM DD, YYYY');

  // TODO: date formats will need i18n someday
  const periodEndDate = dayjs
    .unix(customerSubscription.current_period_end)
    .format('MMMM DD, YYYY');

  return (
    <>
      {reactivateConfirmationRevealed && (
        <DialogMessage onDismiss={hideReactivateConfirmation}>
          <img
            className="fpn-reactivate-subscription"
            alt="Firefox Private Network"
            src={fpnImage}
          />
          <h4>Want to keep using {plan.product_name}?</h4>
          {/* TO DO: display card type, IE 'to the Visa card ending...' */}
          <p>
            Your access to {plan.product_name} will continue, and your billing
            cycle and payment will stay the same. Your next charge will be $
            {formatCurrencyInCents(plan.amount)} to the card ending in {last4}{' '}
            on {periodEndDate}.
          </p>
          <div className="action">
            <button
              className="settings-button"
              onClick={onReactivateClick}
              data-testid="reactivate-subscription-confirm-button"
            >
              <span className="change-button">Resubscribe</span>
            </button>
          </div>
        </DialogMessage>
      )}
      <div className="subscription-cancelled">
        <div className="with-settings-button">
          <div>
            <p>You cancelled your subscription on {cancelledAtDate}.</p>
            <p>
              You will lose access to {plan.product_name} on{' '}
              <strong>{periodEndDate}</strong>.
            </p>
          </div>
          <div className="action">
            <button
              className="settings-button"
              onClick={revealReactivateConfirmation}
              data-testid="reactivate-subscription-button"
            >
              <span className="change-button">Resubscribe</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionItem;
