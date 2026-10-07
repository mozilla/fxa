/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * WebSocket stand-in for the pairing channel. A backgrounded mobile browser can
 * kill the socket mid-pairing. This reconnects with the resume token from the
 * channel server's greeting, so the TLS session above it carries on unaware.
 * A server that sends no token gets plain WebSocket behaviour.
 */

// Under the channel server's 60 s resume window, so a late retry is not refused.
export const RESUME_WINDOW_MS = 50_000;
export const RESUME_RETRY_MS = 2_000;

const OPEN = 1;
const CLOSED = 3;

export class ResumableWebSocket extends EventTarget {
  private socket: WebSocket;
  private readonly url: URL;
  private channelId?: string;
  private token?: string;
  private queue: string[] = [];
  private resumeDeadline = 0;
  private retryTimer?: ReturnType<typeof setTimeout>;
  private selfClosed = false;
  private done = false;

  constructor(
    url: string,
    private readonly Native: typeof WebSocket
  ) {
    super();
    this.url = new URL(url);
    this.socket = this.attach(new Native(url), false);
  }

  private get resuming(): boolean {
    return this.resumeDeadline > 0;
  }

  get readyState(): number {
    if (this.done) return CLOSED;
    return this.resuming ? OPEN : this.socket.readyState;
  }

  get bufferedAmount(): number {
    return this.resuming ? 0 : this.socket.bufferedAmount;
  }

  send(data: string): void {
    if (this.resuming || this.socket.readyState !== OPEN) {
      this.queue.push(data);
      return;
    }
    this.socket.send(data);
  }

  close(): void {
    this.selfClosed = true;
    this.socket.close();
  }

  private attach(socket: WebSocket, resumed: boolean): WebSocket {
    let greeted = false;
    socket.addEventListener('open', () => {
      if (!resumed) this.dispatchEvent(new Event('open'));
    });
    socket.addEventListener('message', (event: MessageEvent) => {
      if (!greeted) {
        greeted = true;
        try {
          const { channelid, resume } = JSON.parse(event.data);
          this.channelId = channelid ?? this.channelId;
          this.token = resume ?? this.token;
        } catch {
          // Not a greeting; pass it through below.
        }
        if (resumed) {
          this.onResumed();
          return;
        }
      }
      this.dispatchEvent(new MessageEvent('message', { data: event.data }));
    });
    socket.addEventListener('close', () => this.onClose(socket));
    return socket;
  }

  private onClose(socket: WebSocket): void {
    if (socket !== this.socket || this.done) return;
    if (this.selfClosed || !this.token || !this.channelId) {
      this.finish();
      return;
    }
    if (!this.resuming) {
      this.resumeDeadline = Date.now() + RESUME_WINDOW_MS;
      document.addEventListener('visibilitychange', this.onVisible);
      this.tryResume();
      return;
    }
    this.retryTimer = setTimeout(() => this.tryResume(), RESUME_RETRY_MS);
  }

  // The browser may refuse network while hidden; retry as soon as it is back.
  private onVisible = (): void => {
    if (document.visibilityState !== 'visible' || !this.resuming) return;
    if (this.socket.readyState === OPEN) return;
    clearTimeout(this.retryTimer);
    this.tryResume();
  };

  private tryResume(): void {
    if (Date.now() > this.resumeDeadline) {
      this.finish();
      return;
    }
    const url = new URL(`/v1/ws/${this.channelId}`, this.url);
    url.searchParams.set('resume', this.token as string);
    const previous = this.socket;
    this.socket = this.attach(new this.Native(url.href), true);
    if (previous.readyState !== CLOSED) previous.close();
  }

  private onResumed(): void {
    this.stopResuming();
    const queued = this.queue;
    this.queue = [];
    queued.forEach((data) => this.socket.send(data));
  }

  private stopResuming(): void {
    this.resumeDeadline = 0;
    clearTimeout(this.retryTimer);
    document.removeEventListener('visibilitychange', this.onVisible);
  }

  private finish(): void {
    this.stopResuming();
    this.done = true;
    this.dispatchEvent(new Event('close'));
  }
}
