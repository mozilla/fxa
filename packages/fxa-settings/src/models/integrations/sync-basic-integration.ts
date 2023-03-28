/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BaseIntegration,
  IntegrationFeatures,
  IntegrationType,
} from './base-integration';

export interface SyncIntegrationFeatures extends IntegrationFeatures {
  sendChangePasswordNotice: boolean;
}

type SyncIntegrationTypes =
  | IntegrationType.SyncBasic
  | IntegrationType.SyncDesktop;

/**
 * This integration offers very basic Sync page support _without_ browser communication
 * via webchannels. Currently it is only used 1) when a user is on a verification page
 * through Sync in a different browser, and 2) as a base class for desktop Sync support,
 * which has webchannel support.
 */
export class SyncBasicIntegration<
  T extends SyncIntegrationFeatures
> extends BaseIntegration<T> {
  constructor(
    type: SyncIntegrationTypes = IntegrationType.SyncBasic,
    features: Partial<T> = {}
  ) {
    super(type);
    this.setFeatures({
      sendChangePasswordNotice: false,
      syncOptional: false,
      ...features,
    });
  }
}
