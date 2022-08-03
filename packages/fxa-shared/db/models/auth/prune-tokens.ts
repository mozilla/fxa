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
  /**
   * Creates a token pruner
   * @param pruneInterval - A set interval at which to attempt prune operations
   * @param metrics - A statsd instance
   * @param log - A logger
   */
  constructor(
    protected readonly metrics?: StatsD,
    protected readonly log?: ILogger
  ) {
    super();
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
    const prefix = 'prune-tokens';

    this.onStartMetric(prefix);

    // Make pruning request. Since this is often run as a 'fire and forget' call, the
    // error will be handled and logged here.
    try {
      // Note that the database will also check if the pruneInterval has been exceeded. This
      // is by design, so concurrent calls to prune coming from multiple instances won't
      // result in an onslaught of deletes.
      const result = await PruneTokens.callProcedureWithOutputs(
        Proc.Prune,
        [Date.now(), maxTokenAge, maxCodeAge, 0],
        [
          '@unblockCodesDeleted',
          '@signInCodesDeleted',
          '@accountResetTokensDeleted',
          '@passwordForgotTokensDeleted',
          '@passwordChangeTokensDeleted',
          '@sessionTokensDeleted',
        ]
      );

      this.onCompleteMetric(prefix, '@unblockCodesDeleted', result);
      this.onCompleteMetric(prefix, '@signInCodesDeleted', result);
      this.onCompleteMetric(prefix, '@accountResetTokensDeleted', result);
      this.onCompleteMetric(prefix, '@passwordForgotTokensDeleted', result);
      this.onCompleteMetric(prefix, '@passwordChangeTokensDeleted', result);
      this.onCompleteMetric(prefix, '@sessionTokensDeleted', result);

      return result;
    } catch (err) {
      this.onErrorMetric(prefix);
      this.log?.error(prefix, err);
    }
  }

  /**
   * Prunes sessions from accounts with high session counts. Pruning targets older sessions, and
   * effects the sessionTokens, unverifiedTokens and devices tables.
   * @param maxSessions - Max allowed number of sessions per account
   */
  async limitSessions(maxSessions: number) {
    const prefix = 'limit-sessions';

    this.onStartMetric(prefix);

    try {
      const result = await PruneTokens.callProcedureWithOutputsAndQueryResults(
        Proc.LimitSessions,
        [maxSessions.toString()],
        ['@accountsOverLimit', '@totalDeletions']
      );

      this.onCompleteMetric(prefix, '@accountsOverLimit', result.outputs);
      this.onCompleteMetric(prefix, '@totalDeletions', result.outputs);

      return result;
    } catch (err) {
      this.onErrorMetric(prefix);
      this.log?.error(prefix, err);
    }
    return {
      outputs: null,
      results: null,
    };
  }

  private onStartMetric(prefix: string) {
    this.metrics?.increment(`${prefix}.start`);
  }

  private onCompleteMetric(prefix: string, key: string, result: any) {
    if (!result?.[key]) {
      return;
    }

    // drop @, and switch from camel case to kebab case
    const name = key
      .substring(1)
      .replace(/([a-zA-Z])(?=[A-Z])/g, '$1-')
      .toLowerCase();

    this.metrics?.increment(`${prefix}.complete.${name}`, result[key]);
  }

  private onErrorMetric(prefix: string) {
    this.metrics?.increment(`${prefix}.error`);
  }
}
