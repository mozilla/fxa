/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { funnelReducer } from './funnel';
import VerificationMethods from '../../constants/verification-methods';
import { makeCtx as ctx } from './mocks';

describe('funnelReducer: authenticating', () => {
  it('password submit begins signin', () => {
    const r = funnelReducer(
      'authenticating.passwordSignin',
      { type: 'SUBMIT_PASSWORD', password: 'pw' },
      ctx()
    );
    expect(r.state).toBe('authenticating.awaitSigninResult');
    expect(r.effects).toContainEqual({ kind: 'BEGIN_SIGNIN', password: 'pw' });
  });

  it('blocked sign-in with canUnblock goes to the unblock gate', () => {
    const r = funnelReducer(
      'authenticating.awaitSigninResult',
      { type: 'REQUEST_BLOCKED', canUnblock: true },
      ctx()
    );
    expect(r.state).toBe('authenticating.unblockGate');
    expect(r.effects).toContainEqual({ kind: 'SEND_UNBLOCK_EMAIL' });
  });

  it('hard block (no unblock) is terminal-ish: stays for banner, no email', () => {
    const r = funnelReducer(
      'authenticating.awaitSigninResult',
      { type: 'REQUEST_BLOCKED', canUnblock: false },
      ctx()
    );
    expect(r.effects).not.toContainEqual({ kind: 'SEND_UNBLOCK_EMAIL' });
  });

  it('SIGNIN_OK with v1 password account also fires UPGRADE_CREDENTIALS', () => {
    const r = funnelReducer(
      'authenticating.awaitSigninResult',
      {
        type: 'SIGNIN_OK',
        emailVerified: true,
        sessionVerified: false,
        verificationMethod: VerificationMethods.TOTP_2FA,
      },
      ctx({ hasPassword: true })
    );
    expect(r.effects).toContainEqual({ kind: 'UPGRADE_CREDENTIALS' });
  });

  it('cached SIGNIN never fires UPGRADE_CREDENTIALS (no password to re-stretch)', () => {
    const r = funnelReducer(
      'authenticating.cachedSignin',
      { type: 'CACHED_RESULT', emailVerified: true, sessionVerified: true },
      ctx({ hasPassword: false })
    );
    expect(r.effects).not.toContainEqual({ kind: 'UPGRADE_CREDENTIALS' });
  });

  it('unblock gate → verifying.unblock once the email is sent', () => {
    const r = funnelReducer(
      'authenticating.unblockGate',
      { type: 'UNBLOCK_CODE_SENT' },
      ctx()
    );
    expect(r.state).toBe('verifying.unblock');
  });
});
