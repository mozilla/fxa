/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';
import { ILogger } from '../../../log';
import { BaseAuthModel, Proc } from './base-auth';

/**
 * Manages pruning of stale tokens.
 */
export class PruneTokens extends BaseAuthModel {
  /** Current state that the token pruner is in. */
  public get state() {
    return this._state;
  }

  /**
   * Gets the timeout id for any pending prune operation.
   */
  public get currentTimeoutId() {
    return this._timeoutId;
  }

  private _state: 'open' | 'pending' | 'active';
  private _timeoutId: any | undefined;

  /**
   * Creates a token pruner
   * @param pruneInterval - A set interval at which to attempt prune operations
   * @param metrics - A statsd instance
   * @param log - A logger
   */
  constructor(
    public readonly pruneInterval: number,
    protected readonly metrics?: StatsD,
    protected readonly log?: ILogger
  ) {
    super();
    this._state = 'open';
  }

  /**
   * Attempt to prune tokens in database. Note, this method cannot be run at rate any faster
   * than the pruneInterval. i.e. If the prune interval is 1 second, any calls that occur at rate faster
   * than one second are simply ignored.
   *
   * @param maxTokenAge - Max age of token. To disable token pruning set to 0.
   * @param maxCodeAge - Max age of code. To disable token pruning set to 0.
   */
  public async prune(maxTokenAge: number, maxCodeAge: number) {
    // Avoid creating unneeded prune operations. If there is already a pending/active one simply exit.
    if (this._state !== 'open') {
      return;
    }

    // Enter the prune operation
    this._state = 'active';

    // Set a timeout for when the next prune operation can be attempted again. Note,
    // that the interval maybe quite large, so the call to unref() ensures the event
    // loop isn't blocked in the event the process is trying to shutdown.
    this._timeoutId = setTimeout(() => {
      this._state = 'open';
    }, this.pruneInterval).unref();

    this.metrics?.increment('prune-tokens.start');

    // Make pruning request. Since this is often run as a 'fire and forget' call, the
    // error will be handled and logged here.
    try {
      // Note that the database will also check if the pruneInterval has been exceeded. This
      // is by design, so that concurrent calls to prune coming from multiple instances won't
      // result in an onslaught of deletes.
      const result = await PruneTokens.callProcedureWithOutputs(
        Proc.Prune,
        [Date.now(), maxTokenAge, maxCodeAge, this.pruneInterval],
        [
          '@unblockCodesDeleted',
          '@signInCodesDeleted',
          '@accountResetTokensDeleted',
          '@passwordForgotTokensDeleted',
          '@passwordChangeTokensDeleted',
          '@sessionTokensDeleted',
        ]
      );

      const incrementResultMetric = (key: string) => {
        if (!result?.[key]) {
          return;
        }

        // drop @, and switch from camel case to kebab case
        const name = key
          .substring(1)
          .replace(/([a-zA-Z])(?=[A-Z])/g, '$1-')
          .toLowerCase();

        this.metrics?.increment(`prune-tokens.complete.${name}`, result[key]);
      };

      incrementResultMetric('@unblockCodesDeleted');
      incrementResultMetric('@signInCodesDeleted');
      incrementResultMetric('@accountResetTokensDeleted');
      incrementResultMetric('@passwordForgotTokensDeleted');
      incrementResultMetric('@passwordChangeTokensDeleted');
      incrementResultMetric('@sessionTokensDeleted');

      return result;
    } catch (err) {
      this.metrics?.increment('prune-tokens.error');
      this.log?.error('prune-tokens', err);
    } finally {
      // Set the state pending. Subsequent calls are still ignored until the prune interval has
      // actually expired.
      this._state = 'pending';
    }
  }

  /**
   * Stops pending prune
   */
  public stop() {
    clearTimeout(this._timeoutId);
    this._state = 'open';
  }
}
