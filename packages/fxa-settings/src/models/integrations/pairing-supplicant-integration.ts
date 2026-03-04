/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore } from '../../lib/model-data';
import { IntegrationType } from './integration';
import {
  OAuthWebIntegration,
  OAuthIntegrationOptions,
} from './oauth-web-integration';
import {
  PairingChannelClient,
  PairingChannelIncomingMessage,
} from '../../lib/channels/pairing-channel';
import { RemoteMetadata } from '../../lib/types';
import UAParser from 'ua-parser-js';
import { toGenericOSName } from '../../lib/utilities';
import config from '../../lib/config';

/**
 * Supplicant state — mirrors the Backbone state machine but as a
 * simple enum that React components can switch on.
 */
export enum SupplicantState {
  /** Connecting WebSocket to channel server */
  Connecting = 'connecting',
  /** Sending OAuth params, waiting for authority metadata */
  WaitingForMetadata = 'waiting_for_metadata',
  /** Showing approval screen — waiting for both sides to approve */
  WaitingForAuthorizations = 'waiting_for_authorizations',
  /** Supplicant approved, waiting for authority approval */
  WaitingForAuthority = 'waiting_for_authority',
  /** Authority approved, waiting for supplicant user action */
  WaitingForSupplicant = 'waiting_for_supplicant',
  /** Sending OAuth result to relier */
  SendingResult = 'sending_result',
  /** Complete */
  Complete = 'complete',
  /** Error / failure */
  Failed = 'failed',
}

/**
 * Supplicant integration for the device-pairing flow.
 *
 * The "supplicant" is the new device (typically mobile) that wants to pair
 * with the authority (already-signed-in browser).  Communication happens over
 * a PSK-encrypted WebSocket (PairingChannel) via the channel server.
 *
 * Ported from:
 *  - fxa-content-server/app/scripts/models/auth_brokers/pairing/supplicant.js
 *  - fxa-content-server/app/scripts/models/pairing/supplicant-state-machine.js
 */
export class PairingSupplicantIntegration extends OAuthWebIntegration {
  private _channel: PairingChannelClient | null = null;
  private _state: SupplicantState = SupplicantState.Connecting;
  private _remoteMetadata: RemoteMetadata | null = null;
  private _oauthCode: string | null = null;
  private _error: Error | { errno: number; message: string } | null = null;
  private _email = '';
  private _deviceName = '';

  // Callbacks for React components
  public onStateChange: ((state: SupplicantState) => void) | null = null;
  public onError: ((error: unknown) => void) | null = null;

  constructor(
    data: ModelDataStore,
    protected readonly storageData: ModelDataStore,
    public readonly opts: OAuthIntegrationOptions
  ) {
    super(data, storageData, opts, IntegrationType.PairingSupplicant);
  }

  /**
   * Validate that the client_id is in the pairing allowlist.
   * Matches Backbone supplicant.js behavior which throws INVALID_PAIRING_CLIENT.
   * Called by the integration factory after construction.
   */
  validatePairingClient(): boolean {
    const clientId = this.data.clientId;
    const allowedClients = config.pairing?.clients || [];
    // Skip validation when allowlist is empty (dev mode / config not yet loaded)
    if (allowedClients.length === 0) return true;
    return allowedClients.includes(clientId);
  }

  get state(): SupplicantState {
    return this._state;
  }

  get remoteMetadata(): RemoteMetadata | null {
    return this._remoteMetadata;
  }

  get oauthCode(): string | null {
    return this._oauthCode;
  }

  get error(): Error | { errno: number; message: string } | null {
    return this._error;
  }

  /** Email address sent by the authority in pair:auth:metadata. */
  get email(): string {
    return this._email;
  }

  /** Device name sent by the authority in pair:auth:metadata. */
  get deviceName(): string {
    return this._deviceName;
  }

  // ---------------------------------------------------------------------------
  // State management
  // ---------------------------------------------------------------------------

  private setState(state: SupplicantState): void {
    this._state = state;
    this.onStateChange?.(state);
  }

  // ---------------------------------------------------------------------------
  // Channel management
  // ---------------------------------------------------------------------------

  /**
   * Open the WebSocket channel and start the supplicant flow.
   * Called once when the Supp page mounts.
   */
  async openChannel(
    channelServerUri: string,
    channelId: string,
    channelKey: string
  ): Promise<void> {
    if (this._channel) {
      return; // already open
    }

    this._channel = new PairingChannelClient();

    // Listen for channel events
    this._channel.addEventListener('connected', this.handleConnected);
    this._channel.addEventListener('close', this.handleClose);
    this._channel.addEventListener('error', this.handleChannelError);

    // Listen for authority messages (prefixed with 'remote:')
    this._channel.addEventListener(
      'remote:pair:auth:metadata',
      this.handleAuthMetadata
    );
    this._channel.addEventListener(
      'remote:pair:auth:authorize',
      this.handleAuthAuthorize
    );

    try {
      await this._channel.open(channelServerUri, channelId, channelKey);
    } catch (err: unknown) {
      this._error = err instanceof Error ? err : new Error(String(err));
      this.setState(SupplicantState.Failed);
      this.onError?.(this._error);
    }
  }

  // ---------------------------------------------------------------------------
  // Actions (called by page components)
  // ---------------------------------------------------------------------------

