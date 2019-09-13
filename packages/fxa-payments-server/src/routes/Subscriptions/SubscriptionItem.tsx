import React, { useCallback, useContext } from 'react';
import dayjs from 'dayjs';
import { useBooleanState, useCheckboxState } from '../../lib/hooks';
import {
  CustomerSubscription,
  CustomerFetchState,
  UpdatePaymentFetchState,
  Subscription,
  Plan,
} from '../../store/types';

import PaymentUpdateForm from './PaymentUpdateForm';
import DialogMessage from '../../components/DialogMessage';
import AppContext from '../../lib/AppContext';

type SubscriptionItemProps = {
  accessToken: string;
  customerSubscription: CustomerSubscription;
  subscription: Subscription | null;
  plan: Plan | null;
  cancelSubscription: Function;
  reactivateSubscription: Function;
  customer: CustomerFetchState;
  updatePaymentStatus: UpdatePaymentFetchState;
  resetUpdatePayment: Function;
  updatePayment: Function;
};
export const SubscriptionItem = ({
  accessToken,
  subscription,
  cancelSubscription,
  reactivateSubscription,
  customer,
  plan,
  updatePayment,
  resetUpdatePayment,
  updatePaymentStatus,
  customerSubscription,
}: SubscriptionItemProps) => {
  const { locationReload } = useContext(AppContext);

  if (!subscription) {
    // TOOD: Maybe need a better message here? This shouldn't happen. But, if it
    // does, it's because subhub reports a subscription that we don't have in
    // the fxa-auth-server database. The two should be kept in eventual sync.
    return (
      <DialogMessage className="dialog-error" onDismiss={locationReload}>
        <h4 data-testid="error-fxa-missing-subscription">Problem loading subscriptions</h4>
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
          <h2>{plan.plan_name}</h2>
        </header>

        {!customerSubscription.cancel_at_period_end ? (
          <>
            <PaymentUpdateForm
              {...{
                plan,
                customerSubscription,
                accessToken,
                customer,
                updatePayment,
                resetUpdatePayment,
                updatePaymentStatus,
              }}
            />
            <CancelSubscriptionPanel
              {...{
                accessToken,
                cancelSubscription,
                plan,
                customerSubscription,
              }}
            />
          </>
        ) : (
          <>
            <ReactivateSubscriptionPanel
              {...{
                accessToken,
                plan,
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
  accessToken: string;
  plan: Plan;
  cancelSubscription: Function;
  customerSubscription: CustomerSubscription;
};

const CancelSubscriptionPanel = ({
  accessToken,
  plan,
  cancelSubscription,
  customerSubscription: { subscription_id, current_period_end },
}: CancelSubscriptionPanelProps) => {
  const [cancelRevealed, revealCancel, hideCancel] = useBooleanState();
  const [confirmationChecked, onConfirmationChanged] = useCheckboxState();
  const confirmCancellation = useCallback(
    () => cancelSubscription(accessToken, subscription_id),
    [accessToken, cancelSubscription, subscription_id]
  );

  // TODO: date formats will need i18n someday
  const periodEndDate = dayjs.unix(current_period_end).format('MMMM DD, YYYY');

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
                <button className="settings-button" onClick={revealCancel} data-testid="reveal-cancel-subscription-button">
                  <span className="change-button">Cancel</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3>Cancel Subscription</h3>
            <p>
              Cancelling means you'll no longer be able to access any of the{' '}
              {plan.plan_name} features or your saved information after{' '}
              {periodEndDate}, the last day of your billing cycle.
            </p>
            <p>
              <label>
                <input
                  data-testid="confirm-cancel-subscription-checkbox"
                  type="checkbox"
                  defaultChecked={confirmationChecked}
                  onChange={onConfirmationChanged}
                />
                <span>Cancel my access and my saved information within{' '}
                {plan.plan_name} on {periodEndDate}</span>
              </label>
            </p>
            <div className="button-row">
              <button
                className="settings-button primary-button"
                onClick={hideCancel}
              >
                Stay Subscribed
              </button>
              <button
                data-testid="cancel-subscription-button"
                className="settings-button secondary-button"
                onClick={confirmCancellation}
                disabled={!confirmationChecked}
              >
                Cancel Subscription
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

type ReactivateSubscriptionPanelProps = {
  accessToken: string;
  plan: Plan;
  customerSubscription: CustomerSubscription;
  subscription: Subscription;
  reactivateSubscription: Function;
};
const ReactivateSubscriptionPanel = ({
  accessToken,
  plan,
  customerSubscription,
  subscription,
  reactivateSubscription,
}: ReactivateSubscriptionPanelProps) => {
  const { subscription_id } = customerSubscription;
  const onReactivateClick = useCallback(
    () => reactivateSubscription(accessToken, subscription_id),
    [accessToken, reactivateSubscription, subscription_id]
  );

  // TODO: date formats will need i18n someday
  const cancelledAtDate = dayjs
    .unix((subscription.cancelledAt as number) / 1000)
    .format('MMMM DD, YYYY');

  // TODO: date formats will need i18n someday
  const periodEndDate = dayjs
    .unix(customerSubscription.current_period_end)
    .format('MMMM DD, YYYY');

  return (
    <div className="subscription-cancelled">
      <div className="with-settings-button">
        <div>
          <p>You cancelled your subscription on {cancelledAtDate}.</p>
          <p>
            You will lose access to {plan.plan_name} on{' '}
            <strong>{periodEndDate}</strong>.
          </p>
        </div>
        <div className="action">
          <button className="settings-button" onClick={onReactivateClick} data-testid="reactivate-subscription-button">
            <span className="change-button">Resubscribe</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionItem;
