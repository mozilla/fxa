/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { MeteringConfig } from './metering.config';

function validateAsTypedConfig(raw: Record<string, unknown>) {
  const config = plainToClass(MeteringConfig, raw, {
    exposeDefaultValues: true,
  });
  const errors = validateSync(config, {
    forbidUnknownValues: true,
    whitelist: true,
  });
  return { config, errors };
}

describe('MeteringConfig', () => {
  const validCloudTasks = {
    useLocalEmulator: 'false',
    projectId: 'fxa-dev',
    locationId: 'us-central1',
    credentials: { keyFilename: '' },
    oidc: {
      aud: 'http://127.0.0.1:3000/v1/metering/internal/threshold-check',
      serviceAccountEmail:
        'metering-task-runner@fxa-dev.iam.gserviceaccount.com',
    },
    threshold: {
      taskUrl: 'http://127.0.0.1:3000/v1/metering/internal/threshold-check',
      queueName: 'metering-threshold-checks',
      bucketSizeMs: '300000',
      scheduleDelayMs: '420000',
    },
  };

  const base = {
    openmeterBaseUrl: 'http://127.0.0.1:48888',
    clients: '{}',
    cloudTasks: validCloudTasks,
  };

  it('validates a fully-populated env-shaped config with no errors', () => {
    const { config, errors } = validateAsTypedConfig({
      ...base,
      openmeterApiKey: '',
      buffer: {
        maxBatchSize: '100',
        maxIntervalMs: '100',
        maxQueueSize: '10000',
      },
    });
    expect(errors).toHaveLength(0);
    expect(config.buffer?.maxBatchSize).toBe(100);
    expect(config.cloudTasks.threshold.bucketSizeMs).toBe(300000);
  });

  it('parses a JSON-string clients map into an object', () => {
    const { config, errors } = validateAsTypedConfig({
      ...base,
      clients: '{"vpn":"super-secret"}',
    });
    expect(errors).toHaveLength(0);
    expect(config.clients).toEqual({ vpn: 'super-secret' });
  });

  it('accepts an empty clients map from an env string', () => {
    const { config, errors } = validateAsTypedConfig(base);
    expect(errors).toHaveLength(0);
    expect(config.clients).toEqual({});
  });

  it('coerces a string-valued useLocalEmulator from an env value', () => {
    const { config, errors } = validateAsTypedConfig({
      ...base,
      cloudTasks: { ...validCloudTasks, useLocalEmulator: 'true' },
    });
    expect(errors).toHaveLength(0);
    expect(config.cloudTasks.useLocalEmulator).toBe(true);
  });

  it('coerces "false" to a real boolean rather than a truthy string', () => {
    const { config } = validateAsTypedConfig(base);
    expect(config.cloudTasks.useLocalEmulator).toBe(false);
  });

  it('rejects a threshold whose scheduleDelayMs is not greater than bucketSizeMs', () => {
    const { errors } = validateAsTypedConfig({
      ...base,
      cloudTasks: {
        ...validCloudTasks,
        threshold: {
          ...validCloudTasks.threshold,
          bucketSizeMs: '420000',
          scheduleDelayMs: '420000',
        },
      },
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts a threshold whose scheduleDelayMs is just greater than bucketSizeMs', () => {
    const { errors } = validateAsTypedConfig({
      ...base,
      cloudTasks: {
        ...validCloudTasks,
        threshold: {
          ...validCloudTasks.threshold,
          bucketSizeMs: '300000',
          scheduleDelayMs: '300001',
        },
      },
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects a config without cloudTasks', () => {
    const { errors } = validateAsTypedConfig({
      openmeterBaseUrl: 'http://127.0.0.1:48888',
      clients: '{}',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects an empty cloudTasks.projectId', () => {
    const { errors } = validateAsTypedConfig({
      ...base,
      cloudTasks: { ...validCloudTasks, projectId: '' },
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects an empty cloudTasks.locationId', () => {
    const { errors } = validateAsTypedConfig({
      ...base,
      cloudTasks: { ...validCloudTasks, locationId: '' },
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects an empty threshold.taskUrl', () => {
    const { errors } = validateAsTypedConfig({
      ...base,
      cloudTasks: {
        ...validCloudTasks,
        threshold: { ...validCloudTasks.threshold, taskUrl: '' },
      },
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects an empty threshold.queueName', () => {
    const { errors } = validateAsTypedConfig({
      ...base,
      cloudTasks: {
        ...validCloudTasks,
        threshold: { ...validCloudTasks.threshold, queueName: '' },
      },
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects missing oidc fields when not using the local emulator', () => {
    const { errors } = validateAsTypedConfig({
      ...base,
      cloudTasks: {
        ...validCloudTasks,
        useLocalEmulator: 'false',
        oidc: { aud: '', serviceAccountEmail: '' },
      },
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('allows missing oidc fields when using the local emulator', () => {
    const { errors } = validateAsTypedConfig({
      ...base,
      cloudTasks: {
        ...validCloudTasks,
        useLocalEmulator: 'true',
        oidc: { aud: '', serviceAccountEmail: '' },
      },
    });
    expect(errors).toHaveLength(0);
  });
});
