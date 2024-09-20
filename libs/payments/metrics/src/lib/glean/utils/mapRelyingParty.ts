/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { normalizeGleanFalsyValues } from './normalizeGleanFalsyValues';

export function mapRelyingParty(searchParams: Record<string, string>) {
  return {
    relying_party_oauth_client_id: '',
    relying_party_service: normalizeGleanFalsyValues(searchParams['service']),
  };
}
