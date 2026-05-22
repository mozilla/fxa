/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import {
  MeteringCloudTasksConfig,
  MeteringCloudTasksThresholdConfig,
  MeteringConfig,
} from '../metering.config';
import { requireMeteringCloudTasksConfig } from './requireMeteringCloudTasksConfig';

describe('requireMeteringCloudTasksConfig', () => {
  function configWith(
    threshold: Partial<MeteringCloudTasksThresholdConfig> = {}
  ): MeteringConfig {
    const cloudTasks = new MeteringCloudTasksConfig();
    Object.assign(cloudTasks.threshold, {
      taskUrl: 'https://h.example/t',
      queueName: 'q',
      scheduleDelayMs: 1000,
      ...threshold,
    });
    return {
      openmeterBaseUrl: 'http://example.com',
      clients: {},
      cloudTasks,
    };
  }

  it('throws when cloudTasks is missing', () => {
    const meteringConfig: MeteringConfig = {
      openmeterBaseUrl: 'http://example.com',
      clients: {},
    };
    expect(() => requireMeteringCloudTasksConfig(meteringConfig)).toThrow(
      /cloudTasks is required/
    );
  });

  it('throws when threshold.queueName is empty', () => {
    expect(() =>
      requireMeteringCloudTasksConfig(configWith({ queueName: '' }))
    ).toThrow(/queueName is required/);
  });

  it('throws when threshold.taskUrl is empty', () => {
    expect(() =>
      requireMeteringCloudTasksConfig(configWith({ taskUrl: '' }))
    ).toThrow(/taskUrl is required/);
  });

  it('returns the cloudTasks block on success', () => {
    const result = requireMeteringCloudTasksConfig(configWith());
    expect(result.threshold.queueName).toBe('q');
    expect(result.threshold.taskUrl).toBe('https://h.example/t');
  });
});
