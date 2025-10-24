/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getFormattedDuration } from './utils';

describe('utils', () => {
  describe('formatDuration', () => {
    it('should format seconds only when less than 60', () => {
      expect(getFormattedDuration(0)).toBe('0s');
      expect(getFormattedDuration(59)).toBe('59s');
    });

    it('should format minutes and seconds when less than an hour', () => {
      expect(getFormattedDuration(60)).toBe('1m 0s');
      expect(getFormattedDuration(60 * 60 - 1)).toBe('59m 59s');
    });

    it('should format hours, minutes, and seconds when more than an hour', () => {
      expect(getFormattedDuration(60 * 60)).toBe('1h 0m 0s');
      expect(getFormattedDuration(60 * 60 + 60 + 1)).toBe('1h 1m 1s');
      expect(getFormattedDuration(25 * 60 * 60 + 59 * 60 + 59)).toBe(
        '25h 59m 59s'
      );
    });
  });
});
