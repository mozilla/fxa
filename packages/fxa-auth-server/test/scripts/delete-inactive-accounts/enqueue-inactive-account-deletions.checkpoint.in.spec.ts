/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Run the entry function in the Jest process so its mocks apply.

import fs from 'fs';
import os from 'os';
import path from 'path';
import { BigQuery } from '@google-cloud/bigquery';
import { google } from 'googleapis';
import {
  CloudTasksQueueStatsClientFactory,
  InactiveAccountEmailTasksFactory,
} from '@fxa/shared/cloud-tasks';

import appConfig from '../../../config';
import type { ScanStateStorage } from '../../../scripts/delete-inactive-accounts/lib';
import { init } from '../../../scripts/delete-inactive-accounts/enqueue-inactive-account-deletions';

jest.mock('@google-cloud/bigquery', () => ({ BigQuery: jest.fn() }));
jest.mock('googleapis', () => ({
  google: { storage: jest.fn(), auth: { GoogleAuth: jest.fn() } },
}));
jest.mock('@fxa/shared/cloud-tasks', () => ({
  ...jest.requireActual('@fxa/shared/cloud-tasks'),
  CloudTasksQueueStatsClientFactory: jest.fn(),
  InactiveAccountEmailTasksFactory: jest.fn(),
}));

const { cloudTasks } = appConfig.getProperties();
const firstEmailQueuePath = `projects/${cloudTasks.projectId}/locations/${cloudTasks.locationId}/queues/${cloudTasks.inactiveAccountEmails.firstEmailQueueName}`;
const thresholdDays = 2;
const maxDispatchesPerSecond = 10;
const tasksPerDay = maxDispatchesPerSecond * 86400;

const uid = '0123456789abcdef0123456789abcdef';
const stateFileUrl = 'gs://fxa-state/inactive/enqueue.json';
const stateObjectLocation = {
  bucket: 'fxa-state',
  object: 'inactive/enqueue.json',
};
const previousScanRange = {
  previous_start_date: '2016-03-07',
  previous_end_date: '2016-03-13',
};
const serializeScanRange = (
  previous_start_date: string,
  previous_end_date: string
) => JSON.stringify({ previous_start_date, previous_end_date });

const httpError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), { status });

const mockQueryJob = (queryRows: { uid: string }[]) => ({
  id: 'job-1',
  metadata: { statistics: { sessionInfo: { sessionId: 'session-1' } } },
  getQueryResults: jest.fn().mockResolvedValue([queryRows]),
});

const mockBigQuery = (candidateRecords: { uid: string }[]) => {
  const table = { load: jest.fn().mockResolvedValue(undefined) };
  const dataset = {
    createTable: jest.fn().mockResolvedValue(undefined),
    table: jest.fn().mockReturnValue(table),
  };
  const bigQueryClient = {
    createQueryJob: jest
      .fn()
      .mockResolvedValueOnce([mockQueryJob([])])
      .mockResolvedValueOnce([mockQueryJob(candidateRecords)]),
    dataset: jest.fn().mockReturnValue(dataset),
  };
  jest
    .mocked(BigQuery)
    .mockImplementation(() => bigQueryClient as unknown as BigQuery);
  return bigQueryClient;
};

