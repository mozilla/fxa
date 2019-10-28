/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import * as Sentry from '@sentry/browser';
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';

var assert = chai.assert;
const dsn = 'https://public:private@host:port/1';

describe('lib/sentry', function() {
  describe('init', function() {
    it('properly inits', function() {
      try {
        void new SentryMetrics();
      } catch (e) {
        assert.isNull(e);
      }
    });

    it('properly inits with dsn', function() {
      try {
        void new SentryMetrics(dsn);
      } catch (e) {
        assert.isNull(e);
      }
    });
  });

  describe('captureException', function() {
    it('does not throw errors', function() {
      // captureException will not throw before init;
      try {
        Sentry.captureException(new Error('tests'));
      } catch (e) {
        assert.isNull(e);
      }

      void new SentryMetrics(dsn);

      // does not throw after init
      try {
        Sentry.captureException(new Error('tests'));
      } catch (e) {
        assert.isNull(e);
      }
    });
  });

  describe('beforeSend', function() {
    it('works without request url', function() {
      var data = {
        key: 'value',
      };
      var sentry = new SentryMetrics(dsn);
      var resultData = sentry.__beforeSend(data);

      assert.equal(data, resultData);
    });

    it('fingerprints errno', function() {
      var data = {
        key: 'value',
        request: {
          url: 'foo',
        },
        tags: {
          errno: 100,
        },
      };
      var sentry = new SentryMetrics(dsn);
      var resultData = sentry.__beforeSend(data);

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

      var sentry = new SentryMetrics(dsn);
      var resultData = sentry.__beforeSend(badData);

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

      var sentry = new SentryMetrics(dsn);
      var resultData = sentry.__beforeSend(badData);
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

      var sentry = new SentryMetrics(dsn);
      var resultData = sentry.__beforeSend(data);

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
      var sentry = new SentryMetrics(dsn);
      var resultUrl1 = sentry.__cleanUpQueryParam(fixtureUrl1);

      assert.equal(resultUrl1, expectedUrl1);
    });

    it('properly erases sensitive information, keeps allowed fields', function() {
      var fixtureUrl2 =
        'https://accounts.firefox.com/signup?client_id=foo&service=sync';
      var expectedUrl2 =
        'https://accounts.firefox.com/signup?client_id=foo&service=sync';
      var sentry = new SentryMetrics(dsn);
      var resultUrl2 = sentry.__cleanUpQueryParam(fixtureUrl2);

      assert.equal(resultUrl2, expectedUrl2);
    });

    it('properly returns the url when there is no query', function() {
      var expectedUrl = 'https://accounts.firefox.com/signup';
      var sentry = new SentryMetrics(dsn);
      var resultUrl = sentry.__cleanUpQueryParam(expectedUrl);

      assert.equal(resultUrl, expectedUrl);
    });
  });

  describe('captureException', function() {
    it('reports the error to Raven, passing along tags', function() {
      var sandbox = sinon.sandbox.create();
      // do not call the real captureException,
      // no need to make network requests.
      sandbox.stub(Sentry, 'captureException').callsFake(function() {});
      var release = '0.1.0';
      var sentry = new SentryMetrics(dsn, release);

      var err = new Error('uh oh');
      err.code = 400;
      err.context = '/signup';
      err.errno = 998;
      err.namespace = 'config';
      err.status = 401;
      err.ignored = true;

      sentry.captureException(err);

      assert.isTrue(
        Sentry.captureException.calledWith(err, {
          release: release,
          tags: {
            code: 400,
            context: '/signup',
            errno: 998,
            namespace: 'config',
            status: 401,
          },
        })
      );

      sandbox.restore();
    });

    it('reports the error even if release version is not set', function() {
      var sandbox = sinon.sandbox.create();
      sandbox.stub(Sentry, 'captureException').callsFake(function() {});
      var sentry = new SentryMetrics(dsn);

      var err = new Error('uh oh');
      err.code = 400;

      sentry.captureException(err);
      assert.isTrue(
        Sentry.captureException.calledWith(err, {
          tags: {
            code: 400,
          },
        })
      );

      sandbox.restore();
    });
  });

  describe('shouldSendCallback', function() {
    it('sends error when there is no previous error', function() {
      var sentry = new SentryMetrics(dsn);
      assert.isTrue(sentry.__shouldSendCallback(), 'empty object');
      assert.isTrue(sentry.__shouldSendCallback({}), 'empty message');
      for (var x = 0; x < 10; x++) {
        assert.isTrue(
          sentry.__shouldSendCallback({ message: '1' }),
          'same error ' + x
        );
      }
      assert.isFalse(
        sentry.__shouldSendCallback({ message: '1' }),
        'same error limited'
      );
      assert.isTrue(
        sentry.__shouldSendCallback({ message: '2' }),
        'different error'
      );
    });
  });
});
