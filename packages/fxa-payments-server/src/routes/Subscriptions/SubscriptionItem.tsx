import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { formatPeriodEndDate } from '../../lib/formats';
import {
  useBooleanState,
  useCheckboxState,
  PromiseState,
} from '../../lib/hooks';
import {
  CustomerSubscription,
  Subscription,
  Plan,
  Customer,
} from '../../lib/types';
import * as Amplitude from '../../lib/amplitude';

import PaymentUpdateForm from './PaymentUpdateForm';
import DialogMessage from '../../components/DialogMessage';
import AppContext from '../../lib/AppContext';

import ReactivateSubscriptionPanel from './Reactivate/ManagementPanel';
import {
  apiCancelSubscription,
  apiReactivateSubscription,
  apiUpdatePayment,
} from '../../lib/apiClient';
import { FunctionWithIgnoredReturn } from '../../lib/types';

type SubscriptionItemProps = {
  customerSubscription: CustomerSubscription;
  subscription: Subscription | null;
  plan: Plan | null;
  customer: Customer;
  cancelSubscription: FunctionWithIgnoredReturn<typeof apiCancelSubscription>;
  cancelSubscriptionStatus: PromiseState<
    { subscriptionId: string } | undefined,
    any
  >;
  reactivateSubscription: FunctionWithIgnoredReturn<
    typeof apiReactivateSubscription
  >;
  updatePayment: FunctionWithIgnoredReturn<typeof apiUpdatePayment>;
  updatePaymentStatus: PromiseState;
  resetUpdatePayment: () => void;
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
              }}
            />
            <CancelSubscriptionPanel
              {...{
                cancelSubscription,
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
  customerSubscription: CustomerSubscription;
  cancelSubscription: SubscriptionItemProps['cancelSubscription'];
  cancelSubscriptionStatus: SubscriptionItemProps['cancelSubscriptionStatus'];
};

const CancelSubscriptionPanel = ({
  plan,
  cancelSubscription,
  customerSubscription: { subscription_id, current_period_end },
  cancelSubscriptionStatus,
}: CancelSubscriptionPanelProps) => {
  const [cancelRevealed, revealCancel, hideCancel] = useBooleanState();
  const [confirmationChecked, onConfirmationChanged] = useCheckboxState();

  const confirmCancellation = useCallback(() => {
    cancelSubscription({
      subscriptionId: subscription_id,
      planId: plan.plan_id,
      productId: plan.product_id,
    });
  }, [cancelSubscription, subscription_id, plan]);

  const viewed = useRef(false);
  const engaged = useRef(false);

  useEffect(() => {
    if (!viewed.current && cancelRevealed) {
      Amplitude.cancelSubscriptionMounted(plan);
      viewed.current = true;
    }
  }, [cancelRevealed, viewed, plan]);

  const engage = useCallback(() => {
    if (!engaged.current) {
      Amplitude.cancelSubscriptionEngaged(plan);
      engaged.current = true;
    }
  }, [engaged, plan]);

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
              {formatPeriodEndDate(current_period_end)}, the last day of your
              billing cycle.
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
                  {plan.product_name} on{' '}
                  {formatPeriodEndDate(current_period_end)}
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
                  cancelSubscriptionStatus.pending || !confirmationChecked
                }
              >
                {cancelSubscriptionStatus.pending ? (
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

export default SubscriptionItem;
