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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Decode a base64url string to Uint8Array (for PSK). */
function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad =
    base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ---------------------------------------------------------------------------
// PairingChannel client
// ---------------------------------------------------------------------------

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
};

export class PairingChannelClient extends EventTarget {
  private channel: PairingChannelSocket | null = null;
  private _opening = false;

  // -----------------------------------------------------------------------
  // Connect
  // -----------------------------------------------------------------------

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
      const psk = base64urlToUint8Array(channelKey);

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

  // -----------------------------------------------------------------------
  // Send
  // -----------------------------------------------------------------------

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

  // -----------------------------------------------------------------------
  // Close
  // -----------------------------------------------------------------------

  async close(): Promise<void> {
    if (!this.channel) {
      return; // Already closed or never opened
    }
    const ch = this.channel;
    this.channel = null;
    ch.removeEventListener('message', this.handleMessage);
    ch.removeEventListener('error', this.handleError);
    ch.removeEventListener('close', this.handleClose);
    try {
      await ch.close();
    } catch (err) {
      sentryMetrics.captureException(err);
    }
  }

  get isConnected(): boolean {
    return this.channel !== null;
  }

  // -----------------------------------------------------------------------
  // Internal handlers
  // -----------------------------------------------------------------------

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
      ch.removeEventListener('message', this.handleMessage);
      ch.removeEventListener('error', this.handleError);
      ch.removeEventListener('close', this.handleClose);
    }
    this.dispatchEvent(new CustomEvent('close'));
  };
}
