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
  currentPlan: Plan;
  selectedPlan: Plan;
  subscription?: IapSubscription;
  code: string;
};

const getIapSubscriptionAppStoreL10Id = (
  s: IapRoadblockProps['subscription']
) => {
  if (s && s._subscription_type === MozillaSubscriptionTypes.IAP_GOOGLE) {
    return 'brand-name-google-play';
  } else if (s && s._subscription_type === MozillaSubscriptionTypes.IAP_APPLE) {
    return 'brand-name-apple-app-store';
  } else {
    return ''; // if s is undefined return empty string
  }
};

export const IapRoadblock = ({
  profile,
  isMobile,
  currentPlan,
  selectedPlan,
  subscription,
  code,
}: IapRoadblockProps) => {
  const { l10n } = useLocalization();
  let mobileAppStore = '';
  let manageSubscription: VoidFunction = () => {};

  if (subscription !== undefined) {
    mobileAppStore = l10n.getString(
      getIapSubscriptionAppStoreL10Id(subscription)
    );

    const appStoreLink = getIapSubscriptionManagementUrl(subscription);
    manageSubscription = () => (window.location.href = appStoreLink);
  }

  const screenType =
    code === 'iap_upgrade_contact_support'
      ? 'iaperrorupgrade'
      : 'iapsubscribed';
  const subtitle = <p />;
  const title = (
    <SubscriptionTitle screenType={screenType} subtitle={subtitle} />
  );

  return (
    <>
      <Header {...{ profile }} />
      <div className="main-content">
        <PaymentErrorView
          {...{
            subscriptionTitle: title,
            error: { code },
            actionFn: manageSubscription,
            plan: currentPlan,
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
