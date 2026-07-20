/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import type { StatsD } from 'hot-shots';

import {
  FreeAccessCapabilityMap,
  FreeAccessProgramConfigurationManager,
} from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';

import { FreeAccessProgramJournalManager } from './free-access-program.journal.manager';
import {
  FREE_ACCESS_NOTIFIER,
  type FreeAccessNotifier,
  type ReconcileResult,
} from './free-access-program.types';
import { diffByEmail } from './util/diffByEmail';

@Injectable()
export class FreeAccessProgramService {
  constructor(
    private configurationManager: FreeAccessProgramConfigurationManager,
    private journalManager: FreeAccessProgramJournalManager,
    @Inject(FREE_ACCESS_NOTIFIER) private notifier: FreeAccessNotifier,
    @Inject(StatsDService) private statsd: StatsD,
    private logger: Logger
  ) {}

  async findCapabilitiesForEmail(
    email?: string | null
  ): Promise<FreeAccessCapabilityMap> {
    if (!email) return {};
    const projection = await this.configurationManager.getCachedProjection();
    return projection[email.toLowerCase()]?.capabilities ?? {};
  }

  async findOfferingIdsForEmail(email?: string | null): Promise<string[]> {
    if (!email) return [];
    const projection = await this.configurationManager.getCachedProjection();
    return [
      ...(projection[email.toLowerCase()]?.offeringApiIdentifiers ?? []),
    ];
  }

  async reconcile(): Promise<ReconcileResult> {
    const startedAt = Date.now();
    try {
      const [before, after] = await Promise.all([
        this.journalManager.get(),
        this.configurationManager.getFreshProjection(),
      ]);

      if (before === null) {
        // Cold start: seed the journal without firing N events.
        await this.journalManager.set(after);
        this.statsd.increment(
          'free_access_program.reconcile.cold_start_seeded'
        );
        this.recordDuration(startedAt);
        return { changed: 0, skipped: 'cold-cache-seeded' };
      }

      const changedEmails = diffByEmail(before, after);
      this.statsd.increment(
        'free_access_program.reconcile.changed',
        changedEmails.length
      );

      // Invalidate before fan-out so in-process readers don't serve stale
      // state while RPs are already learning the new state.
      try {
        await this.journalManager.set(after);
        await this.invalidateAfterFanout();
      } finally {
        await this.fireNotifications(changedEmails);
      }

      this.recordDuration(startedAt);
      this.statsd.increment('free_access_program.reconcile.success');
      return { changed: changedEmails.length };
    } catch (err) {
      this.recordDuration(startedAt);
      this.statsd.increment('free_access_program.reconcile.failure');
      throw err;
    }
  }

  private recordDuration(startedAt: number): void {
    this.statsd.timing(
      'free_access_program.reconcile.duration_ms',
      Date.now() - startedAt
    );
  }

  private async fireNotifications(emails: string[]): Promise<void> {
    for (const email of emails) {
      try {
        await this.notifier.notifyEmailChanged(email);
      } catch (err) {
        this.statsd.increment('free_access_program.reconcile.notify.error');
        this.logger.error(err);
        Sentry.captureException(err);
      }
    }
  }

  // Best-effort: stale-while-revalidate or the next sweep restores correctness.
  private async invalidateAfterFanout(): Promise<void> {
    try {
      await this.configurationManager.invalidateProjectionCache();
    } catch (err) {
      this.statsd.increment(
        'free_access_program.reconcile.invalidate.error'
      );
      this.logger.error(err);
      Sentry.captureException(err);
    }
  }
}
