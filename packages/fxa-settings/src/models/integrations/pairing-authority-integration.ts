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
import {
  plog,
  SupplicantOAuthRequest,
} from '../../lib/channels/pairing-flow';
import UAParser from 'ua-parser-js';
import { toGenericOSName } from '../../lib/utilities';
import config from '../../lib/config';
import {
  PairingChannelClient,
  PairingChannelIncomingMessage,
  toRemoteMetadata,
} from '../../lib/channels/pairing-channel';
import * as Sentry from '@sentry/browser';

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
/**
 * Live authority pairing session, shared across PairingAuthorityIntegration
 * instances. See the note on `_channel` for why it cannot be instance state.
 *
 * Built by a factory so the fields are declared once: `resetAuthoritySession`
 * cannot then miss one that is added later.
 */
function newAuthoritySession() {
  return {
    channel: null as PairingChannelClient | null,
    state: null as AuthorityState | null,
    remoteMetadata: null as RemoteMetadata | null,
    supplicantOAuth: null as SupplicantOAuthRequest | null,
    suppAuthorized: false,
    authAuthorized: false,
    completing: false,
    pendingGrant: false,
    onSuppComplete: null as (() => void) | null,
    onSuppAuthorized: null as (() => void) | null,
    onError: null as ((error: unknown) => void) | null,
    onStateChange: null as ((state: AuthorityState) => void) | null,
  };
}

const authoritySession = newAuthoritySession();

/** Clear the session, so one test's channel cannot leak into the next. */
export function resetAuthoritySession(): void {
  Object.assign(authoritySession, newAuthoritySession());
}

export class PairingAuthorityIntegration extends OAuthWebIntegration {
  private static readonly TERMINAL_STATES = new Set([
    AuthorityState.Complete,
    AuthorityState.Failed,
  ]);

  // Session state lives at module scope because `useIntegration` rebuilds the
  // integration on navigation. Instance state would be dropped between scan_qr
  // and approve_signin, taking the handshake with it.
  private get _channel(): PairingChannelClient | null {
    return authoritySession.channel;
  }
  private set _channel(v: PairingChannelClient | null) {
    authoritySession.channel = v;
  }
  private get _state(): AuthorityState | null {
    return authoritySession.state;
  }
  private set _state(v: AuthorityState | null) {
    authoritySession.state = v;
  }

  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private get _remoteMetadata(): RemoteMetadata | null {
    return authoritySession.remoteMetadata;
  }
  private set _remoteMetadata(v: RemoteMetadata | null) {
    authoritySession.remoteMetadata = v;
  }
  private _metadataPromise: Promise<RemoteMetadata> | null = null;
  private get _suppAuthorized(): boolean {
    return authoritySession.suppAuthorized;
  }
  private set _suppAuthorized(v: boolean) {
    authoritySession.suppAuthorized = v;
  }
  private get _authAuthorized(): boolean {
    return authoritySession.authAuthorized;
  }
  private set _authAuthorized(v: boolean) {
    authoritySession.authAuthorized = v;
  }
  private _cachedChannelId: string | null = null;

  // v2 mints the code here via pair_oauth_finish rather than in Firefox, so the
  // authority needs the supplicant's OAuth params and its own channel send.
  private get _supplicantOAuth(): SupplicantOAuthRequest | null {
    return authoritySession.supplicantOAuth;
  }
  private set _supplicantOAuth(v: SupplicantOAuthRequest | null) {
    authoritySession.supplicantOAuth = v;
  }
  private get _completing(): boolean {
    return authoritySession.completing;
  }
  private set _completing(v: boolean) {
    authoritySession.completing = v;
  }

  public get onSuppComplete(): (() => void) | null {
    return authoritySession.onSuppComplete;
  }
  public set onSuppComplete(v: (() => void) | null) {
    authoritySession.onSuppComplete = v;
  }
  public get onSuppAuthorized(): (() => void) | null {
    return authoritySession.onSuppAuthorized;
  }
  public set onSuppAuthorized(v: (() => void) | null) {
    authoritySession.onSuppAuthorized = v;
  }
  public onHeartbeatError: ((err: unknown) => void) | null = null;
  public get onError(): ((error: unknown) => void) | null {
    return authoritySession.onError;
  }
  public set onError(v: ((error: unknown) => void) | null) {
    authoritySession.onError = v;
  }
  public get onStateChange(): ((state: AuthorityState) => void) | null {
    return authoritySession.onStateChange;
  }
  public set onStateChange(v: ((state: AuthorityState) => void) | null) {
    authoritySession.onStateChange = v;
  }

  constructor(
    data: ModelDataStore,
    private readonly channelData: ModelDataStore,
    protected readonly storageData: ModelDataStore,
    public readonly opts: OAuthIntegrationOptions
  ) {
    super(data, storageData, opts, IntegrationType.PairingAuthority);
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
    return (
      `${window.location.origin}/pair` +
      `#channel_id=${this._channel.channelId}` +
      `&channel_key=${this._channel.channelKey}` +
      `&v=${v}`
    );
  }

