/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import sentryMetrics from './sentry';

var assert = chai.assert;
const dsn = 'https://public:private@host:port/1';
const release = 'v0.0.0';
const env = 'test';
const serverName = 'fxa-payment-server';

describe('lib/sentry', function () {
  beforeAll(() => {
    // Reduce console log noise in test output
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('init', function () {
    it('properly configures with dsn', function () {
      try {
        sentryMetrics.configure({
          release,
          sentry: {
            dsn,
            env,
            serverName,
            sampleRate: 1.0,
          },
        });
      } catch (e) {
        assert.isNull(e);
      }
    });
  });

  describe('beforeSend', function () {
    jest.spyOn(console, 'info').mockImplementation(jest.fn());
    jest.spyOn(console, 'error').mockImplementation(jest.fn());

    sentryMetrics.configure({
      release,
      sentry: {
        dsn,
        env,
        serverName,
        sampleRate: 1.0,
      },
    });

    it('works without request url', function () {
      var data = {
        key: 'value',
      };
      var resultData = sentryMetrics.__beforeSend(data);

      assert.equal(data, resultData);
    });

    it('fingerprints errno', function () {
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
  });
});
