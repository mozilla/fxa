/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var Raven = require('raven');
  var SentryMetrics = require('lib/sentry');
  var sinon = require('sinon');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;
  var windowMock;
  var host;

  describe('lib/sentry', function () {

    beforeEach(function () {
      windowMock = new WindowMock();
      host = windowMock.location.host;
    });

    afterEach(function () {
      Raven.uninstall();
    });

    describe('init', function () {
      it('properly inits', function () {
        try {
          void new SentryMetrics();
        } catch (e) {
          assert.isNull(e);
        }
      });

      it('properly inits with host', function () {
        var sentry;
        try {
          sentry = new SentryMetrics(host);
        } catch (e) {
          assert.isNull(e);
        }

        assert.equal(sentry._endpoint, '//__API_KEY__@' + host + '/metrics-errors');
      });

      it('catches init errors', function () {
        sinon.stub(Raven, 'config', function () {
          throw new Error('Config error');
        });

        try {
          void new SentryMetrics(host);
        } catch (e) {
          assert.isNull(e);
        }

        assert.isTrue(Raven.config.called);

        Raven.config.restore();
      });

    });

    describe('remove', function () {
      it('properly removes itself', function () {
        var sentry = new SentryMetrics(host);
        try {
          sentry.remove();
        } catch (e) {
          assert.isNull(e);
        }
      });
    });

    describe('captureException', function () {
      it('does not throw errors', function () {
        // captureException will not throw before init;
        try {
          Raven.captureException(new Error('tests'));
        } catch (e) {
          assert.isNull(e);
        }

        void new SentryMetrics(host);

        // does not throw after init
        try {
          Raven.captureException(new Error('tests'));
        } catch (e) {
          assert.isNull(e);
        }

      });
    });

    describe('beforeSend', function () {
      it('works without request url', function () {
        var data = {
          key: 'value'
        };
        var sentry = new SentryMetrics(host);
        var resultData = sentry.__beforeSend(data);

        assert.equal(data, resultData);
      });

      it('properly erases sensitive information from url', function () {
        var url = 'https://accounts.firefox.com/complete_reset_password';
        var badQuery = '?token=foo&code=bar&email=some%40restmail.net&service=sync';
        var goodQuery = '?token=VALUE&code=VALUE&email=VALUE&service=sync';
        var badData = {
          request: {
            url: url + badQuery
          }
        };

        var goodData = {
          request: {
            url: url + goodQuery
          }
        };

        var sentry = new SentryMetrics(host);
        var resultData = sentry.__beforeSend(badData);

        assert.equal(resultData.key, goodData.key);
        assert.equal(resultData.url, goodData.url);
      });

      it('properly erases sensitive information from referrer', function () {
        var url = 'https://accounts.firefox.com/complete_reset_password';
        var badQuery = '?token=foo&code=bar&email=some%40restmail.net&service=sync';
        var goodQuery = '?token=VALUE&code=VALUE&email=VALUE&service=sync';
        var badData = {
          request: {
            headers: {
              Referer: url + badQuery
            }
          }
        };

        var goodData = {
          request: {
            headers: {
              Referer: url + goodQuery
            }
          }
        };

        var sentry = new SentryMetrics(host);
        var resultData = sentry.__beforeSend(badData);
        assert.equal(resultData.request.headers.Referer, goodData.request.headers.Referer);
      });
    });

    describe('cleanUpQueryParam', function () {
      it('properly erases sensitive information', function () {
        var fixtureUrl1 = 'https://accounts.firefox.com/complete_reset_password?token=foo&code=bar&email=some%40restmail.net';
        var expectedUrl1 = 'https://accounts.firefox.com/complete_reset_password?token=VALUE&code=VALUE&email=VALUE';
        var sentry = new SentryMetrics(host);
        var resultUrl1 = sentry.__cleanUpQueryParam(fixtureUrl1);

        assert.equal(resultUrl1, expectedUrl1);
      });

      it('properly erases sensitive information, keeps allowed fields', function () {
        var fixtureUrl2 = 'https://accounts.firefox.com/signup?client_id=foo&preVerifyToken=bar&service=sync';
        var expectedUrl2 = 'https://accounts.firefox.com/signup?client_id=foo&preVerifyToken=VALUE&service=sync';
        var sentry = new SentryMetrics(host);
        var resultUrl2 = sentry.__cleanUpQueryParam(fixtureUrl2);

        assert.equal(resultUrl2, expectedUrl2);
      });

      it('properly returns the url when there is no query', function () {
        var expectedUrl = 'https://accounts.firefox.com/signup';
        var sentry = new SentryMetrics(host);
        var resultUrl = sentry.__cleanUpQueryParam(expectedUrl);

        assert.equal(resultUrl, expectedUrl);
      });
    });

    describe('captureException', function () {
      it('reports the error to Raven, passing along tags', function () {
        var sandbox = sinon.sandbox.create();
        sandbox.spy(Raven, 'captureException');

        var sentry = new SentryMetrics(host);

        var err = new Error('uh oh');
        err.code = 400;
        err.errno = 998;
        err.namespace = 'config';
        err.status = 401;
        err.ignored = true;

        sentry.captureException(err);

        assert.isTrue(Raven.captureException.calledWith(err, {
          tags: {
            code: 400,
            errno: 998,
            namespace: 'config',
            status: 401
          }
        }));

        sandbox.restore();
      });
    });
  });

});

