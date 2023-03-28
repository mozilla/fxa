/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum IntegrationType {
  OAuth = 'OAuth',
  PairingAuthority = 'PairingAuthority', // TODO
  PairingSupplicant = 'PairingSupplicant', // TODO
  SyncBasic = 'SyncBasic',
  SyncDesktop = 'SyncDesktop',
  Web = 'Web', // default
}

export abstract class Integration<
  T extends IntegrationFeatures = IntegrationFeatures
> {
  type: IntegrationType;
  public features: T = {} as T;

  constructor(type: IntegrationType) {
    this.type = type;
  }

  protected setFeatures(features: Partial<T>) {
    this.features = { ...this.features, ...features } as T;
  }
}

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

/* TODO, do we care about these capabilities/features?
 * -isOpenWebmailButtonVisible: we have a webmail link showing only in desktop v3 on the confirm
 * reset PW page and confirm page. We have this comment: "we do not show [this] in mobile context
 * because it performs worse".
 * -
 */

export class BaseIntegration<
  T extends IntegrationFeatures = IntegrationFeatures
> extends Integration<T> {
  constructor(type: IntegrationType) {
    super(type);
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
