/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';

import {
  INVALID_UTM,
  MetricErrorReporter,
  MetricValidator,
} from 'lib/metric-validator';

describe('lib/metric-validator', function () {
  let client;
  let reporter;
  let metrics;

  beforeEach(() => {
    client = {
      captureException: () => '',
    };

    reporter = new MetricErrorReporter(client);
    metrics = new MetricValidator(reporter, {
      maxEventOffset: 2 * 24 * 60 * 60 * 1000,
    });
  });

  describe('sanitize', () => {
    describe('utm', () => {
      function checkUtm(data, expected) {
        metrics.sanitizeUtmParams(data);
        assert.include(data, expected);
      }

      it('fixes bad utm param', () => {
        const badUtm = '[bad]';
        checkUtm(
          {
            utm_campaign: badUtm,
            utm_content: badUtm,
            utm_medium: badUtm,
            utm_source: badUtm,
            utm_term: badUtm,
          },
          {
            utm_campaign: INVALID_UTM,
            utm_content: INVALID_UTM,
            utm_medium: INVALID_UTM,
            utm_source: INVALID_UTM,
            utm_term: INVALID_UTM,
          }
        );

        assert.equal(metrics.errorReporter.counts.critical, 0);
        assert.equal(metrics.errorReporter.counts.captured, 5);
      });
    });

    describe('events', () => {
      function checkEvents(data, expected) {
        metrics.sanitizeEvents(data);
        assert.deepInclude(data, expected);
      }

      it('fixes events.type', () => {
        checkEvents(
          {
            events: [
              {
                offset: 0,
                type: 'some.error[weirdness]',
              },
            ],
          },
          {
            events: [
              {
                offset: 0,
                type: 'some.error',
              },
            ],
          }
        );

        // Make sure counts are correct. Note that type is not considered critical or captured
        assert.equal(metrics.errorReporter.counts.captured, 0);
        assert.equal(metrics.errorReporter.counts.critical, 0);
      });
    });

    describe('device id', () => {
      function checkDeviceId(data, expected) {
        metrics.sanitizeDeviceId(data);
        assert.include(data, expected);
      }

      it('fixes bad device id', () => {
        checkDeviceId(
          {
            deviceId: null,
          },
          {
            deviceId: 'none',
          }
        );

        checkDeviceId(
          {
            deviceId: undefined,
          },
          {
            deviceId: 'none',
          }
        );
        checkDeviceId(
          {
            deviceId: '',
          },
          {
            deviceId: 'none',
          }
        );

        // Make sure counts are correct. Note that device id isn't considered critical, but
        // it's not ideal that it's undefined, so for the time being we still capture it.
        assert.equal(metrics.errorReporter.counts.captured, 3);
        assert.equal(metrics.errorReporter.counts.critical, 0);
      });
    });
  });
});
