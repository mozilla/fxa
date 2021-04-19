/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Header } from '../../../components/Header';
import PlanDetails from '../../../components/PlanDetails';
import { SubscriptionUpgradeProps } from '../SubscriptionUpgrade';
import { SubscriptionTitle } from '../../../components/SubscriptionTitle';
import PaymentErrorView from 'fxa-payments-server/src/components/PaymentErrorView';

export type SubscriptionUpgradeRoadblockProps = Pick<
  SubscriptionUpgradeProps,
  'profile' | 'isMobile' | 'selectedPlan'
>;

export const SubscriptionUpgradeRoadblock = ({
  profile,
  isMobile,
  selectedPlan,
}: SubscriptionUpgradeRoadblockProps) => {
  const title = (
    <SubscriptionTitle {...{ screenType: 'noupgrade', subtitle: <p></p> }} />
  );

  return (
    <>
      <Header {...{ profile }} />
      <div className="main-content">
        <PaymentErrorView
          {...{
            subscriptionTitle: title,
            error: { code: 'no_subscription_upgrades' },
            onRetry: () => {}, // PaymentErrorView actually ignores this
            plan: selectedPlan,
          }}
        />

        <PlanDetails
          {...{
            profile,
            selectedPlan,
            isMobile,
            showExpandButton: isMobile,
          }}
        />
      </div>
    </>
  );
};

export default SubscriptionUpgradeRoadblock;
