/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore } from '../../lib/model-data';
import { IntegrationType } from './base-integration';
import {
  SyncBasicIntegration,
  SyncIntegrationFeatures,
} from './sync-basic-integration';

/**
 * Sync desktop with context=fx_desktop_v3 (FF < 123)
 */
export function isSyncDesktopV3Integration(integration: {
  type: IntegrationType;
}): integration is SyncDesktopV3Integration {
  return (
    (integration as SyncDesktopV3Integration).type ===
    IntegrationType.SyncDesktopV3
  );
}

/* This is a legacy integration for desktop Firefox < 123 that must be supported
 * for the foreseeable future.
 */
export class SyncDesktopV3Integration extends SyncBasicIntegration<SyncIntegrationFeatures> {
  constructor(data: ModelDataStore) {
    super(data, IntegrationType.SyncDesktopV3);
    this.setFeatures({ allowUidChange: true });
  }

  isDesktopSync() {
    return true;
  }

  isFirefoxDesktopClient() {
    return true;
  }
}