  /** Supplicant user approved the pairing. */
  async supplicantApprove(): Promise<void> {
    if (!this._channel) return;

    try {
      await this._channel.send('pair:supp:authorize', {});

      if (this._state === SupplicantState.WaitingForAuthorizations) {
        // Supplicant approved first — wait for authority
        this.setState(SupplicantState.WaitingForAuthority);
      } else if (this._state === SupplicantState.WaitingForSupplicant) {
        // Authority already approved — send result
        this.sendResultToRelier();
      }
    } catch (err: unknown) {
      this._error = err instanceof Error ? err : new Error(String(err));
      this.setState(SupplicantState.Failed);
      this.onError?.(this._error);
    }
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  private handleConnected = () => {
    this.setState(SupplicantState.WaitingForMetadata);

    // Send OAuth request to authority
    const oauthParams = this.getOAuthParams();
    this._channel
      ?.send('pair:supp:request', oauthParams as Record<string, unknown>)
      .catch((err: unknown) => {
        this._error = err instanceof Error ? err : new Error(String(err));
        this.setState(SupplicantState.Failed);
        this.onError?.(this._error);
      });
  };

  private handleAuthMetadata = (event: Event) => {
    const data = (event as CustomEvent).detail as PairingChannelIncomingMessage;

    // The authority sends deviceName and email at top level of the message
    this._deviceName = data.deviceName || '';
    this._email = data.email || '';

    if (data.remoteMetaData) {
      const parser = new UAParser(data.remoteMetaData.ua || '');
      const browser = parser.getBrowser();
      const os = parser.getOS();

      this._remoteMetadata = {
        city: data.remoteMetaData.city,
        country: data.remoteMetaData.country,
        region: data.remoteMetaData.region,
        ipAddress: data.remoteMetaData.ipAddress || '',
        deviceFamily: browser.name || 'Unknown',
        deviceOS: toGenericOSName(os.name || ''),
        deviceName: data.deviceName || browser.name || 'Unknown',
      };
    }

    this.setState(SupplicantState.WaitingForAuthorizations);
  };

  private handleAuthAuthorize = (event: Event) => {
    const data = (event as CustomEvent).detail;

    // Authority sends { code, state } when approving — code is required
    if (!data?.code) {
      this._error = new Error(
        'Authority approved without providing an OAuth code'
      );
      this.setState(SupplicantState.Failed);
      this.onError?.(this._error);
      return;
    }

    this._oauthCode = data.code;

    if (this._state === SupplicantState.WaitingForAuthorizations) {
      // Authority approved first — wait for supplicant user
      this.setState(SupplicantState.WaitingForSupplicant);
    } else if (this._state === SupplicantState.WaitingForAuthority) {
      // Supplicant already approved — send result
      this.sendResultToRelier();
    }
  };

  private handleClose = () => {
    // Channel closed — if we're not in a terminal state, it's an error
    if (
      this._state !== SupplicantState.Complete &&
      this._state !== SupplicantState.SendingResult &&
      this._state !== SupplicantState.Failed
    ) {
      this._error = {
        errno: 1006,
        message: 'Connection to remote device closed, please try again',
      };
      this.setState(SupplicantState.Failed);
      this.onError?.(this._error);
    }
  };

  private handleChannelError = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    this._error = detail;
    this.setState(SupplicantState.Failed);
    this.onError?.(detail);
  };

  // ---------------------------------------------------------------------------
  // OAuth result
  // ---------------------------------------------------------------------------

  private sendResultToRelier(): void {
    // The redirect URI with code and state is constructed by the integration's
    // base class. Page components handle the actual navigation/redirect.
    this.setState(SupplicantState.Complete);
  }

  /**
   * Build the OAuth params to send to the authority.
   * Matches Backbone's SupplicantRelier.getOAuthParams().
   *
   * Uses this.data (OAuthIntegrationData) which reads from URL params
   * via @bind decorators. The scope may contain literal '+' characters
   * (from URL %2B encoding) which must be normalized to spaces for the
   * OAuth server to properly validate scopes.
   */
  private getOAuthParams(): {
    access_type: string;
    client_id: string;
    code_challenge: string;
    code_challenge_method: string;
    keys_jwk: string;
    scope: string;
    state: string;
  } {
    return {
      access_type: this.data.accessType || 'offline',
      client_id: this.data.clientId || '',
      code_challenge: this.data.codeChallenge || '',
      code_challenge_method: this.data.codeChallengeMethod || '',
      keys_jwk: this.data.keysJwk || '',
      // Normalize '+' to space — browsers may store URL-encoded spaces as %2B
      // which URLSearchParams decodes to literal '+' instead of space.
      scope: (this.data.scope || '').replace(/\+/g, ' '),
      state: this.data.state || '',
    };
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  async destroy(): Promise<void> {
    this.onStateChange = null;
    this.onError = null;

    if (this._channel) {
      this._channel.removeEventListener('connected', this.handleConnected);
      this._channel.removeEventListener('close', this.handleClose);
      this._channel.removeEventListener('error', this.handleChannelError);
      this._channel.removeEventListener(
        'remote:pair:auth:metadata',
        this.handleAuthMetadata
      );
      this._channel.removeEventListener(
        'remote:pair:auth:authorize',
        this.handleAuthAuthorize
      );
      try {
        await this._channel.close();
      } catch {
        // ignore close errors during cleanup
      }
      this._channel = null;
    }
  }
}
