/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { buildAuthorizeUrl } from './authorize';
import { scopeMatrix } from './scopes';

describe('buildAuthorizeUrl', () => {
  it('serializes scopes, PKCE and pass-through params, dropping empty ones', () => {
    const url = new URL(
      buildAuthorizeUrl(
        'http://localhost:3030/authorization',
        'http://localhost:8090/callback',
        {
          client_id: 'abc',
          scopes: ['openid', 'profile'],
          keys: true,
          params: { prompt: 'none', login_hint: '' },
        },
        { state: 's', code_challenge: 'c', keys_jwk: 'k' }
      )
    );
    const p = url.searchParams;
    expect(p.get('scope')).toBe('openid profile');
    expect(url.search).toContain('scope=openid%20profile');
    expect(p.get('code_challenge_method')).toBe('S256');
    expect(p.get('keys_jwk')).toBe('k');
    expect(p.get('prompt')).toBe('none');
    expect(p.has('login_hint')).toBe(false);
  });
});

describe('scopeMatrix', () => {
  it('expands profile to every profile:* scope and marks withheld claims', () => {
    const rows = scopeMatrix(['openid', 'profile'], {
      sub: 'x',
      email: 'a@b.c',
      uid: 'u',
    });
    const byScope = Object.fromEntries(rows.map((r) => [r.scope, r]));
    expect(byScope['profile:email'].requested).toBe(true);
    expect(byScope['profile:email'].claims).toEqual([
      { name: 'email', present: true },
    ]);
    expect(byScope['profile:avatar'].requested).toBe(true);
    expect(byScope['profile:avatar'].claims.every((c) => !c.present)).toBe(
      true
    );
  });

  it('does not mark unrequested scopes for an untrusted request', () => {
    const rows = scopeMatrix(['profile:email'], { email: 'a@b.c' });
    expect(rows.find((r) => r.scope === 'profile:uid')?.requested).toBe(false);
  });
});
