/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BaseIntegration,
  Integration,
  IntegrationFeatures,
  IntegrationType,
} from './base-integration';
import { bind, ModelDataStore } from '../../lib/model-data';
import { AUTH_PROVIDER } from 'fxa-auth-client/browser';

import { BaseIntegrationData } from './web-integration';
import { IsOptional, IsString } from 'class-validator';

export function isThirdPartyAuthCallbackIntegration(
  integration: null | Integration<IntegrationFeatures>
): integration is ThirdPartyAuthCallbackIntegration {
  if (!integration) {
    return false;
  }

  return integration.type === IntegrationType.ThirdPartyAuthCallback;
}

export class ThirdPartyAuthCallbackIntegrationData extends BaseIntegrationData {
  @IsString()
  @bind()
  state: string | undefined;

  @IsString()
  @bind()
  code: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  provider: string | undefined;
}

export interface ThirdPartyAuthCallbackIntegrationFeatures
  extends IntegrationFeatures {}

export class ThirdPartyAuthCallbackIntegration extends BaseIntegration<ThirdPartyAuthCallbackIntegrationFeatures> {
  constructor(data: ModelDataStore) {
    super(
      IntegrationType.ThirdPartyAuthCallback,
      new ThirdPartyAuthCallbackIntegrationData(data)
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

  setParams(params: URLSearchParams) {
    console.log('Setting params to', params);
    this.data.setParams(params);
  }
}
