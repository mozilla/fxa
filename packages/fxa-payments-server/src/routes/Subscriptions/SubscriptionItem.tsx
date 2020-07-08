/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { Localized } from '@fluent/react';
import { getLocalizedDate, getLocalizedDateString } from '../../lib/formats';
import { useCheckboxState } from '../../lib/hooks';
import { useBooleanState } from 'fxa-react/lib/hooks';
import {
  CustomerSubscription,
  Subscription,
  Plan,
  Customer,
} from '../../store/types';
import { SelectorReturns } from '../../store/selectors';
import { SubscriptionsProps } from './index';
import * as Amplitude from '../../lib/amplitude';

import PaymentUpdateForm from './PaymentUpdateForm';
import DialogMessage from '../../components/DialogMessage';
import AppContext from '../../lib/AppContext';

import ReactivateSubscriptionPanel from './Reactivate/ManagementPanel';

type SubscriptionItemProps = {
  customerSubscription: CustomerSubscription;
  plan: Plan | null;
  cancelSubscription: SubscriptionsProps['cancelSubscription'];
  reactivateSubscription: SubscriptionsProps['reactivateSubscription'];
  customer: Customer;
  updatePaymentStatus: SelectorReturns['updatePaymentStatus'];
  resetUpdatePayment: SubscriptionsProps['resetUpdatePayment'];
  updatePayment: SubscriptionsProps['updatePayment'];
  cancelSubscriptionStatus: SelectorReturns['cancelSubscriptionStatus'];
};

export const SubscriptionItem = ({
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

  if (!plan) {
    // TODO: This really shouldn't happen, would mean the user has a
    // subscription to a plan that no longer exists in API results.
    return (
      <DialogMessage className="dialog-error" onDismiss={locationReload}>
        <Localized id="product-plan-not-found">
          <h4 data-testid="error-subhub-missing-plan">Plan not found</h4>
        </Localized>
        <Localized id="sub-item-no-such-plan">
          <p>No such plan for this subscription.</p>
        </Localized>
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
  cancelSubscription: SubscriptionsProps['cancelSubscription'];
  customerSubscription: CustomerSubscription;
  cancelSubscriptionStatus: SelectorReturns['cancelSubscriptionStatus'];
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
    cancelSubscription(subscription_id, plan);
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

  const engagedOnHideCancel = useCallback(
    (evt) => {
      engage();
      onConfirmationChanged(evt);
      hideCancel();
    },
    [hideCancel, engage]
  );

  const engagedOnConfirmationChanged = useCallback(
    (evt) => {
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
                <Localized id="sub-item-cancel-sub">
                  <h3>Cancel Subscription</h3>
                </Localized>
              </div>
              <div className="action">
                <button
                  className="settings-button"
                  onClick={revealCancel}
                  data-testid="reveal-cancel-subscription-button"
                >
                  <Localized id="payment-cancel-btn">
                    <span className="change-button">Cancel</span>
                  </Localized>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Localized id="sub-item-cancel-sub">
              <h3>Cancel Subscription</h3>
            </Localized>
            <Localized
              id="sub-item-cancel-msg"
              $name={plan.product_name}
              $period={getLocalizedDate(current_period_end)}
            >
              <p>
                You will no longer be able to use {plan.product_name} after{' '}
                {getLocalizedDateString(current_period_end)}, the last day of
                your billing cycle.
              </p>
            </Localized>
            <p>
              <label>
                <input
                  data-testid="confirm-cancel-subscription-checkbox"
                  type="checkbox"
                  defaultChecked={confirmationChecked}
                  onChange={engagedOnConfirmationChanged}
                />
                <Localized
                  id="sub-item-cancel-confirm"
                  $name={plan.product_name}
                  $period={getLocalizedDate(current_period_end)}
                >
                  <span>
                    Cancel my access and my saved information within{' '}
                    {plan.product_name} on{' '}
                    {getLocalizedDateString(current_period_end, false)}
                  </span>
                </Localized>
              </label>
            </p>
            <div className="button-row">
              <Localized id="sub-item-stay-sub">
                <button
                  className="settings-button primary-button"
                  onClick={engagedOnHideCancel}
                >
                  Stay Subscribed
                </button>
              </Localized>
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
                  <Localized id="sub-item-cancel-sub">
                    <span>Cancel Subscription</span>
                  </Localized>
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
