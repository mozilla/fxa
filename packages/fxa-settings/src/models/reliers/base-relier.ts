/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';
import {
  bind,
  KeyTransforms as T,
  ModelDataProvider,
  ModelValidation as V,
} from '../../lib/model-data';
import { MozServices } from '../../lib/types';

export interface RelierSubscriptionInfo {
  subscriptionProductId: string;
  subscriptionProductName: string;
}

export interface RelierClientInfo {
  clientId: string | undefined;
  imageUri: string | undefined;
  serviceName: string | undefined;
  redirectUri: string | undefined;
  trusted: boolean | undefined;
}

/**
 * A convenience interface for easy mocking / testing. Use this type in components.
 */
export interface RelierData {
  name: string;
  context: string | undefined;
  email: string | undefined;
  entrypoint: string | undefined;
  entrypointExperiment: string | undefined;
  entrypointVariation: string | undefined;
  resetPasswordConfirm: boolean | undefined;
  setting: string | undefined;
  service: string | undefined;
  style: string | undefined;
  uid: string | undefined;
  utmCampaign: string | undefined;
  utmContent: string | undefined;
  utmMedium: string | undefined;
  utmSource: string | undefined;
  utmTerm: string | undefined;

  clientInfo: Promise<RelierClientInfo> | undefined;
  subscriptionInfo: Promise<RelierSubscriptionInfo> | undefined;
}

export interface ResumeTokenInfo {
  // TBD
}

export interface Relier extends RelierData {
  getServiceName(): Promise<string>;
  getClientInfo(): Promise<RelierClientInfo | undefined>;
  isOAuth(): boolean;
  isSync(): Promise<boolean>;
  shouldOfferToSync(view: string): boolean;
  wantsKeys(): boolean;
  wantsTwoStepAuthentication(): boolean;
  isTrusted(): boolean;
  validate(): void;
  getService(): string | undefined;
  getRedirectUri(): string | undefined;
}

export interface RelierAccount {
  uid: string;
  email: string;
  sessionToken: string;
  verifyIdToken(
    idTokenHint: string,
    clientId: string,
    gracePeriod: number
  ): Promise<{ sub: string }>;
  isDefault(): unknown;
}

/**
 * Create a relier class that can be bound to a data store
 */
export class BaseRelier extends ModelDataProvider implements Relier {
  get name() {
    return 'base';
  }

  /** Lazy loaded client info. */
  clientInfo: Promise<RelierClientInfo> | undefined;

  /** Lazy loaded subscription info. */
  subscriptionInfo: Promise<RelierSubscriptionInfo> | undefined;

  @bind([V.isString])
  context: string | undefined;

  @bind([V.isString])
  email: string | undefined;

  @bind([V.isString])
  entrypoint: string | undefined;

  @bind([V.isString], T.snakeCase)
  entrypointExperiment: string | undefined;

  @bind([V.isString], T.snakeCase)
  entrypointVariation: string | undefined;

  @bind([V.isBoolean], T.snakeCase)
  resetPasswordConfirm: boolean | undefined;

  @bind([V.isString])
  setting: string | undefined;

  @bind([V.isString])
  service: string | undefined;

  @bind([V.isString])
  style: string | undefined;

  @bind([V.isString])
  uid: string | undefined;

  @bind([V.isString], T.snakeCase)
  utmCampaign: string | undefined;

  @bind([V.isString], T.snakeCase)
  utmContent: string | undefined;

  @bind([V.isString], T.snakeCase)
  utmMedium: string | undefined;

  @bind([V.isString], T.snakeCase)
  utmSource: string | undefined;

  @bind([V.isString], T.snakeCase)
  utmTerm: string | undefined;

  isOAuth(): boolean {
    return false;
  }

  async isSync(): Promise<boolean> {
    return false;
  }

  async getClientInfo(): Promise<RelierClientInfo | undefined> {
    return undefined;
  }

  async getServiceName(): Promise<string> {
    // If the service is not defined, then check the client info
    if (!this.service) {
      if (this.clientInfo) {
        const clientInfo = await this.clientInfo;
        if (clientInfo?.serviceName) {
          return clientInfo.serviceName;
        }
      }
    }

    // Fallback to defacto service names
    switch (this.service) {
      case MozServices.FirefoxSync:
      case 'sync':
        return MozServices.FirefoxSync;

      case MozServices.FirefoxMonitor:
        return MozServices.FirefoxMonitor;

      case MozServices.MozillaVPN:
        return MozServices.MozillaVPN;

      case MozServices.Pocket:
        return MozServices.Pocket;

      default:
        return MozServices.Default;
    }
  }

  shouldOfferToSync(view: string): boolean {
    return false;
  }
  wantsKeys(): boolean {
    return false;
  }
  wantsTwoStepAuthentication(): boolean {
    return false;
  }

  getRedirectUri(): string | undefined {
    return undefined;
  }

  getService() {
    return this.service;
  }

  isTrusted() {
    return true;
  }

  // TODO: This seems like feature envy... Move logic elsewhere.
  // accountNeedsPermissions(account:RelierAccount): boolean {
  //   return false;
  // }
}
