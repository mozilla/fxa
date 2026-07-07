/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
jest.mock('../logging/log', () => () => mockLogger);

const postWaictReport = require('./post-waict-report');

const CANARY_PATH = '/waict-canary.js';

function build(overrides = {}) {
  const statsd = { increment: jest.fn() };
  const route = postWaictReport({
    op: 'server.waict.violation',
    canaryOp: 'server.waict.canary.success',
    path: '/_/waict-violation',
    statsd,
    canaryPath: CANARY_PATH,
    ...overrides,
  });
  return { route, statsd };
}

function mockReqRes(body, userAgent = 'Firefox') {
  const req = {
    body,
    get: jest.fn((h) => (h === 'User-Agent' ? userAgent : undefined)),
  };
  const res = { json: jest.fn() };
  return { req, res };
}

// A well-formed WAICT violation report body (browser sends camelCase).
function violationReport(overrides = {}) {
  return {
    type: 'waict-violation',
    body: {
      blockedURL: 'https://accounts.firefox.com/scripts/app.js',
      documentURL: 'https://accounts.firefox.com/signin',
      reason: 'missing_from_manifest',
      destination: 'script',
      ...overrides,
    },
  };
}

describe('post-waict-report route', () => {
  it('is a POST route at the configured path', () => {
    const { route } = build();
    expect(route.method).toBe('post');
    expect(route.path).toBe('/_/waict-violation');
  });

  it('acknowledges the request immediately with success', () => {
    const { route } = build();
    const { req, res } = mockReqRes([violationReport()]);
    route.process(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('logs a violation and increments a counter tagged by reason', () => {
    const { route, statsd } = build();
    const { req, res } = mockReqRes([violationReport()]);

    route.process(req, res);

    expect(statsd.increment).toHaveBeenCalledWith('waict.violation', 1, {
      reason: 'missing_from_manifest',
    });
    expect(mockLogger.info).toHaveBeenCalledWith(
      'server.waict.violation',
      expect.objectContaining({
        reason: 'missing_from_manifest',
        blocked: 'https://accounts.firefox.com/scripts/app.js',
        destination: 'script',
      })
    );
  });

  it('defaults the statsd reason tag to "unknown" when reason is absent', () => {
    const { route, statsd } = build();
    const report = violationReport();
    delete report.body.reason;
    const { req, res } = mockReqRes([report]);

    route.process(req, res);

    expect(statsd.increment).toHaveBeenCalledWith('waict.violation', 1, {
      reason: 'unknown',
    });
  });

  it('buckets an unknown reason under "other" to bound tag cardinality', () => {
    const { route, statsd } = build();
    const report = violationReport({ reason: 'totally-made-up-reason' });
    const { req, res } = mockReqRes([report]);

    route.process(req, res);

    expect(statsd.increment).toHaveBeenCalledWith('waict.violation', 1, {
      reason: 'other',
    });
    // The raw reason is still logged (bounded by validation in production).
    const logged = mockLogger.info.mock.calls.find(
      (c) => c[0] === 'server.waict.violation'
    )[1];
    expect(logged.reason).toBe('totally-made-up-reason');
  });

  it('treats a canary report as a pipeline-alive success, not a violation', () => {
    const { route, statsd } = build();
    const report = violationReport({
      blockedURL: `https://accounts.firefox.com${CANARY_PATH}`,
    });
    const { req, res } = mockReqRes([report]);

    route.process(req, res);

    expect(statsd.increment).toHaveBeenCalledWith('waict.canary.success');
    expect(statsd.increment).not.toHaveBeenCalledWith(
      'waict.violation',
      expect.anything(),
      expect.anything()
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      'server.waict.canary.success',
      expect.any(Object)
    );
  });

  it('matches the canary by pathname even with a query string', () => {
    const { route, statsd } = build();
    const report = violationReport({
      blockedURL: `https://accounts.firefox.com${CANARY_PATH}?v=123`,
    });
    const { req, res } = mockReqRes([report]);

    route.process(req, res);

    expect(statsd.increment).toHaveBeenCalledWith('waict.canary.success');
  });

  it('strips email and uid query params from logged URLs', () => {
    const { route } = build();
    const report = violationReport({
      documentURL:
        'https://accounts.firefox.com/signin?email=user@example.com&uid=deadbeef&foo=bar',
      blockedURL:
        'https://accounts.firefox.com/scripts/app.js?uid=deadbeef',
    });
    const { req, res } = mockReqRes([report]);

    route.process(req, res);

    const logged = mockLogger.info.mock.calls.find(
      (c) => c[0] === 'server.waict.violation'
    )[1];
    expect(logged.documentURL).not.toContain('email=');
    expect(logged.documentURL).not.toContain('uid=');
    expect(logged.documentURL).not.toContain('user@example.com');
    // Non-PII params are preserved.
    expect(logged.documentURL).toContain('foo=bar');
    expect(logged.blocked).not.toContain('uid=');
  });

  it('normalizes a single (non-array) report object', () => {
    const { route, statsd } = build();
    const { req, res } = mockReqRes(violationReport());

    route.process(req, res);

    expect(statsd.increment).toHaveBeenCalledWith('waict.violation', 1, {
      reason: 'missing_from_manifest',
    });
  });

  it('processes every report in a batch', () => {
    const { route, statsd } = build();
    const { req, res } = mockReqRes([
      violationReport({ reason: 'missing_from_manifest' }),
      violationReport({ reason: 'no_manifest_match' }),
    ]);

    route.process(req, res);

    expect(statsd.increment).toHaveBeenCalledWith('waict.violation', 1, {
      reason: 'missing_from_manifest',
    });
    expect(statsd.increment).toHaveBeenCalledWith('waict.violation', 1, {
      reason: 'no_manifest_match',
    });
  });

  it('skips null / non-object report entries without throwing', () => {
    const { route, statsd } = build();
    const { req, res } = mockReqRes([null, 'garbage', violationReport()]);

    expect(() => route.process(req, res)).not.toThrow();
    // Only the one valid report produced a violation counter.
    expect(
      statsd.increment.mock.calls.filter((c) => c[0] === 'waict.violation')
        .length
    ).toBe(1);
  });

  it('handles a report with no URL fields without throwing', () => {
    const { route, statsd } = build();
    // A malformed/minimal report: no blockedURL, no documentURL.
    const { req, res } = mockReqRes([{ type: 'waict-violation', body: {} }]);

    expect(() => route.process(req, res)).not.toThrow();
    // With no blockedURL it is not a canary, so it counts as a violation.
    expect(statsd.increment).toHaveBeenCalledWith('waict.violation', 1, {
      reason: 'unknown',
    });
    const logged = mockLogger.info.mock.calls.find(
      (c) => c[0] === 'server.waict.violation'
    )[1];
    expect(logged.documentURL).toBe('');
  });

  it('accepts snake_case field aliases (blocked_url)', () => {
    const { route, statsd } = build();
    const { req, res } = mockReqRes([
      {
        type: 'waict-violation',
        body: {
          blocked_url: `https://accounts.firefox.com${CANARY_PATH}`,
          reason: 'missing_from_manifest',
        },
      },
    ]);

    route.process(req, res);

    // blocked_url pointing at the canary path is still recognized as canary.
    expect(statsd.increment).toHaveBeenCalledWith('waict.canary.success');
  });

  it('does not throw when statsd is not configured', () => {
    const { route } = build({ statsd: undefined });
    const { req, res } = mockReqRes([violationReport()]);
    expect(() => route.process(req, res)).not.toThrow();
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('does not throw if processing a report throws (response already sent)', () => {
    const { route } = build();
    const { req, res } = mockReqRes([violationReport()]);
    // Make logger.info throw once to simulate a mid-loop failure after the
    // response was already sent; the guard must swallow it.
    mockLogger.info.mockImplementationOnce(() => {
      throw new Error('boom');
    });

    expect(() => route.process(req, res)).not.toThrow();
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'server.waict.report.error',
      expect.any(Object)
    );
  });
});

describe('post-waict-report BODY_SCHEMA validation', () => {
  // Mirror the celebrate options used by the routing layer (stripUnknown for
  // objects, not arrays) so this exercises real request-validation behavior.
  const OPTS = { stripUnknown: { arrays: false, objects: true } };

  function validate(body) {
    return postWaictReport.BODY_SCHEMA.validate(body, OPTS);
  }

  it('accepts an array of well-formed reports', () => {
    const { error } = validate([violationReport(), violationReport()]);
    expect(error).toBeUndefined();
  });

  it('accepts a single (non-array) report object', () => {
    const { error } = validate(violationReport());
    expect(error).toBeUndefined();
  });

  it('rejects an array larger than the per-request cap', () => {
    const tooMany = Array.from(
      { length: postWaictReport.MAX_REPORTS_PER_REQUEST + 1 },
      () => violationReport()
    );
    const { error } = validate(tooMany);
    expect(error).toBeDefined();
  });

  it('strips unknown keys from a report body', () => {
    const report = violationReport();
    report.body.evil = 'x'.repeat(50);
    report.attacker = 'y'.repeat(50);
    const { value, error } = validate([report]);

    expect(error).toBeUndefined();
    expect(value[0].body.evil).toBeUndefined();
    expect(value[0].attacker).toBeUndefined();
    // Declared fields survive.
    expect(value[0].body.reason).toBe('missing_from_manifest');
  });

  it('rejects an over-long string field', () => {
    const report = violationReport({ reason: 'x'.repeat(2000) });
    const { error } = validate([report]);
    expect(error).toBeDefined();
  });
});
