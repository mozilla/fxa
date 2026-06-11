/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  MeterBySlugResultFactory,
  MeterBySlugResultUtil,
  StrapiMeterFactory,
} from '.';
import {
  MeterInvalidNotificationThresholdError,
  MeterNotFoundError,
} from '../../cms.error';

describe('MeterBySlugResultUtil', () => {
  it('returns the meter matching the factory result', () => {
    const result = MeterBySlugResultFactory();
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.getMeter()).toEqual(result.meters[0]);
  });

  it('exposes the raw meters array', () => {
    const result = MeterBySlugResultFactory();
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.meters).toHaveLength(1);
  });

  it('throws MeterNotFoundError when no meter is returned', () => {
    const result = MeterBySlugResultFactory({ meters: [] });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(() => util.getMeter()).toThrow(MeterNotFoundError);
  });

  it('parses comma-separated notificationThresholds into numbers', () => {
    const result = MeterBySlugResultFactory({
      meters: [StrapiMeterFactory({ notificationThresholds: '50,75,90' })],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.getNotificationThresholds()).toEqual([50, 75, 90]);
  });

  it('ignores empty entries from double commas or trailing commas', () => {
    const result = MeterBySlugResultFactory({
      meters: [StrapiMeterFactory({ notificationThresholds: '50,,80,100,' })],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.getNotificationThresholds()).toEqual([50, 80, 100]);
  });

  it('returns an empty array for empty-string notificationThresholds', () => {
    const result = MeterBySlugResultFactory({
      meters: [StrapiMeterFactory({ notificationThresholds: '' })],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.getNotificationThresholds()).toEqual([]);
  });

  it('preserves 0 as a valid threshold value', () => {
    const result = MeterBySlugResultFactory({
      meters: [StrapiMeterFactory({ notificationThresholds: '0,50,100' })],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.getNotificationThresholds()).toEqual([0, 50, 100]);
  });

  it('trims whitespace around threshold values', () => {
    const result = MeterBySlugResultFactory({
      meters: [
        StrapiMeterFactory({ notificationThresholds: ' 50 , 75 , 90 ' }),
      ],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.getNotificationThresholds()).toEqual([50, 75, 90]);
  });

  it('throws MeterInvalidNotificationThresholdError for negative values', () => {
    const result = MeterBySlugResultFactory({
      meters: [StrapiMeterFactory({ notificationThresholds: '-10,50,90' })],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(() => util.getNotificationThresholds()).toThrow(
      MeterInvalidNotificationThresholdError
    );
  });

  it('throws MeterInvalidNotificationThresholdError for values above 100', () => {
    const result = MeterBySlugResultFactory({
      meters: [StrapiMeterFactory({ notificationThresholds: '50,150,90' })],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(() => util.getNotificationThresholds()).toThrow(
      MeterInvalidNotificationThresholdError
    );
  });

  it('filters out non-numeric notificationThresholds values', () => {
    const result = MeterBySlugResultFactory({
      meters: [StrapiMeterFactory({ notificationThresholds: '50,abc,90' })],
    });
    const util = new MeterBySlugResultUtil(result, 'test-slug');
    expect(util.getNotificationThresholds()).toEqual([50, 90]);
  });
});
