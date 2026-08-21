/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const waict = require('./waict');
const { buildHeaderValue, REPORT_ENDPOINT_NAME } = waict;

function baseConfig(overrides = {}) {
  return {
    manifestPath: '/waict-manifest.json',
    maxAge: 0,
    blockedDestinations: ['script'],
    reportUri: '/_/waict-violation',
    ...overrides,
  };
}

describe('waict buildHeaderValue', () => {
  it('emits the structured-field parameters in report mode', () => {
    const value = buildHeaderValue(baseConfig());

    // Order matters for readability but the spec parses by name; assert each
    // parameter is present and well-formed.
    expect(value).toContain('max-age=0');
    expect(value).toContain('mode=report');
    expect(value).toContain('blocked-destinations=(script)');
    expect(value).toContain(`endpoints=(${REPORT_ENDPOINT_NAME})`);
    // manifest is an sf-string and must be double-quoted.
    expect(value).toContain('manifest="/waict-manifest.json"');
  });

  it('is always non-blocking (mode=report), never enforcing', () => {
    const value = buildHeaderValue(baseConfig({ maxAge: 86400 }));
    expect(value).toContain('mode=report');
    expect(value).not.toContain('mode=enforce');
  });

  it('joins multiple blocked destinations as a space-separated inner list', () => {
    const value = buildHeaderValue(
      baseConfig({ blockedDestinations: ['script', 'style'] })
    );
    expect(value).toContain('blocked-destinations=(script style)');
  });

  it('reflects the configured max-age', () => {
    const value = buildHeaderValue(baseConfig({ maxAge: 3600 }));
    expect(value).toContain('max-age=3600');
  });

  it('quotes the configured manifest path', () => {
    const value = buildHeaderValue(
      baseConfig({ manifestPath: '/custom/manifest.json' })
    );
    expect(value).toContain('manifest="/custom/manifest.json"');
  });
});

describe('waict middleware', () => {
  // Build a minimal response object compatible with the `on-headers` module
  // used by html-middleware: it wraps res.writeHead and fires its listener
  // synchronously when writeHead is called. We drive that by setting the
  // content-type header, then calling writeHead to simulate response start.
  function mockRes() {
    const headers = {};
    return {
      setHeader: jest.fn((name, val) => {
        headers[name.toLowerCase()] = val;
      }),
      getHeader: jest.fn((name) => headers[name.toLowerCase()]),
      removeHeader: jest.fn((name) => {
        delete headers[name.toLowerCase()];
      }),
      writeHead: jest.fn(),
    };
  }

  it('calls next immediately without waiting for the response', () => {
    const mw = waict(baseConfig({ statsd: { increment: jest.fn() } }));
    const next = jest.fn();

    mw({}, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('sets the WAICT and Reporting-Endpoints headers on HTML responses', () => {
    const statsd = { increment: jest.fn() };
    const mw = waict(baseConfig({ statsd }));
    const res = mockRes();

    mw({}, res, jest.fn());

    // Simulate an HTML document response.
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.writeHead(200);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Integrity-Policy-WAICT-v1',
      expect.stringContaining('mode=report')
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Reporting-Endpoints',
      `${REPORT_ENDPOINT_NAME}="/_/waict-violation"`
    );
    expect(statsd.increment).toHaveBeenCalledWith('waict.document_served');
  });

  it('does not set WAICT headers on non-HTML responses', () => {
    const statsd = { increment: jest.fn() };
    const mw = waict(baseConfig({ statsd }));
    const res = mockRes();

    mw({}, res, jest.fn());

    // A JSON/API response should be left untouched.
    res.setHeader('content-type', 'application/json');
    res.writeHead(200);

    expect(res.setHeader).not.toHaveBeenCalledWith(
      'Integrity-Policy-WAICT-v1',
      expect.anything()
    );
    expect(statsd.increment).not.toHaveBeenCalled();
  });

  it('does not throw when statsd is not configured', () => {
    const mw = waict(baseConfig());
    const res = mockRes();

    mw({}, res, jest.fn());

    res.setHeader('content-type', 'text/html');
    expect(() => res.writeHead(200)).not.toThrow();
    expect(res.setHeader).toHaveBeenCalledWith(
      'Integrity-Policy-WAICT-v1',
      expect.any(String)
    );
  });
});
