/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore } from '../../lib/model-data';
import { IntegrationType } from './base-integration';
import {
  SyncBasicIntegration,
  SyncIntegrationFeatures,
} from './sync-basic-integration';

export function isSyncDesktopIntegration(integration: {
  type: IntegrationType;
}): integration is SyncDesktopIntegration {
  return (
    (integration as SyncDesktopIntegration).type === IntegrationType.SyncDesktop
  );
}

export class SyncDesktopIntegration extends SyncBasicIntegration<SyncIntegrationFeatures> {
  constructor(data: ModelDataStore) {
    super(data, IntegrationType.SyncDesktop);
    this.setFeatures({ allowUidChange: true });
  }

  async isSync() {
    return true;
  }
}
