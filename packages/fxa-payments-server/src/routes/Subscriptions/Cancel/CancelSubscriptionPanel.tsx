/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useRef } from 'react';
import { Localized } from '@fluent/react';
import {
  getLocalizedDate,
  getLocalizedDateString,
  formatPlanPricing,
  getLocalizedCurrency,
} from '../../../lib/formats';
import { useCheckboxState } from '../../../lib/hooks';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { CustomerSubscription, Plan, Customer } from '../../../store/types';
import { SelectorReturns } from '../../../store/selectors';
import { SubscriptionsProps } from '../index';
import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';
import * as Amplitude from '../../../lib/amplitude';

export type CancelSubscriptionPanelProps = {
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

  const planPricing = formatPlanPricing(
    plan.amount,
    plan.currency,
    plan.interval,
    plan.interval_count
  );
  const nextBillDate = getLocalizedDateString(current_period_end, true);
  const nextBill = `Next billed on ${nextBillDate}`;
  const { upgradeCTA } = metadataFromPlan(plan);

  return (
    <>
      <div className="cancel-subscription">
        {!cancelRevealed ? (
          <>
            <div className="with-settings-button">
              <div className="price-details" data-testid="price-details">
                <Localized
                  id={`sub-plan-price-${plan.interval}`}
                  $amount={getLocalizedCurrency(plan.amount, plan.currency)}
                  $intervalCount={plan.interval_count}
                >
                  <div className="plan-pricing">{planPricing}</div>
                </Localized>
                <Localized id="sub-next-bill" $date={nextBillDate}>
                  <div>{nextBill}</div>
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
            {upgradeCTA && (
              <p
                className="upgrade-cta"
                data-testid="upgrade-cta"
                dangerouslySetInnerHTML={{ __html: upgradeCTA }}
              />
            )}
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
                  data-testid="stay-subscribed-button"
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

export default CancelSubscriptionPanel;
