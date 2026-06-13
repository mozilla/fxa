/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AppBadgesTemplateData } from '../../partials/appBadges';
import { TemplateData as AutomatedEmailNoActionTemplateData } from '../../partials/automatedEmailNoAction';

export type TemplateData = AppBadgesTemplateData &
  AutomatedEmailNoActionTemplateData & {
    link: string;
    desktopLink: string;
    onDesktopOrTabletDevice: boolean;
    productName: string;
  };

export const template = 'postVerify';
export const version = 8;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postVerify-subject-4',
    message: 'Welcome to Mozilla!',
  },
  action: {
    id: 'postVerify-action-2',
    message: 'Connect another device',
  },
};
