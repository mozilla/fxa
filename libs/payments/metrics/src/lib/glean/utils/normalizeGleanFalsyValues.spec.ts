/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { normalizeGleanFalsyValues } from './normalizeGleanFalsyValues';

describe('normalizeGleanFalsyValues', () => {
  it('should return an empty string if the value is null', () => {
    expect(normalizeGleanFalsyValues(null)).toEqual('');
  });

  it('should return the value if it is not null', () => {
    expect(normalizeGleanFalsyValues('value')).toEqual('value');
  });
});
