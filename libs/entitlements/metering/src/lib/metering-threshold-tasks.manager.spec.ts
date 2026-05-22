/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CloudTasksClient } from '@google-cloud/tasks';

import { StatsDService } from '@fxa/shared/metrics/statsd';

import {
  MeteringCloudTasksConfig,
  MeteringCloudTasksThresholdConfig,
  MeteringConfig,
} from './metering.config';
import { MeteringThresholdTasksManager } from './metering-threshold-tasks.manager';

describe('MeteringThresholdTasksManager', () => {
  const SLUG = 'bandwidth';
  const USER = 'user-1';
  const QUEUE = 'metering-threshold-checks';
  const TASK_URL = 'https://payments-api.example/v1/metering/internal/threshold-check';
  const AUD = TASK_URL;
  const RUNNER = 'metering-task-runner@example.iam.gserviceaccount.com';

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
      bucketSizeMs: 5 * 60 * 1000,
      scheduleDelayMs: 7 * 60 * 1000,
      ...overrides,
    });
    return {
      openmeterBaseUrl: 'http://example.com',
      clients: {},
      cloudTasks,
    };
  }

  async function buildManager(meteringConfig: MeteringConfig = buildConfig()) {
    const cloudTasksClient = { createTask: jest.fn(), getTask: jest.fn() };
    const statsd = { increment: jest.fn() };
    const logger = { error: jest.fn(), log: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringThresholdTasksManager,
        { provide: MeteringConfig, useValue: meteringConfig },
        { provide: CloudTasksClient, useValue: cloudTasksClient },
        { provide: StatsDService, useValue: statsd },
        { provide: Logger, useValue: logger },
      ],
    }).compile();
    const meteringThresholdTasksManager = moduleRef.get(
      MeteringThresholdTasksManager
    );
    return { meteringThresholdTasksManager, cloudTasksClient, statsd, logger };
  }

  async function expectBuildToThrow(
    meteringConfig: MeteringConfig,
    matcher: RegExp
  ): Promise<void> {
    await expect(buildManager(meteringConfig)).rejects.toThrow(matcher);
  }

  describe('construction', () => {
    it('throws when cloudTasks is missing', async () => {
      await expectBuildToThrow(
        { openmeterBaseUrl: 'http://example.com', clients: {} },
        /cloudTasks is required/
      );
    });

    it('throws when threshold.queueName is empty', async () => {
      await expectBuildToThrow(
        buildConfig({ queueName: '' }),
        /queueName is required/
      );
    });

    it('throws when threshold.taskUrl is empty', async () => {
      await expectBuildToThrow(
        buildConfig({ taskUrl: '' }),
        /taskUrl is required/
      );
    });
  });

  describe('scheduleThresholdCheck', () => {
    it('enqueues with a configured-bucket-stable task name + scheduleTime + payload', async () => {
      const { meteringThresholdTasksManager, cloudTasksClient, statsd } =
        await buildManager();
      cloudTasksClient.createTask.mockResolvedValue([{ name: 't/a' }]);

      const now = new Date('2026-05-19T12:34:56.000Z');
      const bucket = Math.floor(now.getTime() / (5 * 60 * 1000));
      const expectedTaskId = `threshold-${SLUG}-${USER}-${bucket}`;

      const result = await meteringThresholdTasksManager.scheduleThresholdCheck(
        { slug: SLUG, userIdentifier: USER },
        now
      );

      expect(cloudTasksClient.createTask).toHaveBeenCalledWith({
        parent: `projects/proj/locations/us-central1/queues/${QUEUE}`,
        task: {
          name: `projects/proj/locations/us-central1/queues/${QUEUE}/tasks/${expectedTaskId}`,
          scheduleTime: { seconds: (now.getTime() + 7 * 60 * 1000) / 1000 },
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
      expect(result).toEqual({
        enqueued: true,
        taskId: expectedTaskId,
        reason: 'created',
      });
      expect(statsd.increment).toHaveBeenCalledWith('metering.tasks.enqueue');
    });

    it('uses the configured scheduleDelayMs', async () => {
      const { meteringThresholdTasksManager, cloudTasksClient } =
        await buildManager(
          buildConfig({ scheduleDelayMs: 60_000, bucketSizeMs: 30_000 })
        );
      cloudTasksClient.createTask.mockResolvedValue([{ name: 't/a' }]);

      const now = new Date('2026-05-19T12:00:00.000Z');
      await meteringThresholdTasksManager.scheduleThresholdCheck(
        { slug: SLUG, userIdentifier: USER },
        now
      );

      expect(cloudTasksClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          task: expect.objectContaining({
            scheduleTime: { seconds: (now.getTime() + 60_000) / 1000 },
          }),
        })
      );
    });

    it('uses the configured bucketSizeMs in the task name', async () => {
      const oneMin = 60 * 1000;
      const { meteringThresholdTasksManager, cloudTasksClient } =
        await buildManager(
          buildConfig({ bucketSizeMs: oneMin, scheduleDelayMs: 90_000 })
        );
      cloudTasksClient.createTask.mockResolvedValue([{ name: 't/a' }]);

      const now = new Date('2026-05-19T12:34:30.000Z');
      const expectedBucket = Math.floor(now.getTime() / oneMin);

      await meteringThresholdTasksManager.scheduleThresholdCheck(
        { slug: SLUG, userIdentifier: USER },
        now
      );

      expect(cloudTasksClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          task: expect.objectContaining({
            name: `projects/proj/locations/us-central1/queues/${QUEUE}/tasks/threshold-${SLUG}-${USER}-${expectedBucket}`,
          }),
        })
      );
    });

    it('leaves Kafka-propagation margin between the bucket end and the task fire', async () => {
      // Worst case for Kafka propagation: the FIRST enqueue in a bucket is at
      // the bucket start, which sets `scheduleTime = bucketStart + delay`.
      // A subsequent same-bucket event near `bucketEnd` is dedup'd, so the
      // task still fires at `bucketStart + delay`. The margin between the
      // latest possible same-bucket event and the task fire is therefore
      // `delay - bucketSize`. The config invariant `delay > bucketSize`
      // guarantees this is positive.
      const { meteringThresholdTasksManager, cloudTasksClient } =
        await buildManager();
      cloudTasksClient.createTask.mockResolvedValue([{ name: 't/a' }]);

      const bucketSizeMs = 5 * 60 * 1000;
      const scheduleDelayMs = 7 * 60 * 1000;
      const bucketStartMs = Math.floor(
        Date.parse('2026-05-19T12:00:00.000Z') / bucketSizeMs
      ) * bucketSizeMs;
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
            scheduleTime: { seconds: expectedFireMs / 1000 },
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

      const result = await meteringThresholdTasksManager.scheduleThresholdCheck({
        slug: SLUG,
        userIdentifier: USER,
      });

      expect(result.reason).toBe('dedup');
      expect(result.enqueued).toBe(false);
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.tasks.enqueue.dedup'
      );
    });

    it('reports permission errors with a bucketed reason tag', async () => {
      const { meteringThresholdTasksManager, cloudTasksClient, statsd, logger } =
        await buildManager();
      const err = Object.assign(new Error('Permission denied'), {
        code: 'PERMISSION_DENIED',
      });
      cloudTasksClient.createTask.mockRejectedValue(err);

      const result = await meteringThresholdTasksManager.scheduleThresholdCheck({
        slug: SLUG,
        userIdentifier: USER,
      });

      expect(result.reason).toBe('error');
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.tasks.enqueue_error',
        { reason: 'permission' }
      );
      expect(logger.error).toHaveBeenCalledWith(err);
    });

    it('reports unknown errors with reason="other"', async () => {
      const { meteringThresholdTasksManager, cloudTasksClient, statsd } =
        await buildManager();
      const err = new Error('whoops');
      cloudTasksClient.createTask.mockRejectedValue(err);

      const result = await meteringThresholdTasksManager.scheduleThresholdCheck({
        slug: SLUG,
        userIdentifier: USER,
      });

      expect(result.reason).toBe('error');
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.tasks.enqueue_error',
        { reason: 'other' }
      );
    });
  });
});
