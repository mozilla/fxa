/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useContext } from 'react';
import { Localized } from '@fluent/react';
import { CustomerSubscription, Plan, Customer } from '../../store/types';
import { SelectorReturns } from '../../store/selectors';
import { SubscriptionsProps } from './index';

import DialogMessage from '../../components/DialogMessage';
import AppContext from '../../lib/AppContext';

import CancelSubscriptionPanel from './Cancel/CancelSubscriptionPanel';
import ReactivateSubscriptionPanel from './Reactivate/ManagementPanel';

export type SubscriptionItemProps = {
  customerSubscription: CustomerSubscription;
  plan: Plan | null;
  cancelSubscription: SubscriptionsProps['cancelSubscription'];
  reactivateSubscription: SubscriptionsProps['reactivateSubscription'];
  customer: Customer;
  cancelSubscriptionStatus: SelectorReturns['cancelSubscriptionStatus'];
};

export const SubscriptionItem = ({
  cancelSubscription,
  cancelSubscriptionStatus,
  reactivateSubscription,
  customer,
  plan,
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
          <CancelSubscriptionPanel
            {...{
              cancelSubscription,
              cancelSubscriptionStatus,
              customerSubscription,
              plan,
            }}
          />
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

export default SubscriptionItem;
