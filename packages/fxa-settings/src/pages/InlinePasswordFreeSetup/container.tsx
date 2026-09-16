/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/browser';
import { useLocation, useNavigate } from 'react-router';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import InlinePasswordFreeSetup from '.';
import AppLayout from '../../components/AppLayout';
import { ERRNO } from '@fxa/accounts/errors';
import { Banner } from '../../components/Banner';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import {
  createPasskeyWrap,
  type CreatePasskeyWrapResult,
} from '../../lib/passkeys/wrap/creation';
import { clearPendingPasskeyWrap } from '../../lib/passkeys/pending-wrap';
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
 *
 * TODO: FXA-14153 adds the upgrade ceremony; once it lands, a wrap conflict
 * (the stored wrap predates a key rotation) and an invalid proof should offer
 * that path instead of the generic copy.
 *
 * TODO(FXA-14153): merge blocker. The mfa JWT lives ten minutes from the
 * passkey assertion, and the password step plus this page can outlast it.
 * An expired token surfaces as errno 223 and today gets the generic copy.
 * Re-run the ceremony to mint a fresh token and retry the store instead.
 */
function localizedFailure(
  ftlMsgResolver: FtlMsgResolver,
  result: Extract<CreatePasskeyWrapResult, { ok: false }>
): string {
  const passkeyUnusable = ftlMsgResolver.getMsg(
    'inline-password-free-setup-error-passkey-unusable',
    'This passkey can’t be used to skip the password.'
  );
  const generic = ftlMsgResolver.getMsg(
    'inline-password-free-setup-error-generic',
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
const InlinePasswordFreeSetupContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ftlMsgResolver = useFtlMsgResolver();
  const alertBar = useAlertBar();
  const sensitiveDataClient = useSensitiveDataClient();
  const authClient = useAuthClient();
  const [isEnabling, setIsEnabling] = useState(false);

  const pending = sensitiveDataClient.PasskeyWrapData;

  // Leaving by any other route (browser Back, another navigation) must not
  // keep the material around. StrictMode unmounts and remounts synchronously
  // in development, so the clear is deferred one tick and skipped if the page
  // is mounted again by then.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      queueMicrotask(() => {
        if (!mounted.current) {
          clearPendingPasskeyWrap(sensitiveDataClient);
        }
      });
    };
  }, [sensitiveDataClient]);

  // Navigation runs in a transition, so this page can re-render with the
  // material already cleared while the Settings chunk loads. The ref keeps
  // the missing-material fallback below from replacing the outcome state.
  const leaving = useRef(false);

  const continueToSettings = useCallback(() => {
    leaving.current = true;
    clearPendingPasskeyWrap(sensitiveDataClient);
    navigate(`/settings${location.search}`, { replace: true });
  }, [sensitiveDataClient, location.search, navigate]);

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
    if (result.ok) {
      alertBar.success(
        ftlMsgResolver.getMsg(
          'inline-password-free-setup-success-alert',
          'This passkey is set up for password-free sign-in.'
        )
      );
    } else {
      alertBar.error(localizedFailure(ftlMsgResolver, result));
    }
    continueToSettings();
  }, [pending, continueToSettings, authClient, ftlMsgResolver, alertBar]);

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
      <InlinePasswordFreeSetup
        onEnable={onEnable}
        onNotNow={() => continueToSettings()}
        isEnabling={isEnabling}
      />
    </>
  );
};

export default InlinePasswordFreeSetupContainer;
