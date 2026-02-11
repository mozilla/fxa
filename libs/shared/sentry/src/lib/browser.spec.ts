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

    it('properly erases sensitive information from url', () => {
      const url = 'https://accounts.firefox.com/complete_reset_password';
      const badQuery =
        '?token=foo&code=bar&email=some%40restmail.net&service=sync';
      const goodQuery = '?token=VALUE&code=VALUE&email=VALUE&service=sync';
      const badData = {
        request: {
          url: url + badQuery,
        },
      };

      const goodData = {
        request: {
          url: url + goodQuery,
        },
      };

      const resultData = sentryMetrics.__beforeSend(config, badData);
      expect(resultData?.request?.url).toEqual(goodData.request.url);
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
      };

      const goodData = {
        request: {
          headers: {
            Referer: url + goodQuery,
          },
        },
      };

      const resultData = sentryMetrics.__beforeSend(config, badData);
      expect(resultData?.request?.headers?.Referer).toEqual(
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
      };

      const resultData = sentryMetrics.__beforeSend(config, data);

      expect(
        resultData?.exception?.values?.[0].stacktrace?.frames?.[0].abs_path
      ).toEqual(goodAbsPath);
      expect(
        resultData?.exception?.values?.[0].stacktrace?.frames?.[1].abs_path
      ).toEqual(goodAbsPath);
    });
  });

  describe('cleanUpQueryParam', () => {
    it('properly erases sensitive information', () => {
      const fixtureUrl1 =
        'https://accounts.firefox.com/complete_reset_password?token=foo&code=bar&email=some%40restmail.net';
      const expectedUrl1 =
        'https://accounts.firefox.com/complete_reset_password?token=VALUE&code=VALUE&email=VALUE';
      const resultUrl1 = sentryMetrics.__cleanUpQueryParam(fixtureUrl1);

      expect(resultUrl1).toEqual(expectedUrl1);
    });

    it('properly erases sensitive information, keeps allowed fields', () => {
      const fixtureUrl2 =
        'https://accounts.firefox.com/signup?client_id=foo&service=sync';
      const expectedUrl2 =
        'https://accounts.firefox.com/signup?client_id=foo&service=sync';
      const resultUrl2 = sentryMetrics.__cleanUpQueryParam(fixtureUrl2);

      expect(resultUrl2).toEqual(expectedUrl2);
    });

    it('properly returns the url when there is no query', () => {
      const expectedUrl = 'https://accounts.firefox.com/signup';
      const resultUrl = sentryMetrics.__cleanUpQueryParam(expectedUrl);

      expect(resultUrl).toEqual(expectedUrl);
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
