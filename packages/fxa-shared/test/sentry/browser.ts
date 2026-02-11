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

    it('properly erases sensitive information from url', () => {
      const url = 'https://accounts.firefox.com/complete_reset_password';
      const badQuery =
        '?token=foo&code=bar&email=some%40restmail.net&service=sync';
      const goodQuery = '?token=VALUE&code=VALUE&email=VALUE&service=sync';
      const badData = {
        request: {
          url: url + badQuery,
        },
      } as unknown as Sentry.ErrorEvent;

      const goodData = {
        request: {
          url: url + goodQuery,
        },
      };

      const resultData = sentryMetrics.__beforeSend(config, badData);
      assert.equal(resultData?.request!.url, goodData.request.url);
    });

    it('properly erases sensitive information from referrer', () => {
      const url = 'https://accounts.firefox.com/complete_reset_password';
      const badQuery =
        '?token=foo&code=bar&email=some%40restmail.net&service=sync';
      const goodQuery = '?token=VALUE&code=VALUE&email=VALUE&service=sync';
      const badData = {
        request: {
          headers: {
            Referer: url + badQuery,
          },
        },
      } as unknown as Sentry.ErrorEvent;

      const goodData = {
        request: {
          headers: {
            Referer: url + goodQuery,
          },
        },
      };

      const resultData = sentryMetrics.__beforeSend(config, badData);
      assert.equal(
        resultData?.request?.headers?.Referer,
        goodData.request.headers.Referer
      );
    });

    it('properly erases sensitive information from abs_path', () => {
      const url = 'https://accounts.firefox.com/complete_reset_password';
      const badCulprit =
        'https://accounts.firefox.com/scripts/57f6d4e4.main.js';
      const badAbsPath =
        'https://accounts.firefox.com/complete_reset_password?token=foo&code=bar&email=a@a.com&service=sync&resume=barbar';
      const goodAbsPath =
        'https://accounts.firefox.com/complete_reset_password?token=VALUE&code=VALUE&email=VALUE&service=sync&resume=VALUE';
      const data = {
        culprit: badCulprit,
        exception: {
          values: [
            {
              stacktrace: {
                frames: [
                  {
                    abs_path: badAbsPath, // eslint-disable-line camelcase
                  },
                  {
                    abs_path: badAbsPath, // eslint-disable-line camelcase
                  },
                ],
              },
            },
          ],
        },
        request: {
          url,
        },
      } as unknown as Sentry.ErrorEvent;

      const resultData = sentryMetrics.__beforeSend(config, data);

      assert.equal(
        resultData?.exception!.values![0].stacktrace!.frames![0].abs_path,
        goodAbsPath
      );
      assert.equal(
        resultData?.exception!.values![0].stacktrace!.frames![1].abs_path,
        goodAbsPath
      );
    });
  });

  describe('cleanUpQueryParam', () => {
    it('properly erases sensitive information', () => {
      const fixtureUrl1 =
        'https://accounts.firefox.com/complete_reset_password?token=foo&code=bar&email=some%40restmail.net';
      const expectedUrl1 =
        'https://accounts.firefox.com/complete_reset_password?token=VALUE&code=VALUE&email=VALUE';
      const resultUrl1 = sentryMetrics.__cleanUpQueryParam(fixtureUrl1);

      assert.equal(resultUrl1, expectedUrl1);
    });

    it('properly erases sensitive information, keeps allowed fields', () => {
      const fixtureUrl2 =
        'https://accounts.firefox.com/signup?client_id=foo&service=sync';
      const expectedUrl2 =
        'https://accounts.firefox.com/signup?client_id=foo&service=sync';
      const resultUrl2 = sentryMetrics.__cleanUpQueryParam(fixtureUrl2);

      assert.equal(resultUrl2, expectedUrl2);
    });

    it('properly returns the url when there is no query', () => {
      const expectedUrl = 'https://accounts.firefox.com/signup';
      const resultUrl = sentryMetrics.__cleanUpQueryParam(expectedUrl);

      assert.equal(resultUrl, expectedUrl);
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
