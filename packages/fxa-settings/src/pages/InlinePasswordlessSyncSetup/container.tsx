/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/browser';
import { useLocation, useNavigate } from 'react-router';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import InlinePasswordlessSyncSetup from '.';
import AppLayout from '../../components/AppLayout';
import { ERRNO } from '@fxa/accounts/errors';
import { Banner } from '../../components/Banner';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import {
  createPasskeyWrap,
  type CreatePasskeyWrapResult,
} from '../../lib/passkeys/wrap/creation';
import { SensitiveData } from '../../lib/sensitive-data-client';
import {
  useAuthClient,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../models';
import type { SettingsLocationState } from '../../components/Settings/PageSettings';

/**
 * Copy for a wrap that could not be stored. Sign-in has already completed,
 * so every message says only the opt-in failed. Server refusals arrive as the
 * raw `AuthUiError`; this surface decides what each errno means here.
 *
 * TODO: FXA-14153 adds the upgrade ceremony; once it lands, a wrap conflict
 * (the stored wrap predates a key rotation) and an invalid proof should offer
 * that path instead of the generic copy.
 */
function localizedFailure(
  ftlMsgResolver: FtlMsgResolver,
  result: Extract<CreatePasskeyWrapResult, { ok: false }>
): string {
  const passkeyUnusable = ftlMsgResolver.getMsg(
    'inline-passwordless-sync-setup-error-passkey-unusable',
    'This passkey can’t be used to skip the password.'
  );
  const generic = ftlMsgResolver.getMsg(
    'inline-passwordless-sync-setup-error-generic',
    'Couldn’t enable this passkey for Sync. You can try again the next time you sign in.'
  );

  if ('error' in result) {
    switch (result.error.errno) {
      case ERRNO.THROTTLED:
        return getLocalizedErrorMessage(ftlMsgResolver, result.error);
      case ERRNO.PASSKEY_NOT_FOUND:
        return passkeyUnusable;
      default:
        return generic;
    }
  }
  switch (result.failure) {
    case 'prf_unsupported':
    case 'platform_crypto':
      return passkeyUnusable;
    case 'proof_malformed':
    case 'key_unusable':
      return generic;
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
  const authClient = useAuthClient();
  const [isEnabling, setIsEnabling] = useState(false);

  const pending = sensitiveDataClient.getDataType(
    SensitiveData.Key.PasskeyWrap
  );

  const clearPending = useCallback(() => {
    pending?.kB?.fill(0);
    pending?.prfOut.fill(0);
    sensitiveDataClient.setDataType(SensitiveData.Key.PasskeyWrap, undefined);
  }, [pending, sensitiveDataClient]);

  // Navigation runs in a transition, so this page can re-render with the
  // material already cleared while the Settings chunk loads. The ref keeps
  // the missing-material fallback below from replacing the outcome state.
  const leaving = useRef(false);

  const continueToSettings = useCallback(
    (state: SettingsLocationState = {}) => {
      leaving.current = true;
      clearPending();
      navigate(`/settings${location.search}`, { state, replace: true });
    },
    [clearPending, location.search, navigate]
  );

  const isMissingWrapData = !pending?.kB;

  useEffect(() => {
    if (isMissingWrapData && !leaving.current) {
      continueToSettings();
    }
  }, [isMissingWrapData, continueToSettings]);

  const onEnable = useCallback(async () => {
    if (!pending?.kB) {
      continueToSettings();
      return;
    }
    setIsEnabling(true);
    let result: CreatePasskeyWrapResult;
    try {
      result = await createPasskeyWrap(authClient, {
        credentialId: pending.credentialId,
        mfaToken: pending.mfaToken,
        prfOut: pending.prfOut,
        kB: pending.kB,
      });
    } catch (err) {
      Sentry.captureException(err);
      result = { ok: false, error: AuthUiErrors.UNEXPECTED_ERROR };
    }
    continueToSettings(
      result.ok
        ? { passkeySyncEnabled: true }
        : {
            localizedErrorFromLocationState: localizedFailure(
              ftlMsgResolver,
              result
            ),
          }
    );
  }, [pending, continueToSettings, authClient, ftlMsgResolver]);

  if (isMissingWrapData) {
    return <AppLayout loading />;
  }

  return (
    <>
      {/* TEMP(FXA-13151): remove before merge. Manual-verification readout of
          the material this page is about to seal. */}
      <Banner
        type="info"
        content={{
          localizedHeading: 'TEMP wrap material',
          localizedDescription: `kB ${pending.kB?.length ?? 0} bytes · prfOut ${
            pending.prfOut.length
          } bytes · credential ${pending.credentialId.slice(0, 12)}… · proof ${
            pending.mfaToken.split('.')[1]?.slice(0, 12) ?? '?'
          }…`,
        }}
      />
      <InlinePasswordlessSyncSetup
        onEnable={onEnable}
        onNotNow={() => continueToSettings()}
        isEnabling={isEnabling}
      />
    </>
  );
};

export default InlinePasswordlessSyncSetupContainer;
