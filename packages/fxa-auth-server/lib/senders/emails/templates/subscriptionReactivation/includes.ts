/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GlobalTemplateValues } from '../../../renderer';

export const getIncludes = (
  isFreeTrialReactivation: boolean
): GlobalTemplateValues => ({
  subject: isFreeTrialReactivation
    ? {
        id: 'subscriptionReactivation-freeTrial-subject',
        message: 'Your <%- productName %> trial has been reactivated',
      }
    : {
        id: 'subscriptionReactivation-subject-2',
        message: 'Your <%- productName %> subscription has been reactivated',
      },
});

export default getIncludes;
