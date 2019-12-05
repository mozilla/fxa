import React, { useCallback } from 'react';
import {
  Plan,
  CustomerSubscription,
  Subscription,
  Customer,
  FunctionWithIgnoredReturn,
} from '../../../lib/types';
import { useBooleanState } from '../../../lib/hooks';
import { formatPeriodEndDate } from '../../../lib/formats';
import ReactivationConfirmationDialog from './ConfirmationDialog';
import { apiReactivateSubscription } from '../../../lib/apiClient';

export default ({
  plan,
  customerSubscription,
  subscription,
  customer,
  reactivateSubscription,
}: {
  plan: Plan;
  customerSubscription: CustomerSubscription;
  subscription: Subscription;
  customer: Customer;
  reactivateSubscription: FunctionWithIgnoredReturn<
    typeof apiReactivateSubscription
  >;
}) => {
  const { subscription_id } = customerSubscription;
  const [
    reactivateConfirmationRevealed,
    revealReactivateConfirmation,
    hideReactivateConfirmation,
  ] = useBooleanState();

  const onReactivateClick = useCallback(() => {
    reactivateSubscription({
      subscriptionId: subscription_id,
      planId: plan.plan_id,
    });
    hideReactivateConfirmation();
  }, [
    reactivateSubscription,
    plan,
    subscription_id,
    hideReactivateConfirmation,
  ]);

  // TODO: date formats will need i18n someday
  const cancelledAtDate = subscription.cancelledAt
    ? formatPeriodEndDate((subscription.cancelledAt as number) / 1000)
    : null;

  // TODO: date formats will need i18n someday
  const periodEndDate = formatPeriodEndDate(
    customerSubscription.current_period_end
  );

  return (
    <>
      {reactivateConfirmationRevealed && (
        <ReactivationConfirmationDialog
          {...{ plan, customer, periodEndDate }}
          onDismiss={hideReactivateConfirmation}
          onConfirm={onReactivateClick}
        />
      )}
      <div className="subscription-cancelled">
        <div className="with-settings-button">
          <div className="subscription-cancelled-details">
            {cancelledAtDate && (
              <p data-testid="subscription-cancelled-date">
                You cancelled your subscription on {cancelledAtDate}.
              </p>
            )}
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