describe('inactive-account deletion checkpoints', () => {
  const originalArgv = process.argv;
  let outputDirectory: string;
  let storageClient: { objects: jest.Mocked<ScanStateStorage['objects']> };
  let scheduleFirstEmail: jest.Mock;
  let getQueue: jest.Mock;

  const mockQueue = (tasksCount: number) =>
    getQueue.mockResolvedValue([
      {
        stats: { tasksCount: `${tasksCount}` },
        rateLimits: { maxDispatchesPerSecond },
      },
    ]);

  const runScript = (...args: string[]) => {
    process.argv = [
      'node',
      'enqueue-inactive-account-deletions.ts',
      '--bq-dataset',
      'fxa-dev.inactives_testo',
      '--output-path',
      path.join(outputDirectory, 'mysql-uids.csv'),
      ...args,
    ];
    return init();
  };

  beforeEach(() => {
    outputDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'enqueue-checkpoint-')
    );
    storageClient = { objects: { get: jest.fn(), insert: jest.fn() } };
    (google.storage as jest.Mock).mockReturnValue(storageClient);
    scheduleFirstEmail = jest.fn().mockResolvedValue(undefined);
    jest.mocked(InactiveAccountEmailTasksFactory).mockReturnValue({
      scheduleFirstEmail,
    } as unknown as ReturnType<typeof InactiveAccountEmailTasksFactory>);
    getQueue = jest.fn();
    mockQueue(0);
    jest.mocked(CloudTasksQueueStatsClientFactory).mockReturnValue({
      getQueue,
    } as unknown as ReturnType<typeof CloudTasksQueueStatsClientFactory>);
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.argv = originalArgv;
    fs.rmSync(outputDirectory, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  describe('with a saved scan range', () => {
    beforeEach(() => {
      storageClient.objects.get.mockResolvedValue({ data: previousScanRange });
    });

    it('reads and displays the next scan range without saving during a dry run', async () => {
      await expect(
        runScript('--enqueue-emails', 'true', '--state-file', stateFileUrl)
      ).resolves.toBe(0);

      expect(storageClient.objects.get).toHaveBeenCalledWith({
        ...stateObjectLocation,
        alt: 'media',
      });
      expect(console.log).toHaveBeenCalledWith(
        'Previous scan range: 2016-03-07 to 2016-03-13'
      );
      expect(console.log).toHaveBeenCalledWith(
        'Start date: 2016-02-29T00:00:00.000Z'
      );
      expect(console.log).toHaveBeenCalledWith(
        'End date: 2016-03-06T00:00:00.000Z'
      );
      expect(BigQuery).not.toHaveBeenCalled();
      expect(storageClient.objects.insert).not.toHaveBeenCalled();
    });

    it('leaves the checkpoint unchanged when email enqueueing is disabled', async () => {
      mockBigQuery([{ uid }]);

      await expect(
        runScript(
          '--dry-run',
          'false',
          '--enqueue-emails',
          'false',
          '--state-file',
          stateFileUrl
        )
      ).resolves.toBe(0);

      expect(scheduleFirstEmail).not.toHaveBeenCalled();
      expect(storageClient.objects.insert).not.toHaveBeenCalled();
    });

    it('saves the scanned range even when no candidates are found', async () => {
      mockBigQuery([]);
      storageClient.objects.insert.mockResolvedValue({ data: {} });

      await expect(
        runScript(
          '--dry-run',
          'false',
          '--enqueue-emails',
          'true',
          '--state-file',
          stateFileUrl
        )
      ).resolves.toBe(0);

      expect(scheduleFirstEmail).not.toHaveBeenCalled();
      expect(storageClient.objects.insert).toHaveBeenCalledTimes(1);
      expect(storageClient.objects.insert).toHaveBeenCalledWith({
        bucket: stateObjectLocation.bucket,
        name: stateObjectLocation.object,
        media: {
          mimeType: 'application/json',
          body: serializeScanRange('2016-02-29', '2016-03-06'),
        },
      });
    });

    it('saves the scanned range after enqueueing notification emails', async () => {
      mockBigQuery([{ uid }]);
      storageClient.objects.insert.mockResolvedValue({ data: {} });

      await expect(
        runScript(
          '--dry-run',
          'false',
          '--enqueue-emails',
          'true',
          '--state-file',
          stateFileUrl
        )
      ).resolves.toBe(0);

      expect(scheduleFirstEmail).toHaveBeenCalledTimes(1);
      expect(scheduleFirstEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { uid },
          taskOptions: { taskId: `${uid}-inactive-delete-first-email` },
        })
      );
      expect(storageClient.objects.insert).toHaveBeenCalledTimes(1);
      expect(storageClient.objects.insert.mock.calls[0][0].media?.body).toBe(
        serializeScanRange('2016-02-29', '2016-03-06')
      );
      expect(
        storageClient.objects.insert.mock.invocationCallOrder[0]
      ).toBeGreaterThan(scheduleFirstEmail.mock.invocationCallOrder[0]);
    });

    it('propagates a checkpoint write failure', async () => {
      mockBigQuery([]);
      storageClient.objects.insert.mockRejectedValue(httpError(412));

      await expect(
        runScript(
          '--dry-run',
          'false',
          '--enqueue-emails',
          'true',
          '--state-file',
          stateFileUrl
        )
      ).rejects.toThrow('HTTP 412');
    });
  });

  describe('when the state object is missing', () => {
    beforeEach(() => {
      storageClient.objects.get.mockRejectedValue(httpError(404));
    });

    it('requires an explicit date range to bootstrap the checkpoint', async () => {
      await expect(runScript('--state-file', stateFileUrl)).rejects.toThrow(
        'No previous scan range found.'
      );
      expect(storageClient.objects.insert).not.toHaveBeenCalled();
    });

    it('creates the checkpoint from the explicit dates after a successful scan', async () => {
      mockBigQuery([]);
      storageClient.objects.insert.mockResolvedValue({ data: {} });

      await expect(
        runScript(
          '--dry-run',
          'false',
          '--enqueue-emails',
          'true',
          '--state-file',
          stateFileUrl,
          '--start-date',
          '2016-03-07',
          '--end-date',
          '2016-03-13'
        )
      ).resolves.toBe(0);

      expect(storageClient.objects.insert).toHaveBeenCalledTimes(1);
      expect(storageClient.objects.insert.mock.calls[0][0].media?.body).toBe(
        serializeScanRange('2016-03-07', '2016-03-13')
      );
    });
  });

  describe('when no state file is configured', () => {
    it('makes no GCS calls', async () => {
      mockBigQuery([]);

      await expect(
        runScript(
          '--dry-run',
          'false',
          '--enqueue-emails',
          'true',
          '--start-date',
          '2016-03-07',
          '--end-date',
          '2016-03-13'
        )
      ).resolves.toBe(0);

      expect(google.storage).not.toHaveBeenCalled();
      expect(storageClient.objects.get).not.toHaveBeenCalled();
      expect(storageClient.objects.insert).not.toHaveBeenCalled();
    });
  });

  describe('first email queue capacity', () => {
    const liveRun = [
      '--dry-run',
      'false',
      '--enqueue-emails',
      'true',
      '--state-file',
      stateFileUrl,
      '--threshold',
      `${thresholdDays}`,
    ];

    beforeEach(() => {
      storageClient.objects.get.mockResolvedValue({ data: previousScanRange });
      storageClient.objects.insert.mockResolvedValue({ data: {} });
    });

    it('does not read the queue during a dry run with a threshold', async () => {
      await expect(
        runScript(
          '--state-file',
          stateFileUrl,
          '--threshold',
          `${thresholdDays}`
        )
      ).resolves.toBe(0);

      expect(CloudTasksQueueStatsClientFactory).not.toHaveBeenCalled();
      expect(getQueue).not.toHaveBeenCalled();
    });

    it('scans without checking the queue when no threshold is supplied', async () => {
      const bigQueryClient = mockBigQuery([{ uid }]);

      await expect(
        runScript(
          '--dry-run',
          'false',
          '--enqueue-emails',
          'true',
          '--state-file',
          stateFileUrl
        )
      ).resolves.toBe(0);

      expect(CloudTasksQueueStatsClientFactory).not.toHaveBeenCalled();
      expect(getQueue).not.toHaveBeenCalled();
      expect(bigQueryClient.createQueryJob).toHaveBeenCalledTimes(2);
      expect(scheduleFirstEmail).toHaveBeenCalledTimes(1);
      expect(storageClient.objects.insert).toHaveBeenCalledTimes(1);
    });

    it('requests the configured first-email queue', async () => {
      mockBigQuery([]);

      await expect(runScript(...liveRun)).resolves.toBe(0);

      expect(getQueue).toHaveBeenCalledTimes(1);
      expect(getQueue).toHaveBeenCalledWith(
        expect.objectContaining({ name: firstEmailQueuePath })
      );
    });

    it('scans when estimated drain time is below the threshold', async () => {
      mockQueue(thresholdDays * tasksPerDay - 1);
      const bigQueryClient = mockBigQuery([{ uid }]);

      await expect(runScript(...liveRun)).resolves.toBe(0);

      expect(bigQueryClient.createQueryJob).toHaveBeenCalledTimes(2);
      expect(scheduleFirstEmail).toHaveBeenCalledTimes(1);
      expect(storageClient.objects.insert).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['equals', thresholdDays * tasksPerDay],
      ['exceeds', thresholdDays * tasksPerDay + 1],
    ])(
      'skips when estimated drain time %s the threshold',
      async (_, tasksCount) => {
        mockQueue(tasksCount);
        mockBigQuery([{ uid }]);

        await expect(runScript(...liveRun)).resolves.toBe(0);

        expect(console.log).toHaveBeenCalledWith(
          `Skipping the scan.  The first email queue needs ${
            (tasksCount / tasksPerDay).toFixed(2)
          } days to drain; the threshold is ${thresholdDays} days.`
        );
        expect(BigQuery).not.toHaveBeenCalled();
        expect(scheduleFirstEmail).not.toHaveBeenCalled();
        expect(storageClient.objects.insert).not.toHaveBeenCalled();
      }
    );

    it('does not scan when the queue lookup fails', async () => {
      getQueue.mockRejectedValue(new Error('PERMISSION_DENIED'));
      mockBigQuery([{ uid }]);

      await expect(runScript(...liveRun)).rejects.toThrow('PERMISSION_DENIED');

      expect(BigQuery).not.toHaveBeenCalled();
      expect(scheduleFirstEmail).not.toHaveBeenCalled();
      expect(storageClient.objects.insert).not.toHaveBeenCalled();
    });
  });
});
