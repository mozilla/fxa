/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'jsdom-global/register';
import { assert } from 'chai';
import * as Sentry from '@sentry/browser';
import sentryMetrics, { _Sentry } from '../../lib/sentry';
const sinon = require('sinon');

const dsn = 'https://public:private@host:port/1';

describe('lib/sentry', () => {
  before(() => {
    // Reduce console log noise in test output
    sinon.spy(console, 'error');
  });

  after(() => {
    (globalThis.window.console.error as sinon.SinonSpy).restore();
  });

  describe('init', () => {
    it('properly configures with dsn', () => {
      try {
        sentryMetrics.configure(dsn);
      } catch (e) {
        assert.isNull(e);
      }
    });
  });

  describe('beforeSend', () => {
    sentryMetrics.configure(dsn);

    it('works without request url', () => {
      const data = {
        key: 'value',
      } as Sentry.Event;

      const resultData = sentryMetrics.__beforeSend(data);

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
      } as Sentry.Event;

      const resultData = sentryMetrics.__beforeSend(data);

      assert.equal(
        resultData.fingerprint![0],
        'errno100',
        'correct fingerprint'
      );
      assert.equal(
        resultData.level,
        Sentry.Severity.Info,
        'correct known error level'
      );
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

      const resultData = sentryMetrics.__beforeSend(badData);
      assert.equal(resultData.request!.url, goodData.request.url);
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

      const resultData = sentryMetrics.__beforeSend(badData);
      assert.equal(
        resultData.request?.headers?.Referer,
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

      const resultData = sentryMetrics.__beforeSend(data);

      assert.equal(
        resultData.exception!.values![0].stacktrace!.frames![0].abs_path,
        goodAbsPath
      );
      assert.equal(
        resultData.exception!.values![0].stacktrace!.frames![1].abs_path,
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
});
