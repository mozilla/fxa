/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { mapUtm } from './mapUtm';

describe('mapUtm', () => {
  it('should map the values if present', () => {
    const mockUtmParams = {
      utm_source: 'utm_source',
      utm_medium: 'utm_medium',
      utm_campaign: 'utm_campaign',
      utm_content: 'utm_content',
      utm_term: 'utm_term',
    };
    expect(mapUtm(mockUtmParams)).toEqual(mockUtmParams);
  });

  it('should return empty strings if the values are not present', () => {
    expect(mapUtm({})).toEqual({
      utm_campaign: '',
      utm_content: '',
      utm_medium: '',
      utm_source: '',
      utm_term: '',
    });
  });
});
