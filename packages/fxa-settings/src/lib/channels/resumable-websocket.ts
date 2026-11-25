/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * WebSocket stand-in for the pairing channel. A backgrounded mobile browser can
 * kill the socket mid-pairing. This reconnects with the resume token from the
 * channel server's latest greeting, so the TLS session above it carries on
 * unaware. The server issues a new token with each resume.
 * A server that sends no token gets plain WebSocket behaviour.
 */

// Under the channel server's 60 s resume window, so a late retry is not refused.
export const RESUME_WINDOW_MS = 50_000;
export const RESUME_RETRY_MS = 2_000;
export const RESUME_PROTOCOL_PREFIX = 'resume.';
// The channel server closes with this code when it ends a channel on purpose.
export const CHANNEL_CLOSED_CODE = 4000;
// The channel server sends this every 5 s to a client that asks for it.
export const KEEPALIVE = '{"keepalive":true}';
// Three missed keepalives. The server gives up on a silent client at 15 s too.
export const KEEPALIVE_TIMEOUT_MS = 15_000;

export type CloseReason =
  | 'server_closed'
  | 'self_closed'
  | 'no_token'
  | 'resume_expired';

const OPEN = 1;
const CLOSED = 3;

export class ResumableWebSocket extends EventTarget {
  private socket: WebSocket;
  private readonly url: URL;
  private channelId?: string;
  private token?: string;
  // Everything handed to send(), in order. A pairing is under a dozen messages.
  private outbox: string[] = [];
  // How many of them were written to a socket, delivered or not.
  private written = 0;
  private resumeDeadline = 0;
  private retryTimer?: ReturnType<typeof setTimeout>;
  private selfClosed = false;
  private done = false;
  private attempts = 0;
  private _closeReason?: CloseReason;
  private keepaliveSeen = false;
  private watchdog?: ReturnType<typeof setTimeout>;
  /**
   * A socket that went silent without closing, kept open while a resume is
   * tried. It is not closed until the resume succeeds: a close frame on a
   * connection that was only slow would end this client's place for good.
   */
  private suspect?: WebSocket;

  constructor(
    url: string,
    private readonly Native: typeof WebSocket
  ) {
    super();
    this.url = new URL(url);
    // Asks the channel server to hold this client after a drop. Older servers ignore it.
    const first = new URL(url);
    first.searchParams.set('resume', '1');
    first.searchParams.set('keepalive', '1');
    this.socket = this.attach(new Native(first.href), false);
  }

  private get resuming(): boolean {
    return this.resumeDeadline > 0;
  }

  get closeReason(): CloseReason | undefined {
    return this._closeReason;
  }

  get readyState(): number {
    if (this.done) return CLOSED;
    return this.resuming ? OPEN : this.socket.readyState;
  }

  get bufferedAmount(): number {
    return this.resuming ? 0 : this.socket.bufferedAmount;
  }

  send(data: string): void {
    this.outbox.push(data);
    if (this.resuming || this.socket.readyState !== OPEN) {
      return;
    }
    this.socket.send(data);
    this.written = this.outbox.length;
  }

  close(): void {
    if (this.done) return;
    this.selfClosed = true;
    // Between attempts the socket is already closed and fires no event.
    if (this.resuming) this.finish('self_closed');
    this.socket.close();
  }

  private attach(socket: WebSocket, resumed: boolean): WebSocket {
    let greeted = false;
    let received: unknown;
    socket.addEventListener('open', () => {
      if (!resumed) this.dispatchEvent(new Event('open'));
    });
    socket.addEventListener('message', (event: MessageEvent) => {
      if (socket === this.suspect) this.recover();
      if (socket === this.socket) this.armWatchdog();
      if (event.data === KEEPALIVE) {
        this.keepaliveSeen = true;
        this.armWatchdog();
        return;
      }
      if (!greeted) {
        greeted = true;
        try {
          const { channelid, resume, received: count } = JSON.parse(event.data);
          received = count;
          if (typeof channelid === 'string') this.channelId = channelid;
          if (typeof resume === 'string') this.token = resume;
        } catch {
          // Not a greeting; pass it through below.
        }
        if (resumed) {
          this.onResumed(received);
          return;
        }
      }
      this.dispatchEvent(new MessageEvent('message', { data: event.data }));
    });
    socket.addEventListener('close', (event: CloseEvent) =>
      this.onClose(socket, event.code)
    );
    return socket;
  }

