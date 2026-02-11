/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { setTimeout } from 'timers/promises';

export class RateLimitObserver {
  rateCount: Record<number, number> = {};

  constructor(private readonly rateLimit: number) {}

  /** Increment the current rate count */
  public increment() {
    const now = Math.floor(Date.now() / 1000);
    if (!this.rateCount[now]) {
      this.rateCount[now] = 0;
    }
    this.rateCount[now]++;
  }

  /**
   * Pauses for as long as necessary to respect the rate limit.
   */
  public async pause() {
    const now = Math.floor(Date.now() / 1000);
    const count = this.rateCount[now] ?? 0;
    if (count < this.rateLimit) {
      return;
    }

    const delay = (now + 1) * 1000 - Date.now();
    if (delay > 0) {
      await setTimeout(delay);
    }

    // Reset the rate count
    this.rateCount = {};
  }
}
