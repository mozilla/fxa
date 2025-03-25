/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ModelDataStore } from '../../lib/model-data';
import { Constants } from '../../lib/constants';
import { SyncBasicIntegrationData } from './data';
import { IntegrationFeatures } from './features';
import { GenericIntegration, IntegrationType } from './integration';

export interface SyncIntegrationFeatures extends IntegrationFeatures {
  sendChangePasswordNotice: boolean;
}

type SyncIntegrationTypes =
  | IntegrationType.SyncBasic
  | IntegrationType.SyncDesktopV3;

/**
 * This integration offers basic Sync page support _without_ browser communication
 * via webchannels. Currently it is only used 1) when a user is on a verification page
 * through Sync in a different browser, which will no longer be the case once we use
 * codes for reset PW, and 2) as a base class for sync desktop v3.
 *
 * TODO in FXA-10313, let's just get rid of this now that we're on codes.
 * Move methods into SyncDesktopV3Integration.
 */
export class SyncBasicIntegration extends GenericIntegration<
  SyncIntegrationFeatures,
  SyncBasicIntegrationData
> {
  constructor(
    data: ModelDataStore,
    type: SyncIntegrationTypes = IntegrationType.SyncBasic
  ) {
    super(type, new SyncBasicIntegrationData(data), {
      sendChangePasswordNotice: false,
      allowUidChange: false,
      fxaStatus: false,
      handleSignedInNotification: true,
      reuseExistingSession: false,
      supportsPairing: false,
    });
  }

  get serviceName() {
    if (this.data.service === 'sync') {
      return Constants.RELIER_SYNC_SERVICE_NAME;
    } else {
      return 'Firefox';
    }
  }

  wantsKeys() {
    return true;
  }

  isSync() {
    return true;
  }
}
