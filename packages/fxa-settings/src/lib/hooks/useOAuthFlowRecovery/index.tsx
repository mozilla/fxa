/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useState } from 'react';
import {
  Integration,
  isOAuthNativeIntegration,
  isProbablyFirefox,
} from '../../../models';
import firefox from '../../channels/firefox';
import { hardNavigate } from 'fxa-react/lib/utils';

export type OAuthFlowRecoveryResult = {
  isRecovering: boolean;
  recoveryFailed: boolean;
  attemptOAuthFlowRecovery: () => Promise<{ success: boolean; error?: Error }>;
};

/**
 * Recovers from broken OAuth Native flows after page refresh or browser crash.
 * Uses Firefox webchannel to get fresh OAuth params and redirects to /signin.
 */
export function useOAuthFlowRecovery(
  integration: Integration
): OAuthFlowRecoveryResult {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryFailed, setRecoveryFailed] = useState(false);

  const attemptOAuthFlowRecovery = useCallback(async () => {
    // Only attempt recovery for OAuth Native integrations (Firefox/Sync)
    if (!isOAuthNativeIntegration(integration) || !isProbablyFirefox()) {
      return { success: false };
    }

    setIsRecovering(true);
    setRecoveryFailed(false);

    try {
      // Get scopes from integration or use default Sync scopes
      let scopes: string[];
      try {
        scopes = integration.getPermissions();
      } catch (e) {
        scopes = ['profile', 'https://identity.mozilla.com/apps/oldsync'];
      }

      // Start a new OAuth flow in Firefox to get fresh params
      const params = await firefox.fxaOAuthFlowBegin(scopes);
      if (!params) {
        setRecoveryFailed(true);
        return { success: false };
      }

      // Build redirect URL preserving existing flow/utm params
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set('client_id', params.client_id);
      currentParams.set('state', params.state);
      currentParams.set('scope', params.scope);
      currentParams.set('access_type', params.access_type || 'offline');
      currentParams.set('context', 'oauth_webchannel_v1');

      if (params.action) {
        currentParams.set('action', params.action);
      }
      if (params.code_challenge) {
        currentParams.set('code_challenge', params.code_challenge);
      }
      if (params.code_challenge_method) {
        currentParams.set('code_challenge_method', params.code_challenge_method);
      }

      // Redirect to /signin - user will re-enter password
      hardNavigate(`/signin?${currentParams.toString()}`);

      return { success: true };
    } catch (error) {
      console.error('[useOAuthFlowRecovery] Error during recovery:', error);
      setRecoveryFailed(true);
      return { success: false, error: error as Error };
    } finally {
      setIsRecovering(false);
    }
  }, [integration]);

  return {
    isRecovering,
    recoveryFailed,
    attemptOAuthFlowRecovery,
  };
}

export default useOAuthFlowRecovery;
