/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * PairingChannel — TypeScript wrapper around the fxa-pairing-channel npm
 * package.  Handles PSK-encrypted WebSocket communication between the
 * supplicant and the channel server (which relays messages to/from the
 * authority).
 *
 * Ported from: fxa-content-server/app/scripts/lib/pairing-channel-client.js
 */

import sentryMetrics from 'fxa-shared/sentry/browser';
import { RemoteMetadata } from '../types';
import UAParser from 'ua-parser-js';
import { toGenericOSName } from '../utilities';
import { base64urlToBytes, bytesToBase64url } from '../base64url';

// Types

export type PairingChannelMessage = {
  message: string;
  data?: Record<string, unknown>;
};

export type PairingChannelRemoteMetadata = {
  city?: string;
  country?: string;
  region?: string;
  ua?: string;
  ipAddress?: string;
};

/**
 * Derive the device details shown to the user from the channel server's
 * `sender` envelope. Shared by both sides of the flow: the supplicant reads it
 * off `pair:auth:metadata`, the authority off `pair:supp:request`.
 */
export function toRemoteMetadata(
  remote: PairingChannelRemoteMetadata,
  deviceName?: string
): RemoteMetadata {
  const parser = new UAParser(remote.ua || '');
  const browser = parser.getBrowser();
  const os = parser.getOS();

  return {
    city: remote.city,
    country: remote.country,
    region: remote.region,
    ipAddress: remote.ipAddress || '',
    deviceFamily: browser.name || 'Unknown',
    deviceOS: toGenericOSName(os.name || ''),
    deviceName: deviceName || browser.name || 'Unknown',
  };
}

export type PairingChannelIncomingMessage = {
  remoteMetaData: PairingChannelRemoteMetadata;
  deviceName?: string;
  email?: string;
  code?: string;
  state?: string;
};

// Error definitions matching Backbone's pairing-channel-client-errors
export const PairingChannelErrors = {
  UNEXPECTED_ERROR: { errno: 999, message: 'Unexpected error' },
  INVALID_CONFIGURATION: {
    errno: 1000,
    message: 'Invalid channel server configuration',
  },
  ALREADY_CONNECTED: {
    errno: 1001,
    message: 'Already connected to channel server',
  },
  NOT_CONNECTED: {
    errno: 1002,
    message: 'Not connected to channel server',
  },
  INVALID_MESSAGE: {
    errno: 1003,
    message: 'Invalid message from the remote device',
  },
  INVALID_OUTBOUND_MESSAGE: {
    errno: 1004,
    message: 'Sending a malformed message',
  },
  CHANNEL_ID_MISMATCH: {
    errno: 1005,
    message: 'Error pairing to remote device',
  },
  CONNECTION_CLOSED: {
    errno: 1006,
    message: 'Connection to remote device closed, please try again',
  },
} as const;

export type PairingChannelErrorType = keyof typeof PairingChannelErrors;

export class PairingChannelError extends Error {
  readonly errno: number;
  constructor(type: PairingChannelErrorType) {
    const def = PairingChannelErrors[type];
    super(def.message);
    this.name = 'PairingChannelError';
    this.errno = def.errno;
  }
}

/**
 * EventTarget-based client that wraps fxa-pairing-channel for PSK-encrypted
 * WebSocket communication with the channel server.
 *
 * Events emitted:
 *  - `connected`                   — WebSocket open
 *  - `close`                       — WebSocket closed
 *  - `error`                       — error (detail: PairingChannelError)
 *  - `remote:<message_name>`       — incoming message from remote peer
 *                                    (detail: PairingChannelIncomingMessage)
 */
type PairingChannelSocket = {
  send(data: unknown): Promise<void>;
  close(): Promise<void>;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
  _channelId?: string;
  _channelKey?: Uint8Array;
};

export class PairingChannelClient extends EventTarget {
  private channel: PairingChannelSocket | null = null;
  private _opening = false;

  get channelKey() {
    if (this.channel?._channelKey) {
      return bytesToBase64url(this.channel._channelKey);
    }
    return null;
  }

  get channelId() {
    if (this.channel?._channelId) {
      return this.channel._channelId;
    }
    return null;
  }

