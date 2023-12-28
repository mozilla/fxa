/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IntegrationType } from '../../models';
import { IntegrationSubsetType } from './interfaces';

export function createMockWebIntegration(): IntegrationSubsetType {
  return {
    type: IntegrationType.Web,
  };
}

export function createMockSyncDesktopV3Integration(): IntegrationSubsetType {
  return {
    type: IntegrationType.SyncDesktopV3,
  };
}
