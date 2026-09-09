/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AppBadgesTemplateData } from '../../partials/appBadges';
import { TemplateData as IconTemplateData } from '../../partials/icon';
import { TemplateData as SubscriptionSupportTemplateData } from '../../partials/subscriptionSupport';

export type TemplateData = AppBadgesTemplateData &
  IconTemplateData &
  SubscriptionSupportTemplateData & {
    icon: string;
    link: string;
    productName: string;
    subscriptionSupportUrl: string;
    playStoreLink: string;
    appStoreLink: string;
    iosUrl: undefined;
    androidUrl: undefined;
  };

export const template = 'downloadSubscription';
export const version = 2;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'downloadSubscription-subject',
    message: 'Welcome to <%- productName %>',
  },
  action: {
    id: 'downloadSubscription-link-action-2',
    message: 'Download <%- productName %>',
  },
};