  /**
   * Creates a new pairing channel. Once opened, a channelId and channelKey
   * should be populated on this instance.
   *
   * @param channelServerUri The channel server to connect to.
   */
  async create(channelServerUri: string): Promise<void> {
    if (this.channel || this._opening) {
      throw new PairingChannelError('ALREADY_CONNECTED');
    }

    if (!channelServerUri) {
      throw new PairingChannelError('INVALID_CONFIGURATION');
    }

    this._opening = true;
    try {
      const { PairingChannel } = await import(
        /* webpackChunkName: "fxaPairingChannel" */
        'fxa-pairing-channel/dist/FxAccountsPairingChannel.babel.umd.js'
      );
      const channel = await PairingChannel.create(channelServerUri);
      this.channel = channel;

      // Listeners go on before `connected` so a message that arrives in the
      // same tick as the handshake completing is not dropped.
      channel.addEventListener('message', this.handleMessage);
      channel.addEventListener('error', this.handleError);
      channel.addEventListener('close', this.handleClose);

      this.dispatchEvent(new CustomEvent('connected'));
    } catch (err) {
      sentryMetrics.captureException(err);
      this.dispatchEvent(new CustomEvent('error', { detail: err }));
      // Rethrow so the caller can tell a failed create from a successful one.
      // Without this the authority resolves as if it had a channel and encodes
      // `channel_id=null` into a QR code the supplicant cannot join.
      throw err;
    } finally {
      this._opening = false;
    }
  }

  /**
   * Opens an existing pairing channel connection
   * @param channelServerUri Channel server to connect to
   * @param channelId Id of channel to open
   * @param channelKey Key for channel
   */
  async open(
    channelServerUri: string,
    channelId: string,
    channelKey: string
  ): Promise<void> {
    if (this.channel || this._opening) {
      throw new PairingChannelError('ALREADY_CONNECTED');
    }

    if (!channelServerUri || !channelId || !channelKey) {
      throw new PairingChannelError('INVALID_CONFIGURATION');
    }

    this._opening = true;
    try {
      const psk = base64urlToBytes(channelKey);

      // Dynamic import — fxa-pairing-channel UMD bundle exposes PairingChannel.connect()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — no types for this legacy UMD package
      const FxAccountsPairingChannel = await import(
        /* webpackChunkName: "fxaPairingChannel" */
        'fxa-pairing-channel/dist/FxAccountsPairingChannel.babel.umd.js'
      );

      const channel = await FxAccountsPairingChannel.PairingChannel.connect(
        channelServerUri,
        channelId,
        psk
      );

      this.channel = channel;
      this.dispatchEvent(new CustomEvent('connected'));

      channel.addEventListener('message', this.handleMessage);
      channel.addEventListener('error', this.handleError);
      channel.addEventListener('close', this.handleClose);
    } catch (err) {
      sentryMetrics.captureException(err);
      this.dispatchEvent(new CustomEvent('error', { detail: err }));
    } finally {
      this._opening = false;
    }
  }

  async send(
    message: string,
    data: Record<string, unknown> = {}
  ): Promise<void> {
    if (!this.channel) {
      throw new PairingChannelError('NOT_CONNECTED');
    }
    if (!message) {
      throw new PairingChannelError('INVALID_OUTBOUND_MESSAGE');
    }
    await this.channel.send({ message, data });
  }

  async close(): Promise<void> {
    if (!this.channel) {
      return; // Already closed or never opened
    }
    const ch = this.channel;
    this.channel = null;
    this.removeChannelListeners(ch);
    try {
      await ch.close();
    } catch (err) {
      sentryMetrics.captureException(err);
    }
  }

  get isConnected(): boolean {
    return this.channel !== null;
  }

  private handleMessage = (event: Event) => {
    try {
      const detail = (event as CustomEvent).detail;
      if (!detail) {
        throw new PairingChannelError('INVALID_MESSAGE');
      }
      const { data: payload, sender } = detail;

      if (!payload || typeof payload.message !== 'string') {
        throw new PairingChannelError('INVALID_MESSAGE');
      }

      // Validate sender metadata exists (matches Backbone's PAIRING_MESSAGE_SENDER_SCHEMA)
      if (!sender || typeof sender !== 'object') {
        throw new PairingChannelError('INVALID_MESSAGE');
      }

      const { data = {}, message } = payload;

      // Enrich with sender metadata (same shape as Backbone)
      data.remoteMetaData = {
        city: sender?.city,
        country: sender?.country,
        region: sender?.region,
        ua: sender?.ua,
        ipAddress: sender?.remote,
      };

      this.dispatchEvent(
        new CustomEvent(`remote:${message}`, { detail: data })
      );
    } catch (err) {
      sentryMetrics.captureException(err);
      this.dispatchEvent(new CustomEvent('error', { detail: err }));
    }
  };

  private handleError = (event: Event) => {
    sentryMetrics.captureException((event as CustomEvent).detail);
    this.dispatchEvent(
      new CustomEvent('error', {
        detail: new PairingChannelError('UNEXPECTED_ERROR'),
      })
    );
  };

  private handleClose = () => {
    if (this.channel) {
      const ch = this.channel;
      this.channel = null;
      this.removeChannelListeners(ch);
    }
    this.dispatchEvent(new CustomEvent('close'));
  };

  private removeChannelListeners(ch: PairingChannelSocket): void {
    ch.removeEventListener('message', this.handleMessage);
    ch.removeEventListener('error', this.handleError);
    ch.removeEventListener('close', this.handleClose);
  }
}
