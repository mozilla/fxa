/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { KeyTransforms as T, ModelDataStore } from '../../lib/model-data';
import { Constants } from '../../lib/constants';
import { WebIntegrationData } from './data';

import { IntegrationFeatures } from './features';
import { GenericIntegration, IntegrationType } from './integration';

export class WebIntegration extends GenericIntegration<
  IntegrationFeatures,
  WebIntegrationData
> {
  constructor(data: ModelDataStore) {
    super(IntegrationType.Web, new WebIntegrationData(data), {
      reuseExistingSession: true,
      // TODO: check if `navigator.userAgent` is firefox desktop.
      // content-server also checks for FF version 55+ but that's nearly 6 years old
      fxaStatus: true,
      allowUidChange: false,
      handleSignedInNotification: true,
      supportsPairing: false,
    });
  }

  // Special case of mobile accessing Settings through the browser's "Manage account"
  // TODO: do we want a SyncMobileBasic integration for this?
  isSync() {
    return this.data.context === Constants.OAUTH_WEBCHANNEL_CONTEXT;
  }
}

export function isWebIntegration(integration: {
  type: IntegrationType;
}): integration is WebIntegration {
  return (integration as WebIntegration).type === IntegrationType.Web;
}

export default WebIntegration;
