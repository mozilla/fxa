/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { initializeNimbus } from '.';

jest.mock('@sentry/browser', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

const context = { language: 'en', region: 'US' };

describe('initializeNimbus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null without a Sentry exception when the fetch has a network failure', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        new TypeError('NetworkError when attempting to fetch resource.')
      );

    expect(await initializeNimbus('abc', false, context)).toBeNull();
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: 'nimbus-experiments',
      level: 'warning',
      message: 'Nimbus experiments fetch failed',
    });
  });

  it('returns null and reports to Sentry when the response JSON cannot be parsed', async () => {
    const parseError = new SyntaxError('Unexpected token');
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockRejectedValue(parseError),
    });

    expect(await initializeNimbus('abc', false, context)).toBeNull();
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(parseError, {
      tags: { source: 'nimbus-experiments' },
    });
  });

  it('returns the parsed result for a 200 response', async () => {
    const result = { features: { foo: true }, nimbusUserId: 'abc' };
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue(result),
    });

    expect(await initializeNimbus('abc', false, context)).toEqual(result);
  });

  it('returns null without a Sentry call for a non-200 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 500 });

    expect(await initializeNimbus('abc', false, context)).toBeNull();
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
  });
});
