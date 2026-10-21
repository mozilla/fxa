/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AccessToken } from './access-token';

// Deterministic. authAt is seconds since epoch; the others are ms.
const MOCK_CREATED_AT = 1_700_000_000_000;
const MOCK_EXPIRES_AT = 1_700_000_100_000;
const MOCK_AUTH_AT = 1_700_000_000;

const baseJson = {
  clientId: 'deadbeef',
  name: 'client',
  canGrant: false,
  publicClient: false,
  userId: 'feedcafe',
  scope: 'profile',
  token: 'ffff',
  createdAt: MOCK_CREATED_AT,
  profileChangedAt: MOCK_CREATED_AT,
  expiresAt: MOCK_EXPIRES_AT,
};

describe('AccessToken authentication-event metadata (RFC 9470)', () => {
  it('round-trips authAt, amr, and aal through toJSON/parse', () => {
    const token = AccessToken.parse(
      JSON.stringify({
        ...baseJson,
        authAt: MOCK_AUTH_AT,
        amr: ['pwd', 'otp'],
        aal: 2,
      })
    );

    expect(token.authAt).toBe(MOCK_AUTH_AT);
    expect(token.amr).toEqual(['pwd', 'otp']);
    expect(token.aal).toBe(2);

    const json = token.toJSON() as any;
    expect(json.authAt).toBe(MOCK_AUTH_AT);
    expect(json.amr).toEqual(['pwd', 'otp']);
    expect(json.aal).toBe(2);

    // A full re-hydration preserves the model, including the metadata fields.
    const reparsed = AccessToken.parse(JSON.stringify(json));
    expect(reparsed).toEqual(token);
  });

  it('omits the metadata keys when the token carries none', () => {
    const token = AccessToken.parse(JSON.stringify(baseJson));

    expect(token.authAt).toBeUndefined();
    expect(token.amr).toBeUndefined();
    expect(token.aal).toBeUndefined();

    // JSON.stringify drops undefined values.
    const serialized = JSON.stringify(token.toJSON());
    expect(serialized).not.toContain('authAt');
    expect(serialized).not.toContain('amr');
    expect(serialized).not.toContain('aal');
  });
});