  async createChannel(): Promise<void> {
    if (this._channel) {
      console.warn('Pairing channel already exists!')
      return;
    }

    const channel = new PairingChannelClient();
    this._channel = channel;

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
    channel.addEventListener(
      'remote:pair:supp:complete',
      this.handleSuppComplete
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
    // A close during completion is the supplicant finishing, not an abort.
    if (this._completing) {
      return;
    }
    this.fail({
      errno: 1006,
      message: 'Connection to remote device closed, please try again',
    });
  };

  private handleChannelError = (event: Event) => {
    this.fail((event as CustomEvent).detail);
  };

  private setState(state: AuthorityState): void {
    plog('auth state ->', state);
    this._state = state;
    this.onStateChange?.(state);
  }

  private fail(err: unknown): void {
    plog('auth fail', (err as { message?: string })?.message ?? String(err));
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
    plog('auth channel connected');
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
    plog('auth recv <- pair:supp:request');
    const data = (event as CustomEvent).detail as PairingChannelIncomingMessage;
    if (data?.remoteMetaData) {
      this._remoteMetadata = toRemoteMetadata(data.remoteMetaData);
    }
    // pair_oauth_finish needs these to mint a code bound to the supplicant's
    // own PKCE verifier and keys_jwk.
    const req = data as unknown as Partial<SupplicantOAuthRequest>;
    if (req?.client_id && req?.state) {
      this._supplicantOAuth = {
        client_id: req.client_id,
        state: req.state,
        scope: req.scope ?? '',
        code_challenge: req.code_challenge ?? '',
        code_challenge_method: req.code_challenge_method,
        keys_jwk: req.keys_jwk ?? '',
      };
    }
    this.setState(AuthorityState.WaitingForAuthorizations);
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
  /** v2: the supplicant finished its OAuth exchange and is signed in. */
  private handleSuppComplete = () => {
    this._completing = true;
    this.onSuppComplete?.();
  };

  private handleSuppAuthorize = () => {
    if (!this._suppAuthorized) {
      this._suppAuthorized = true;
      this.onSuppAuthorized?.();
    }

    // The authority already approved and was waiting on this.
    if (authoritySession.pendingGrant) {
      this.grantOAuthCode().catch((err) => Sentry.captureException(err));
    }

    if (this._state === AuthorityState.WaitingForAuthorizations) {
      // Supplicant approved first — the authority user has yet to act.
      this.setState(AuthorityState.WaitingForAuthority);
    } else if (this._state === AuthorityState.WaitingForSupplicant) {
      // Authority already approved. Handshake complete.
      this.setState(AuthorityState.Complete);
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
    await firefox.pairAuthorize(this.channelId);

    if (this._state === AuthorityState.WaitingForAuthorizations) {
      this.setState(AuthorityState.WaitingForSupplicant);
    } else if (this._state === AuthorityState.WaitingForAuthority) {
      this.setState(AuthorityState.Complete);
    }
  }

  /** The OAuth params the supplicant sent, needed by pair_oauth_finish. */
  get supplicantOAuth(): SupplicantOAuthRequest | null {
    return this._supplicantOAuth;
  }

  /**
   * v2 authority approval. Where `authorize()` hands the channel work to
   * Firefox via `fxaccounts:pair_authorize`, v2 mints the code here through
   * `pair_oauth_finish` and relays it over the channel FxA owns.
   *
   * Returns false when there is nothing to authorize, so the caller can stay on
   * the approval screen rather than navigate into a dead flow.
   */
  async authorizeV2(): Promise<boolean> {
    const req = this._supplicantOAuth;
    if (!req || !this._channel) {
      return false;
    }
    this._authAuthorized = true;

    // The supplicant only listens for `pair:auth:authorize` once its user taps
    // Connect, so sending before then is lost. Approving first is normal:
    // defer the grant until `pair:supp:authorize` arrives.
    if (!this._suppAuthorized) {
      plog('auth approved first; waiting for the supplicant');
      authoritySession.pendingGrant = true;
      this.setState(AuthorityState.WaitingForSupplicant);
      return true;
    }
    return this.grantOAuthCode();
  }

  /**
   * Reply to `pair:supp:request` with the details the supplicant shows on its
   * confirmation card. It waits for this before advancing, so omitting it
   * stalls the handshake with both sides connected.
   *
   * A page passes them in: the supplicant is not signed in, so these are the
   * authority's own account fields.
   */
  async sendAuthorityMetadata(meta: {
    email?: string;
    displayName?: string;
    avatar?: string;
  }): Promise<void> {
    if (!this._channel) {
      return;
    }
    plog('auth send -> pair:auth:metadata');
    await this._channel.send('pair:auth:metadata', {
      email: meta.email,
      displayName: meta.displayName,
      avatar: meta.avatar,
      deviceName: undefined,
    });
  }

  /** Mint the code and relay it over the channel. */
  private async grantOAuthCode(): Promise<boolean> {
    const req = this._supplicantOAuth;
    if (!req || !this._channel) {
      return false;
    }
    authoritySession.pendingGrant = false;
    const finished = await firefox.pairOauthFinish({
      client_id: req.client_id,
      state: req.state,
      scope: req.scope,
      code_challenge: req.code_challenge,
      code_challenge_method: req.code_challenge_method,
      keys_jwk: req.keys_jwk,
    });
    if (!finished) {
      plog('auth pair_oauth_finish returned nothing');
      return false;
    }
    plog('auth send -> pair:auth:authorize');
    await this._channel.send('pair:auth:authorize', {
      code: finished.code,
      state: finished.state,
    });
    return true;
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
    this.onSuppComplete = null;
    this.onHeartbeatError = null;

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
        'remote:pair:supp:complete',
        this.handleSuppComplete
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
