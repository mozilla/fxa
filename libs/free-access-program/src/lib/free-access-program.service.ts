/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import type { StatsD } from 'hot-shots';

import { AccountManager } from '@fxa/shared/account/account';
import {
  type FreeAccessCapabilityMap,
  FreeAccessProgramConfigurationManager,
} from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';

import { FreeAccessProgramJournalManager } from './free-access-program.journal.manager';
import type { FreeAccessPendingNotification } from './free-access-program.repository';
import {
  FREE_ACCESS_NOTIFIER,
  type FreeAccessForUid,
  type FreeAccessNotifier,
  type ReconcileResult,
} from './free-access-program.types';
import { diffByEmail } from './util/diffByEmail';

const NOTIFICATION_DELAY_MARGIN_SECONDS = 60;
const MAX_DUE_NOTIFICATIONS_PER_RUN = 500;
const FIRESTORE_NOT_FOUND = 5;
const FIRESTORE_FAILED_PRECONDITION = 9;

function hasAnyEntry(record: Record<string, unknown>): boolean {
  for (const key in record) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return true;
    }
  }
  return false;
}

@Injectable()
export class FreeAccessProgramService {
  constructor(
    private configurationManager: FreeAccessProgramConfigurationManager,
    private accountManager: AccountManager,
    @Inject(StatsDService) private statsd: StatsD,
    private logger: Logger,
    // Write-path dependencies: required by reconcile(), unused by the read
    // methods. Optional so read-only consumers (e.g. payments-api) can
    // construct the service without wiring the journal/notifier.
    @Optional() private journalManager?: FreeAccessProgramJournalManager,
    @Optional()
    @Inject(FREE_ACCESS_NOTIFIER)
    private notifier?: FreeAccessNotifier
  ) {}

  async findCapabilitiesForEmail(
    email?: string | null
  ): Promise<FreeAccessCapabilityMap> {
    if (!email) {
      this.recordMembershipCheck('email_capabilities', false);
      return {};
    }
    const projection = await this.configurationManager.getCachedProjection();
    const capabilities = projection[email.toLowerCase()]?.capabilities ?? {};
    this.recordMembershipCheck(
      'email_capabilities',
      Object.keys(capabilities).length > 0
    );
    return capabilities;
  }

  async findCapabilitiesForUid(uid: string): Promise<FreeAccessCapabilityMap> {
    const projection = await this.configurationManager.getCachedProjection();
    if (!hasAnyEntry(projection)) {
      this.recordMembershipCheck('uid_capabilities', false);
      return {};
    }
    const email = (
      await this.accountManager.getPrimaryEmailByUid(uid)
    )?.toLowerCase();
    const capabilities = (email && projection[email]?.capabilities) || {};
    this.recordMembershipCheck(
      'uid_capabilities',
      Object.keys(capabilities).length > 0
    );
    return capabilities;
  }

  async findOfferingIdsForEmail(email?: string | null): Promise<string[]> {
    if (!email) {
      this.recordMembershipCheck('email_offerings', false);
      return [];
    }
    const projection = await this.configurationManager.getCachedProjection();
    const offeringApiIdentifiers = [
      ...(projection[email.toLowerCase()]?.offeringApiIdentifiers ?? []),
    ];
    this.recordMembershipCheck(
      'email_offerings',
      offeringApiIdentifiers.length > 0
    );
    return offeringApiIdentifiers;
  }

  async findFreeAccessForUid(uid: string): Promise<FreeAccessForUid> {
    const empty: FreeAccessForUid = { isMember: false, grantsByClient: {} };

    const email = (
      await this.accountManager.getPrimaryEmailByUid(uid)
    )?.toLowerCase();
    if (!email) {
      this.recordMembershipCheck('uid', false);
      return empty;
    }

    const projection = await this.configurationManager.getCachedProjection();
    if (!(email in projection)) {
      this.recordMembershipCheck('uid', false);
      return empty;
    }

    const grantsByClient =
      await this.configurationManager.getCachedAccessGrantsByClient();
    this.recordMembershipCheck('uid', true);
    return { isMember: true, grantsByClient: grantsByClient[email] ?? {} };
  }

  private recordMembershipCheck(
    lookup:
      | 'uid'
      | 'uid_capabilities'
      | 'email_capabilities'
      | 'email_offerings',
    member: boolean
  ): void {
    this.statsd.increment('free_access_program.membership.check', {
      member: `${member}`,
      lookup,
    });
  }

