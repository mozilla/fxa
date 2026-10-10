/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface BatchBufferOptions<T> {
  maxSize: number;
  flushIntervalMs: number;
  onFlush: (items: T[]) => Promise<void>;
  onError: (err: unknown) => void;
}

export class BatchBuffer<T> {
  private items: T[] = [];
  private timer: NodeJS.Timeout | null = null;
  private readonly inFlight = new Set<Promise<void>>();

  constructor(private readonly opts: BatchBufferOptions<T>) {}

  push(item: T): void {
    this.items.push(item);
    if (this.items.length >= this.opts.maxSize) {
      this.cancelTimer();
      this.flush();
    } else if (this.timer === null) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.flush();
      }, this.opts.flushIntervalMs);
    }
  }

  async drain(): Promise<void> {
    this.cancelTimer();
    this.flush();
    await Promise.allSettled(Array.from(this.inFlight));
  }

  private flush(): void {
    if (this.items.length === 0) {
      return;
    }
    const batch = this.items;
    this.items = [];

    const flushPromise: Promise<void> = this.opts
      .onFlush(batch)
      .catch((err: unknown) => {
        this.opts.onError(err);
      })
      .finally(() => {
        this.inFlight.delete(flushPromise);
      });
    this.inFlight.add(flushPromise);
  }

  private cancelTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
