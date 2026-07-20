/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { startOfMinute } from './time';

describe('time module', () => {
  it('returned the expected interface', () => {
    expect(typeof startOfMinute).toBe('function');
    expect(startOfMinute.length).toBe(1);
  });

  describe('start of minute:', () => {
    it('returns the correct time', () => {
      const date = new Date('2018-10-10T10:10Z');
      expect(startOfMinute(date)).toBe('2018-10-10T10:10:00Z');
    });
  });

  describe('end of minute:', () => {
    it('returns the correct time', () => {
      const date = new Date('2018-10-10T10:10:59.999Z');
      expect(startOfMinute(date)).toBe('2018-10-10T10:10:00Z');
    });
  });

  describe('with padding:', () => {
    it('returns the correct time', () => {
      const date = new Date('2018-09-09T09:09Z');
      expect(startOfMinute(date)).toBe('2018-09-09T09:09:00Z');
    });
  });

  describe('non-UTC timezone:', () => {
    it('returns the correct time', () => {
      const date = new Date('2018-01-01T00:00+01:00');
      expect(startOfMinute(date)).toBe('2017-12-31T23:00:00Z');
    });
  });
});
