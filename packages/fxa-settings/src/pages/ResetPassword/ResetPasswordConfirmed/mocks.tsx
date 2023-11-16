/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../../../lib/types';
import { IntegrationType } from '../../../models';
import { ResetPasswordConfirmedBaseIntegration } from './interfaces';

export function createMockResetPasswordConfirmWebIntegration(): ResetPasswordConfirmedBaseIntegration {
  return {
    type: IntegrationType.Web,
    getServiceName: () => Promise.resolve(MozServices.Default),
    isSync: () => Promise.resolve(false),
  };
}
