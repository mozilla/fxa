/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// new data store from web channel message instead of query params

import { Constants } from '../../lib/constants';
import { ModelDataStore } from '../../lib/model-data';
import { IntegrationType } from './base-integration';
import { OAuthIntegration, OAuthIntegrationOptions } from './oauth-integration';

export function isSyncDesktopOAuthIntegration(integration: {
  type: IntegrationType;
}): integration is SyncDesktopOAuthIntegration {
  return (
    (integration as SyncDesktopOAuthIntegration).type === IntegrationType.OAuth
  );
}

/*
 * Firefox desktop 123+ uses the oauth_webchannel_v1 context and sends oauth data
 * usually passed via query params to us through a web channel message `fxa_status`
 * instead. This happens due to the index page "Looking for Firefox Sync?" link
 * needing this data, and the in-browser link follows suite for consistency.
 */
export class SyncDesktopOAuthIntegration extends OAuthIntegration {
  constructor(
    data: ModelDataStore,
    protected readonly storageData: ModelDataStore,
    public readonly opts: OAuthIntegrationOptions
  ) {
    super(data, storageData, opts, IntegrationType.SyncDesktopOAuth);
  }

  getServiceName() {
    return Constants.RELIER_SYNC_SERVICE_NAME;
  }
}
