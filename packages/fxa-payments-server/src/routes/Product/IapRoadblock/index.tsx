/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useLocalization } from '@fluent/react';
import {
  IapSubscription,
  MozillaSubscriptionTypes,
} from 'fxa-shared/subscriptions/types';
import { Header } from '../../../components/Header';
import { PaymentErrorView } from '../../../components/PaymentErrorView';
import PlanDetails from '../../../components/PlanDetails';
import SubscriptionTitle from '../../../components/SubscriptionTitle';
import { Customer, Profile, Plan } from '../../../store/types';
import { getIapSubscriptionManagementUrl } from '../../../lib/formats';

export type IapRoadblockProps = {
  isMobile: boolean;
  profile: Profile;
  customer: Customer;
  selectedPlan: Plan;
  subscription: IapSubscription;
};

const getIapSubscriptionAppStoreL10Id = (
  s: IapRoadblockProps['subscription']
) => {
  switch (s._subscription_type) {
    case MozillaSubscriptionTypes.IAP_GOOGLE:
      return 'brand-name-google-play';
    case MozillaSubscriptionTypes.IAP_APPLE:
      return 'brand-name-apple-app-store';
  }
};

export const IapRoadblock = ({
  profile,
  isMobile,
  selectedPlan,
  subscription,
}: IapRoadblockProps) => {
  const { l10n } = useLocalization();
  const mobileAppStore = l10n.getString(
    getIapSubscriptionAppStoreL10Id(subscription)
  );
  const appStoreLink = getIapSubscriptionManagementUrl(subscription);
  const subtitle = <p />;
  const title = (
    <SubscriptionTitle screenType="iapsubscribed" subtitle={subtitle} />
  );

  const manageSubscription: VoidFunction = () =>
    (window.location.href = appStoreLink);

  return (
    <>
      <Header {...{ profile }} />
      <div className="main-content">
        <PaymentErrorView
          {...{
            subscriptionTitle: title,
            error: { code: 'iap_already_subscribed' },
            actionFn: manageSubscription,
            plan: selectedPlan,
            contentProps: { mobileAppStore },
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

export default IapRoadblock;
