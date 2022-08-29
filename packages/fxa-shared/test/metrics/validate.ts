/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import { BrowserClient } from '@sentry/browser';
import moment from 'moment';
import sinon from 'sinon';

import {
  CheckedMetrics,
  CheckedUtmMetrics,
  INVALID_UTM,
  MetricErrorReporter,
  MetricValidator,
} from '../../metrics/validate';

const MAX_INTEGER = Number.MAX_SAFE_INTEGER;
const INTEGER_OVERFLOW = Number.MAX_SAFE_INTEGER + 1;

describe('sanitize', function () {
  let client: BrowserClient;
  let reporter: MetricErrorReporter;
  let metrics: MetricValidator;
  let fakeSentryCapture: any;

  beforeEach(() => {
    client = new BrowserClient();
    fakeSentryCapture = sinon.replace(
      client,
      'captureException',
      sinon.fake.returns('')
    );
    reporter = new MetricErrorReporter(client);
    metrics = new MetricValidator(reporter, {
      maxEventOffset: moment.duration(2, 'days').asMilliseconds(),
    });
  });

  describe('clamp', function () {
    it('returns original value when no default is defined', () => {
      assert.equal(metrics.clamp('test', 'a', 0, 100), 'a');
    });

    it('returns a default value when value is invalid', () => {
      assert.equal(metrics.clamp('test', 'a', 0, 100, 2), 2);
    });

    it('handles undefined values when a default value is defined', () => {
      assert.equal(metrics.clamp('test', null, 0, 100, 2), 2);
      assert.equal(metrics.clamp('test', undefined, 0, 100, 2), 2);
    });

    it('clamps to max', () => {
      assert.equal(metrics.clamp('test', '101', 0, 100, 2), 100);
      assert.equal(metrics.clamp('test', 101, 0, 100, 2), 100);
    });

    it('clamps to min', () => {
      assert.equal(metrics.clamp('test', '-1', 0, 100, 2), 0);
      assert.equal(metrics.clamp('test', -1, 0, 100, 2), 0);
    });

    it('fails on invalid min/max request', () => {
      assert.throws(() => metrics.clamp('test', 2, 100, 0, 2));
    });

    it('clamps max integer overflow', () => {
      assert.equal(
        metrics.clamp('test', INTEGER_OVERFLOW, 0, MAX_INTEGER),
        MAX_INTEGER
      );
    });

    it('tracks critical error and reports it', () => {
      metrics.clamp('test', 0, 1, 2, 2, true);
      assert.equal(metrics.errorReporter.counts.critical, 1);
      assert.equal(metrics.errorReporter.counts.captured, 1);
      assert.equal(fakeSentryCapture.callCount, 1);
    });

    it('does not track critical error but does report it', () => {
      metrics.clamp('test', 0, 1, 2, 2, false);

      assert.equal(metrics.errorReporter.counts.critical, 0);
      assert.equal(metrics.errorReporter.counts.captured, 1);
      assert.equal(fakeSentryCapture.callCount, 1);
    });
  });

  describe('sanitize', () => {
    describe('utm', () => {
      function checkUtm(data: CheckedUtmMetrics, expected: CheckedUtmMetrics) {
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

    describe('duration', () => {
      function checkDuration(
        data: Pick<CheckedMetrics, 'duration'>,
        expected: Pick<CheckedMetrics, 'duration'>
      ) {
        metrics.sanitizeDuration(data);
        assert.include(data, expected);
      }

      it('fixes duration', () => {
        checkDuration(
          {
            duration: '',
          },
          {
            duration: 0,
          }
        );
        checkDuration(
          {
            duration: undefined,
          },
          {
            duration: 0,
          }
        );
        checkDuration(
          {
            duration: null,
          },
          {
            duration: 0,
          }
        );
        checkDuration(
          {
            duration: -1,
          },
          {
            duration: 0,
          }
        );
        checkDuration(
          {
            duration: INTEGER_OVERFLOW,
          },
          {
            duration: MAX_INTEGER,
          }
        );
        // Make sure counts are correct.
        assert.equal(metrics.errorReporter.counts.captured, 5);
        assert.equal(metrics.errorReporter.counts.critical, 5);
      });
    });

    describe('navigation timings', () => {
      function checkNavTiming(
        data: Pick<CheckedMetrics, 'navigationTiming'>,
        expected: Pick<CheckedMetrics, 'navigationTiming'>
      ) {
        metrics.sanitizeNavigationTiming(data);
        assert.deepInclude(data, expected);
      }

      it('fixes nav timings', () => {
        checkNavTiming(
          {
            navigationTiming: {
              connectStart: undefined,
              connectEnd: undefined,
              domainLookupEnd: undefined,
              redirectStart: undefined,
            },
          },
          {
            navigationTiming: {
              connectStart: null,
              connectEnd: null,
              domainLookupEnd: null,
              redirectStart: null,
            },
          }
        );

        checkNavTiming(
          {
            navigationTiming: {
              connectStart: null,
              connectEnd: null,
              domainLookupEnd: null,
              redirectStart: null,
            },
          },
          {
            navigationTiming: {
              connectStart: null,
              connectEnd: null,
              domainLookupEnd: null,
              redirectStart: null,
            },
          }
        );

        checkNavTiming(
          {
            navigationTiming: {
              connectStart: '',
              connectEnd: '',
              domainLookupEnd: '',
              redirectStart: '',
            },
          },
          {
            navigationTiming: {
              connectStart: null,
              connectEnd: null,
              domainLookupEnd: null,
              redirectStart: null,
            },
          }
        );

        checkNavTiming(
          {
            navigationTiming: {
              connectStart: INTEGER_OVERFLOW,
              connectEnd: INTEGER_OVERFLOW,
              domainLookupEnd: INTEGER_OVERFLOW,
              redirectStart: INTEGER_OVERFLOW,
            },
          },
          {
            navigationTiming: {
              connectStart: MAX_INTEGER,
              connectEnd: MAX_INTEGER,
              domainLookupEnd: MAX_INTEGER,
              redirectStart: MAX_INTEGER,
            },
          }
        );

        checkNavTiming(
          {
            navigationTiming: {
              connectStart: -1,
              connectEnd: -1,
              domainLookupEnd: -1,
              redirectStart: -1,
            },
          },
          {
            navigationTiming: {
              connectStart: 0,
              connectEnd: 0,
              domainLookupEnd: 0,
              redirectStart: 0,
            },
          }
        );

        // Make sure counts are correct.
        // Note that per test there are 2 tests with invalid values with 4 issues each.
        assert.equal(metrics.errorReporter.counts.captured, 2 * 4);
        assert.equal(metrics.errorReporter.counts.critical, 2 * 4);
      });
    });

    describe('events', () => {
      function checkEvents(
        data: Pick<CheckedMetrics, 'events'>,
        expected: Pick<CheckedMetrics, 'events'>
      ) {
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

      it('fixes events.offset', () => {
        checkEvents(
          {
            events: [
              {
                offset: -1,
                type: 'some.type',
              },
            ],
          },
          {
            events: [
              {
                offset: 0,
                type: 'some.type',
              },
            ],
          }
        );
        checkEvents(
          {
            events: [
              {
                offset: INTEGER_OVERFLOW,
                type: 'some.type',
              },
            ],
          },
          {
            events: [
              {
                offset: moment.duration(2, 'days').asMilliseconds(),
                type: 'some.type',
              },
            ],
          }
        );

        // Make sure counts are correct.
        assert.equal(metrics.errorReporter.counts.captured, 2);
        assert.equal(metrics.errorReporter.counts.critical, 2);
      });
    });

    describe('device id', () => {
      function checkDeviceId(
        data: Pick<CheckedMetrics, 'deviceId'>,
        expected: Pick<CheckedMetrics, 'deviceId'>
      ) {
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
