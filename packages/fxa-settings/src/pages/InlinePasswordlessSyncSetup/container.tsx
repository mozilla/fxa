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
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import {
  createPasskeyWrap,
  type CreatePasskeyWrapResult,
} from '../../lib/passkeys/wrap/creation';
import { sessionToken } from '../../lib/cache';
import { useClearPasskeyWrapOnLeave } from '../../lib/passkeys/use-clear-wrap-on-leave';
import {
  useAlertBar,
  useAuthClient,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../models';

/**
 * Copy for a wrap that could not be stored. Sign-in has already completed,
 * so every message says only the opt-in failed. Server refusals arrive as the
 * raw `AuthUiError`; this surface decides what each errno means here.
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
    'Couldn’t set up this passkey for password-free sign-in. You can try again the next time you sign in.'
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
 * Offers to store a passkey wrap after a desktop browser sign-in that needed
 * encryption keys (Sync, for example) and so used a PRF-capable passkey and
 * then a password. Everything it needs was left in `SensitiveDataClient` by
 * those two steps; when any of it is missing (a reload clears it) the page
 * continues to the normal post-sign-in destination.
 *
 * A failed store also continues, with the message queued for the Settings
 * alert bar: `createWrap` zeroes `kB` and the PRF output whatever the
 * outcome, so there is nothing to retry with.
 *
 * Every exit lands in Settings: this page replaces the other post-sign-in
 * promos rather than preceding them.
 */
const InlinePasswordlessSyncSetupContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ftlMsgResolver = useFtlMsgResolver();
  const alertBar = useAlertBar();
  const sensitiveDataClient = useSensitiveDataClient();
  const authClient = useAuthClient();
  const [isEnabling, setIsEnabling] = useState(false);

  const pendingWrap = sensitiveDataClient.PasskeyWrapData;

  // Leaving by any other route (browser Back, another navigation) must not
  // keep the material around.
  const mounted = useClearPasskeyWrapOnLeave(sensitiveDataClient);

  // Navigation runs in a transition, so this page can re-render with the
  // material already cleared while the Settings chunk loads. The ref keeps
  // the missing-material fallback below from replacing the outcome state.
  const leaving = useRef(false);

  const continueToSettings = useCallback(() => {
    leaving.current = true;
    sensitiveDataClient.clearPasskeyWrapData();
    navigate(`/settings${location.search}`, { replace: true });
  }, [sensitiveDataClient, location.search, navigate]);

  const isMissingWrapData = !pendingWrap?.kB;

  useEffect(() => {
    if (isMissingWrapData && !leaving.current) {
      continueToSettings();
    }
  }, [isMissingWrapData, continueToSettings]);

  // Synchronous re-entry guard: `createPasskeyWrap` zeroes the buffers in
  // place, so a second click before `isEnabling` renders would seal zeros.
  const inFlight = useRef(false);
  const onEnable = useCallback(async () => {
    if (inFlight.current) {
      return;
    }
    if (!pendingWrap?.kB) {
      continueToSettings();
      return;
    }
    inFlight.current = true;
    setIsEnabling(true);
    let result: CreatePasskeyWrapResult;
    try {
      result = await createPasskeyWrap(authClient, {
        credentialId: pendingWrap.credentialId,
        mfaToken: pendingWrap.mfaToken,
        sessionToken: sessionToken(),
        prfOut: pendingWrap.prfOut,
        kB: pendingWrap.kB,
      });
    } catch (err) {
      Sentry.captureException(err);
      result = { ok: false, error: AuthUiErrors.UNEXPECTED_ERROR };
    }
    // The user left during the store or the step-up prompt; the unmount
    // already zeroed the material, and their new route stands.
    if (!mounted.current) {
      return;
    }
    // A live wrap with different bytes was stored meanwhile, by another device
    // or a retry whose response was lost. Either one opens with the current kB.
    const alreadyStored =
      !result.ok &&
      'error' in result &&
      result.error.errno === ERRNO.PASSKEY_WRAP_CONFLICT;
    if (result.ok || alreadyStored) {
      alertBar.success(
        ftlMsgResolver.getMsg(
          'inline-passwordless-sync-setup-success-alert',
          'This passkey is set up for password-free sign-in.'
        )
      );
    } else {
      alertBar.error(localizedFailure(ftlMsgResolver, result));
    }
    continueToSettings();
  }, [
    pendingWrap,
    mounted,
    continueToSettings,
    authClient,
    ftlMsgResolver,
    alertBar,
  ]);

  if (isMissingWrapData) {
    return <AppLayout loading />;
  }

  return (
    <InlinePasswordlessSyncSetup
      onEnable={onEnable}
      onNotNow={() => continueToSettings()}
      isEnabling={isEnabling}
    />
  );
};

export default InlinePasswordlessSyncSetupContainer;
