/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../../lib/types';
import { WebChannelServices, SyncEngines } from '../../lib/channels/firefox';
import { IntegrationData } from './data/data';
import { IntegrationFeatures } from './features';
import {
  RelierClientInfo,
  RelierCmsInfo,
  RelierLegalTerms,
  RelierSubscriptionInfo,
} from './relier-interfaces';

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
  cmsInfo: RelierCmsInfo | undefined;
  legalTerms: RelierLegalTerms | undefined;
  // Set by IntegrationFactory.initClientInfo when the /v1/oauth/client/:id
  // fetch in `useClientInfoState` failed (network, WAF challenge, 5xx,
  // unknown client_id). Downstream code uses this to surface a discrete
  // error instead of falling through to scope-validation paths with a
  // half-populated clientInfo.
  clientInfoLoadFailed: boolean = false;

  constructor(
    type: IntegrationType,
    data: TData,
    features: TFeatures,
    clientInfo?: RelierClientInfo,
    subscriptionInfo?: RelierSubscriptionInfo | undefined,
    cmsInfo?: RelierCmsInfo | undefined,
    legalTerms?: RelierLegalTerms | undefined
  ) {
    this.type = type;
    this.data = data;
    this.clientInfo = clientInfo;
    this.subscriptionInfo = subscriptionInfo;
    this.cmsInfo = cmsInfo;
    this.legalTerms = legalTerms;
    this.features = features;
  }

  setFeatures(features: Partial<TFeatures>) {
    this.features = { ...this.features, ...features } as TFeatures;
  }

  isSync() {
    return false;
  }

  isDesktopSync() {
    return false;
  }

  isFirefoxClientServiceRelay() {
    return false;
  }

  isFirefoxClientServiceSmartWindow() {
    return false;
  }

  isFirefoxClientServiceVpn() {
    return false;
  }

  isFirefoxNonSync() {
    return false;
  }

  // Practically, this will never be called unless the integration is
  // an oauth-native-integration, but provide a reasonable default.
  getWebChannelServices(
    _syncEngines?: SyncEngines
  ): WebChannelServices | undefined {
    return undefined;
  }

  isFirefoxClient() {
    return this.isFirefoxDesktopClient() || this.isFirefoxMobileClient();
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

      case MozServices.TestService:
        return MozServices.TestService;

      default:
        return MozServices.Default;
    }
  }

  /**
   * Whether this integration strictly requires keys, forcing password entry.
   * Currently only Sync requires keys.
   *
   * Note, the Relay browser service login launched in Firefox desktop 135, and
   * the "keys optional" capability launched in Fx desktop 147, meaning all Relay
   * service users in those Fx versions require a password.
   *
   * Desktop OAuth launched with Fx 134. SyncDesktopV3 users don't have non-Sync
   * browser support.
   */
  requiresKeys(): boolean {
    return false;
  }

  /**
   * Whether this integration wants keys opportunistically — if the user
   * enters a password for another reason, we should also fetch keys.
   * This applies to non-Sync browser services (Relay, VPN, SmartWindow) that
   * request the Sync scope so users can turn Sync on in the browser without
   * being bounced back to FxA.
   */
  wantsKeysIfPasswordEntered(): boolean {
    return false;
  }

  /**
   * Whether this integration requests scoped keys. When true, `keys: true`
   * is sent to the auth server, which may trigger email verification.
   * Use `requiresKeys()` when you need to know if keys are mandatory
   * (e.g., forcing password entry), and `wantsKeys()` when you need to
   * know if scoped keys are being requested, either because they're
   * required or because the user entered a password and keys can be
   * derived opportunistically.
   */
  wantsKeys(): boolean {
    return this.requiresKeys() || this.wantsKeysIfPasswordEntered();
  }

  /**
   * Whether a passwordless account must set/enter a password to derive scoped
   * keys. Sync always requires keys; a non-Sync Firefox service that wants keys
   * needs a password only when the browser has not advertised `keys_optional`.
   * `browserSupportsKeysOptional` is the raw browser capability (from
   * `useFxAStatus`); this method applies the per-integration policy.
   */
  requiresPasswordForLogin(browserSupportsKeysOptional = false): boolean {
    return (
      this.requiresKeys() ||
      this.nonSyncKeysRequirePassword(browserSupportsKeysOptional)
    );
  }

  /**
   * The non-Sync half of `requiresPasswordForLogin`, exposed on its own so
   * callers (e.g. SigninDecider) reuse it instead of re-open-coding the clause.
   */
  nonSyncKeysRequirePassword(browserSupportsKeysOptional = false): boolean {
    return !browserSupportsKeysOptional && this.wantsKeysIfPasswordEntered();
  }

  /**
   * Whether a non-Sync Firefox service may complete login without keys (browser
   * advertised `keys_optional`, so Sync is decoupled from the service).
   */
  supportsKeylessLogin(browserSupportsKeysOptional = false): boolean {
    return browserSupportsKeysOptional && this.isFirefoxNonSync();
  }

  /**
   * Whether a Sync sign-in may send a pre-keys keyless `fxaccounts:login` before
   * the password step (desktop only; mobile ignores the login message).
   */
  allowsPreKeysSyncLogin(browserSupportsKeysOptional = false): boolean {
    return (
      browserSupportsKeysOptional &&
      this.isSync() &&
      !this.isFirefoxMobileClient()
    );
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

  getCmsInfo() {
    // Still check for an empty object and only return if not empty.
    return Object.keys(this.cmsInfo || {}).length > 0
      ? this.cmsInfo
      : undefined;
  }

  getLegalTerms() {
    return this.legalTerms;
  }
}