  async reconcile(): Promise<ReconcileResult> {
    const journalManager = this.journalManager;
    const notifier = this.notifier;
    if (!journalManager || !notifier) {
      throw new Error(
        'FreeAccessProgramService.reconcile requires a journal manager and notifier'
      );
    }

    const startedAt = Date.now();
    try {
      // Time the journal (Firestore) load here; the CMS fetch is timed inside
      // getFreshProjection (reconcile.load.projection_ms). Kept in flight
      // together so reconcile latency stays attributable to each source.
      const journalStartedAt = Date.now();
      const beforePromise = journalManager.get().then((result) => {
        this.statsd.timing(
          'free_access_program.reconcile.load.journal_ms',
          Date.now() - journalStartedAt
        );
        return result;
      });
      const [before, after] = await Promise.all([
        beforePromise,
        this.configurationManager.getFreshProjection(),
      ]);

      if (before === null) {
        // Cold start: seed the journal without firing N events.
        await journalManager.set(after);
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

      // Queued before the journal write: a crash in between re-diffs and
      // re-queues the same ids on the next run instead of dropping them.
      if (changedEmails.length > 0) {
        await journalManager.queueNotifications(
          changedEmails,
          Date.now() + this.notificationDelayMs()
        );
      }

      try {
        await journalManager.set(after);
        await this.invalidateAfterFanout();
      } finally {
        await this.sendDueNotifications(journalManager, notifier);
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

  // Other processes only invalidate their memory tier on TTL expiry, so RPs
  // must not be told about a change until every instance can serve it.
  private notificationDelayMs(): number {
    return (
      (this.configurationManager.memoryCacheTtlSeconds() +
        NOTIFICATION_DELAY_MARGIN_SECONDS) *
      1000
    );
  }

  // Failures leave the pending doc in place for the next run to retry.
  private async sendDueNotifications(
    journalManager: FreeAccessProgramJournalManager,
    notifier: FreeAccessNotifier
  ): Promise<void> {
    let due: FreeAccessPendingNotification[];
    try {
      due = await journalManager.getDueNotifications(
        Date.now(),
        MAX_DUE_NOTIFICATIONS_PER_RUN
      );
    } catch (err) {
      this.statsd.increment('free_access_program.reconcile.pending.load.error');
      this.logger.error(err);
      Sentry.captureException(err);
      return;
    }
    if (due.length === MAX_DUE_NOTIFICATIONS_PER_RUN) {
      this.statsd.increment('free_access_program.reconcile.pending.backlog');
    }

    for (const notification of due) {
      if (notification.email === undefined) {
        this.statsd.increment('free_access_program.reconcile.pending.malformed');
        this.logger.error('freeAccessProgram.pending.malformed', {
          id: notification.id,
        });
        await this.deletePending(journalManager, notification);
        continue;
      }

      try {
        await notifier.notifyEmailChanged(notification.email);
        this.statsd.increment('free_access_program.reconcile.notify.success');
      } catch (err) {
        this.statsd.increment('free_access_program.reconcile.notify.error');
        this.logger.error(err);
        Sentry.captureException(err);
        continue;
      }

      await this.deletePending(journalManager, notification);
    }
  }

  private async deletePending(
    journalManager: FreeAccessProgramJournalManager,
    notification: FreeAccessPendingNotification
  ): Promise<void> {
    try {
      await journalManager.deleteNotification(notification);
    } catch (err) {
      // Re-queued or already deleted by a concurrent run: expected, not a failure.
      const code = (err as { code?: number })?.code;
      if (
        code === FIRESTORE_FAILED_PRECONDITION ||
        code === FIRESTORE_NOT_FOUND
      ) {
        this.statsd.increment(
          'free_access_program.reconcile.pending.delete.superseded'
        );
        return;
      }
      this.statsd.increment(
        'free_access_program.reconcile.pending.delete.error'
      );
      this.logger.error('freeAccessProgram.pending.delete.error', {
        id: notification.id,
        err,
      });
      Sentry.captureException(err);
    }
  }

  // Best-effort: stale-while-revalidate or the next sweep restores correctness.
  private async invalidateAfterFanout(): Promise<void> {
    try {
      await this.configurationManager.invalidateProjectionCache();
    } catch (err) {
      this.statsd.increment('free_access_program.reconcile.invalidate.error');
      this.logger.error(err);
      Sentry.captureException(err);
    }
  }
}
