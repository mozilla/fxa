/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from 'mozlog';

import { isError, Result } from '../result';

abstract class SelfUpdatingService<T> {
  protected logger: Logger;
  private data: T;
  private timer: NodeJS.Timeout | null;
  private readonly refreshInterval: number;

  constructor(logger: Logger, refreshInterval: number, defaultValue: T) {
    this.logger = logger;
    this.refreshInterval = refreshInterval;
    this.data = defaultValue;
    this.timer = null;
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
      throw result;
    }
    this.data = result;
    this.timer = setInterval(async () => await this.updateService(), this.refreshInterval);
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
