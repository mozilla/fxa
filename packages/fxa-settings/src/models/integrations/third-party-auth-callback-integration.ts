/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore } from '../../lib/model-data';
import { AUTH_PROVIDER } from 'fxa-auth-client/browser';
import { ThirdPartyAuthCallbackIntegrationData } from './data';
import { IntegrationFeatures } from './features';
import {
  GenericIntegration,
  Integration,
  IntegrationType,
} from './integration';

export function isThirdPartyAuthCallbackIntegration(
  integration: null | Integration
): integration is ThirdPartyAuthCallbackIntegration {
  if (!integration) {
    return false;
  }

  return integration.type === IntegrationType.ThirdPartyAuthCallback;
}

export class ThirdPartyAuthCallbackIntegration extends GenericIntegration<
  IntegrationFeatures,
  ThirdPartyAuthCallbackIntegrationData
> {
  constructor(data: ModelDataStore) {
    super(
      IntegrationType.ThirdPartyAuthCallback,
      new ThirdPartyAuthCallbackIntegrationData(data),
      {
        allowUidChange: false,
        fxaStatus: false,
        handleSignedInNotification: true,
        reuseExistingSession: false,
        supportsPairing: false,
      }
    );
  }

  thirdPartyAuthParams() {
    const code = this.data.code;
    const providerFromParams = this.data.provider;
    let provider: AUTH_PROVIDER;
    if (providerFromParams === 'apple') {
      provider = AUTH_PROVIDER.APPLE;
    } else {
      provider = AUTH_PROVIDER.GOOGLE;
    }

    return { code, provider };
  }

  getFxAParams() {
    const state = this.data.state;
    if (state) {
      const decodedState = decodeURIComponent(state);
      const url = new URL(decodedState);
      return url.search;
    }

    return '';
  }

  getError() {
    return this.data.error;
  }
}
