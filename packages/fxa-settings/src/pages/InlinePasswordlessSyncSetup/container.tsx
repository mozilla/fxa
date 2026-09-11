/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import InlinePasswordlessSyncSetup from '.';
import AppLayout from '../../components/AppLayout';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
// Deep import: `lib/passkeys/wrap` pulls in the HPKE suite, and this page is
// lazy-loaded so the cost stays out of the initial chunk.
import {
  usePasskeyWrapCreation,
  type CreatePasskeyWrapResult,
} from '../../lib/passkeys/wrap';
import { SensitiveData } from '../../lib/sensitive-data-client';
import { useFtlMsgResolver, useSensitiveDataClient } from '../../models';

/**
 * Copy for a wrap that could not be stored. Sign-in has already completed,
 * so every message says only the opt-in failed.
 *
 * TODO: FXA-14153 adds the upgrade ceremony; once it lands, `wrap_conflict`
 * (the stored wrap predates a key rotation) and `proof_invalid` should offer
 * that path instead of the generic copy.
 */
function localizedFailure(
  ftlMsgResolver: FtlMsgResolver,
  result: Extract<CreatePasskeyWrapResult, { ok: false }>
): string {
  switch (result.failure) {
    case 'throttled':
      return getLocalizedErrorMessage(ftlMsgResolver, AuthUiErrors.THROTTLED);
    case 'prf_unsupported':
    case 'platform_crypto':
    case 'passkey_not_found':
      return ftlMsgResolver.getMsg(
        'inline-passwordless-sync-setup-error-passkey-unusable',
        'This passkey can’t be used to skip the password.'
      );
    default:
      return ftlMsgResolver.getMsg(
        'inline-passwordless-sync-setup-error-generic',
        'Couldn’t enable this passkey for Sync. You can try again the next time you sign in.'
      );
  }
}

/**
 * Offers to store a passkey wrap after a desktop Sync sign-in that used a
 * PRF-capable passkey and then a password. Everything it needs was left in
 * `SensitiveDataClient` by those two steps; when any of it is missing (a
 * reload clears it) the page continues to the normal Sync destination.
 *
 * A failed store also continues, carrying the message: `createWrap` zeroes
 * `kB` and the PRF output whatever the outcome, so there is nothing to retry
 * with.
 *
 * Every exit lands in Settings: this page replaces the other post-sign-in
 * promos rather than preceding them.
 */
const InlinePasswordlessSyncSetupContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ftlMsgResolver = useFtlMsgResolver();
  const sensitiveDataClient = useSensitiveDataClient();
  const { createWrap, isLoading } = usePasskeyWrapCreation();

  const pending = sensitiveDataClient.getDataType(
    SensitiveData.Key.PasskeyWrap
  );

  const clearPending = useCallback(() => {
    pending?.kB?.fill(0);
    pending?.prfOut.fill(0);
    sensitiveDataClient.setDataType(SensitiveData.Key.PasskeyWrap, undefined);
  }, [pending, sensitiveDataClient]);

  // Sign-in already completed, so this never re-prompts for a password.
  const continueToSettings = useCallback(
    (localizedErrorFromLocationState?: string) => {
      clearPending();
      navigate(`/settings${location.search}`, {
        state: { localizedErrorFromLocationState },
        replace: true,
      });
    },
    [clearPending, location.search, navigate]
  );

  const isMissingWrapData = !pending?.kB;

  useEffect(() => {
    if (isMissingWrapData) {
      continueToSettings();
    }
  }, [isMissingWrapData, continueToSettings]);

  const onEnable = useCallback(async () => {
    if (!pending?.kB) {
      continueToSettings();
      return;
    }
    const result = await createWrap({
      credentialId: pending.credentialId,
      mfaToken: pending.mfaToken,
      prfOut: pending.prfOut,
      kB: pending.kB,
    });
    if (result.ok) {
      clearPending();
      navigate('/settings', {
        state: { passkeySyncEnabled: true },
        replace: true,
      });
      return;
    }
    continueToSettings(localizedFailure(ftlMsgResolver, result));
  }, [
    pending,
    continueToSettings,
    createWrap,
    clearPending,
    navigate,
    ftlMsgResolver,
  ]);

  if (isMissingWrapData) {
    return <AppLayout loading />;
  }

  return (
    <InlinePasswordlessSyncSetup
      onEnable={onEnable}
      onNotNow={() => continueToSettings()}
      isEnabling={isLoading}
    />
  );
};

export default InlinePasswordlessSyncSetupContainer;
