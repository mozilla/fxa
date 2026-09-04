/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore } from '../../lib/model-data';
import { Constants } from '../../lib/constants';
import { IntegrationType } from './integration';
import {
  OAuthWebIntegration,
  OAuthIntegrationOptions,
  normalizeError,
} from './oauth-web-integration';
import {
  firefox,
  PairSupplicantMetadataResponse,
} from '../../lib/channels/firefox';
import { RemoteMetadata } from '../../lib/types';
import UAParser from 'ua-parser-js';
import { toGenericOSName } from '../../lib/utilities';
import config from '../../lib/config';
import {
  PairingChannelClient,
  toRemoteMetadata,
} from '../../lib/channels/pairing-channel';
import { OAuthError } from '../../lib/oauth';
import {
  ValidatedSupplicantRequest,
  validateSupplicantRequest,
} from './pairing-request-validation';
import * as Sentry from '@sentry/browser';
import { buildPairUrl } from '../../lib/pairing/pair-url';

const PAIR_HEARTBEAT_INTERVAL = 1000;

/**
 * Authority state — a simple enum that React components can switch on.
 *
 * The `WaitingFor*` members name *who the flow is waiting on*, not who owns
 * the state, so they read the same on both sides of the channel as
 * `SupplicantState`.
 */
export enum AuthorityState {
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
  private static readonly TERMINAL_STATES = new Set([
    AuthorityState.Complete,
    AuthorityState.Failed,
  ]);

  private _channel: PairingChannelClient | null = null;
  private _version: number | null = null;
  public _iid: string | null = null;
  private _state: AuthorityState | null = null;

  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private _remoteMetadata: RemoteMetadata | null = null;
  private _metadataPromise: Promise<RemoteMetadata> | null = null;
  private _suppAuthorized = false;
  private _authAuthorized = false;
  private _cachedChannelId: string | null = null;
  private _supRequest: ValidatedSupplicantRequest | null = null;

  public onSuppAuthorized: (() => void) | null = null;
  public onHeartbeatError: ((err: unknown) => void) | null = null;
  public onError: ((error: unknown) => void) | null = null;
  public onStateChange: ((state: AuthorityState) => void) | null = null;

  constructor(
    data: ModelDataStore,
    private readonly channelData: ModelDataStore,
    protected readonly storageData: ModelDataStore,
    public readonly opts: OAuthIntegrationOptions
  ) {
    super(data, storageData, opts, IntegrationType.PairingAuthority);
    this._iid = crypto.randomUUID();
    console.info('Created new PairingAuthorityIntegration', this._iid);
  }

  /**
   * Signals that the integration supports pairing. Which in this case will always be true.
   */
  isPairing(): boolean {
    return true;
  }

  get state(): AuthorityState | null {
    return this._state;
  }

  hasChannel() {
    return this._channel !== null;
  }

  /**
   * The URL encoded into the QR code. The supplicant reads the channel
   * credentials out of the fragment, which is never sent to the server.
   */
  getPairUrl(v: '1' | '2') {
    if (!this._channel?.channelId || !this._channel?.channelKey) {
      throw new Error('Cannot build a pair URL before the channel is created.');
    }
    // Shared with the supplicant's deep link back into Firefox, so the URL we
    // encode and the URL we hand off can never disagree.
    return buildPairUrl({
      channelId: this._channel.channelId,
      channelKey: this._channel.channelKey,
      version: v,
    });
  }

  async createChannel(): Promise<void> {
    if (this._channel) {
      console.warn('Pairing channel already exists!')
      return;
    }

    const channel = new PairingChannelClient();
    this._channel = channel;
    this._version = 2; // Only pairing v2 creates the authority channel

    channel.addEventListener('connected', this.handleConnected);
    channel.addEventListener('close', this.handleClose);
    channel.addEventListener('error', this.handleChannelError);
    channel.addEventListener(
      'remote:pair:supp:request',
      this.handleSuppRequest
    );
    channel.addEventListener(
      'remote:pair:supp:authorize',
      this.handleSuppAuthorize
    );

    try {
      await channel.create(config.pairing.serverBaseUri);
    } catch (err) {
      // Reset _channel so a subsequent createChannel() call can retry.
      this._channel = null;
      this.fail(err);
      throw err;
    }
  }

  /**
   * A close is only unexpected before the handshake finishes. `fail()` already
   * ignores calls made from a terminal state, so completion needs no separate
   * guard here.
   */
  private handleClose = () => {
    this.fail({
      errno: 1006,
      message: 'Connection to remote device closed, please try again',
    });
  };

