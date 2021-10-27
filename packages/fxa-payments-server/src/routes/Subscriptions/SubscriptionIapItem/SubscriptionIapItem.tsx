/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// React looks unused here, but we need it for Storybook
import React from 'react';
import { Localized } from '@fluent/react';

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
  productName: string;
  customerSubscription: IapSubscription;
};

export const SubscriptionIapItem = ({
  productName,
  customerSubscription,
}: SubscriptionIapItemProps) => {
  if (isGooglePlaySubscription(customerSubscription)) {
    return GooglePlaySubscriptionIapItem(productName, customerSubscription);
  }

  if (isAppleSubscription(customerSubscription)) {
    return AppleSubscriptionIapItem(productName, customerSubscription);
  }

  return null;
};

const GooglePlaySubscriptionIapItem = (
  productName: string,
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
          <h2>{productName}</h2>
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
  productName: string,
  customerSubscription: AppleSubscription
) => {
  return (
    <div className="settings-unit">
      <div className="subscription" data-testid="subscription-item">
        <header>
          <h2>{productName}</h2>
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
