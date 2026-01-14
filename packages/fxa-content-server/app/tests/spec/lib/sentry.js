/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import SentryMetrics from 'lib/sentry';

var assert = chai.assert;
const dsn = 'https://public:private@host:8080/1';

describe('lib/sentry', function () {
  describe('init', function () {
    it('properly inits', function () {
      try {
        void new SentryMetrics();
      } catch (e) {
        assert.isNull(e);
      }
    });

    it('properly inits with dsn', function () {
      try {
        void new SentryMetrics({
          release: 'v0.0.0',
          sentry: {
            dsn,
            env: 'test',
            sampleRate: 1.0,
            clientName: 'fxa-content-server-test',
          },
        });
      } catch (e) {
        assert.isNull(e);
      }
    });
  });

  describe('beforeSend', function () {
    it('works without request url', function () {
      var data = {
        key: 'value',
      };
      var sentry = new SentryMetrics(dsn);
      var resultData = sentry.__beforeSend(data);

      assert.equal(data, resultData);
    });

    it('does not return data for known errno', function () {
      const data = {
        key: 'value',
        request: {
          url: 'foo',
        },
        tags: {
          errno: 100,
        },
      };
      const sentry = new SentryMetrics(dsn);
      assert.equal(sentry.__beforeSend(data), null, 'empty data');
    });

    it('does not return data for bad errno', function () {
      const data = {
        key: 'value',
        request: {
          url: 'foo',
        },
        tags: {
          errno: new Error('something is wrong'),
        },
      };
      const sentry = new SentryMetrics(dsn);
      const resultData = sentry.__beforeSend(data);

      assert.equal(resultData.key, 'value', 'correct key');
    });
  });
});