  private onClose(socket: WebSocket, code: number): void {
    if (socket === this.suspect) this.suspect = undefined;
    if (socket !== this.socket || this.done) return;
    if (this.selfClosed) {
      this.finish('self_closed');
      return;
    }
    if (code === CHANNEL_CLOSED_CODE) {
      this.finish('server_closed');
      return;
    }
    if (!this.token || !this.channelId) {
      this.finish('no_token');
      return;
    }
    if (!this.resuming) {
      this.startResuming();
      return;
    }
    this.retryTimer = setTimeout(() => this.tryResume(), RESUME_RETRY_MS);
  }

  private startResuming(): void {
    this.resumeDeadline = Date.now() + RESUME_WINDOW_MS;
    this.attempts = 0;
    document.addEventListener('visibilitychange', this.onVisible);
    this.tryResume();
  }

  private armWatchdog(): void {
    clearTimeout(this.watchdog);
    if (!this.keepaliveSeen || this.done) return;
    this.watchdog = setTimeout(() => this.onSilent(), KEEPALIVE_TIMEOUT_MS);
  }

  /** No traffic for three keepalives: the connection is dead but never closed. */
  private onSilent(): void {
    if (this.done || this.resuming || !this.token || !this.channelId) return;
    // Timers and message delivery are throttled in a hidden page, so silence
    // there says nothing about the connection.
    if (document.visibilityState !== 'visible') {
      this.armWatchdog();
      return;
    }
    this.suspect = this.socket;
    this.startResuming();
  }

  /** The suspect socket spoke before a resume went through, so it was only slow. */
  private recover(): void {
    const attempt = this.socket;
    this.socket = this.suspect as WebSocket;
    this.suspect = undefined;
    this.stopResuming();
    if (attempt.readyState !== CLOSED) attempt.close();
    this.outbox.slice(this.written).forEach((data) => this.socket.send(data));
    this.written = this.outbox.length;
  }

  // The browser may refuse network while hidden; retry as soon as it is back.
  private onVisible = (): void => {
    if (document.visibilityState !== 'visible' || !this.resuming) return;
    // The server may have accepted a connecting attempt and rotated the token.
    if (this.socket.readyState !== CLOSED) return;
    clearTimeout(this.retryTimer);
    this.tryResume();
  };

  private tryResume(): void {
    if (Date.now() > this.resumeDeadline) {
      this.finish('resume_expired');
      return;
    }
    this.attempts++;
    const url = new URL(`/v1/ws/${this.channelId}?keepalive=1`, this.url);
    const previous = this.socket;
    // The token goes in the subprotocol, not the URL, which proxies tend to log.
    this.socket = this.attach(
      new this.Native(url.href, [`${RESUME_PROTOCOL_PREFIX}${this.token}`]),
      true
    );
    if (previous !== this.suspect && previous.readyState !== CLOSED) {
      previous.close();
    }
  }

  /**
   * A write to a socket that had already died is lost without an error, so the
   * server says how many messages reached it and the rest go out again. A
   * server that does not say gets only what was never written.
   */
  private onResumed(received: unknown): void {
    this.stopResuming();
    this.dropSuspect();
    this.armWatchdog();
    const from =
      typeof received === 'number'
        ? Math.min(received, this.written)
        : this.written;
    this.outbox.slice(from).forEach((data) => this.socket.send(data));
    this.written = this.outbox.length;
    this.dispatchEvent(
      new CustomEvent('resumed', { detail: { attempts: this.attempts } })
    );
  }

  private stopResuming(): void {
    this.resumeDeadline = 0;
    clearTimeout(this.retryTimer);
    document.removeEventListener('visibilitychange', this.onVisible);
  }

  private dropSuspect(): void {
    const suspect = this.suspect;
    this.suspect = undefined;
    if (suspect && suspect.readyState !== CLOSED) suspect.close();
  }

  private finish(reason: CloseReason): void {
    this.stopResuming();
    this.dropSuspect();
    clearTimeout(this.watchdog);
    this.done = true;
    this._closeReason = reason;
    this.dispatchEvent(new Event('close'));
  }
}
