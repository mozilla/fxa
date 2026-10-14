/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { popularDomains } from '../index';

describe('popularDomains', () => {
  it('returns an array of 20 domains', () => {
    expect(Array.isArray(popularDomains)).toBe(true);
    expect(popularDomains).toHaveLength(20);
  });

  it('includes some well-known domains', () => {
    expect(popularDomains).toEqual(
      expect.arrayContaining(['gmail.com', 'hotmail.com', 'yahoo.com'])
    );
  });
});
