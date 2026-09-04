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
  toRemoteMetadata,
} from '../../lib/channels/pairing-channel';
import { firefox } from '../../lib/channels/firefox';
import { RemoteMetadata } from '../../lib/types';
import config from '../../lib/config';
import { detectDevice, Devices } from '../../lib/utilities';
import { OAuthNativeClients } from '@fxa/accounts/oauth';

/** Redirect URI used by OAuth WebChannel reliers (matches Backbone Constants.OAUTH_WEBCHANNEL_REDIRECT) */
const OAUTH_WEBCHANNEL_REDIRECT =
  'urn:ietf:wg:oauth:2.0:oob:oauth-redirect-webchannel';

/** FXA-13616: marks a channel consumed so a post-OAuth webview reload can short-circuit. */
export const PAIR_COMPLETE_STORAGE_PREFIX = 'fxa.pair.complete.';

/** Read the channel-complete marker, tolerating an unavailable sessionStorage. */
export function isChannelComplete(channelId: string): boolean {
  try {
    return (
      sessionStorage.getItem(PAIR_COMPLETE_STORAGE_PREFIX + channelId) === '1'
    );
  } catch {
    return false;
  }
}

export function clearChannelComplete(channelId: string): void {
  try {
    sessionStorage.removeItem(PAIR_COMPLETE_STORAGE_PREFIX + channelId);
  } catch {
    // sessionStorage may be unavailable (private mode, quota, SSR).
  }
}

function setChannelComplete(channelId: string): void {
  try {
    sessionStorage.setItem(PAIR_COMPLETE_STORAGE_PREFIX + channelId, '1');
  } catch {
    // sessionStorage may be unavailable (private mode, quota, SSR).
  }
}

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

