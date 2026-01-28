/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'jsdom-global/register';
import { assert } from 'chai';
import * as Sentry from '@sentry/browser';
import sentryMetrics, { _Sentry } from '../../sentry/browser';
import { SentryConfigOpts } from '../../sentry';
import { ILogger } from '../../log';
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
const logger: ILogger = {
  info(...args: any) {},
  trace(...args: any) {},
  warn(...args: any) {},
  error(...args: any) {},
  debug(...args: any) {},
};

describe('sentry/browser', () => {
  before(() => {
    // Reduce console log noise in test output
    sandbox.spy(console, 'error');
  });

  beforeEach(() => {
    // Make sure it's enabled by default
    sentryMetrics.enable();
  });

  after(() => {
    sandbox.restore();
  });

  describe('init', () => {
    it('properly configures with dsn', () => {
      sentryMetrics.configure(config, logger);
    });
  });

  describe('beforeSend', () => {
    before(() => {
      sentryMetrics.configure(config, logger);
    });

    it('works without request url', () => {
      const data = {
        key: 'value',
      } as unknown as Sentry.ErrorEvent;

      const resultData = sentryMetrics.__beforeSend(config, data, {});

      assert.equal(data, resultData);
    });

    it('fingerprints errno', () => {
      const data = {
        request: {
          url: 'https://example.com',
        },
        tags: {
          errno: '100',
        },
      } as unknown as Sentry.ErrorEvent;

      const resultData = sentryMetrics.__beforeSend(config, data, {});

      assert.equal(
        resultData!.fingerprint![0],
        'errno100',
        'correct fingerprint'
      );
      assert.equal(resultData!.level, 'info', 'correct known error level');
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
      assert.isTrue(sentryMetrics.__sentryEnabled());
    });

    it('disables', () => {
      sentryMetrics.disable();
      assert.isFalse(sentryMetrics.__sentryEnabled());
    });

    it('will return null from before send when disabled', () => {
      sentryMetrics.disable();
      assert.isNull(sentryMetrics.__beforeSend({}, {} as any, {}));
    });
  });
});
