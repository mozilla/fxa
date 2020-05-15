/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import sentryMetrics from './sentry';

var assert = chai.assert;
const dsn = 'https://public:private@host:port/1';

describe('lib/sentry', function() {
  beforeAll(() => {
    // Reduce console log noise in test output
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('init', function() {
    it('properly configures with dsn', function() {
      try {
        sentryMetrics.configure(dsn);
      } catch (e) {
        assert.isNull(e);
      }
    });
  });

  describe('beforeSend', function() {
    sentryMetrics.configure(dsn);

    it('works without request url', function() {
      var data = {
        key: 'value',
      };
      var resultData = sentryMetrics.__beforeSend(data);

      assert.equal(data, resultData);
    });

    it('fingerprints errno', function() {
      var data = {
        key: 'value',
        request: {
          url: 'https://example.com',
        },
        tags: {
          errno: 100,
        },
      };
      var resultData = sentryMetrics.__beforeSend(data);

      assert.equal(
        resultData.fingerprint[0],
        'errno100',
        'correct fingerprint'
      );
      assert.equal(resultData.level, 'info', 'correct known error level');
    });

    it('properly erases sensitive information from url', function() {
      var url = 'https://accounts.firefox.com/complete_reset_password';
      var badQuery =
        '?token=foo&code=bar&email=some%40restmail.net&service=sync';
      var goodQuery = '?token=VALUE&code=VALUE&email=VALUE&service=sync';
      var badData = {
        request: {
          url: url + badQuery,
        },
      };

      var goodData = {
        request: {
          url: url + goodQuery,
        },
      };

      var resultData = sentryMetrics.__beforeSend(badData);

      assert.equal(resultData.key, goodData.key);
      assert.equal(resultData.url, goodData.url);
    });

    it('properly erases sensitive information from referrer', function() {
      var url = 'https://accounts.firefox.com/complete_reset_password';
      var badQuery =
        '?token=foo&code=bar&email=some%40restmail.net&service=sync';
      var goodQuery = '?token=VALUE&code=VALUE&email=VALUE&service=sync';
      var badData = {
        request: {
          headers: {
            Referer: url + badQuery,
          },
        },
      };

      var goodData = {
        request: {
          headers: {
            Referer: url + goodQuery,
          },
        },
      };

      var resultData = sentryMetrics.__beforeSend(badData);
      assert.equal(
        resultData.request.headers.Referer,
        goodData.request.headers.Referer
      );
    });

    it('properly erases sensitive information from abs_path', function() {
      var url = 'https://accounts.firefox.com/complete_reset_password';
      var badCulprit = 'https://accounts.firefox.com/scripts/57f6d4e4.main.js';
      var badAbsPath =
        'https://accounts.firefox.com/complete_reset_password?token=foo&code=bar&email=a@a.com&service=sync&resume=barbar';
      var goodAbsPath =
        'https://accounts.firefox.com/complete_reset_password?token=VALUE&code=VALUE&email=VALUE&service=sync&resume=VALUE';
      var data = {
        culprit: badCulprit,
        exception: {
          values: [
            {
              stacktrace: {
                frames: [
                  {
                    abs_path: badAbsPath, //eslint-disable-line camelcase
                  },
                  {
                    abs_path: badAbsPath, //eslint-disable-line camelcase
                  },
                ],
              },
            },
          ],
        },
        request: {
          url: url,
        },
      };

      var resultData = sentryMetrics.__beforeSend(data);

      assert.equal(
        resultData.exception.values[0].stacktrace.frames[0].abs_path,
        goodAbsPath
      );
      assert.equal(
        resultData.exception.values[0].stacktrace.frames[1].abs_path,
        goodAbsPath
      );
    });
  });

  describe('cleanUpQueryParam', function() {
    it('properly erases sensitive information', function() {
      var fixtureUrl1 =
        'https://accounts.firefox.com/complete_reset_password?token=foo&code=bar&email=some%40restmail.net';
      var expectedUrl1 =
        'https://accounts.firefox.com/complete_reset_password?token=VALUE&code=VALUE&email=VALUE';
      var resultUrl1 = sentryMetrics.__cleanUpQueryParam(fixtureUrl1);

      assert.equal(resultUrl1, expectedUrl1);
    });

    it('properly erases sensitive information, keeps allowed fields', function() {
      var fixtureUrl2 =
        'https://accounts.firefox.com/signup?client_id=foo&service=sync';
      var expectedUrl2 =
        'https://accounts.firefox.com/signup?client_id=foo&service=sync';
      var resultUrl2 = sentryMetrics.__cleanUpQueryParam(fixtureUrl2);

      assert.equal(resultUrl2, expectedUrl2);
    });

    it('properly returns the url when there is no query', function() {
      var expectedUrl = 'https://accounts.firefox.com/signup';
      var resultUrl = sentryMetrics.__cleanUpQueryParam(expectedUrl);

      assert.equal(resultUrl, expectedUrl);
    });
  });
});
