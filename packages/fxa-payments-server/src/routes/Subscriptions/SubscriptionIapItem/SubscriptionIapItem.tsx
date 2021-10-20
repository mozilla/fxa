/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useContext } from 'react';
import { Localized } from '@fluent/react';
import { Plan } from '../../../store/types';

import DialogMessage from '../../../components/DialogMessage';
import AppContext from '../../../lib/AppContext';

import {
  AppleSubscription,
  GooglePlaySubscription,
  IapSubscription,
} from 'fxa-shared/subscriptions/types';
import LinkExternal from 'fxa-react/components/LinkExternal';
import {
  isAppleSubscription,
  isGooglePlaySubscription,
} from 'fxa-shared/subscriptions/subscriptions';
import {
  getIapSubscriptionManagementUrl,
  getLocalizedDateString,
} from '../../../lib/formats';

export type SubscriptionIapItemProps = {
  customerSubscription: IapSubscription;
  plan: Plan | null;
};

export const SubscriptionIapItem = ({
  plan,
  customerSubscription,
}: SubscriptionIapItemProps) => {
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

  if (isGooglePlaySubscription(customerSubscription)) {
    return GooglePlaySubscriptionIapItem(plan, customerSubscription);
  }

  if (isAppleSubscription(customerSubscription)) {
    return AppleSubscriptionIapItem(plan, customerSubscription);
  }

  return null;
};

const GooglePlaySubscriptionIapItem = (
  plan: Plan,
  customerSubscription: GooglePlaySubscription
) => {
  const { auto_renewing, expiry_time_millis } = customerSubscription;

  const nextBillDate = getLocalizedDateString(expiry_time_millis / 1000, true);
  const nextBill = `Next billed on ${nextBillDate}`;
  const expiresOn = `Expires on ${nextBillDate}`;

  const appStoreLink = getIapSubscriptionManagementUrl(customerSubscription);

  return (
    <div className="settings-unit">
      <div className="subscription" data-testid="subscription-item">
        <header>
          <h2>{plan.product_name}</h2>
        </header>
        <div className={'with-settings-button'}>
          <div className="iap-details" data-testid="iap-details">
            <Localized id={'sub-iap-item-google-purchase'}>
              <div className="iap-type">Google: In-App purchase</div>
            </Localized>
            {auto_renewing ? (
              <Localized
                id="sub-next-bill"
                vars={{ date: nextBillDate as string }}
              >
                <div>{nextBill}</div>
              </Localized>
            ) : (
              <Localized
                id="sub-expires-on"
                vars={{ date: nextBillDate as string }}
              >
                <div>{expiresOn}</div>
              </Localized>
            )}
          </div>
          <div className="action">
            <LinkExternal
              data-testid="manage-iap-subscription-button"
              className="settings-button"
              href={appStoreLink}
            >
              <Localized id="sub-iap-item-manage-button">
                <span data-testid="manage-iap-button">Manage</span>
              </Localized>
            </LinkExternal>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppleSubscriptionIapItem = (
  plan: Plan,
  customerSubscription: AppleSubscription
) => {
  return (
    <div className="settings-unit">
      <div className="subscription" data-testid="subscription-item">
        <header>
          <h2>{plan.product_name}</h2>
        </header>
        <div>
          <div className="iap-details" data-testid="iap-details">
            <Localized id={'sub-iap-item-apple-purchase'}>
              <div className="iap-type">Apple: In-App purchase</div>
            </Localized>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionIapItem;
