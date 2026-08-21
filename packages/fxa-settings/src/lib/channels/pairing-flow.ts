/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Shared v2 pairing flow state (FXA-12855).
 *
 * The v2 flow spans several routes (scan_qr -> approve_signin -> ...), but the
 * pairing channel is a single live WebSocket that must outlive any one page. A
 * per-page container would close it on navigation. This module-level controller
 * owns the channel and the handshake state so it survives route changes; there
 * is only ever one pairing flow per tab.
 *
 * Reset the controller when the flow ends (success or failure) or when the user
 * leaves the pairing routes, so a stale channel does not leak into a new flow.
 */

import {
  PairingChannelClient,
  PairingChannelRemoteMetadata,
} from './pairing-channel';
import { RemoteMetadata } from '../types';

// Diagnostic pairing log. Visible in Fenix logcat ("Web Content") on the
// supplicant and in the browser console on the authority.
/** Cap the buffer so a long-lived page cannot grow it without bound. */
const PLOG_BUFFER_LIMIT = 200;

export function plog(...args: unknown[]): void {
  // eslint-disable-next-line no-console
  console.log('[pair2]', ...args);
  // Also buffer on `window` so the functional tests can read the trace back out
  // of the Marionette-driven authority, whose console they cannot otherwise see.
  try {
    const w = window as unknown as { __pair2Log?: string[] };
    if (!w.__pair2Log) {
      w.__pair2Log = [];
    }
    w.__pair2Log.push(
      `${args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}`
    );
    if (w.__pair2Log.length > PLOG_BUFFER_LIMIT) {
      w.__pair2Log.shift();
    }
  } catch {
    // Never let logging break the flow.
  }
}

export type SupplicantOAuthRequest = {
  state: string;
  scope: string;
  code_challenge: string;
  // The supplicant sends this; chrome defaults it to S256 when absent.
  code_challenge_method?: string;
  keys_jwk?: string;
  client_id: string;
};

export type AuthorityMetadata = {
  email: string;
  displayName?: string;
  avatar?: string;
  deviceName?: string;
};

/** Map channel sender metadata onto the shape the approval cards render. */
export function toRemoteMetadata(
  m: PairingChannelRemoteMetadata,
  deviceName?: string
): RemoteMetadata {
  const ua = m.ua || '';
  return {
    deviceName,
    // Best-effort until a shared UA parser is wired; the channel only gives a
    // raw UA string. deviceFamily/deviceOS drive DeviceInfoBlock display only.
    deviceFamily: /Android/i.test(ua)
      ? 'Android'
      : /iPhone|iPad|iOS/i.test(ua)
        ? 'iOS'
        : 'Mobile',
    deviceOS: ua,
    ipAddress: m.ipAddress || '',
    city: m.city,
    region: m.region,
    country: m.country,
  };
}

class PairingFlowController {
  private client: PairingChannelClient | null = null;
  private abortWired = false;
  // Set true once a side reaches success, so the channel close that follows a
  // completed flow is not mistaken for an abort.
  completing = false;

  // Authority-held state.
  channelId?: string;
  channelKey?: string;
  supplicantRequest?: SupplicantOAuthRequest;
  remoteMetadata?: RemoteMetadata;

  // Supplicant-held state.
  authorityMetadata?: AuthorityMetadata;
  // What the supplicant's pair_oauth_start produced; kept so the incoming
  // pair:auth:authorize state can be validated and oauth_login can be issued.
  supplicantOAuth?: {
    state: string;
    scope: string;
    code_challenge: string;
    keys_jwk?: string;
  };

  getClient(): PairingChannelClient {
    if (!this.client) {
      this.client = new PairingChannelClient();
    }
    return this.client;
  }

  get isConnected(): boolean {
    return this.client?.isConnected ?? false;
  }

  async joinChannel(
    channelServerUri: string,
    channelId: string,
    channelKey: string
  ): Promise<void> {
    this.channelId = channelId;
    this.channelKey = channelKey;
    await this.getClient().open(channelServerUri, channelId, channelKey);
    plog('channel joined', channelId);
  }

  send(message: string, data: Record<string, unknown> = {}): Promise<void> {
    plog('send ->', message, Object.keys(data));
    return this.getClient()
      .send(message, data)
      .then(
        () => plog('send ok', message),
        (e) => {
          plog('send FAIL', message, String(e));
          throw e;
        }
      );
  }

  /**
   * Wire abort handling once for the flow: an unexpected channel close or error
   * (the peer cancelled, or the connection dropped) invokes `onAbort`, unless we
   * are already completing. Idempotent, so it is safe to call from whichever
   * page mounts first on each side.
   */
  wireAbort(onAbort: () => void): void {
    if (this.abortWired) return;
    this.abortWired = true;
    const client = this.getClient();
    const handler = () => {
      plog('channel close/error; completing=', this.completing);
      if (!this.completing) onAbort();
    };
    client.addEventListener('close', handler);
    client.addEventListener('error', handler);
  }

  /** Subscribe to a channel event; returns an unsubscribe fn. */
  on(type: string, listener: EventListener): () => void {
    const client = this.getClient();
    const wrapped: EventListener = (ev) => {
      plog('recv <-', type);
      listener(ev);
    };
    client.addEventListener(type, wrapped);
    return () => client.removeEventListener(type, wrapped);
  }

  async reset(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    this.abortWired = false;
    this.completing = false;
    this.channelId = undefined;
    this.channelKey = undefined;
    this.supplicantRequest = undefined;
    this.remoteMetadata = undefined;
    this.authorityMetadata = undefined;
    this.supplicantOAuth = undefined;
  }
}

export const pairingFlow = new PairingFlowController();
export type { PairingFlowController };
