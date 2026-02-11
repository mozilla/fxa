/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';
import { ILogger } from '../../../log';
import { uuidTransformer } from '../../transformers';
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
   * @param sessionTokenWindowSize - The size of the pruning window. This only applies to session tokens and
   *                     effectively limits the number of tokens considered per run. Increase this value to
   *                     increase the number of sessions being pruned
   */
  public async prune(
    maxTokenAge: number,
    maxCodeAge: number,
    maxWindowSize: number
  ) {
    const prefix = 'prune-tokens';

    this.onStartMetric(prefix);

    // Make pruning request. Since this is often run as a 'fire and forget' call, the
    // error will be handled and logged here.
    try {
      // Note that the database will also check if the pruneInterval has been exceeded. This
      // is by design, so concurrent calls to prune coming from multiple instances won't
      // result in an onslaught of deletes.
      const result = await PruneTokens.callProcedureWithOutputsAndQueryResults(
        Proc.Prune,
        [Date.now(), maxTokenAge, maxCodeAge, maxWindowSize],
        [
          '@unblockCodesDeleted',
          '@signInCodesDeleted',
          '@accountResetTokensDeleted',
          '@passwordForgotTokensDeleted',
          '@passwordChangeTokensDeleted',
          '@sessionTokensDeleted',
        ]
      );

      this.onEndMetric(prefix);
      this.onCompleteMetric(prefix, '@unblockCodesDeleted', result.outputs);
      this.onCompleteMetric(prefix, '@signInCodesDeleted', result.outputs);
      this.onCompleteMetric(
        prefix,
        '@accountResetTokensDeleted',
        result.outputs
      );
      this.onCompleteMetric(
        prefix,
        '@passwordForgotTokensDeleted',
        result.outputs
      );
      this.onCompleteMetric(
        prefix,
        '@passwordChangeTokensDeleted',
        result.outputs
      );
      this.onCompleteMetric(prefix, '@sessionTokensDeleted', result.outputs);

      return {
        outputs: result.outputs,
        uids:
          result.results?.rows?.length === 5 ? result.results.rows[3] : null,
      };
    } catch (err) {
      this.onErrorMetric(prefix);
      this.log?.error(prefix, err);
    }

    return {
      outputs: null,
      uids: null,
    };
  }

  /**
   * Find accounts with a large number of session related sessions. Note this can be expensive, call sparingly.
   * @param sessionsRequired - An account must have at more sessions than this value to be considered large.
   * @param rowLimit - The maximum number of accounts to return.
   */
  async findLargeAccounts(sessionsRequired: number, rowLimit: number) {
    const prefix = 'find-large-accounts';
    this.onStartMetric(prefix);

    try {
      const result = await PruneTokens.callProcedure(Proc.FindLargeAccounts, [
        sessionsRequired.toString(),
        rowLimit.toString(),
      ]);

      this.onEndMetric(prefix);
      this.onCompleteMetric(prefix, '@totalAccounts', {
        '@totalAccounts': result.rows?.length,
      });

      return result.rows;
    } catch (err) {
      this.onErrorMetric(prefix);
      this.log?.error(prefix, err);
    }

    return [];
  }

  /**
   * Prunes old sessions from accounts. Oldest tokens are deleted first.
   * @param accountUid - The target account
   * @param maxSessions - Max allowed number of sessions for account
   * @param maxSessionsDeleted - Limits the number of session tokens deleted per call
   */
  async limitSessions(
    accountUid: string,
    maxSessions: number,
    maxSessionsDeleted: number
  ) {
    const prefix = 'limit-sessions';
    this.onStartMetric(prefix);

    try {
      const result = await PruneTokens.callProcedureWithOutputs(
        Proc.LimitSessions,
        [
          uuidTransformer.to(accountUid),
          maxSessions.toString(),
          maxSessionsDeleted.toString(),
        ],
        ['@totalDeletions']
      );

      this.onEndMetric(prefix);
      this.onCompleteMetric(prefix, '@totalDeletions', result);

      return {
        outputs: result,
      };
    } catch (err) {
      this.onErrorMetric(prefix);
      this.log?.error(prefix, err);
    }

    return {
      outputs: null,
    };
  }

  private onStartMetric(prefix: string) {
    this.metrics?.increment(`${prefix}.start`);
  }

  private onEndMetric(prefix: string) {
    this.metrics?.increment(`${prefix}.end`);
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
