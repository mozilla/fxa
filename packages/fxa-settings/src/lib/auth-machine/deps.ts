/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { useAuthClient, useSession } from '../../models';
import type { SensitiveDataClient } from '../../lib/sensitive-data-client';
import { cachedSignIn } from '../../pages/Signin/utils';
import type { Integration } from '../../models';
import type { EffectDeps } from './effects';

interface MachineDepInput {
  authClient: ReturnType<typeof useAuthClient>;
  integration: Pick<Integration, 'getClientId' | 'getService'>;
  sensitiveDataClient: SensitiveDataClient;
  sessionToken?: string;
  session: ReturnType<typeof useSession>;
}

/**
 * Adapts the existing auth-client methods into the EffectDeps shape
 * consumed by the auth-machine effect runner.
 *
 * Slice 1: minimal adapters; upgradeCredentials is a no-op placeholder
 * (full credential upgrade wiring is deferred to a later slice).
 */
export function makeMachineDeps({
  authClient,
  integration,
  sensitiveDataClient: _sensitiveDataClient,
  sessionToken,
  session,
}: MachineDepInput): EffectDeps {
  return {
    checkAccountStatus: async (email) => {
      const { exists } = await authClient.accountStatusByEmail(email, {
        thirdPartyAuthStatus: true,
        clientId: integration.getClientId(),
        service: integration.getService(),
      });
      return { exists };
    },

    // beginSignin is a thin wrapper; the full credential-stretching path
    // (v1/v2 key upgrade) remains in the legacy handler for now (Slice 1 scaffolding).
    beginSignin: async ({ password: _password, unblockCode: _unblockCode }) => {
      // Slice 1: flag-gate scaffolding; full submit cutover deferred to a later slice.
      // This stub satisfies the EffectDeps type and keeps the module tree sound;
      // machine.send('SUBMIT_PASSWORD') is not yet wired from the submit handler.
      throw new Error('beginSignin: not yet wired in Slice 1');
    },

    cachedSignin: async () => {
      if (!sessionToken) {
        throw new Error('cachedSignin: no sessionToken available');
      }
      const result = await cachedSignIn(sessionToken, authClient, session);
      if (!result.data) {
        throw new Error('cachedSignin: no data returned');
      }
      const {
        emailVerified,
        sessionVerified,
        verificationMethod,
        verificationReason,
      } = result.data;
      return {
        emailVerified: emailVerified ?? false,
        sessionVerified: sessionVerified ?? false,
        verificationMethod: verificationMethod as string | undefined,
        verificationReason: verificationReason as string | undefined,
      };
    },

    sendUnblockEmail: async () => {
      // Slice 1: flag-gate scaffolding; unblock email sending deferred to a later slice.
      throw new Error('sendUnblockEmail: not yet wired in Slice 1');
    },

    upgradeCredentials: async () => {
      // Slice 1: no-op; full v1→v2 upgrade is wired in the legacy beginSigninHandler.
    },
  };
}