  private handleChannelError = (event: Event) => {
    this.fail((event as CustomEvent).detail);
  };

  private setState(state: AuthorityState): void {
    this._state = state;
    console.info('Emitting pairing authority state change event.', {id: this._iid, state: this.state});
    this.onStateChange?.(state);
  }

  private fail(err: unknown): void {
    if (
      this._state &&
      PairingAuthorityIntegration.TERMINAL_STATES.has(this._state)
    ) {
      return;
    }
    this.setState(AuthorityState.Failed);
    this.onError?.(normalizeError(err));
  }

  private handleConnected = () => {
    this.setState(AuthorityState.WaitingForMetadata);
  };

  /**
   * Authority: the supplicant scanned the QR, joined the channel and sent its
   * OAuth request. This is the mirror of `handleAuthMetadata`, but the payloads
   * are *not* symmetric, so the auth-side logic does not carry over wholesale:
   *
   *  - The message is `pair:supp:request`, not `pair:supp:metadata`. The
   *    supplicant only ever sends `pair:supp:request` (OAuth params) and
   *    `pair:supp:authorize`; there is no supplicant metadata message.
   *  - `deviceName` and `email` are authority-owned — the supplicant is not
   *    signed in yet, so its request carries neither. Reading them here would
   *    always blank out the account details, so they are left alone.
   *  - `remoteMetaData` *is* present either way: PairingChannelClient derives it
   *    from the channel server's `sender` envelope, not from the payload. That
   *    is what the authority shows so the user can confirm which device is
   *    asking, and the only field of the message we consume.
   */
  private handleSuppRequest = (event: Event) => {
    const data = (event as CustomEvent).detail;
    if (data?.remoteMetaData) {
      this._remoteMetadata = toRemoteMetadata(data.remoteMetaData);
    }

    // In V2, FxA brokers pairing channel communications. Ack back to
    // the supplicant with meta data, so the can approve the connection.
    if (this._version === 2) {
      if (!this._channel) {
        this.fail(
          new Error('Cannot handle a supplicant request without a channel.')
        );
        return;
      }

      // Vet the request as it arrives rather than in `authorize()`: approving is
      // what turns these params into a real OAuth code with the account's Sync
      // keys wrapped inside, so a request we would refuse must never reach the
      // approval screen. Nothing throws out of this listener — a throw here
      // reaches no caller, leaving the flow silently stalled.
      const validation = validateSupplicantRequest(data);
      if (!validation.ok) {
        const err = new OAuthError('INVALID_PARAMETER', {
          param: validation.failures.map((f) => f.field).join(', '),
        });
        // Field names and reasons only. The payload is remote-controlled, and
        // `keys_jwk`/`code_challenge` do not belong in Sentry.
        Sentry.captureException(err, {
          extra: {
            pairingRequestFailures: validation.failures
              .map((f) => `${f.field}: ${f.reason}`)
              .join('; '),
          },
        });
        this.fail(err);
        return;
      }

      this._supRequest = validation.request;

      this._channel.send('pair:auth:metadata', {})
        .then(()=>{
           this.setState(AuthorityState.WaitingForAuthorizations);
        })
        .catch((err) => {
          console.warn('Error sending pair:auth:metadata');
          Sentry.captureException(err);
          this.fail(err);
        });
    } else {
      this.setState(AuthorityState.WaitingForAuthorizations);
    }
  };

  /**
   * Authority: the supplicant user tapped Connect.
   *
   * `pair:supp:authorize` is sent with an empty payload (see
   * `supplicantApprove`, and Backbone's supplicant-state-machine.js, which
   * sends it with no data at all), so unlike `pair:auth:authorize` there is
   * nothing in `event.detail` to validate — the message arriving *is* the
   * signal. The channel is PSK-encrypted and PairingChannelClient has already
   * rejected anything without a well-formed envelope and sender, so the detail
   * is deliberately not read here.
   */
  private handleSuppAuthorize = () => {
    if (!this._suppAuthorized) {
      this._suppAuthorized = true;
      this.onSuppAuthorized?.();
    }

    // In V2, the supplicant ALWAYS approves first!
    if (this._version === 2) {
      this.setState(AuthorityState.WaitingForAuthority);
    } else {
      if (this._state === AuthorityState.WaitingForAuthorizations) {
        // Supplicant approved first — the authority user has yet to act.
        this.setState(AuthorityState.WaitingForAuthority);
      } else if (this._state === AuthorityState.WaitingForSupplicant) {
        // Authority already approved. Handshake complete.
        this.setState(AuthorityState.Complete);
      }
    }
  };

