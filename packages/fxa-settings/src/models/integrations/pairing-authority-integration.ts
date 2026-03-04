/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore } from '../../lib/model-data';
import { Constants } from '../../lib/constants';
import { IntegrationType } from './integration';
import {
  OAuthWebIntegration,
  OAuthIntegrationOptions,
} from './oauth-web-integration';
import {
  firefox,
  PairSupplicantMetadataResponse,
} from '../../lib/channels/firefox';
import { RemoteMetadata } from '../../lib/types';
import UAParser from 'ua-parser-js';
import { toGenericOSName } from '../../lib/utilities';
import config from '../../lib/config';

const PAIR_HEARTBEAT_INTERVAL = 1000;

/**
 * Authority integration for the device-pairing flow.
 *
 * The "authority" is the already-signed-in Firefox browser that is
 * approving a new device (the "supplicant") to pair.  Communication
 * with Firefox happens over WebChannel commands; the page components
 * call methods on this class to drive the flow.
 *
 * Ported from: fxa-content-server/app/scripts/models/auth_brokers/pairing/authority.js
 */
export class PairingAuthorityIntegration extends OAuthWebIntegration {
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private _remoteMetadata: RemoteMetadata | null = null;
  private _metadataPromise: Promise<RemoteMetadata> | null = null;
  private _suppAuthorized = false;
  private _authAuthorized = false;

  // Callbacks that page components can subscribe to
  public onSuppAuthorized: (() => void) | null = null;
  public onHeartbeatError: ((err: unknown) => void) | null = null;

  constructor(
    data: ModelDataStore,
    private readonly channelData: ModelDataStore,
    protected readonly storageData: ModelDataStore,
    public readonly opts: OAuthIntegrationOptions
  ) {
    super(data, storageData, opts, IntegrationType.PairingAuthority);
  }

  /**
   * Validate that the client_id is in the pairing allowlist.
   * Matches Backbone authority.js behavior which throws INVALID_PAIRING_CLIENT.
   * Called by the integration factory after construction.
   */
  validatePairingClient(): boolean {
    const clientId = this.data.clientId;
    const allowedClients = config.pairing?.clients || [];
    // Skip validation when allowlist is empty (dev mode / config not yet loaded)
    if (allowedClients.length === 0) return true;
    return allowedClients.includes(clientId);
  }

  /** Channel ID from the URL — needed for all WebChannel pairing commands. */
  get channelId(): string {
    // Authority receives channel_id as a query param (not hash — hash is supplicant-only)
    return (
      new URLSearchParams(window.location.search).get('channel_id') ||
      String(this.channelData.get('channel_id') || '')
    );
  }

  /**
   * Override getServiceName to avoid scope validation issues.
   * The pairing authority is always Firefox Sync — clientInfo is not
   * populated for this integration, so the base class would fail
   * when checking trusted/untrusted permissions.
   */
  getServiceName(): string {
    return Constants.RELIER_SYNC_SERVICE_NAME;
  }

  /** Remote (supplicant) device metadata, populated by getSupplicantMetadata(). */
  get remoteMetadata(): RemoteMetadata | null {
    return this._remoteMetadata;
  }

  get suppAuthorized(): boolean {
    return this._suppAuthorized;
  }

  get authAuthorized(): boolean {
    return this._authAuthorized;
  }

  // ---------------------------------------------------------------------------
  // Supplicant metadata
  // ---------------------------------------------------------------------------

  /**
   * Request metadata about the supplicant device from Firefox via WebChannel.
   * Enriches with UA-parsed device type/family/OS (matching Backbone behavior).
   */
  async getSupplicantMetadata(): Promise<RemoteMetadata> {
    if (this._remoteMetadata) {
      return this._remoteMetadata;
    }

    // Guard against concurrent calls from multiple components
    if (this._metadataPromise) {
      return this._metadataPromise;
    }

    this._metadataPromise = this.fetchSupplicantMetadata();
    try {
      return await this._metadataPromise;
    } finally {
      this._metadataPromise = null;
    }
  }

  private async fetchSupplicantMetadata(): Promise<RemoteMetadata> {
    const response: PairSupplicantMetadataResponse =
      await firefox.pairSupplicantMetadata(this.channelId);

    const parser = new UAParser(response.ua);
    const browser = parser.getBrowser();
    const os = parser.getOS();

    this._remoteMetadata = {
      city: response.city,
      country: response.country,
      region: response.region,
      ipAddress: response.ipAddress,
      deviceFamily: browser.name || 'Unknown',
      deviceOS: toGenericOSName(os.name || ''),
      // Don't set deviceName to a generic type like "desktop" — the
      // DeviceInfoBlock renders a prominent h2 for it. Backbone doesn't
      // show a device name heading on the authority pages.
      deviceName: undefined,
    };

    return this._remoteMetadata;
  }

  // ---------------------------------------------------------------------------
  // Heartbeat
  // ---------------------------------------------------------------------------

  /** Start heartbeat polling (every ~1000ms). */
  startHeartbeat(): void {
    if (this.heartbeatTimer) {
      return; // already running
    }
    if (!this.channelId) {
      this.onHeartbeatError?.(
        new Error('No channel_id available for heartbeat')
      );
      return;
    }

    let heartbeatPending = false;
    this.heartbeatTimer = setInterval(async () => {
      if (heartbeatPending) return;
      heartbeatPending = true;
      try {
        const response = await firefox.pairHeartbeat(this.channelId);

        // Guard: if stopHeartbeat() was called while awaiting, bail out
        // to prevent stale callbacks after cleanup.
        if (!this.heartbeatTimer) return;

        if (!response) return;

        if (response.err) {
          this.stopHeartbeat();
          this.onHeartbeatError?.(response.err);
          return;
        }

        if (response.suppAuthorized && !this._suppAuthorized) {
          this._suppAuthorized = true;
          this.onSuppAuthorized?.();
        }
      } catch (err) {
        if (!this.heartbeatTimer) return;
        this.stopHeartbeat();
        this.onHeartbeatError?.(err);
      } finally {
        heartbeatPending = false;
      }
    }, PAIR_HEARTBEAT_INTERVAL);
  }

  /** Stop heartbeat polling. */
  stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /** Authority user approved the pairing request. */
  authorize(): void {
    this._authAuthorized = true;
    firefox.pairAuthorize(this.channelId);
  }

  /** Authority user declined the pairing request. */
  decline(): void {
    this.stopHeartbeat();
    firefox.pairDecline(this.channelId);
  }

  /** Signal pairing complete to Firefox. */
  complete(): void {
    this.stopHeartbeat();
    firefox.pairComplete(this.channelId);
  }

  /** Clean up timers on unmount. */
  destroy(): void {
    this.stopHeartbeat();
    this.onSuppAuthorized = null;
    this.onHeartbeatError = null;
  }
}
