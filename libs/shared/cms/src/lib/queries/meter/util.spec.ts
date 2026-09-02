/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  METERING_CALENDAR_PERIODS,
  MeterBySlugResultFactory,
  MeterBySlugResultUtil,
  StrapiMeterRawFactory,
  toStrapiMeter,
} from '.';
import {
  MeterInvalidNotificationThresholdError,
  MeterInvalidWindowError,
  MeterNotFoundError,
} from '../../cms.error';

describe('toStrapiMeter', () => {
  it.each(METERING_CALENDAR_PERIODS)(
    'maps a calendar meter with the %s period',
    (period) => {
      const meter = StrapiMeterRawFactory({
        windowKind: 'calendar',
        windowPeriod: period,
      });
      expect(toStrapiMeter(meter).window).toEqual({ kind: 'calendar', period });
    }
  );

  it('maps a sliding meter to a duration in milliseconds', () => {
    const meter = StrapiMeterRawFactory({
      windowKind: 'sliding',
      windowPeriod: null,
      windowDurationMinutes: 90,
    });
    expect(toStrapiMeter(meter).window).toEqual({
      kind: 'sliding',
      durationMs: 90 * 60_000,
    });
  });

  it('maps a session meter to a duration in milliseconds', () => {
    const meter = StrapiMeterRawFactory({
      windowKind: 'session',
      windowPeriod: null,
      windowDurationMinutes: 30,
    });
    expect(toStrapiMeter(meter).window).toEqual({
      kind: 'session',
      durationMs: 30 * 60_000,
    });
  });

  it('rejects a calendar meter without a period', () => {
    const meter = StrapiMeterRawFactory({
      windowKind: 'calendar',
      windowPeriod: null,
    });
    expect(() => toStrapiMeter(meter)).toThrow(MeterInvalidWindowError);
  });

  it('rejects a sliding meter without a duration', () => {
    const meter = StrapiMeterRawFactory({
      windowKind: 'sliding',
      windowDurationMinutes: null,
    });
    expect(() => toStrapiMeter(meter)).toThrow(MeterInvalidWindowError);
  });

  it('preserves every field other than the window', () => {
    const meter = StrapiMeterRawFactory({ windowPeriod: 'daily' });
    const normalized = toStrapiMeter(meter);
    expect(normalized.slug).toBe(meter.slug);
    expect(normalized.unit).toBe(meter.unit);
    expect(normalized.limit).toBe(meter.limit);
    expect(normalized.notificationThresholds).toBe(
      meter.notificationThresholds
    );
    expect(normalized.webhooks).toEqual(meter.webhooks);
  });

  it('does not mutate the raw meter', () => {
    const meter = StrapiMeterRawFactory({ windowPeriod: 'daily' });
    toStrapiMeter(meter);
    expect(meter.windowPeriod).toBe('daily');
  });
});

describe('MeterBySlugResultUtil', () => {
  it('returns the first meter with its window normalized', () => {
    const meter = StrapiMeterRawFactory({ windowPeriod: 'monthly' });
    const util = new MeterBySlugResultUtil({ meters: [meter] }, 'test-slug');
    expect(util.getMeter()).toEqual({
      slug: meter.slug,
      unit: meter.unit,
      limit: meter.limit,
      notificationThresholds: meter.notificationThresholds,
      webhooks: meter.webhooks,
      window: { kind: 'calendar', period: 'monthly' },
    });
  });

  it('exposes the normalized meters array', () => {
    const result = MeterBySlugResultFactory();
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.meters).toHaveLength(1);
    expect(util.meters[0].window).toEqual({
      kind: 'calendar',
      period: result.meters[0].windowPeriod,
    });
  });

  it('throws MeterNotFoundError when no meter is returned', () => {
    const result = MeterBySlugResultFactory({ meters: [] });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(() => util.getMeter()).toThrow(MeterNotFoundError);
  });

  it('parses comma-separated notificationThresholds into numbers', () => {
    const result = MeterBySlugResultFactory({
      meters: [StrapiMeterRawFactory({ notificationThresholds: '50,75,90' })],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.getNotificationThresholds()).toEqual([50, 75, 90]);
  });

  it('ignores empty entries from double commas or trailing commas', () => {
    const result = MeterBySlugResultFactory({
      meters: [
        StrapiMeterRawFactory({ notificationThresholds: '50,,80,100,' }),
      ],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.getNotificationThresholds()).toEqual([50, 80, 100]);
  });

  it('returns an empty array for empty-string notificationThresholds', () => {
    const result = MeterBySlugResultFactory({
      meters: [StrapiMeterRawFactory({ notificationThresholds: '' })],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.getNotificationThresholds()).toEqual([]);
  });

  it('preserves 0 as a valid threshold value', () => {
    const result = MeterBySlugResultFactory({
      meters: [StrapiMeterRawFactory({ notificationThresholds: '0,50,100' })],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.getNotificationThresholds()).toEqual([0, 50, 100]);
  });

  it('trims whitespace around threshold values', () => {
    const result = MeterBySlugResultFactory({
      meters: [
        StrapiMeterRawFactory({ notificationThresholds: ' 50 , 75 , 90 ' }),
      ],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.getNotificationThresholds()).toEqual([50, 75, 90]);
  });

  it('throws MeterInvalidNotificationThresholdError for negative values', () => {
    const result = MeterBySlugResultFactory({
      meters: [StrapiMeterRawFactory({ notificationThresholds: '-10,50,90' })],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(() => util.getNotificationThresholds()).toThrow(
      MeterInvalidNotificationThresholdError
    );
  });

  it('throws MeterInvalidNotificationThresholdError for values above 100', () => {
    const result = MeterBySlugResultFactory({
      meters: [StrapiMeterRawFactory({ notificationThresholds: '50,150,90' })],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(() => util.getNotificationThresholds()).toThrow(
      MeterInvalidNotificationThresholdError
    );
  });

  it('filters out non-numeric notificationThresholds values', () => {
    const result = MeterBySlugResultFactory({
      meters: [StrapiMeterRawFactory({ notificationThresholds: '50,abc,90' })],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.getNotificationThresholds()).toEqual([50, 90]);
  });
});
