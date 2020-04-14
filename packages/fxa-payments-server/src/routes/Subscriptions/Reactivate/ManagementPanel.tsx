import React, { useCallback } from 'react';
import { Localized } from '@fluent/react';
import {
  Plan,
  CustomerSubscription,
  Subscription,
  Customer,
} from '../../../store/types';
import { useBooleanState } from '../../../lib/hooks';
import { getLocalizedDateString, getLocalizedDate } from '../../../lib/formats';
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

  const cancelledAt = subscription.cancelledAt
    ? (subscription.cancelledAt as number) / 1000
    : null;

  const periodEndTimeStamp = customerSubscription.current_period_end;

  return (
    <>
      {reactivateConfirmationRevealed && (
        <ReactivationConfirmationDialog
          {...{ plan, customer, periodEndDate: periodEndTimeStamp }}
          onDismiss={hideReactivateConfirmation}
          onConfirm={onReactivateClick}
        />
      )}
      <div className="subscription-cancelled">
        <div className="with-settings-button">
          <div className="subscription-cancelled-details">
            {cancelledAt && (
              <Localized
                id="reactivate-panel-date"
                $date={getLocalizedDate(cancelledAt)}
              >
                <p data-testid="subscription-cancelled-date">
                  You cancelled your subscription on{' '}
                  {getLocalizedDateString(cancelledAt)}.
                </p>
              </Localized>
            )}
            <Localized
              id="reactivate-panel-copy"
              $name={plan.product_name}
              $date={getLocalizedDate(periodEndTimeStamp)}
              strong={<strong></strong>}
            >
              <p>
                You will lose access to {plan.product_name} on{' '}
                <strong>{getLocalizedDateString(periodEndTimeStamp)}</strong>.
              </p>
            </Localized>
          </div>
          <div className="action">
            <button
              className="settings-button"
              onClick={revealReactivateConfirmation}
              data-testid="reactivate-subscription-button"
            >
              <Localized id="reactivate-confirm-button">
                <span className="change-button">Resubscribe</span>
              </Localized>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
