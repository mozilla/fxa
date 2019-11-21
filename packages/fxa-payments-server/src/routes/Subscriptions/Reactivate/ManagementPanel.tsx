import React, { useCallback } from 'react';
import {
  Plan,
  CustomerSubscription,
  Subscription,
  Customer,
} from '../../../store/types';
import { useBooleanState } from '../../../lib/hooks';
import { formatPeriodEndDate } from '../../../lib/formats';
import { ActionFunctions } from '../../../store/actions';
import ReactivationConfirmationDialog from './ConfirmationDialog';

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
  reactivateSubscription: ActionFunctions['reactivateSubscription'];
}) => {
  const { subscription_id } = customerSubscription;
  const [
    reactivateConfirmationRevealed,
    revealReactivateConfirmation,
    hideReactivateConfirmation,
  ] = useBooleanState();

  const onReactivateClick = useCallback(() => {
    reactivateSubscription(subscription_id, plan);
    hideReactivateConfirmation();
  }, [
    reactivateSubscription,
    plan,
    subscription_id,
    hideReactivateConfirmation,
  ]);

  // TODO: date formats will need i18n someday
  const cancelledAtDate = formatPeriodEndDate(
    (subscription.cancelledAt as number) / 1000
  );

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
