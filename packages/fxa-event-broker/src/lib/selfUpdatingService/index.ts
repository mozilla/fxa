/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from 'mozlog';

import { isError, Result } from '../result';

/**
 * SelfUpdatingService is an abstract generic class that implements a
 * cached set of data that automatically refreshes in the background
 * to always have a fresh set of data without delay for callers.
 *
 * The drawback of this approach is that the resource being requested
 * will be queried at the desired `refreshInterval` even if its not
 * needed.
 *
 */
abstract class SelfUpdatingService<T> {
  protected logger: Logger;
  protected data: T;
  private timer: NodeJS.Timeout | null;
  private readonly refreshInterval: number;
  private failOnStart: boolean;

  constructor(
    logger: Logger,
    refreshInterval: number,
    defaultValue: T,
    failOnStart: boolean = true
  ) {
    this.logger = logger;
    this.refreshInterval = refreshInterval;
    this.data = defaultValue;
    this.timer = null;
    this.failOnStart = failOnStart;
  }

  /**
   * Start the service with automatic refreshing of `T` data.
   *
   * * This will error on start if the first fetch fails.
   * * Calls while the service is already running will be ignored.
   */
  public async start() {
    if (this.timer) {
      return;
    }

    // Verify we can do the initial fetch
    const result = await this.updateFunction();
    if (isError(result)) {
      this.logger.error('clientCapabilityService', { err: result });
      if (this.failOnStart) {
        throw result;
      }
    } else {
      this.data = result;
    }
    this.timer = setInterval(async () => {
      try {
        await this.updateService();
      } catch (err) {
        this.logger.error('updateService', { err });
      }
    }, this.refreshInterval);
  }

  /**
   * Stop the service from refreshing `T`.
   *
   * * Calls while the service is stopped will be ignored.
   */
  public async stop() {
    if (!this.timer) {
      return;
    }
    clearInterval(this.timer);
    this.timer = null;
  }

  /**
   * Return the cached service data.
   */
  public serviceData(): T {
    return this.data;
  }

  /**
   * Abstract function called every interval to update the cached service data.
   */
  protected abstract updateFunction(): Promise<Result<T>>;

  private async updateService(): Promise<void> {
    const result = await this.updateFunction();
    if (isError(result)) {
      this.logger.error('selfUpdatingService', { err: result });
      return;
    }
    this.data = result;
  }
}

export { SelfUpdatingService };
