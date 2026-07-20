/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'jsdom-global/register';
import * as Sentry from '@sentry/browser';
import sentryMetrics, { _Sentry } from './browser';
import { SentryConfigOpts } from './models/SentryConfigOpts';
import { Logger } from './sentry.types';

const sinon = require('sinon');
const sandbox = sinon.createSandbox();

const config: SentryConfigOpts = {
  release: 'v0.0.0',
  sentry: {
    dsn: 'https://public:private@host:8080/1',
    env: 'test',
    clientName: 'fxa-shared-testing',
    sampleRate: 0,
  },
};
const logger: Logger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

describe('sentry/browser', () => {
  beforeAll(() => {
    // Reduce console log noise in test output
    sandbox.spy(console, 'error');
  });

  beforeEach(() => {
    // Make sure it's enabled by default
    sentryMetrics.enable();
  });

  afterAll(() => {
    sandbox.restore();
  });

  describe('init', () => {
    it('properly configures with dsn', () => {
      sentryMetrics.configure(config, logger);
    });
  });

  describe('beforeSend', () => {
    beforeAll(() => {
      sentryMetrics.configure(config, logger);
    });

    it('works without request url', () => {
      const data = {
        key: 'value',
      } as Sentry.Event;

      const resultData = sentryMetrics.__beforeSend(config, data, {});

      expect(data).toEqual(resultData);
    });

    it('fingerprints errno', () => {
      const data = {
        request: {
          url: 'https://example.com',
        },
        tags: {
          errno: '100',
        },
      } as Sentry.Event;

      const resultData = sentryMetrics.__beforeSend(config, data, {});
      expect(resultData?.fingerprint?.[0]).toEqual('errno100');
      expect(resultData?.level).toEqual('info');
    });
  });

  describe('captureException', () => {
    it('calls Sentry.captureException', () => {
      const sentryCaptureException = sinon.stub(_Sentry, 'captureException');
      sentryMetrics.captureException(new Error('testo'));
      sinon.assert.calledOnce(sentryCaptureException);
      sentryCaptureException.restore();
    });
  });

  describe('disable / enables', () => {
    it('enables', () => {
      sentryMetrics.enable();
      expect(sentryMetrics.__sentryEnabled()).toBeTruthy();
    });

    it('disables', () => {
      sentryMetrics.disable();
      expect(sentryMetrics.__sentryEnabled()).toBeFalsy();
    });

    it('will return null from before send when disabled', () => {
      sentryMetrics.disable();
      expect(sentryMetrics.__beforeSend({}, {}, {})).toBeNull();
    });
  });
});
