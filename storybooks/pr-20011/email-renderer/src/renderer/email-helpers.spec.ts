/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  constructLocalDateString,
  constructLocalTimeAndDateStrings,
} from './email-helpers';

describe('EmailHelpers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructLocalTimeAndDateStrings', () => {
    beforeEach(() => {
      jest
        .spyOn(Date, 'now')
        .mockReturnValue(new Date('2024-01-15T20:30:45Z').getTime());
    });

    it('should construct time and date strings with timezone', () => {
      const result = constructLocalTimeAndDateStrings(
        'America/Los_Angeles',
        'en-US'
      );

      expect(result.time).toEqual('12:30:45 PM (PST)');
      expect(result.date).toEqual('Monday, Jan 15, 2024');
    });

    it('should use default timezone when not provided', () => {
      const result = constructLocalTimeAndDateStrings(undefined, 'en-US');

      expect(result.time).toEqual('8:30:45 PM (UTC)');
      expect(result.date).toEqual('Monday, Jan 15, 2024');
      expect(result.acceptLanguage).toEqual('en-US');
      expect(result.timeZone).toEqual('Etc/UTC');
    });

    it('should use default locale when not provided', () => {
      const result = constructLocalTimeAndDateStrings('America/New_York');

      expect(result.time).toEqual('3:30:45 PM (EST)');
      expect(result.date).toEqual('Monday, Jan 15, 2024');
      expect(result.acceptLanguage).toEqual('en');
      expect(result.timeZone).toEqual('America/New_York');
    });

    it('should handle different locales', () => {
      const result = constructLocalTimeAndDateStrings('Europe/London', 'fr-FR');

      expect(result.time).toEqual('20:30:45 (GMT)');
      expect(result.date).toEqual('lundi, 15 janv. 2024');
    });

    it('should format with no parameters', () => {
      const result = constructLocalTimeAndDateStrings();

      expect(result.time).toEqual('8:30:45 PM (UTC)');
      expect(result.date).toEqual('Monday, Jan 15, 2024');
    });
  });

  describe('constructLocalDateString', () => {
    it('should construct localized date string with timezone', () => {
      const date = new Date('2024-01-15T12:00:00Z');

      const result = constructLocalDateString(
        'America/Los_Angeles',
        'en-US',
        date
      );

      expect(result).toEqual('01/15/2024');
    });

    it('should accept custom format string', () => {
      const date = new Date('2024-01-15T12:00:00Z');

      const result = constructLocalDateString(
        'America/Chicago',
        'en-US',
        date,
        'YYYY-MM-DD'
      );

      expect(result).toEqual('2024-01-15');
    });

    it('should use current date when not provided', () => {
      jest
        .spyOn(Date, 'now')
        .mockReturnValue(new Date('2024-01-15T12:00:00Z').getTime());

      const result = constructLocalDateString('America/Denver', 'en-US');

      expect(result).toEqual('01/15/2024');
    });

    it('should handle different locales', () => {
      const date = new Date('2024-01-15T12:00:00Z');

      const result = constructLocalDateString('Europe/Paris', 'de-DE', date);

      expect(result).toEqual('15.01.2024');
    });

    it('should accept timestamp as date parameter', () => {
      jest
        .spyOn(Date, 'now')
        .mockReturnValue(new Date('2025-12-31T23:59:59Z').getTime());

      const timestamp = Date.now();

      const result = constructLocalDateString(
        'Asia/Tokyo',
        'ja-JP',
        timestamp // epoch timestamp instead of Date object
      );

      expect(result).toEqual('2026/01/01');
    });

    it('should use default timezone when not provided', () => {
      const date = new Date('2024-01-15T02:00:00Z');
      const resultDefault = constructLocalDateString(undefined, 'en-US', date);

      const resultEst = constructLocalDateString(
        'America/New_York',
        'en-US',
        date
      );

      expect(resultDefault).not.toBe(resultEst);
      expect(resultDefault).toEqual('01/15/2024');
      expect(resultEst).toEqual('01/14/2024');
    });
  });
});
