/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// React looks unused here, but we need it for Storybook
import React from 'react';
import { Localized } from '@fluent/react';

import { IapSubscription } from 'fxa-shared/subscriptions/types';
import {
  AppStoreSubscription,
  PlayStoreSubscription,
} from 'fxa-shared/dto/auth/payments/iap-subscription';
import LinkExternal from 'fxa-react/components/LinkExternal';
import {
  isAppleSubscription,
  isGooglePlaySubscription,
} from 'fxa-shared/subscriptions/type-guards';
import {
  getIapSubscriptionManagementUrl,
  getLocalizedDate,
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
  customerSubscription: PlayStoreSubscription
) => {
  const { auto_renewing, expiry_time_millis } = customerSubscription;

  const nextBillDate = getLocalizedDateString(expiry_time_millis / 1000, true);
  const nextBillDateL10n = getLocalizedDate(expiry_time_millis / 1000, true);
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
            <Localized id={'sub-iap-item-google-purchase-2'}>
              <div className="iap-type">Google: In-App purchase</div>
            </Localized>
            {auto_renewing ? (
              <Localized id="sub-next-bill" vars={{ date: nextBillDateL10n }}>
                <div>{nextBill}</div>
              </Localized>
            ) : (
              <Localized id="sub-expires-on" vars={{ date: nextBillDateL10n }}>
                <div>{expiresOn}</div>
              </Localized>
            )}
          </div>
          <div className="action">
            <LinkExternal
              data-testid="manage-iap-subscription-button"
              className="button settings-button"
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
  customerSubscription: AppStoreSubscription
) => {
  const { auto_renewing, expiry_time_millis } = customerSubscription;

  let nextBill, expiresOn, nextBillDate, nextBillDateL10n;
  // TODO - Remove expiry_time_millis check pending https://developer.apple.com/forums/thread/705730
  if (expiry_time_millis) {
    nextBillDate = getLocalizedDateString(expiry_time_millis / 1000, true);
    nextBillDateL10n = getLocalizedDate(expiry_time_millis / 1000, true);
    nextBill = `Next billed on ${nextBillDate}`;
    expiresOn = `Expires on ${nextBillDate}`;
  }

  const appStoreLink = getIapSubscriptionManagementUrl(customerSubscription);

  return (
    <div className="settings-unit">
      <div className="subscription" data-testid="subscription-item">
        <header>
          <h2>{productName}</h2>
        </header>
        <div className={'with-settings-button'}>
          <div className="iap-details" data-testid="iap-details">
            <Localized id={'sub-iap-item-apple-purchase-2'}>
              <div className="iap-type">Apple: In-App purchase</div>
            </Localized>
            {!!expiry_time_millis &&
              (auto_renewing ? (
                <Localized id="sub-next-bill" vars={{ date: nextBillDateL10n }}>
                  <div>{nextBill}</div>
                </Localized>
              ) : (
                <Localized
                  id="sub-expires-on"
                  vars={{ date: nextBillDateL10n }}
                >
                  <div>{expiresOn}</div>
                </Localized>
              ))}
          </div>
          <div className="action">
            <LinkExternal
              data-testid="manage-iap-subscription-button"
              className="button settings-button"
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

export default SubscriptionIapItem;
