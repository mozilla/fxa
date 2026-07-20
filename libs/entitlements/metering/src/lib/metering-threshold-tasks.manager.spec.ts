/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { StatsDService } from '@fxa/shared/metrics/statsd';

import {
  MeteringCloudTasksConfig,
  MeteringCloudTasksThresholdConfig,
  MeteringConfig,
} from './metering.config';
import {
  MeteringCloudTasksClient,
  MeteringThresholdTasksManager,
} from './metering-threshold-tasks.manager';
import { buildThresholdTaskId } from './utils/buildThresholdTaskId';

describe('MeteringThresholdTasksManager', () => {
  const SLUG = 'bandwidth';
  const USER = 'user-1';
  const QUEUE = 'metering-threshold-checks';
  const TASK_URL =
    'https://payments-api.example/v1/metering/internal/threshold-check';
  const AUD = TASK_URL;
  const RUNNER = 'metering-task-runner@example.iam.gserviceaccount.com';
  const DEFAULT_BUCKET_SIZE_MS = 5 * 60 * 1000;
  const DEFAULT_SCHEDULE_DELAY_MS = 7 * 60 * 1000;

  function buildConfig(
    overrides: Partial<MeteringCloudTasksThresholdConfig> = {}
  ): MeteringConfig {
    const cloudTasks = new MeteringCloudTasksConfig();
    Object.assign(cloudTasks, {
      projectId: 'proj',
      locationId: 'us-central1',
    });
    Object.assign(cloudTasks.oidc, {
      aud: AUD,
      serviceAccountEmail: RUNNER,
    });
    Object.assign(cloudTasks.threshold, {
      queueName: QUEUE,
      taskUrl: TASK_URL,
      bucketSizeMs: DEFAULT_BUCKET_SIZE_MS,
      scheduleDelayMs: DEFAULT_SCHEDULE_DELAY_MS,
      ...overrides,
    });
    return {
      openmeterBaseUrl: 'http://example.com',
      clients: {},
      cloudTasks,
    };
  }

  async function buildManager(meteringConfig: MeteringConfig = buildConfig()) {
    const cloudTasksClient = {
      createTask: jest.fn().mockResolvedValue([{ name: 'tasks/created' }]),
      getTask: jest.fn(),
    };
    const statsd = { increment: jest.fn() };
    const logger = { error: jest.fn(), log: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringThresholdTasksManager,
        { provide: MeteringConfig, useValue: meteringConfig },
        { provide: MeteringCloudTasksClient, useValue: cloudTasksClient },
        { provide: StatsDService, useValue: statsd },
        { provide: Logger, useValue: logger },
      ],
    }).compile();
    const meteringThresholdTasksManager = moduleRef.get(
      MeteringThresholdTasksManager
    );
    return { meteringThresholdTasksManager, cloudTasksClient, statsd, logger };
  }

  describe('scheduleThresholdCheck', () => {
    it('enqueues a create-task call with the full task definition', async () => {
      const { meteringThresholdTasksManager, cloudTasksClient } =
        await buildManager();

      const now = new Date('2026-05-19T12:34:56.000Z');
      const expectedTaskId = buildThresholdTaskId(
        { slug: SLUG, userIdentifier: USER },
        now,
        DEFAULT_BUCKET_SIZE_MS
      );

      await meteringThresholdTasksManager.scheduleThresholdCheck(
        { slug: SLUG, userIdentifier: USER },
        now
      );

      expect(cloudTasksClient.createTask).toHaveBeenCalledWith({
        parent: `projects/proj/locations/us-central1/queues/${QUEUE}`,
        task: {
          name: `projects/proj/locations/us-central1/queues/${QUEUE}/tasks/${expectedTaskId}`,
          scheduleTime: {
            seconds: Math.floor(
              (now.getTime() + DEFAULT_SCHEDULE_DELAY_MS) / 1000
            ),
            nanos: 0,
          },
          httpRequest: {
            url: TASK_URL,
            httpMethod: 1,
            headers: { 'Content-Type': 'application/json' },
            body: Buffer.from(
              JSON.stringify({
                slug: SLUG,
                userIdentifier: USER,
              })
            ).toString('base64'),
            oidcToken: {
              audience: AUD,
              serviceAccountEmail: RUNNER,
            },
          },
        },
      });
    });

    it('returns enqueued true with the task id and a created reason', async () => {
      const { meteringThresholdTasksManager } = await buildManager();

      const now = new Date('2026-05-19T12:34:56.000Z');
      const expectedTaskId = buildThresholdTaskId(
        { slug: SLUG, userIdentifier: USER },
        now,
        DEFAULT_BUCKET_SIZE_MS
      );

      const result = await meteringThresholdTasksManager.scheduleThresholdCheck(
        { slug: SLUG, userIdentifier: USER },
        now
      );

      expect(result).toEqual({
        enqueued: true,
        taskId: expectedTaskId,
        reason: 'created',
      });
    });

    it('increments the enqueue metric on success', async () => {
      const { meteringThresholdTasksManager, statsd } = await buildManager();

      await meteringThresholdTasksManager.scheduleThresholdCheck({
        slug: SLUG,
        userIdentifier: USER,
      });

      expect(statsd.increment).toHaveBeenCalledWith('metering.tasks.enqueue');
    });

    it('uses the configured scheduleDelayMs for the schedule time', async () => {
      const { meteringThresholdTasksManager, cloudTasksClient } =
        await buildManager(buildConfig({ scheduleDelayMs: 60_000 }));

      const now = new Date('2026-05-19T12:00:00.000Z');
      await meteringThresholdTasksManager.scheduleThresholdCheck(
        { slug: SLUG, userIdentifier: USER },
        now
      );

      expect(cloudTasksClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          task: expect.objectContaining({
            scheduleTime: {
              seconds: Math.floor((now.getTime() + 60_000) / 1000),
              nanos: 0,
            },
          }),
        })
      );
    });

    it('encodes a sub-second schedule time as whole seconds plus nanos', async () => {
      const { meteringThresholdTasksManager, cloudTasksClient } =
        await buildManager();

      const now = new Date('2026-05-19T12:34:56.250Z');
      const fireTimeMs = now.getTime() + DEFAULT_SCHEDULE_DELAY_MS;

      await meteringThresholdTasksManager.scheduleThresholdCheck(
        { slug: SLUG, userIdentifier: USER },
        now
      );

      expect(cloudTasksClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          task: expect.objectContaining({
            scheduleTime: {
              seconds: Math.floor(fireTimeMs / 1000),
              nanos: 250 * 1e6,
            },
          }),
        })
      );
    });

    it('uses the configured bucketSizeMs in the task name', async () => {
      const oneMin = 60_000;
      const { meteringThresholdTasksManager, cloudTasksClient } =
        await buildManager(
          buildConfig({ bucketSizeMs: oneMin, scheduleDelayMs: 90_000 })
        );

      const now = new Date('2026-05-19T12:34:30.000Z');
      const expectedTaskId = buildThresholdTaskId(
        { slug: SLUG, userIdentifier: USER },
        now,
        oneMin
      );

      await meteringThresholdTasksManager.scheduleThresholdCheck(
        { slug: SLUG, userIdentifier: USER },
        now
      );

      expect(cloudTasksClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          task: expect.objectContaining({
            name: `projects/proj/locations/us-central1/queues/${QUEUE}/tasks/${expectedTaskId}`,
          }),
        })
      );
    });

    it('fires the task after the bucket ends so a late event still lands first', async () => {
      // A late event in the same bucket is deduplicated, so the task still
      // fires at the first enqueue's time plus the delay. Config keeps the
      // delay larger than the bucket size so a late event still reaches
      // OpenMeter before the task runs.
      const { meteringThresholdTasksManager, cloudTasksClient } =
        await buildManager();

      const bucketSizeMs = DEFAULT_BUCKET_SIZE_MS;
      const scheduleDelayMs = DEFAULT_SCHEDULE_DELAY_MS;
      const bucketStartMs =
        Math.floor(Date.parse('2026-05-19T12:00:00.000Z') / bucketSizeMs) *
        bucketSizeMs;
      const firstEventTime = new Date(bucketStartMs);

      await meteringThresholdTasksManager.scheduleThresholdCheck(
        { slug: SLUG, userIdentifier: USER },
        firstEventTime
      );

      const expectedFireMs = firstEventTime.getTime() + scheduleDelayMs;
      const bucketEndMs = bucketStartMs + bucketSizeMs;
      const marginMs = expectedFireMs - bucketEndMs;
      expect(marginMs).toBe(scheduleDelayMs - bucketSizeMs);
      expect(marginMs).toBeGreaterThan(0);
      expect(cloudTasksClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          task: expect.objectContaining({
            scheduleTime: { seconds: expectedFireMs / 1000, nanos: 0 },
          }),
        })
      );
    });

    it('treats ALREADY_EXISTS as dedup, not an error', async () => {
      const { meteringThresholdTasksManager, cloudTasksClient, statsd } =
        await buildManager();
      const err = Object.assign(new Error('task already exists'), {
        code: 6,
      });
      cloudTasksClient.createTask.mockRejectedValue(err);

      const result = await meteringThresholdTasksManager.scheduleThresholdCheck(
        {
          slug: SLUG,
          userIdentifier: USER,
        }
      );

      expect(result.reason).toBe('dedup');
      expect(result.enqueued).toBe(false);
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.tasks.enqueue.dedup'
      );
    });

    it('tags the enqueue_error metric with reason "permission" and logs the error', async () => {
      const {
        meteringThresholdTasksManager,
        cloudTasksClient,
        statsd,
        logger,
      } = await buildManager();
      const err = Object.assign(new Error('Permission denied'), {
        code: 'PERMISSION_DENIED',
      });
      cloudTasksClient.createTask.mockRejectedValue(err);

      const result = await meteringThresholdTasksManager.scheduleThresholdCheck(
        {
          slug: SLUG,
          userIdentifier: USER,
        }
      );

      expect(result.reason).toBe('error');
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.tasks.enqueue_error',
        { reason: 'permission' }
      );
      expect(logger.error).toHaveBeenCalledWith(err);
    });

    it('tags the enqueue_error metric with reason "other" on an unrecognized error', async () => {
      const { meteringThresholdTasksManager, cloudTasksClient, statsd } =
        await buildManager();
      const err = new Error('whoops');
      cloudTasksClient.createTask.mockRejectedValue(err);

      const result = await meteringThresholdTasksManager.scheduleThresholdCheck(
        {
          slug: SLUG,
          userIdentifier: USER,
        }
      );

      expect(result.reason).toBe('error');
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.tasks.enqueue_error',
        { reason: 'other' }
      );
    });
  });
});
