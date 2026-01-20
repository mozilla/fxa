/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Converts app request geoLocation data to a standardized format
 * used in email rendering library.
 * @param geoData Object containing city, state, and country
 * @returns
 */
export function formatGeoData({
  city,
  state,
  country,
}: {
  city?: string;
  state?: string;
  country?: string;
} = {}): { city: string; country: string; stateCode: string } {
  return {
    city: city || '',
    country: country || '',
    stateCode: state || '',
  };
}

export default {
  formatGeoData,
};
