/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';

import { assert } from 'chai';

import { AccessToken } from '../../../../db/models/auth/access-token';

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

    assert.strictEqual(token.authAt, MOCK_AUTH_AT);
    assert.deepEqual(token.amr, ['pwd', 'otp']);
    assert.strictEqual(token.aal, 2);

    const json = token.toJSON() as any;
    assert.strictEqual(json.authAt, MOCK_AUTH_AT);
    assert.deepEqual(json.amr, ['pwd', 'otp']);
    assert.strictEqual(json.aal, 2);

    // A full re-hydration preserves the model, including the new fields.
    const reparsed = AccessToken.parse(JSON.stringify(json));
    assert.deepEqual(reparsed, token);
  });

  it('omits the metadata keys when the token carries none', () => {
    const token = AccessToken.parse(JSON.stringify(baseJson));

    assert.isUndefined(token.authAt);
    assert.isUndefined(token.amr);
    assert.isUndefined(token.aal);

    // JSON.stringify drops undefined values, so tokens without the metadata
    // serialize exactly as they did before this field was added.
    const serialized = JSON.stringify(token.toJSON());
    assert.notInclude(serialized, 'authAt');
    assert.notInclude(serialized, 'amr');
    assert.notInclude(serialized, 'aal');
  });
});