export type OAuthStartParams = {
  access_type: string;
  client_id: string;
  code_challenge: string;
  code_challenge_method: string;
  keys_jwk: string;
  scope: string;
  state: string;
};

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
  private _channelId: string | null = null;
  private _version: number | null = null;
  private _iid: string | null = null;
  /**
   * The `state` this supplicant asked for, remembered so the authority's
   * `pair:auth:authorize` can be checked against it. In v2 the value comes from
   * `firefox.pairOauthStart` rather than the URL, so `this.data.state` is empty
   * and the round-trip check would otherwise pass for anything.
   */
  private _requestedState: string | null = null;

  public onStateChange: ((state: SupplicantState) => void) | null = null;
  public onError: ((error: unknown) => void) | null = null;

  constructor(
    data: ModelDataStore,
    protected readonly storageData: ModelDataStore,
    public readonly opts: OAuthIntegrationOptions
  ) {
    super(data, storageData, opts, IntegrationType.PairingSupplicant);
    this._iid = crypto.randomUUID();
  }

  /**
   * Signals that the integration supports pairing. Which in this case will always be true.
   */
  isPairing(): boolean {
    return true;
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
    if (allowedClients.length === 0) {
      return true;
    }
    return allowedClients.includes(clientId);
  }

  getServiceName(): string {
    // TBD: At somepoint we will need to encode the service in the pair url?
    return 'sync';
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

  private static readonly TERMINAL_STATES = new Set([
    SupplicantState.Complete,
    SupplicantState.SendingResult,
    SupplicantState.Failed,
  ]);

  private setState(state: SupplicantState): void {
    this._state = state;
    console.info(`Emitting pairing supplicant state change event.`, {id: this._iid, state: this.state});
    this.onStateChange?.(state);
  }

  /** Normalize any thrown value into the structured error type we store. */
  private normalizeError(
    err: unknown
  ): Error | { errno: number; message: string } {
    if (err instanceof Error) {
      return err;
    }
    if (
      typeof err === 'object' &&
      err !== null &&
      'errno' in err &&
      'message' in err
    ) {
      return err as { errno: number; message: string };
    }
    return new Error(String(err));
  }

  private fail(err: unknown): void {
    if (PairingSupplicantIntegration.TERMINAL_STATES.has(this._state)) {
      return;
    }
    this._error = this.normalizeError(err);
    this.setState(SupplicantState.Failed);
    this.onError?.(this._error);
  }

  hasChannel(channelId:string) {
    return !!this._channel && this._channel.channelId === channelId;
  }

  /**
   * Open the WebSocket channel and start the supplicant flow.
   * Called once when the Supp page mounts.
   */
  async openChannel(
    channelServerUri: string,
    channelId: string,
    channelKey: string,
    version:number = 1
  ): Promise<void> {

    if (version === 2 && this._channel) {
      if (channelId === this._channel.channelId) {
        console.warn('Pairing channel already open!');
        return; // already open
      } else {
        console.warn('Different pairing channel already open!');
        this._channel.close();
      }
    }

    if (this._channel) {
      console.warn('Pairing channel already open!');
      return; // already open
    }

    this._channelId = channelId;
    this._version = version;
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
      // Reset _channel so a subsequent openChannel() call can retry
      this._channel = null;
      this.fail(err);
    }
  }

  /** Supplicant user approved the pairing. */
  async supplicantApprove(): Promise<void> {
    if (!this._channel) {
      throw new Error('Missing channel!');
    }

    try {
      await this._channel.send('pair:supp:authorize', {});
    } catch (err: unknown) {
      this.fail(err);
      throw err;
    }

    // In V2, the the UI flow forces the supplicant to approve first.
    if (this._version === 2) {
      this.setState(SupplicantState.WaitingForAuthority);
    }
    else {
      if (this._state === SupplicantState.WaitingForAuthorizations) {
        this.setState(SupplicantState.WaitingForAuthority);
      } else if (this._state === SupplicantState.WaitingForSupplicant) {
        this.sendResultToRelier();
      }
    }
  }

  private handleConnected = () => {
    this.setState(SupplicantState.WaitingForMetadata);

    // Callback to the browser and get the oauth parameters
    (async () => {
      const oauthParams = await this.getOAuthParams();

      // Send OAuth request to authority
      if (!this._channel) {
        throw new Error('Channel no longe exists!')
      }
      await this._channel
        .send('pair:supp:request', oauthParams);

    })().catch((err: unknown) => {
      this.fail(err);
    });
  };

  private handleAuthMetadata = (event: Event) => {
    const data = (event as CustomEvent).detail as PairingChannelIncomingMessage;

    // The authority sends deviceName and email at top level of the message
    this._deviceName = data.deviceName || '';
    this._email = data.email || '';

    if (data.remoteMetaData) {
      this._remoteMetadata = toRemoteMetadata(
        data.remoteMetaData,
        data.deviceName
      );
    }

    this.setState(SupplicantState.WaitingForAuthorizations);
  };

  private handleAuthAuthorize = (event: Event) => {
    const data = (event as CustomEvent).detail;

    // Validate authority response matches Backbone's validateApprovalData():
    // code must be exactly 64 hex characters; state must match original.
    if (!data?.code || !/^[a-fA-F0-9]{64}$/.test(data.code)) {
      this.fail(
        new Error('Authority approved without providing a valid OAuth code')
      );
      return;
    }

    // v1 reads it from the URL, v2 from `pairOauthStart`, so prefer what we
    // actually sent. Nothing to compare against means we never sent a request,
    // which makes this authorize unsolicited.
    const expectedState = this._requestedState ?? this.data.state;
    if (!expectedState) {
      this.fail(
        new Error('Cannot verify OAuth state: no request state recorded')
      );
      return;
    }
    if (data.state !== expectedState) {
      this.fail(new Error('OAuth state mismatch'));
      return;
    }
    this._oauthCode = data.code;

    // In V2, the authority always approves last, so we can just finish
    // the process here.
    if (this._version === 2) {
      firefox.fxaOAuthLogin({
        code: data.code,
        state: data.state,
        redirect: OAUTH_WEBCHANNEL_REDIRECT,
        action: 'pairing',
      });
      if (this._channel?.channelId) {
        setChannelComplete(this._channel.channelId);
      }
      this.setState(SupplicantState.Complete);
    } else {
      if (this._state === SupplicantState.WaitingForAuthorizations) {
        // Authority approved first — wait for supplicant user
        this.setState(SupplicantState.WaitingForSupplicant);
      } else if (this._state === SupplicantState.WaitingForAuthority) {
        // Supplicant already approved — send result
        this.sendResultToRelier();
      }
    }
  };

  /** True when a close/error during connect is the FXA-13616 reload, not a real failure. */
  private isPostCompletionReconnect(): boolean {
    return (
      this._state === SupplicantState.Connecting &&
      this._channelId !== null &&
      isChannelComplete(this._channelId)
    );
  }

  checkClientInfo () {
    // no-op. The supplicant doesn't have client info.
  }

  getClientId(): string | undefined {
    let clientId = super.getClientId();

    // BAND-AIDE! We should get from the URL, or fxa status! Unfortunately
    // there are situations like pairing where it's not in the URL and
    // fxa status is also missing the value.
    if (!clientId) {
      const deviceType = detectDevice();
      if (deviceType === Devices.FIREFOX_ANDROID) {
        clientId = OAuthNativeClients.Fenix;
      }
      if (deviceType === Devices.FIREFOX_IOS) {
        clientId = OAuthNativeClients.FirefoxIOS;
      }
      if (deviceType === Devices.FIREFOX_DESKTOP) {
        clientId = OAuthNativeClients.FirefoxDesktop;
      }
    }

    if (!clientId) {
      console.warn("Could not resolve a valid clientId!")
    }

    return clientId;
  }

  private handleClose = () => {
    console.warn('Channel close event');
    if (this.isPostCompletionReconnect()) {
      return;
    }
    this.fail({
      errno: 1006,
      message: 'Connection to remote device closed, please try again',
    });
  };

  private handleChannelError = (event: Event) => {

    console.warn('Channel error event', event)

    if (this.isPostCompletionReconnect()) {
      return;
    }
    this.fail((event as CustomEvent).detail);
  };

  // TODO: Remove after v1 is deprecated
  private sendResultToRelier(): void {
    this.setState(SupplicantState.SendingResult);

    // Send fxaccounts:oauth_login via WebChannel so the embedding browser
    // (iOS WKWebView or Desktop Firefox) can complete the OAuth flow.
    // Matches Backbone's supplicant-webchannel.js sendCodeToRelier() which
    // calls sendOAuthResultToRelier() in oauth-webchannel-v1.js.
    if (this._oauthCode) {
      firefox.fxaOAuthLogin({
        code: this._oauthCode,
        state: this.data.state || '',
        redirect: OAUTH_WEBCHANNEL_REDIRECT,
        action: 'pairing',
      });
    }

    if (this._channelId) {
      setChannelComplete(this._channelId);
    }

    this.setState(SupplicantState.Complete);
  }

  private hasUrlOAuthParams(): boolean {
    return !!(
      this.data.clientId &&
      this.data.codeChallenge &&
      this.data.codeChallengeMethod &&
      this.data.keysJwk &&
      this.data.state &&
      this.data.scope
    );
  }

  /**
   * Build the OAuth params to send to the authority, either from the URL or,
   * in v2, from the browser.
   * Matches Backbone's SupplicantRelier.getOAuthParams() with Vat validation.
   *
   * Required fields (client_id, code_challenge, code_challenge_method,
   * keys_jwk, scope, state) throw on missing values to match Backbone's
   * Vat.*.required() validators.
   */
  private async getOAuthParams(): Promise<OAuthStartParams> {
    // A supplicant whose own app scanned the QR is opened by app-services,
    // which has already run OAuth start and put the params in the URL. Asking
    // the browser again there would begin a second flow and strand the PKCE
    // verifier the app is holding for the code it expects back.
    if (this._version === 2 && !this.hasUrlOAuthParams()) {
      const data = await firefox.pairOauthStart({});
      if (!data) {
        throw new Error('Firefox could not provide oauth params.')
      }

      // This following client id check is a bandaide for now, so we at least
      // have a client id... We fail fast here if we can't figure anything
      // out, since there's not point in proceeding.
      const client_id = this.data.clientId || this.getClientId();
      if (!client_id) {
        console.warn('Could not determine clientId!')
        throw new Error("Could not determine clientId! Cannot proceed.")
      }

      const scope = [
        ...new Set(data?.scope.replace(/\+/g, ' ').trim().split(/\s+/)),
      ].join(' ');

      const result = {
        access_type: this.data.accessType || 'offline',
        client_id,
        code_challenge: data.code_challenge,
        code_challenge_method: data.code_challenge_method,
        keys_jwk: data.keys_jwk,
        scope,
        state: data.state,
      };

      // Fail fast if something wasn't provided.
      const missing = Object.entries(result).filter(([k,v]) => !v && k !== 'client_id').map(([k]) => k);
      if (missing.length) {
        throw new Error(`Missing required OAuth params: ${missing.join(', ')}`);
      }

      this._requestedState = result.state;
      return result;
    }

    const clientId = this.data.clientId;
    const codeChallenge = this.data.codeChallenge;
    const codeChallengeMethod = this.data.codeChallengeMethod;
    const keysJwk = this.data.keysJwk;
    const state = this.data.state;
    const rawScope = this.data.scope;

    if (
      !clientId ||
      !codeChallenge ||
      !codeChallengeMethod ||
      !keysJwk ||
      !state ||
      !rawScope
    ) {
      const missing = Object.entries({
        client_id: clientId,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
        keys_jwk: keysJwk,
        state,
        scope: rawScope,
      })
        .filter(([, v]) => !v)
        .map(([k]) => k);
      throw new Error(`Missing required OAuth params: ${missing.join(', ')}`);
    }

    // Normalize scope: replace '+' with space, split, deduplicate, rejoin.
    // Matches Backbone's scopeStrToArray().join(' ').
    const scope = [
      ...new Set(rawScope.replace(/\+/g, ' ').trim().split(/\s+/)),
    ].join(' ');

    this._requestedState = state;
    return {
      access_type: this.data.accessType || 'offline',
      client_id: clientId,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      keys_jwk: keysJwk,
      scope,
      state,
    };
  }

  async destroy(): Promise<void> {
    console.info('Channel destroy')
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
