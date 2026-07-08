/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthUiErrors } from '../auth-errors/auth-errors';
import type { AuthEvent, Effect } from './types';

export interface EffectDeps {
  checkAccountStatus: (email: string) => Promise<{ exists: boolean }>;
  // Simplified: verificationMethod/verificationReason are compared as strings in the funnel.
  beginSignin: (opts: { password: string; unblockCode?: string }) => Promise<{
    emailVerified: boolean;
    sessionVerified: boolean;
    verificationMethod?: string;
    verificationReason?: string;
  }>;
  cachedSignin: () => Promise<{
    emailVerified: boolean;
    sessionVerified: boolean;
    verificationMethod?: string;
    verificationReason?: string;
  }>;
  sendUnblockEmail: () => Promise<void>;
  upgradeCredentials: () => Promise<void>;
}

export async function runEffect(
  effect: Effect,
  deps: EffectDeps
): Promise<AuthEvent | null> {
  switch (effect.kind) {
    case 'RESOLVE_INTEGRATION':
      return { type: 'INTEGRATION_RESOLVED' };

    case 'CHECK_ACCOUNT_STATUS': {
      const { exists } = await deps.checkAccountStatus(effect.email);
      return { type: 'ACCOUNT_STATUS', exists };
    }

    case 'BEGIN_SIGNIN':
      try {
        const r = await deps.beginSignin({
          password: effect.password,
          unblockCode: effect.unblockCode,
        });
        const eventType = effect.unblockCode ? 'UNBLOCK_OK' : 'SIGNIN_OK';
        return {
          type: eventType,
          emailVerified: r.emailVerified,
          sessionVerified: r.sessionVerified,
          verificationMethod: r.verificationMethod as any,
          verificationReason: r.verificationReason as any,
        } as AuthEvent;
      } catch (e: any) {
        if (e?.errno === AuthUiErrors.REQUEST_BLOCKED.errno)
          return { type: 'REQUEST_BLOCKED', canUnblock: true };
        if (e?.errno === AuthUiErrors.THROTTLED.errno)
          return { type: 'THROTTLED', canUnblock: true };
        throw e; // incorrect-password etc. handled by the form, not the funnel
      }

    case 'CACHED_SIGNIN': {
      try {
        const r = await deps.cachedSignin();
        return {
          type: 'CACHED_RESULT',
          emailVerified: r.emailVerified,
          sessionVerified: r.sessionVerified,
          verificationMethod: r.verificationMethod as any,
          verificationReason: r.verificationReason as any,
        };
      } catch (e: any) {
        if (e?.errno === AuthUiErrors.INVALID_TOKEN.errno)
          return { type: 'SESSION_EXPIRED' };
        throw e;
      }
    }

    case 'SEND_UNBLOCK_EMAIL':
      await deps.sendUnblockEmail();
      return { type: 'UNBLOCK_CODE_SENT' };

    case 'UPGRADE_CREDENTIALS':
      // Fire-and-forget: a failed upgrade must never block sign-in.
      try {
        await deps.upgradeCredentials();
      } catch {
        /* stay v1 */
      }
      return null;

    case 'DELEGATE_LEGACY':
      return null;
  }
}
