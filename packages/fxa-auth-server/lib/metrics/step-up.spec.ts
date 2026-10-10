/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  recordStepUpMetrics,
  StepUpEvaluation,
  StepUpMetricsDeps,
  StepUpReason,
} from './step-up';

const CLIENT_ID = '98e6508e88680e1a';
const UID = 'f0e1d2c3b4a596879685746352413021';
const TAGS = { clientId: CLIENT_ID, service: 'sync' };
const REASONS: StepUpReason[] = [
  'acr_values_unmet',
  'max_age_stale',
  'auth_time_missing',
];

const makeDeps = () => {
  const request = {
    app: { clientIdTag: CLIENT_ID, serviceTag: 'sync', metricsContext: {} },
    payload: {},
    query: {},
  } as unknown as StepUpMetricsDeps['request'];
  const statsd = { increment: jest.fn(), histogram: jest.fn() };
  const glean = {
    stepUpAuth: {
      requested: jest.fn().mockResolvedValue(undefined),
      satisfied: jest.fn().mockResolvedValue(undefined),
      rejected: jest.fn().mockResolvedValue(undefined),
    },
  };
  const log = { warn: jest.fn() };
  const deps = {
    request,
    uid: UID,
    clientId: CLIENT_ID,
    statsd,
    glean,
    log,
  } as unknown as StepUpMetricsDeps;
  return { deps, request, statsd, glean, log };
};

const emitted = (statsd: { increment: jest.Mock }) =>
  statsd.increment.mock.calls.map(([name]) => name);

describe('recordStepUpMetrics', () => {
  it('emits nothing when step-up was not requested', () => {
    const { deps, statsd, glean } = makeDeps();

    recordStepUpMetrics({ requested: false, satisfied: true }, deps);

    expect(statsd.increment).not.toHaveBeenCalled();
    expect(statsd.histogram).not.toHaveBeenCalled();
    expect(glean.stepUpAuth.requested).not.toHaveBeenCalled();
  });

  it('counts a satisfied evaluation as requested and satisfied', () => {
    const { deps, request, statsd, glean } = makeDeps();

    recordStepUpMetrics(
      { requested: true, satisfied: true, authAgeSeconds: 42 },
      deps
    );

    expect(emitted(statsd)).toEqual([
      'oauth.step_up.requested',
      'oauth.step_up.satisfied',
    ]);
    expect(glean.stepUpAuth.satisfied).toHaveBeenCalledWith(request, {
      uid: UID,
    });
    expect(glean.stepUpAuth.rejected).not.toHaveBeenCalled();
  });

  it.each(REASONS)('counts a %s rejection with its reason', (reason) => {
    const { deps, request, statsd, glean } = makeDeps();

    recordStepUpMetrics(
      { requested: true, satisfied: false, reason, authAgeSeconds: 9000 },
      deps
    );

    expect(emitted(statsd)).toEqual([
      'oauth.step_up.requested',
      'oauth.step_up.rejected',
    ]);
    expect(statsd.increment).toHaveBeenLastCalledWith(
      'oauth.step_up.rejected',
      {
        ...TAGS,
        reason,
      }
    );
    expect(glean.stepUpAuth.rejected).toHaveBeenCalledWith(request, {
      uid: UID,
      reason,
    });
    expect(glean.stepUpAuth.satisfied).not.toHaveBeenCalled();
  });

  it('tags with the resolved client id and the service dimension', () => {
    const { deps, statsd } = makeDeps();

    recordStepUpMetrics({ requested: true, satisfied: true }, deps);

    expect(statsd.increment).toHaveBeenCalledWith(
      'oauth.step_up.requested',
      TAGS
    );
  });

  it('records the session auth age as a histogram', () => {
    const { deps, statsd } = makeDeps();

    recordStepUpMetrics(
      { requested: true, satisfied: true, authAgeSeconds: 0 },
      deps
    );

    expect(statsd.histogram).toHaveBeenCalledWith(
      'oauth.step_up.auth_age',
      0,
      TAGS
    );
  });

  it('skips the histogram when the session carries no auth time', () => {
    const { deps, statsd } = makeDeps();

    recordStepUpMetrics(
      { requested: true, satisfied: false, reason: 'auth_time_missing' },
      deps
    );

    expect(statsd.histogram).not.toHaveBeenCalled();
  });

  it.each(['requested', 'satisfied'] as const)(
    'reports a rejected Glean %s promise instead of dropping it',
    async (event) => {
      const { deps, statsd, glean, log } = makeDeps();
      glean.stepUpAuth[event].mockRejectedValue(new Error('glean down'));

      recordStepUpMetrics({ requested: true, satisfied: true }, deps);
      await new Promise(process.nextTick);

      expect(statsd.increment).toHaveBeenCalledWith(
        'oauth.step_up.telemetry_failed',
        { clientId: CLIENT_ID }
      );
      expect(log.warn).toHaveBeenCalledWith('oauth.step_up.telemetry_failed', {
        err: 'Error',
      });
    }
  );

  it('reports a rejected Glean rejection ping instead of dropping it', async () => {
    const { deps, glean, log } = makeDeps();
    glean.stepUpAuth.rejected.mockRejectedValue(new Error('glean down'));

    recordStepUpMetrics(
      { requested: true, satisfied: false, reason: 'max_age_stale' },
      deps
    );
    await new Promise(process.nextTick);

    expect(log.warn).toHaveBeenCalledWith('oauth.step_up.telemetry_failed', {
      err: 'Error',
    });
  });

  it('leaves no unhandled rejection when Glean fails', async () => {
    const { deps, glean } = makeDeps();
    glean.stepUpAuth.requested.mockRejectedValue(new Error('glean down'));
    const unhandled = jest.fn();
    process.on('unhandledRejection', unhandled);

    try {
      recordStepUpMetrics({ requested: true, satisfied: true }, deps);
      await new Promise((resolve) => setImmediate(resolve));
    } finally {
      process.off('unhandledRejection', unhandled);
    }

    expect(unhandled).not.toHaveBeenCalled();
  });

  it('still emits Glean when statsd throws', () => {
    const { deps, statsd, glean } = makeDeps();
    statsd.increment.mockImplementation(() => {
      throw new Error('statsd down');
    });

    expect(() =>
      recordStepUpMetrics({ requested: true, satisfied: true }, deps)
    ).not.toThrow();
    expect(glean.stepUpAuth.requested).toHaveBeenCalled();
  });

  it('still emits statsd when the Glean group is missing', () => {
    const { deps: base, statsd } = makeDeps();
    const deps = { ...base, glean: {} as any };

    expect(() =>
      recordStepUpMetrics({ requested: true, satisfied: true }, deps)
    ).not.toThrow();
    expect(emitted(statsd)).toEqual([
      'oauth.step_up.requested',
      'oauth.step_up.satisfied',
      'oauth.step_up.telemetry_failed',
    ]);
  });

  it('does not throw when statsd and glean are absent', () => {
    const { request } = makeDeps();
    const evaluation: StepUpEvaluation = {
      requested: true,
      satisfied: false,
      reason: 'max_age_stale',
    };

    expect(() =>
      recordStepUpMetrics(evaluation, {
        request,
        uid: UID,
        clientId: CLIENT_ID,
      })
    ).not.toThrow();
  });
});
