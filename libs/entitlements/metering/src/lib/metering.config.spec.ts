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
  const base = {
    openmeterBaseUrl: 'http://127.0.0.1:48888',
    clients: '{}',
  };

  it('validates a fully-populated env-shaped config with no errors', () => {
    const { config, errors } = validateAsTypedConfig({
      openmeterBaseUrl: 'http://127.0.0.1:48888',
      openmeterApiKey: '',
      clients: '{}',
      buffer: {
        maxBatchSize: '100',
        maxIntervalMs: '100',
        maxQueueSize: '10000',
      },
      cloudTasks: {
        useLocalEmulator: 'true',
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
      },
    });
    expect(errors).toHaveLength(0);
    expect(config.cloudTasks?.useLocalEmulator).toBe(true);
    expect(config.buffer?.maxBatchSize).toBe(100);
    expect(config.cloudTasks?.threshold.bucketSizeMs).toBe(300000);
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
      cloudTasks: {
        useLocalEmulator: 'true',
        threshold: {
          bucketSizeMs: '300000',
          scheduleDelayMs: '420000',
        },
      },
    });
    expect(errors).toHaveLength(0);
    expect(config.cloudTasks?.useLocalEmulator).toBe(true);
  });

  it('coerces "false" to a real boolean rather than a truthy string', () => {
    const { config } = validateAsTypedConfig({
      ...base,
      cloudTasks: { useLocalEmulator: 'false' },
    });
    expect(config.cloudTasks?.useLocalEmulator).toBe(false);
  });

  it('rejects a threshold whose scheduleDelayMs is not greater than bucketSizeMs', () => {
    const { errors } = validateAsTypedConfig({
      ...base,
      cloudTasks: {
        threshold: {
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
        threshold: {
          bucketSizeMs: '300000',
          scheduleDelayMs: '300001',
        },
      },
    });
    expect(errors).toHaveLength(0);
  });
});
