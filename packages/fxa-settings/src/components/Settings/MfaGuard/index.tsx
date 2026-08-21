/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode, useCallback } from 'react';

import { useAccount, useAlertBar } from '../../../models';
import { sessionToken as getSessionToken } from '../../../lib/cache';
import { MfaReason, MfaScope } from '../../../lib/types';
import { useNavigate } from 'react-router';
import { MfaGuardCore } from './MfaGuardCore';

export { MfaGuardCore } from './MfaGuardCore';

/**
 * Settings-flavored MFA guard. A thin wrapper over {@link MfaGuardCore} that
 * supplies the Settings-specific bits — the account email, the alert bar for
 * fatal errors, the globally-cached session token, and navigation back to
 * `/settings` / `/signin`. Behavior and public API are unchanged; the reusable
 * logic now lives in `MfaGuardCore` (see FXA-14311).
 */
export const MfaGuard = ({
  children,
  requiredScope,
  onDismissCallback = async () => {},
  debounceIntervalMs = 3000,
  reason,
}: {
  children: ReactNode;
  requiredScope: MfaScope;
  onDismissCallback?: () => Promise<void>;
  debounceIntervalMs?: number;
  reason: MfaReason;
}) => {
  const account = useAccount();
  const alertBar = useAlertBar();
  const navigate = useNavigate();
  const sessionToken = getSessionToken();

  // If no session token exists, kick them to sign-in
  if (!sessionToken) {
    throw new Error('Invalid state. Missing sessionToken');
  }

  const onDismiss = useCallback(() => {
    onDismissCallback().then(() => {
      navigate('/settings');
    });
  }, [navigate, onDismissCallback]);

  return (
    <MfaGuardCore
      requiredScope={requiredScope}
      reason={reason}
      email={account.email}
      sessionToken={sessionToken}
      debounceIntervalMs={debounceIntervalMs}
      onDismiss={onDismiss}
      onSessionInvalid={() => navigate('/signin')}
      onFatalError={(localizedMessage) => alertBar.error(localizedMessage)}
    >
      {children}
    </MfaGuardCore>
  );
};
