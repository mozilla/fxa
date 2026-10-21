/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'jsdom-global/register';
import * as Sentry from '@sentry/browser';
import {
  disableSentry,
  enableSentry,
  SentryConfigOpts,
} from '@fxa/shared/sentry-utils';
import sentryMetrics, { captureException, initSentry } from './browser';
import packageDefault from '../index';

jest.mock('@sentry/browser', () => {
  const actual = jest.requireActual('@sentry/browser');
  return {
    ...actual,
    init: jest.fn(),
    captureException: jest.fn(),
  };
});

const config: SentryConfigOpts = {
  release: 'v0.0.0',
  sentry: {
    dsn: 'https://public:private@host:8080/1',
    env: 'test',
    clientName: 'fxa-shared-testing',
    sampleRate: 0,
  },
};

describe('sentry/browser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    enableSentry();
  });

  describe('initSentry', () => {
    it('initializes', () => {
      const spy = jest.spyOn(Sentry, 'init');
      initSentry(config);
      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockReset();
      spy.mockRestore();
    });

    it('adds no integrations when tracing is not configured', () => {
      initSentry(config);
      expect(jest.mocked(Sentry.init).mock.calls[0][0]?.integrations).toEqual(
        []
      );
    });

    it('adds browser tracing when tracesSampleRate is set', () => {
      initSentry({
        ...config,
        sentry: { ...config.sentry, tracesSampleRate: 0.5 },
      });
      expect(jest.mocked(Sentry.init).mock.calls[0][0]?.integrations).toEqual([
        expect.objectContaining({ name: 'BrowserTracing' }),
      ]);
    });

    it('adds browser tracing when tracesSampler is set', () => {
      initSentry({
        ...config,
        sentry: { ...config.sentry, tracesSampler: () => 1 },
      });
      expect(jest.mocked(Sentry.init).mock.calls[0][0]?.integrations).toEqual([
        expect.objectContaining({ name: 'BrowserTracing' }),
      ]);
    });
  });

  describe('default export', () => {
    it('maps the legacy API', () => {
      expect(sentryMetrics).toEqual({
        configure: initSentry,
        captureException,
        enable: enableSentry,
        disable: disableSentry,
      });
    });

    it('is re-exported from the package entrypoint', () => {
      expect(packageDefault).toBe(sentryMetrics);
    });
  });

  describe('captureException', () => {
    it('calls Sentry.captureException', () => {
      const spy = jest.spyOn(Sentry, 'captureException');
      captureException(new Error('testo'));
      expect(spy).toHaveBeenCalled();

      spy.mockReset();
      spy.mockRestore();
    });
  });
});
