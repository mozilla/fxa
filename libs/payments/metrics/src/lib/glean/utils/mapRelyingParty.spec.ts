/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { mapRelyingParty } from './mapRelyingParty';

describe('mapRelyingParty', () => {
  it('should map relying party data if present', () => {
    expect(mapRelyingParty({ service: 'vpn' })).toEqual({
      relying_party_oauth_client_id: '',
      relying_party_service: 'vpn',
    });
  });

  it('should return empty strings if relying party data is not present', () => {
    expect(mapRelyingParty({})).toEqual({
      relying_party_oauth_client_id: '',
      relying_party_service: '',
    });
  });
});
