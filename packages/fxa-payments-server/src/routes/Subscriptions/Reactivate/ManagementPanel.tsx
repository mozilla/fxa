/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// React looks unused here, but we need it for Storybook.
import React, { useCallback } from 'react';
import { Localized } from '@fluent/react';
import { Plan, Customer } from '../../../store/types';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { getLocalizedDateString, getLocalizedDate } from '../../../lib/formats';
import { ActionFunctions } from '../../../store/actions';
import ReactivationConfirmationDialog from './ConfirmationDialog';
import { WebSubscription } from 'fxa-shared/subscriptions/types';

const ReactivateSubscriptionPanel = ({
  plan,
  customerSubscription,
  customer,
  reactivateSubscription,
}: {
  plan: Plan;
  customerSubscription: WebSubscription;
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

  const periodEndTimeStamp = customerSubscription.current_period_end;

  return (
    <>
      {reactivateConfirmationRevealed && (
        <ReactivationConfirmationDialog
          {...{
            plan,
            customer,
            periodEndDate: periodEndTimeStamp,
            customerSubscription,
          }}
          onDismiss={hideReactivateConfirmation}
          onConfirm={onReactivateClick}
        />
      )}
      <div className="subscription-cancelled">
        <div className="with-settings-button">
          <div className="subscription-cancelled-details">
            <Localized
              id="reactivate-panel-copy"
              vars={{
                name: plan.product_name,
                date: getLocalizedDate(periodEndTimeStamp),
              }}
              elems={{
                strong: <strong></strong>,
              }}
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

export default ReactivateSubscriptionPanel;
