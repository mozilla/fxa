/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/browser';
import { useLocation, useNavigate } from 'react-router';
import InlinePasswordlessSyncSetup from '.';
import AppLayout from '../../components/AppLayout';
import { ERRNO } from '@fxa/accounts/errors';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import type { PasskeyWrapEnvelope } from 'fxa-auth-client/browser';
import type { BannerProps } from '../../components/Banner/interfaces';
import {
  createPasskeyWrap,
  retryPasskeyWrapStore,
  type CreatePasskeyWrapResult,
} from '../../lib/passkeys/wrap/creation';
import { PASSKEY_TROUBLESHOOT_URL } from '../../lib/passkeys/constants';
import { sessionToken } from '../../lib/cache';
import {
  useAlertBar,
  useAuthClient,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../models';

/**
 * Offers to store a passkey wrap after a desktop browser sign-in that needed
 * encryption keys (Sync, for example) and so used a PRF-capable passkey and
 * then a password. Everything it needs was left in `SensitiveDataClient` by
 * those two steps; when any of it is missing (a reload clears it) the page
 * continues to the normal post-sign-in destination.
 *
 * A failed store continues too, with the message queued for the Settings
 * alert bar. The exception is a dismissed or timed-out authenticator prompt:
 * the sealed envelope survives that, so the offer stays up to be retried.
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
  const [error, setError] =
    useState<Pick<BannerProps, 'type' | 'content' | 'link'>>();

  // Set when the prompt that would have submitted the envelope was dismissed
  // or timed out. Holding it lets the next click skip straight to a fresh
  // prompt, which is the only way back: the key material it was sealed from
  // is zeroed once an envelope exists.
  const pendingRetry = useRef<
    { envelope: PasskeyWrapEnvelope; credentialId: string } | undefined
  >(undefined);

  // Read once: leaving the route zeroes and drops the client's entry, and
  // the exit to Settings suspends on its chunk with this page still mounted.
  // A live read would have the offer vanish mid-render on the way out.
  const [pendingWrap] = useState(() => sensitiveDataClient.PasskeyWrapData);

  // Guards the continuations below: the seal and the step-up prompt both
  // await, and by the time they resolve the user may have left.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Leaving the route zeroes the material, so this only has to pick the exit.
  const continueToSettings = useCallback(() => {
    navigate(`/settings${location.search}`, { replace: true });
  }, [location.search, navigate]);

  const isMissingWrapData = !pendingWrap?.kB;

  useEffect(() => {
    if (isMissingWrapData) {
      continueToSettings();
    }
  }, [isMissingWrapData, continueToSettings]);

  const onEnable = useCallback(async () => {
    if (!pendingWrap?.kB) {
      continueToSettings();
      return;
    }
    setError(undefined);
    setIsEnabling(true);
    const retry = pendingRetry.current;
    const session = sessionToken();
    let result: CreatePasskeyWrapResult;
    try {
      result =
        retry && session
          ? await retryPasskeyWrapStore(
              authClient,
              { credentialId: retry.credentialId, sessionToken: session },
              retry.envelope
            )
          : await createPasskeyWrap(authClient, {
              credentialId: pendingWrap.credentialId,
              mfaToken: pendingWrap.mfaToken,
              sessionToken: session,
              // Copies, because sealing reads these after an await it cannot
              // see past: leaving the route zeroes the held buffers in place,
              // and an envelope sealed over zeroes still passes the round-trip
              // self-check, which compares zeroes to zeroes.
              prfOut: new Uint8Array(pendingWrap.prfOut),
              kB: new Uint8Array(pendingWrap.kB),
            });
    } catch (err) {
      Sentry.captureException(err);
      result = { ok: false, error: AuthUiErrors.UNEXPECTED_ERROR };
    }
    // The user left during the store or the step-up prompt. Everything below
    // is a global side effect — alert bar, navigation — that would land on
    // whatever page they are on now.
    if (!mounted.current) {
      return;
    }
    if (!result.ok && 'retryable' in result) {
      pendingRetry.current = {
        envelope: result.envelope,
        credentialId: pendingWrap.credentialId,
      };
      // The envelope is everything a retry needs, so the material it was
      // sealed from has no reader left. The offer stays on this route, so
      // nothing else will zero it until the user leaves.
      pendingWrap.kB.fill(0);
      pendingWrap.prfOut.fill(0);
      setError(
        result.error
          ? // A server refusal says when to come back, which is only useful
            // while the button to come back to is still on screen.
            {
              type: 'error',
              content: {
                localizedHeading: getLocalizedErrorMessage(
                  ftlMsgResolver,
                  result.error
                ),
              },
            }
          : // A dismissed prompt is the user's own doing, so it carries the
            // same weight and the same help link as a dismissed sign-in.
            {
              type: 'warning',
              content: {
                localizedHeading: ftlMsgResolver.getMsg(
                  'inline-passwordless-sync-setup-error-cancelled',
                  'Passkey confirmation didn’t finish'
                ),
                localizedDescription: ftlMsgResolver.getMsg(
                  'inline-passwordless-sync-setup-error-cancelled-description',
                  'Confirm with your passkey to skip the password next time.'
                ),
              },
              link: {
                url: PASSKEY_TROUBLESHOOT_URL,
                localizedText: ftlMsgResolver.getMsg(
                  'passkey-authentication-trouble-link',
                  'How to use passkeys'
                ),
              },
            }
      );
      setIsEnabling(false);
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
          'This passkey is ready for sync sign-in'
        )
      );
    } else {
      // Sign-in already completed, and nothing was stored, so the next Sync
      // sign-in finds no wrap and offers again — whatever the cause was.
      alertBar.error(
        ftlMsgResolver.getMsg(
          'inline-passwordless-sync-setup-error-generic',
          'Something went wrong, you’ll still need to enter your password next time'
        )
      );
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
      error={error}
    />
  );
};

export default InlinePasswordlessSyncSetupContainer;
