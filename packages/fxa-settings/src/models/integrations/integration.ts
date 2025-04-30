/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../../lib/types';
import { IntegrationData } from './data/data';
import { IntegrationFeatures } from './features';
import { RelierClientInfo, RelierSubscriptionInfo } from './relier-interfaces';

/**
 * Default alias type, so we don't have continually redeclare default generic types.
 */
export type Integration = GenericIntegration<
  IntegrationFeatures,
  IntegrationData
>;

/**
 * Enumerates know 'integration' types
 */
export enum IntegrationType {
  OAuthWeb = 'OAuthWeb', // OAuth for non-browser services/RPs
  OAuthNative = 'OAuthNative', // OAuth for desktop & mobile clients
  PairingAuthority = 'PairingAuthority', // TODO
  PairingSupplicant = 'PairingSupplicant', // TODO
  SyncBasic = 'SyncBasic',
  SyncDesktopV3 = 'SyncDesktopV3',
  Web = 'Web', // default
  ThirdPartyAuthCallback = 'ThirdPartyAuthCallback', // For third party auth callbacks
}

/**
 * Generic base class for all integrations. Can work with varying features and data models (ie TFeature and TData).
 */
export class GenericIntegration<
  TFeatures extends IntegrationFeatures,
  TData extends IntegrationData,
> {
  public type: IntegrationType;
  public data: TData;

  protected features: TFeatures;

  clientInfo: RelierClientInfo | undefined;
  subscriptionInfo: RelierSubscriptionInfo | undefined;

  constructor(
    type: IntegrationType,
    data: TData,
    features: TFeatures,
    clientInfo?: RelierClientInfo,
    subscriptionInfo?: RelierSubscriptionInfo | undefined
  ) {
    this.type = type;
    this.data = data;
    this.clientInfo = clientInfo;
    this.subscriptionInfo = subscriptionInfo;
    this.features = features;
  }

  setFeatures(features: Partial<TFeatures>) {
    this.features = { ...this.features, ...features } as TFeatures;
  }

  hasWebChannelSupport() {
    return this.isSync() || this.isDesktopRelay() || this.isDesktopSync();
  }

  isSync() {
    return false;
  }

  isDesktopSync() {
    return false;
  }

  isDesktopRelay() {
    return false;
  }

  isFirefoxMobileClient() {
    return false;
  }

  isFirefoxDesktopClient() {
    return false;
  }

  getServiceName(): string {
    // If the service is not defined, then check the client info
    if (!this.data.service && this.clientInfo?.serviceName) {
      return this.clientInfo.serviceName;
    }

    // TODO: Not 100% sure about this
    // If the service is the same as the client info id, then use that service name
    if (
      this.clientInfo?.clientId &&
      this.clientInfo?.serviceName &&
      this.clientInfo?.clientId === this.data.service
    ) {
      return this.clientInfo.serviceName;
    }

    // Fallback to defacto service names
    switch (this.data.service) {
      case MozServices.FirefoxSync:
      case 'sync':
        return MozServices.FirefoxSync;

      case MozServices.Monitor:
        return MozServices.Monitor;

      case MozServices.MozillaVPN:
        return MozServices.MozillaVPN;

      case MozServices.Pocket:
        return MozServices.Pocket;

      case MozServices.TestService:
        return MozServices.TestService;

      default:
        return MozServices.Default;
    }
  }

  wantsKeys(): boolean {
    return false;
  }

  wantsLogin(): boolean {
    return false;
  }

  wantsTwoStepAuthentication(): boolean {
    return false;
  }

  getRedirectUri(): string | undefined {
    return undefined;
  }

  getService(): string | undefined {
    return this.data.service;
  }

  getClientId(): string | undefined {
    return this.data.clientId;
  }

  isTrusted() {
    return true;
  }

  thirdPartyAuthParams() {
    return {};
  }
}
