/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { MeteringConfig } from './metering.config';
import { MIN_DEDUPE_TTL_SECONDS } from './metering.constants';

function validateConfig(raw: Record<string, unknown>) {
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
    oidc: {
      aud: 'http://127.0.0.1:3000/v1/metering/internal/sweep',
      serviceAccountEmail:
        'metering-task-runner@fxa-dev.iam.gserviceaccount.com',
    },
  };

  const validClickHouse = {
    url: 'https://clickhouse.example.com:8443',
    database: 'metering',
    username: 'metering_rw',
    password: 'super-secret',
    requestTimeoutMs: '10000',
    maxExecutionTimeSeconds: '10',
    maxThreads: '2',
    maxMemoryUsageBytes: '268435456',
    maxBytesBeforeExternalGroupBy: '134217728',
  };

  const validPubSub = {
    projectId: 'fxa-dev',
    topicName: 'metering-events',
    subscriptionName: 'metering-events-clickhouse',
    consumerEnabled: 'false',
    publishBatchSize: '100',
    publishBatchIntervalMs: '50',
    consumerBatchSize: '1000',
    consumerFlushIntervalMs: '5000',
    maxOutstandingMessages: '5000',
  };

  const validSweep = {
    lookbackMs: '90000',
    cooldownMs: '3600000',
    dispatchConcurrency: '20',
  };

  const validRedis = {
    host: 'redis.example.com',
    port: '6379',
    tls: 'false',
    keyPrefix: 'metering:dedupe:',
    claimTtlSeconds: '60',
    dedupeTtlSeconds: '90000',
    connectTimeoutMs: '5000',
    commandTimeoutMs: '2000',
  };

  const base = {
    clients: '{}',
    cloudTasks: validCloudTasks,
    usageGrants: { firestoreCollectionName: 'metering-usage-grants' },
    clickhouse: validClickHouse,
    pubsub: validPubSub,
    redis: validRedis,
    sweep: validSweep,
  };

  it('validates a fully-populated env-shaped config with no errors', () => {
    const { errors } = validateConfig(base);
    expect(errors).toHaveLength(0);
  });

  it('rejects a config missing a nested section', () => {
    const { errors } = validateConfig({ ...base, pubsub: undefined });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('parses a JSON-string clients map into an object', () => {
    const { config, errors } = validateConfig({
      ...base,
      clients: '{"vpn":"super-secret"}',
    });
    expect(errors).toHaveLength(0);
    expect(config.clients).toEqual({ vpn: 'super-secret' });
  });

  it('coerces env-string numbers and booleans into real types', () => {
    const { config, errors } = validateConfig(base);
    expect(errors).toHaveLength(0);
    expect(config.clickhouse.maxMemoryUsageBytes).toBe(268_435_456);
    expect(config.redis.dedupeTtlSeconds).toBe(90_000);
    expect(config.pubsub.consumerEnabled).toBe(false);
    expect(config.cloudTasks.useLocalEmulator).toBe(false);
  });

  it('rejects missing oidc fields when not using the local emulator', () => {
    const { errors } = validateConfig({
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
    const { errors } = validateConfig({
      ...base,
      cloudTasks: {
        ...validCloudTasks,
        useLocalEmulator: 'true',
        oidc: { aud: '', serviceAccountEmail: '' },
      },
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects the local emulator flag when NODE_ENV is production', () => {
    const nodeEnv = process.env['NODE_ENV'];
    process.env['NODE_ENV'] = 'production';
    try {
      const { errors } = validateConfig({
        ...base,
        cloudTasks: { ...validCloudTasks, useLocalEmulator: 'true' },
      });
      expect(errors.length).toBeGreaterThan(0);
    } finally {
      process.env['NODE_ENV'] = nodeEnv;
    }
  });

  it('allows a real cloud tasks config when NODE_ENV is production', () => {
    const nodeEnv = process.env['NODE_ENV'];
    process.env['NODE_ENV'] = 'production';
    try {
      const { errors } = validateConfig(base);
      expect(errors).toHaveLength(0);
    } finally {
      process.env['NODE_ENV'] = nodeEnv;
    }
  });

  it('allows a clickhouse config with no password', () => {
    const { config, errors } = validateConfig({
      ...base,
      clickhouse: { ...validClickHouse, password: undefined },
    });
    expect(errors).toHaveLength(0);
    expect(config.clickhouse.password).toBeUndefined();
  });

  it('rejects a dedupe TTL shorter than the acceptance window plus skew', () => {
    const { errors } = validateConfig({
      ...base,
      redis: {
        ...validRedis,
        dedupeTtlSeconds: String(MIN_DEDUPE_TTL_SECONDS - 1),
      },
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts a dedupe TTL exactly at the acceptance window plus skew', () => {
    const { errors } = validateConfig({
      ...base,
      redis: {
        ...validRedis,
        dedupeTtlSeconds: String(MIN_DEDUPE_TTL_SECONDS),
      },
    });
    expect(errors).toHaveLength(0);
  });
});
