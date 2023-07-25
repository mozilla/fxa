/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BaseIntegration,
  IntegrationFeatures,
  IntegrationType,
} from './base-integration';
import {
  bind,
  ModelValidation as V,
  ModelDataStore,
} from '../../lib/model-data';
import { Constants } from '../../lib/constants';
import { BaseIntegrationData } from './web-integration';

export class SyncBasicIntegrationData extends BaseIntegrationData {
  @bind([V.isValidCountry])
  country: string | undefined;

  @bind([V.isString])
  signinCode: string | undefined;

  @bind([V.isAction])
  action: string | undefined;

  @bind([V.isString])
  syncPreference: string | undefined;

  @bind([V.isString])
  multiService: boolean | undefined;

  @bind([V.isString])
  tokenCode: string | undefined;
}

export interface SyncIntegrationFeatures extends IntegrationFeatures {
  sendChangePasswordNotice: boolean;
}

type SyncIntegrationTypes =
  | IntegrationType.SyncBasic
  | IntegrationType.SyncDesktop;

// TODO: we may only need sync-desktop-integration once we no longer use reset PW links?
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
    data: ModelDataStore,
    type: SyncIntegrationTypes = IntegrationType.SyncBasic,
    features: Partial<T> = {}
  ) {
    super(type, new SyncBasicIntegrationData(data));
    this.setFeatures({
      sendChangePasswordNotice: false,
      syncOptional: false,
      ...features,
    });
  }

  get serviceName() {
    if (this.data.service === 'sync') {
      return Constants.RELIER_SYNC_SERVICE_NAME;
    } else {
      return 'Firefox';
    }
  }

  shouldOfferToSync(view: string) {
    return this.data.service !== 'sync' && view !== 'force-auth';
  }

  wantsKeys() {
    return true;
  }

  async isSync() {
    return true;
  }
}