  /**
   * Validate that the client_id is in the pairing allowlist.
   * Matches Backbone authority.js behavior which throws INVALID_PAIRING_CLIENT.
   * Called by the integration factory after construction.
   */
  validatePairingClient(): boolean {
    const clientId = this.data.clientId;
    const allowedClients = config.pairing?.clients || [];
    // Skip validation when allowlist is empty (dev mode / config not yet loaded)
    if (allowedClients.length === 0) {
      return true;
    }
    return allowedClients.includes(clientId);
  }

  /** Channel ID from the URL — needed for all WebChannel pairing commands. */
  get channelId(): string {
    if (!this._cachedChannelId) {
      // Authority receives channel_id as a query param (not hash — hash is supplicant-only)
      this._cachedChannelId =
        new URLSearchParams(window.location.search).get('channel_id') ||
        String(this.channelData.get('channel_id') || '');
    }
    return this._cachedChannelId;
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
      if (heartbeatPending) {
        return;
      }
      heartbeatPending = true;
      try {
        const response = await firefox.pairHeartbeat(this.channelId);

        // Guard: if stopHeartbeat() was called while awaiting, bail out
        // to prevent stale callbacks after cleanup.
        if (!this.heartbeatTimer) {
          return;
        }

        if (!response) {
          return;
        }

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
        if (!this.heartbeatTimer) {
          return;
        }
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

  /** Authority user approved the pairing request. */
  async authorize(): Promise<void> {
    this._authAuthorized = true;

    if (this._version === 2) {
      // `_supRequest` is only ever assigned from `validateSupplicantRequest`, so a
      // non-null value here has already passed every rule. The type is the
      // guarantee; re-checking the fields would only invite the two copies to drift.
      const supRequest = this._supRequest;
      if (!supRequest || !this._channel) {
        this.fail(
          new Error('Cannot authorize without a validated supplicant request.')
        );
        return;
      }

      try {
        const result = await firefox.pairOauthFinish({
          client_id: supRequest.client_id,
          code_challenge: supRequest.code_challenge,
          code_challenge_method: supRequest.code_challenge_method,
          keys_jwk: supRequest.keys_jwk,
          scope: supRequest.scope,
          state: supRequest.state
        });

        if (!result?.code || !result.state) {
          throw new Error('Failed to finalize oauth pair!');
        }
        console.info('OAuth pair finish success!')

        await this._channel.send('pair:auth:authorize', {
          code: result.code,
          state: result.state
        })
      } catch (err) {
        // pairOauthFinish rejects on its own timeout, on a missing code/state and
        // on an echoed-state mismatch, and the send can reject too. The approve
        // handler does not await this method, so anything thrown from here would
        // be an unhandled rejection that leaves the user on the approval screen.
        Sentry.captureException(err);
        this.fail(err);
        return;
      }
    }
    else {
      await firefox.pairAuthorize(this.channelId);
    }

    // The post-approval transition, shared by both pairing versions.
    if (this._state === AuthorityState.WaitingForAuthorizations) {
      this.setState(AuthorityState.WaitingForSupplicant);
    } else if (this._state === AuthorityState.WaitingForAuthority) {
      this.setState(AuthorityState.Complete);
    }
  }

  /** Authority user declined the pairing request. */
  async decline(): Promise<void> {
    this.stopHeartbeat();
    await firefox.pairDecline(this.channelId);
  }

  /** Signal pairing complete to Firefox. */
  async complete(): Promise<void> {
    this.stopHeartbeat();
    await firefox.pairComplete(this.channelId);
  }

  /** Clean up timers on unmount. */
  async destroy() {
    this.stopHeartbeat();
    this.onSuppAuthorized = null;
    this.onHeartbeatError = null;
    this._supRequest = null;

    this.onStateChange = null;
    this.onError = null;

    if (this._channel) {
      this._channel.removeEventListener('connected', this.handleConnected);
      this._channel.removeEventListener('close', this.handleClose);
      this._channel.removeEventListener('error', this.handleChannelError);
      this._channel.removeEventListener(
        'remote:pair:supp:request',
        this.handleSuppRequest
      );
      this._channel.removeEventListener(
        'remote:pair:supp:authorize',
        this.handleSuppAuthorize
      );

      try {
        await this._channel.close();
      } catch (err) {
        Sentry.captureException(err)
      } finally {
        this._channel = null;
      }
    }
  }
}
