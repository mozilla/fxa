/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../../lib/types';

export enum IntegrationType {
  OAuth = 'OAuth',
  PairingAuthority = 'PairingAuthority', // TODO
  PairingSupplicant = 'PairingSupplicant', // TODO
  SyncBasic = 'SyncBasic',
  SyncDesktop = 'SyncDesktop',
  Web = 'Web', // default
}

/* TODO, do we care about this feature (capability in content-server)?
 * -isOpenWebmailButtonVisible: we have a webmail link showing only in desktop v3
 *  on the confirm reset PW page and confirm page. We have this comment: "we do not
 * show [this] in mobile context because it performs worse".
 */
export interface IntegrationFeatures {
  /**
   * If the provided UID no longer exists on the auth server, can the
   * user sign up/in with the same email address but a different uid?
   */
  allowUidChange: boolean;
  /**
   * Should the user agent be queried for FxA data?
   */
  fxaStatus: boolean;
  /**
   * Should the view handle signed-in notifications from other tabs?
   */
  handleSignedInNotification: boolean;
  /**
   * If the user has an existing sessionToken, can we safely re-use it on
   * subsequent signin attempts rather than generating a new token each time?
   */
  reuseExistingSession: boolean;
  /**
   * Does this environment support pairing?
   */
  supportsPairing: boolean;
  /**
   * Does this environment support the Sync Optional flow?
   */
  syncOptional: boolean;
}

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

export abstract class Integration<
  T extends IntegrationFeatures = IntegrationFeatures
> {
  type: IntegrationType;
  public features: T = {} as T;
  // TODO fix data type
  public data: any;
  /** Lazy loaded client info. */
  clientInfo: Promise<RelierClientInfo> | undefined;
  /** Lazy loaded subscription info. */
  subscriptionInfo: Promise<RelierSubscriptionInfo> | undefined;

  // TODO fix data type
  constructor(type: IntegrationType, data: any) {
    this.type = type;
    this.data = data;
  }

  protected setFeatures(features: Partial<T>) {
    this.features = { ...this.features, ...features } as T;
  }

  // TODO: do we need this/isSync?
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
    if (!this.data.service) {
      if (this.clientInfo) {
        const clientInfo = await this.clientInfo;
        if (clientInfo?.serviceName) {
          return clientInfo.serviceName;
        }
      }
    }

    // Fallback to defacto service names
    switch (this.data.service) {
      case MozServices.FirefoxSync:
      case 'sync':
        return MozServices.FirefoxSync;

      case MozServices.FirefoxMonitor:
        return MozServices.FirefoxMonitor;

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
    return this.data.service;
  }

  async isTrusted() {
    return true;
  }

  // TODO: This seems like feature envy... Move logic elsewhere.
  // accountNeedsPermissions(account:RelierAccount): boolean {
  //   return false;
  // }
}

export class BaseIntegration<
  T extends IntegrationFeatures = IntegrationFeatures
> extends Integration<T> {
  // TODO fix data type
  constructor(type: IntegrationType, data: any) {
    super(type, data);
    this.setFeatures({
      allowUidChange: false,
      fxaStatus: false,
      handleSignedInNotification: true,
      reuseExistingSession: false,
      supportsPairing: false,
      syncOptional: false,
    } as T);
  }
}
