/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { normalizeGleanFalsyValues } from './normalizeGleanFalsyValues';

export function mapUtm(searchParams: Record<string, string | undefined>) {
  return {
    utm_campaign: normalizeGleanFalsyValues(searchParams['utm_campaign']),
    utm_content: normalizeGleanFalsyValues(searchParams['utm_content']),
    utm_medium: normalizeGleanFalsyValues(searchParams['utm_medium']),
    utm_source: normalizeGleanFalsyValues(searchParams['utm_source']),
    utm_term: normalizeGleanFalsyValues(searchParams['utm_term']),
  };
}
