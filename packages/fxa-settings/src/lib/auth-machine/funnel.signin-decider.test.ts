/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { funnelReducer } from './funnel';
import { makeCtx as ctx } from './mocks';

describe('funnelReducer: bootstrapping + identifying + signinDecider', () => {
  it('clientInfo failure hard-fails to serviceUnavailable', () => {
    const r = funnelReducer(
      'bootstrapping.resolving',
      { type: 'SERVICE_UNAVAILABLE' },
      ctx()
    );
    expect(r.state).toBe('terminal.serviceUnavailable');
  });

  it('email submit checks account status', () => {
    const r = funnelReducer(
      'identifying.index',
      { type: 'SUBMIT_EMAIL', email: 'a@example.com' },
      ctx()
    );
    expect(r.state).toBe('identifying.checkingAccountStatus');
    expect(r.effects).toContainEqual({
      kind: 'CHECK_ACCOUNT_STATUS',
      email: 'a@example.com',
    });
  });

  it('existing account auto-advances through the decider to password sign-in', () => {
    const r = funnelReducer(
      'identifying.checkingAccountStatus',
      { type: 'ACCOUNT_STATUS', exists: true },
      ctx()
    );
    expect(r.state).toBe('authenticating.passwordSignin');
  });

  it('non-existent account delegates to legacy (signup is Slice 4)', () => {
    const r = funnelReducer(
      'identifying.checkingAccountStatus',
      { type: 'ACCOUNT_STATUS', exists: false },
      ctx()
    );
    expect(r.state).toBe('delegated.legacy');
  });

  it('decider Branch B: cached when no password needed', () => {
    const r = funnelReducer(
      'authenticating.signinDecider',
      { type: 'INTEGRATION_RESOLVED' },
      ctx({
        hasCachedSession: true,
        hasPassword: true,
        supportsKeysOptionalLogin: true,
      })
    );
    expect(r.state).toBe('authenticating.cachedSignin');
    expect(r.effects).toContainEqual({ kind: 'CACHED_SIGNIN' });
  });

  it('decider Branch D: password sign-in by default', () => {
    const r = funnelReducer(
      'authenticating.signinDecider',
      { type: 'INTEGRATION_RESOLVED' },
      ctx()
    );
    expect(r.state).toBe('authenticating.passwordSignin');
  });

  it('decider Branch A: passwordless delegates (Slice 2)', () => {
    const r = funnelReducer(
      'authenticating.signinDecider',
      { type: 'INTEGRATION_RESOLVED' },
      ctx({ passwordlessSupported: true, hasPassword: false })
    );
    expect(r.state).toBe('delegated.legacy');
  });
});
