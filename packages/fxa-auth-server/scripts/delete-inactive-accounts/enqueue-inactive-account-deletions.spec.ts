/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { maybeEnqueueFirstEmail } from './enqueue-inactive-account-deletions';

const uid = '0123456789abcdef0123456789abcdef';

const buildDeps = (overrides: any = {}) => {
  const glean = {
    inactiveAccountDeletion: {
      firstEmailTaskRequest: jest.fn().mockResolvedValue(undefined),
      firstEmailTaskEnqueued: jest.fn().mockResolvedValue(undefined),
      firstEmailTaskRejected: jest.fn().mockResolvedValue(undefined),
    },
  };

  return {
    accountEventsManager: {
      findEmailEvents: jest.fn().mockResolvedValue([]),
    },
    emailCloudTasks: {
      scheduleFirstEmail: jest.fn().mockResolvedValue('task-name'),
    },
    glean,
    statsd: { increment: jest.fn() },
    log: { error: jest.fn() },
    debugLog: jest.fn(),
    msTilFirstEmail: 0,
    now: () => 1_700_000_000_000,
    ...overrides,
  };
};

describe('maybeEnqueueFirstEmail', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('skips accounts that already received an inactiveAccountFirstWarning email', async () => {
    const deps = buildDeps({
      accountEventsManager: {
        findEmailEvents: jest
          .fn()
          .mockResolvedValue([{ name: 'emailSent' }]),
      },
    });

    const enqueued = await maybeEnqueueFirstEmail(uid, deps as any);

    expect(enqueued).toBe(false);
    // the skip is the idempotency guard: no task should be scheduled
    expect(deps.emailCloudTasks.scheduleFirstEmail).not.toHaveBeenCalled();
    expect(
      deps.glean.inactiveAccountDeletion.firstEmailTaskRequest
    ).not.toHaveBeenCalled();
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accounts.inactive.cron.skipped-already-notified'
    );
    // queried using the first-warning template within [0, now()]
    expect(deps.accountEventsManager.findEmailEvents).toHaveBeenCalledWith(
      uid,
      'emailSent',
      'inactiveAccountFirstWarning',
      0,
      1_700_000_000_000
    );
  });

  it('fails safe (skips, no enqueue) when the dedup lookup rejects', async () => {
    const deps = buildDeps({
      accountEventsManager: {
        findEmailEvents: jest.fn().mockRejectedValue(new Error('firestore down')),
      },
    });

    const enqueued = await maybeEnqueueFirstEmail(uid, deps as any);

    // must not throw (would be an unhandled rejection in the queued task) and
    // must not enqueue when the duplicate check is inconclusive
    expect(enqueued).toBe(false);
    expect(deps.emailCloudTasks.scheduleFirstEmail).not.toHaveBeenCalled();
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'accounts.inactive.cron.dedupe-check.error'
    );
    expect(deps.log.error).toHaveBeenCalledWith(
      'accounts.inactive.dedupeCheckError',
      expect.objectContaining({ uid })
    );
  });

  it('enqueues a first-email task when no prior first-warning event exists', async () => {
    const deps = buildDeps({ msTilFirstEmail: 86_400_000 });

    const enqueued = await maybeEnqueueFirstEmail(uid, deps as any);

    expect(enqueued).toBe(true);
    expect(deps.emailCloudTasks.scheduleFirstEmail).toHaveBeenCalledWith({
      payload: { uid },
      emailOptions: { deliveryTime: 1_700_000_000_000 + 86_400_000 },
      taskOptions: { taskId: `${uid}-inactive-delete-first-email` },
    });
    expect(
      deps.glean.inactiveAccountDeletion.firstEmailTaskEnqueued
    ).toHaveBeenCalledTimes(1);
    expect(
      deps.glean.inactiveAccountDeletion.firstEmailTaskRejected
    ).not.toHaveBeenCalled();
  });

  it('returns false and records a rejection when scheduling throws', async () => {
    const deps = buildDeps({
      emailCloudTasks: {
        scheduleFirstEmail: jest
          .fn()
          .mockRejectedValue(Object.assign(new Error('boom'), { code: 13 })),
      },
    });

    const enqueued = await maybeEnqueueFirstEmail(uid, deps as any);

    expect(enqueued).toBe(false);
    expect(deps.statsd.increment).toHaveBeenCalledWith(
      'cloud-tasks.inactive-account-email.enqueue.error-code',
      { errorCode: 13 }
    );
    expect(
      deps.glean.inactiveAccountDeletion.firstEmailTaskRejected
    ).toHaveBeenCalledTimes(1);
    expect(deps.log.error).toHaveBeenCalledWith(
      'accounts.inactive.emailEnqueueError',
      expect.objectContaining({ uid })
    );
  });
});
